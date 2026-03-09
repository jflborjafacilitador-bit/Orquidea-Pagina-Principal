import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { UserPlus, Key, Copy, Check } from 'lucide-react';

const CATEGORIAS = [
    { key: 'jaboneria_basica', label: '🧼 Jabonería Básica' },
    { key: 'jaboneria_avanzada', label: '🧼 Jabonería Avanzada' },
    { key: 'velas_basica', label: '🕯️ Velas Básica' },
    { key: 'velas_avanzada', label: '🕯️ Velas Avanzada' },
    { key: 'moldes_silicon', label: '🧩 Moldes de Silicón' },
    { key: 'marketing_digital', label: '📱 Marketing Digital' },
];

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

// Panel form compartido
interface LegacyFormState {
    categorias: string[];
    nivel: 'cobre' | 'plata';
}

const emptyForm = (): LegacyFormState => ({ categorias: [], nivel: 'cobre' });

const CategorySelector = ({
    state,
    onChange,
}: {
    state: LegacyFormState;
    onChange: (s: LegacyFormState) => void;
}) => {
    const toggleCat = (key: string) => {
        const next = state.categorias.includes(key)
            ? state.categorias.filter(c => c !== key)
            : [...state.categorias, key];
        onChange({ ...state, categorias: next });
    };

    return (
        <div>
            <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: '0.6rem' }}>
                Categorías con acceso:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {CATEGORIAS.map(cat => (
                    <button
                        key={cat.key}
                        type="button"
                        onClick={() => toggleCat(cat.key)}
                        style={{
                            padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600,
                            border: state.categorias.includes(cat.key)
                                ? '2px solid var(--color-primary)'
                                : '2px solid var(--color-light-bg)',
                            backgroundColor: state.categorias.includes(cat.key)
                                ? 'rgba(172,17,62,0.08)' : 'transparent',
                            color: state.categorias.includes(cat.key) ? 'var(--color-primary)' : 'var(--color-gray-800)',
                            cursor: 'pointer', transition: 'all 0.15s'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: '0.6rem' }}>
                Nivel de acceso:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['cobre', 'plata'] as const).map(n => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange({ ...state, nivel: n })}
                        style={{
                            padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700,
                            border: state.nivel === n ? '2px solid var(--color-primary)' : '2px solid var(--color-light-bg)',
                            backgroundColor: state.nivel === n ? 'rgba(172,17,62,0.08)' : 'transparent',
                            color: state.nivel === n ? 'var(--color-primary)' : 'var(--color-gray-800)',
                            cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s'
                        }}
                    >
                        {n === 'cobre' ? '🥉 Cobre (básico)' : '🥈 Plata (avanzado)'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const LegacyAccess = () => {
    const [formA, setFormA] = useState<LegacyFormState>(emptyForm());
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const [codeMsg, setCodeMsg] = useState('');

    const [formB, setFormB] = useState<LegacyFormState>(emptyForm());
    const [email, setEmail] = useState('');
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [emailMsg, setEmailMsg] = useState('');

    const applyLegacy = (uid: string) =>
        setDoc(doc(db, 'users', uid), {
            role: 'legacy',
            legacyTier: formB.nivel,
            legacyCategories: formB.categorias,
            legacyExpiry: oneYearFromNow(),
            legacyGrantedAt: new Date().toISOString(),
            niveles: Object.fromEntries(formB.categorias.map(c => [c, 0])),
        }, { merge: true });

    // Método A: Generar código
    const handleGenerarCodigo = async () => {
        if (formA.categorias.length === 0) { setCodeMsg('⚠️ Selecciona al menos una categoría.'); return; }
        setLoadingCode(true); setCodeMsg('');
        try {
            const code = generateCode();
            await addDoc(collection(db, 'codigos_legacy'), {
                code,
                usado: false,
                createdAt: new Date().toISOString(),
                usadoPor: null,
                expiry: oneYearFromNow(),
                tier: formA.nivel,
                categories: formA.categorias,
            });
            setGeneratedCode(code);
            setCodeMsg('✅ Código generado. Envíaselo a la alumna.');
        } catch { setCodeMsg('❌ Error al generar.'); }
        finally { setLoadingCode(false); }
    };

    const handleCopy = () => { navigator.clipboard.writeText(generatedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    // Método B: Acceso manual por email
    const handleDarAccesoEmail = async () => {
        if (!email.trim()) return;
        if (formB.categorias.length === 0) { setEmailMsg('⚠️ Selecciona al menos una categoría.'); return; }
        setLoadingEmail(true); setEmailMsg('');
        try {
            const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
            const snap = await getDocs(q);
            if (!snap.empty) {
                await applyLegacy(snap.docs[0].id);
                setEmailMsg(`✅ Acceso legacy otorgado a ${email} por 1 año.`);
            } else {
                await addDoc(collection(db, 'legacy_pendientes'), {
                    email: email.trim().toLowerCase(),
                    tier: formB.nivel,
                    categories: formB.categorias,
                    legacyExpiry: oneYearFromNow(),
                    grantedAt: new Date().toISOString(),
                });
                setEmailMsg(`⚠️ Email sin cuenta aún. Guardado como pendiente — cuando se registre se aplicará automáticamente.`);
            }
        } catch (e) { console.error(e); setEmailMsg('❌ Error. Verifica el email.'); }
        finally { setLoadingEmail(false); setEmail(''); }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    👩‍🎓 Acceso para Alumnas Anteriores
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Elige las categorías y el nivel de acceso antes de generar el código o asignarlo.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

                {/* Método A */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        <Key size={22} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)' }}>Método A — Código Canjeable</h2>
                    </div>

                    <CategorySelector state={formA} onChange={setFormA} />

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerarCodigo}
                        disabled={loadingCode}
                        style={{ width: '100%', padding: '0.85rem', marginTop: '1.2rem', marginBottom: '0.8rem' }}
                    >
                        {loadingCode ? 'Generando...' : '🎟️ Generar Código'}
                    </button>

                    {generatedCode && (
                        <div style={{
                            backgroundColor: 'var(--color-light-bg)', borderRadius: 'var(--radius-sm)',
                            padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
                        }}>
                            <code style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                                {generatedCode}
                            </code>
                            <button onClick={handleCopy} style={{ color: 'var(--color-primary)' }}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    )}
                    {codeMsg && <p style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--color-gray-800)' }}>{codeMsg}</p>}
                </div>

                {/* Método B */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        <UserPlus size={22} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)' }}>Método B — Por Email</h2>
                    </div>

                    <CategorySelector state={formB} onChange={setFormB} />

                    <input
                        type="email"
                        placeholder="alumna@ejemplo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem', marginTop: '1.2rem', marginBottom: '0.8rem',
                            borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)',
                            fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleDarAccesoEmail()}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleDarAccesoEmail}
                        disabled={loadingEmail || !email.trim()}
                        style={{ width: '100%', padding: '0.85rem' }}
                    >
                        {loadingEmail ? 'Aplicando...' : '✅ Dar Acceso Legacy (1 año)'}
                    </button>
                    {emailMsg && <p style={{ marginTop: '0.6rem', fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-gray-800)' }}>{emailMsg}</p>}
                </div>
            </div>
        </div>
    );
};
