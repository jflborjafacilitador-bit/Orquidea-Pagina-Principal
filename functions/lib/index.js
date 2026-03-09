"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mpWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const node_fetch_1 = __importDefault(require("node-fetch"));
admin.initializeApp();
const db = admin.firestore();
const MP_ACCESS_TOKEN = "APP_USR-4951831771280219-030915-58f816ade00cf8854166b5172dfce18f-251535062";
const MP_WEBHOOK_SECRET = "abe3d29c265b21dc92d9b0d88f052029b04177d978a4a961397c066952295ed0";
// Mapa de plan_id a nivel de acceso
const PLAN_LEVELS = {
    "850b89b1635743a49cd81494922e6385": "premium_bronce",
    "36018ab63fd949fa85625dd92d2e9795": "premium_plata",
    "3e384749b9e74385a46d8a0ab4a21644": "premium_oro",
};
// Verificar firma HMAC-SHA256 de Mercado Pago
function verifyWebhookSignature(req) {
    const xSignature = req.headers["x-signature"];
    const xRequestId = req.headers["x-request-id"];
    if (!xSignature || !xRequestId)
        return false;
    const parts = xSignature.split(",");
    let ts = "";
    let v1 = "";
    for (const part of parts) {
        const [key, value] = part.trim().split("=");
        if (key === "ts")
            ts = value;
        if (key === "v1")
            v1 = value;
    }
    if (!ts || !v1)
        return false;
    const dataId = req.body?.data?.id || "";
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hash = crypto
        .createHmac("sha256", MP_WEBHOOK_SECRET)
        .update(manifest)
        .digest("hex");
    return hash === v1;
}
// ---------------------------------------------------------
// WEBHOOK: Recibe notificaciones de Mercado Pago
// URL: https://us-central1-orquidea-c187e.cloudfunctions.net/mpWebhook
// ---------------------------------------------------------
exports.mpWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    // Verificar que la petición viene realmente de Mercado Pago
    if (!verifyWebhookSignature(req)) {
        functions.logger.warn("Firma de webhook inválida. Petición rechazada.");
        res.status(401).send("Unauthorized: Invalid signature");
        return;
    }
    const { type, data } = req.body;
    functions.logger.info("Webhook verificado:", { type, data });
    // Solo procesamos notificaciones de suscripciones
    if (type !== "subscription_preapproval") {
        res.status(200).send("OK - ignored");
        return;
    }
    const preapprovalId = data?.id;
    if (!preapprovalId) {
        res.status(400).send("Bad Request: missing preapproval id");
        return;
    }
    try {
        // Consultar la suscripción en Mercado Pago para verificar el estado
        const mpResponse = await (0, node_fetch_1.default)(`https://api.mercadopago.com/preapproval/${preapprovalId}`, { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } });
        if (!mpResponse.ok) {
            functions.logger.error("Error al consultar MP:", await mpResponse.text());
            res.status(500).send("Error fetching subscription from MP");
            return;
        }
        const subscription = (await mpResponse.json());
        const { status, payer_email, preapproval_plan_id } = subscription;
        const planLevel = PLAN_LEVELS[preapproval_plan_id] || "premium";
        // Buscar al usuario en Firebase Auth por su email
        let uid = null;
        try {
            const userRecord = await admin.auth().getUserByEmail(payer_email);
            uid = userRecord.uid;
        }
        catch (e) {
            functions.logger.warn("Usuario no encontrado en Firebase Auth:", payer_email);
        }
        if (!uid) {
            functions.logger.warn("No se encontró usuario para email:", payer_email);
            res.status(200).send("OK - user not found");
            return;
        }
        // Actualizar el rol según el estado de la suscripción
        // "authorized" = activa, cualquier otro = cancelada/pendiente
        const newRole = status === "authorized" ? planLevel : "free";
        await db.doc(`users/${uid}`).set({
            role: newRole,
            subscriptionId: preapprovalId,
            subscriptionStatus: status,
            subscriptionPlan: preapproval_plan_id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        functions.logger.info(`✅ Usuario ${payer_email} actualizado a: ${newRole}`);
        // Registrar el pago en 'pagos' para el panel de Facturación del admin
        if (status === "authorized") {
            const userRecord = await admin.auth().getUser(uid);
            await db.collection("pagos").add({
                userId: uid,
                userEmail: payer_email,
                userName: userRecord.displayName || payer_email,
                amount: subscription.auto_recurring?.transaction_amount || 0,
                currency: subscription.auto_recurring?.currency_id || "MXN",
                plan: planLevel,
                status: "approved",
                subscriptionId: preapprovalId,
                createdAt: new Date().toISOString(),
            });
        }
        res.status(200).send("OK");
    }
    catch (error) {
        functions.logger.error("Error procesando webhook:", error);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=index.js.map