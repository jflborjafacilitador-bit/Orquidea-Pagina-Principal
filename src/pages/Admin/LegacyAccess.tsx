import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { UserPlus, Key, Copy, Check } from 'lucide-react';

const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ORQUIDEA-';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

const oneYearFromNow = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
};

export const LegacyAccess = () => {
    const [email, setEmail] = useState('');
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [emailMsg, setEmailMsg] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const [codeMsg, setCodeMsg] = useState('');

    // Método A: Generar código
    const handleGenerarCodigo = async () => {
        setLoadingCode(true);
        setCodeMsg('');
        try {
            const code = generateCode();
            await addDoc(collection(db, 'codigos_legacy'), {
                code,
                usado: false,
                createdAt: new Date().toISOString(),
                usadoPor: null,
                expiry: oneYearFromNow(),
            });
            setGeneratedCode(code);
            setCodeMsg('✅ Código generado y guardado en Firestore.');
        } catch (e) {
            setCodeMsg('❌ Error al generar el código.');
        } finally {
            setLoadingCode(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Método B: Acceso manual por email
    const handleDarAccesoEmail = async () => {
        if (!email.trim()) return;
        setLoadingEmail(true);
        setEmailMsg('');
        try {
            // Buscar si ya existe el usuario via Firebase Admin (no disponible en cliente)
            // Usamos la colección users para buscar por email
            const { getDocs, query, where } = await import('firebase/firestore');
            const q = query(collection(db, 'users'), where('email', '==', email.trim()));
            const snap = await getDocs(q);

            if (!snap.empty) {
                // Usuario encontrado → actualizar rol
                const userDoc = snap.docs[0];
                await setDoc(doc(db, 'users', userDoc.id), {
                    role: 'legacy',
                    legacyExpiry: oneYearFromNow(),
                    legacyGrantedAt: new Date().toISOString(),
                    niveles: { jaboneria_basica: 0, jaboneria_avanzada: 0, velas_basica: 0, velas_avanzada: 0 },
                }, { merge: true });
                setEmailMsg(`✅ Acceso legacy otorgado a ${email} por 1 año.`);
            } else {
                // Usuario no existe → crear registro pending
                // La usuaria deberá registrarse con ese email y el rol será aplicado
                await addDoc(collection(db, 'legacy_pendientes'), {
                    email: email.trim(),
                    legacyExpiry: oneYearFromNow(),
                    grantedAt: new Date().toISOString(),
                });
                setEmailMsg(`⚠️ El email no tiene cuenta aún. Se guardó como pendiente. Cuando se registre con ese email, el acceso se aplicará automáticamente.`);
            }
        } catch (e) {
            console.error(e);
            setEmailMsg('❌ Error al dar acceso. Verifica el email.');
        } finally {
            setLoadingEmail(false);
            setEmail('');
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    👩‍🎓 Acceso para Alumnas Anteriores
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Otorga 1 año de acceso gratuito al nivel 0 (contenido básico) a alumnas que compraron antes de la plataforma.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

                {/* Método A: Código */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        <Key size={24} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-dark)' }}>Método A — Código Canjeable</h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        Genera un código único y envíaselo a la alumna por WhatsApp o email. Ella lo canjea en <strong>miorquidea.com/canjear</strong>.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerarCodigo}
                        disabled={loadingCode}
                        style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem' }}
                    >
                        {loadingCode ? 'Generando...' : '🎟️ Generar Código de Acceso'}
                    </button>

                    {generatedCode && (
                        <div style={{
                            backgroundColor: 'var(--color-light-bg)', borderRadius: 'var(--radius-sm)',
                            padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
                        }}>
                            <code style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                                {generatedCode}
                            </code>
                            <button onClick={handleCopy} style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    )}
                    {codeMsg && <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--color-gray-800)' }}>{codeMsg}</p>}
                </div>

                {/* Método B: Email manual */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        <UserPlus size={24} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-dark)' }}>Método B — Acceso por Email</h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        Escribe el email de la alumna y dale acceso directamente. Si ya tiene cuenta, se actualiza; si no, se guarda como pendiente.
                    </p>

                    <input
                        type="email"
                        placeholder="alumna@ejemplo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-field"
                        style={{
                            width: '100%', padding: '0.8rem 1rem', marginBottom: '1rem',
                            borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)',
                            fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleDarAccesoEmail()}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleDarAccesoEmail}
                        disabled={loadingEmail || !email.trim()}
                        style={{ width: '100%', padding: '0.9rem' }}
                    >
                        {loadingEmail ? 'Aplicando...' : '✅ Dar Acceso Legacy (1 año)'}
                    </button>
                    {emailMsg && <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--color-gray-800)' }}>{emailMsg}</p>}
                </div>
            </div>
        </div>
    );
};
