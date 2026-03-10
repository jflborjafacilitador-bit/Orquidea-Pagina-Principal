import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { TrendingUp, CheckCircle, AlertCircle, ArrowUp } from 'lucide-react';
import type { MapaSuscripciones, GrupoCategoria, PlanSub } from '../../types/suscripciones';
import { GRUPO_LABEL, PLAN_LABEL, PLAN_COLOR } from '../../types/suscripciones';
import { Link } from 'react-router-dom';

const MP_BRONCE = import.meta.env.VITE_MP_BRONCE_URL || '#';
const MP_PLATA = import.meta.env.VITE_MP_PLATA_URL || '#';
const MP_ORO = import.meta.env.VITE_MP_ORO_URL || '#';
const MP_UNICO = import.meta.env.VITE_MP_UNICO_URL || '#';

const UPGRADE_URL: Record<GrupoCategoria, Partial<Record<PlanSub, string>>> = {
    jaboneria: { cobre: MP_PLATA },   // Upgrade Cobre→Plata Jabonería
    velas: { cobre: MP_PLATA },
    moldes: {},
    marketing: {},
};

// Max videos unlocked per level (approx progression guide)
const NIVEL_PROGRESS_MAX = 12;

export const MisSuscripciones = () => {
    const [suscripciones, setSuscripciones] = useState<MapaSuscripciones>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubs();
    }, []);

    const loadSubs = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) { setLoading(false); return; }
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) {
                setSuscripciones(snap.data().suscripciones ?? {});
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const activaSubs = (Object.entries(suscripciones) as [GrupoCategoria, any][])
        .filter(([, s]) => s?.activa);
    const inactivaSubs = (Object.entries(suscripciones) as [GrupoCategoria, any][])
        .filter(([, s]) => !s?.activa);

    if (loading) return <div className="pulse">Cargando suscripciones...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    📋 Mis Suscripciones
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Aquí puedes ver tu progreso en cada área y gestionar tu plan.
                </p>
            </div>

            {activaSubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <AlertCircle size={48} color="var(--color-primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h2 style={{ color: 'var(--color-gray-800)', marginBottom: '1rem' }}>Sin suscripciones activas</h2>
                    <Link to="/precios" className="btn btn-primary">Ver planes disponibles →</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {activaSubs.map(([grupo, sub]) => (
                        <SubCard key={grupo} grupo={grupo} sub={sub} />
                    ))}
                </div>
            )}

            {/* Explorar más */}
            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ color: 'var(--color-text-dark)', fontSize: '1.2rem', marginBottom: '1.2rem' }}>
                    ➕ Explorar otras áreas
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {(['jaboneria', 'velas', 'moldes', 'marketing'] as GrupoCategoria[])
                        .filter(g => !suscripciones[g]?.activa)
                        .map(grupo => (
                            <Link to="/precios" key={grupo}
                                onClick={() => localStorage.setItem('orquidea_categoria', grupo)}
                                style={{
                                    display: 'block', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                                    border: '2px dashed rgba(0,0,0,0.1)', textDecoration: 'none', textAlign: 'center',
                                    color: 'var(--color-gray-800)', fontSize: '0.9rem', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = 'var(--color-gray-800)'; }}
                            >
                                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                    {GRUPO_LABEL[grupo].split(' ')[0]}
                                </div>
                                <div style={{ fontWeight: 600 }}>{GRUPO_LABEL[grupo].substring(2)}</div>
                                <div style={{ fontSize: '0.78rem', marginTop: '0.4rem' }}>Ver planes →</div>
                            </Link>
                        ))}
                </div>
            </div>

            {inactivaSubs.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ color: 'var(--color-text-dark)', fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.6 }}>
                        Suscripciones anteriores
                    </h2>
                    {inactivaSubs.map(([grupo, sub]) => (
                        <div key={grupo} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0,0,0,0.03)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                            <span style={{ fontSize: '0.9rem' }}>{GRUPO_LABEL[grupo]} — {PLAN_LABEL[sub.plan as PlanSub]}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)' }}>Nivel {sub.nivel} alcanzado</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface SubCardProps {
    grupo: GrupoCategoria;
    sub: { plan: PlanSub; nivel: number; activa: boolean; desde?: string };
}

const SubCard = ({ grupo, sub }: SubCardProps) => {
    const color = PLAN_COLOR[sub.plan] ?? '#CD7F32';
    const progress = Math.min((sub.nivel / NIVEL_PROGRESS_MAX) * 100, 100);
    const sinceLabel = sub.desde ? `desde ${new Date(sub.desde).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}` : '';
    const upgradeUrl = UPGRADE_URL[grupo]?.[sub.plan];

    return (
        <div className="glass animate-fade-in" style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-sm)',
            border: `2px solid ${color}22`
        }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', backgroundColor: `${color}10`, borderBottom: `1px solid ${color}22` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{GRUPO_LABEL[grupo].split(' ')[0]}</div>
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-text-dark)', margin: 0 }}>
                            {GRUPO_LABEL[grupo].substring(2)}
                        </h3>
                    </div>
                    <div>
                        <span style={{
                            backgroundColor: `${color}22`, color, padding: '0.25rem 0.8rem',
                            borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700
                        }}>
                            {PLAN_LABEL[sub.plan]}
                        </span>
                    </div>
                </div>
                {sinceLabel && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)', marginTop: '0.5rem' }}>{sinceLabel}</p>
                )}
            </div>

            {/* Nivel */}
            <div style={{ padding: '1.2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                        <TrendingUp size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                        Nivel actual
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color }}>
                        {sub.nivel}
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '8px', backgroundColor: 'var(--color-light-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        borderRadius: '4px', transition: 'width 0.6s ease'
                    }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)', marginTop: '0.4rem' }}>
                    {sub.nivel === 0
                        ? 'Nivel 0 — Acceso desde el mes 1. Sigue activa para subir de nivel cada mes.'
                        : `Nivel ${sub.nivel} — Llevas ${sub.nivel} ${sub.nivel === 1 ? 'mes' : 'meses'} activa. ¡Sigue así!`}
                </p>

                {/* Accesos incluidos */}
                <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <AccessItem label={`${GRUPO_LABEL[grupo].substring(2)} Básica`} ok={true} />
                    {(grupo === 'jaboneria' || grupo === 'velas') && (
                        <AccessItem label={`${GRUPO_LABEL[grupo].substring(2)} Avanzada`} ok={sub.plan === 'plata' || sub.plan === 'oro'} />
                    )}
                    <AccessItem label="Blog y artículos exclusivos" ok={true} />
                </div>

                {/* Upgrade */}
                {upgradeUrl && (
                    <a href={upgradeUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            marginTop: '1rem', padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                            border: `1.5px solid ${color}`, color, textDecoration: 'none',
                            fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${color}12`; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                    >
                        <ArrowUp size={15} /> Mejorar a Plata
                    </a>
                )}

                <a
                    href="https://www.mercadopago.com.mx/subscriptions"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-800)' }}
                >
                    Gestionar suscripción en Mercado Pago →
                </a>
            </div>
        </div>
    );
};

const AccessItem = ({ label, ok }: { label: string; ok: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
        {ok
            ? <CheckCircle size={14} color="#4CAF50" style={{ flexShrink: 0 }} />
            : <span style={{ width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-gray-800)' }}>✕</span>
        }
        <span style={{ color: ok ? 'var(--color-text-dark)' : 'var(--color-gray-800)', opacity: ok ? 1 : 0.5 }}>{label}</span>
    </div>
);
