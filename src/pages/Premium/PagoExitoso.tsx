import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import {
    collection, query, where, getDocs,
    doc, updateDoc, setDoc, arrayUnion, increment
} from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';

const PLAN_PRICES: Record<string, number> = {
    cobre: 299, plata: 499, oro: 799, unico: 199,
};

// Map category group → default plan when buying Cobre
const GRUPO_DEFAULT_PLAN = (cat: string): string =>
    ['moldes', 'marketing'].includes(cat) ? 'unico' : 'cobre';

// Map localStorage category (e.g., 'jaboneria') → GrupoCategoria key
const VALID_GRUPOS = ['jaboneria', 'velas', 'moldes', 'marketing'];

export const PagoExitoso = () => {
    const navigate = useNavigate();

    useEffect(() => {
        handlePostPayment();
        const timer = setTimeout(() => navigate('/dashboard/mis-suscripciones'), 6000);
        return () => clearTimeout(timer);
    }, [navigate]);

    const handlePostPayment = async () => {
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const categoria = localStorage.getItem('orquidea_categoria') ?? '';
            const refCode = localStorage.getItem('orquidea_ref');

            // 1. Add/update subscription in suscripciones map
            if (VALID_GRUPOS.includes(categoria)) {
                const plan = GRUPO_DEFAULT_PLAN(categoria);
                const subData = {
                    plan,
                    nivel: 0,
                    activa: true,
                    desde: new Date().toISOString(),
                };
                // Merge into suscripciones[categoria]
                await updateDoc(doc(db, 'users', uid), {
                    [`suscripciones.${categoria}`]: subData,
                });
            }

            // 2. Record referral conversion if code exists
            if (refCode) {
                await recordReferral(refCode, categoria);
                localStorage.removeItem('orquidea_ref');
            }

            localStorage.removeItem('orquidea_categoria');
        } catch (e) {
            console.error('Error in post-payment processing:', e);
        }
    };

    const recordReferral = async (refCode: string, categoria: string) => {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(
            collection(db, 'referidos'),
            where('codigo', '==', refCode),
            where('activo', '==', true)
        );
        const snap = await getDocs(q);
        if (snap.empty) return;

        const planKey = GRUPO_DEFAULT_PLAN(categoria);
        const monto = PLAN_PRICES[planKey];
        const descuentoAplicado = monto * 0.10;

        await updateDoc(doc(db, 'referidos', snap.docs[0].id), {
            conversiones: arrayUnion({
                userEmail: user.email ?? '',
                plan: planKey,
                monto,
                descuentoAplicado,
                comisionAdmin: descuentoAplicado,
                fecha: new Date().toISOString(),
            }),
            totalConversiones: increment(1),
            totalComision: increment(descuentoAplicado),
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', minHeight: '60vh' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(76, 175, 80, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <CheckCircle size={48} color="#4CAF50" />
            </div>

            <h1 style={{ color: '#4CAF50', fontSize: '2.2rem', marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
            <p style={{ color: 'var(--color-gray-800)', fontSize: '1.1rem', maxWidth: '450px', lineHeight: 1.6 }}>
                Tu suscripción está siendo activada. En unos momentos tendrás acceso a tu contenido.
            </p>
            <p style={{ color: 'var(--color-gray-800)', marginTop: '2rem', fontSize: '0.9rem' }}>
                Redirigiendo a Mis Suscripciones en 6 segundos...
            </p>

            <button
                className="btn btn-primary"
                style={{ marginTop: '2rem' }}
                onClick={() => navigate('/dashboard/mis-suscripciones')}
            >
                Ver Mis Suscripciones
            </button>
        </div>
    );
};
