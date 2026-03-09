import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react';

const oneYearFromNow = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
};

export const Canjear = () => {
    const [codigo, setCodigo] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null);

    const handleCanjear = async () => {
        if (!codigo.trim() || !email.trim()) return;
        setLoading(true);
        setResultado(null);
        try {
            // Buscar el código en Firestore
            const q = query(
                collection(db, 'codigos_legacy'),
                where('code', '==', codigo.trim().toUpperCase()),
                where('usado', '==', false)
            );
            const snap = await getDocs(q);

            if (snap.empty) {
                setResultado({ ok: false, msg: 'Código inválido o ya fue utilizado. Verifica que lo hayas escrito correctamente.' });
                return;
            }

            const codeDoc = snap.docs[0];
            const codeData = codeDoc.data();

            // Verificar expiración
            if (codeData.expiry && new Date(codeData.expiry) < new Date()) {
                setResultado({ ok: false, msg: 'Este código ha expirado. Contacta a Orquídea para más información.' });
                return;
            }

            // Buscar usuario por email
            const userQ = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
            const userSnap = await getDocs(userQ);

            if (userSnap.empty) {
                setResultado({ ok: false, msg: 'No encontramos una cuenta con ese email. Primero regístrate en miorquidea.com/login y luego vuelve aquí a canjear.' });
                return;
            }

            const userDoc = userSnap.docs[0];

            // Aplicar legacy con categorías y tier del código
            const categories: string[] = codeData.categories ?? [];
            const tier: string = codeData.tier ?? 'cobre';

            await setDoc(doc(db, 'users', userDoc.id), {
                role: 'legacy',
                legacyTier: tier,
                legacyCategories: categories,
                legacyExpiry: oneYearFromNow(),
                legacyGrantedAt: new Date().toISOString(),
                niveles: Object.fromEntries(categories.map((c: string) => [c, 0])),
            }, { merge: true });

            // Marcar código como usado
            await setDoc(doc(db, 'codigos_legacy', codeDoc.id), {
                usado: true,
                usadoPor: email.trim().toLowerCase(),
                usadoAt: new Date().toISOString()
            }, { merge: true });

            setResultado({ ok: true, msg: '🎉 ¡Código canjeado! Ya tienes acceso por 1 año a las secciones incluidas en tu código. Inicia sesión para comenzar.' });
        } catch (e) {
            console.error(e);
            setResultado({ ok: false, msg: 'Error al procesar el código. Intenta de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'var(--color-light-bg)' }}>
            <div className="glass animate-fade-in" style={{
                maxWidth: '480px', width: '100%', padding: '3rem 2.5rem',
                borderRadius: 'var(--radius-lg)', textAlign: 'center',
                backgroundColor: 'var(--color-white)'
            }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto', color: 'white'
                }}>
                    <Gift size={36} />
                </div>

                <h1 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    Canjear Código de Acceso
                </h1>
                <p style={{ color: 'var(--color-gray-800)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Si recibiste un código de Orquídea, ingrésalo aquí para activar tu acceso gratuito por 1 año.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input
                        type="email"
                        placeholder="Tu email registrado en Orquídea"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            padding: '0.9rem 1rem', borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--color-light-bg)', fontSize: '0.95rem',
                            outline: 'none', width: '100%', boxSizing: 'border-box'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="ORQUIDEA-XXXXXXXX"
                        value={codigo}
                        onChange={e => setCodigo(e.target.value.toUpperCase())}
                        style={{
                            padding: '0.9rem 1rem', borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--color-light-bg)', fontSize: '1rem',
                            fontFamily: 'monospace', letterSpacing: '1px', textAlign: 'center',
                            outline: 'none', width: '100%', boxSizing: 'border-box', fontWeight: 700
                        }}
                    />
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleCanjear}
                    disabled={loading || !codigo.trim() || !email.trim()}
                    style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                >
                    {loading ? 'Verificando...' : '🎟️ Canjear Acceso'}
                </button>

                {resultado && (
                    <div style={{
                        marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-sm)',
                        backgroundColor: resultado.ok ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.8rem', textAlign: 'left'
                    }}>
                        {resultado.ok
                            ? <CheckCircle size={20} color="#4CAF50" style={{ flexShrink: 0, marginTop: 2 }} />
                            : <AlertCircle size={20} color="#f44336" style={{ flexShrink: 0, marginTop: 2 }} />
                        }
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-dark)', margin: 0 }}>{resultado.msg}</p>
                    </div>
                )}

                {resultado?.ok && (
                    <a href="/login" className="btn btn-outline" style={{ display: 'block', marginTop: '1rem', textDecoration: 'none' }}>
                        Ir a Iniciar Sesión →
                    </a>
                )}
            </div>
        </div>
    );
};
