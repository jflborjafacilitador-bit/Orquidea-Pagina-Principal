import React from 'react';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';

const MP_COBRE = import.meta.env.VITE_MP_BRONCE_URL || '#';
const MP_PLATA = import.meta.env.VITE_MP_PLATA_URL || '#';
const MP_ORO = import.meta.env.VITE_MP_ORO_URL || '#';
const MP_UNICO = import.meta.env.VITE_MP_UNICO_URL || '#';

type GrupoCategoria = 'velas' | 'jaboneria' | 'moldes' | 'marketing';

interface Plan {
    key: string;
    nombre: string;
    emoji: string;
    precio: number;
    descripcion: string;
    features: string[];
    url: string;
    color: string;
    destacado?: boolean;
}

const PLANES_POR_GRUPO: Record<GrupoCategoria, Plan[]> = {
    velas: [
        {
            key: 'cobre_velas', nombre: 'Cobre', emoji: '🥉', precio: 299, color: '#CD7F32',
            descripcion: 'Velas Básica + Blog',
            features: ['Velas Básica (nivel 1+)', 'Blog y artículos', 'Soporte por email'],
            url: MP_COBRE,
        },
        {
            key: 'plata_velas', nombre: 'Plata', emoji: '🥈', precio: 499, color: '#707B7C',
            descripcion: 'Velas Básica + Avanzada',
            features: ['Velas Básica + Avanzada', 'Blog y artículos', 'Soporte por email'],
            url: MP_PLATA,
        },
        {
            key: 'oro_velas', nombre: 'Oro', emoji: '🥇', precio: 799, color: '#B8860B',
            descripcion: 'Todo + clase mensual de Velas',
            features: ['Velas Básica + Avanzada', 'Blog y artículos', '1 clase personal/mes (Velas)', 'Soporte 24/7 con Orquídea'],
            url: MP_ORO,
            destacado: true,
        },
    ],
    jaboneria: [
        {
            key: 'cobre_jab', nombre: 'Cobre', emoji: '🥉', precio: 299, color: '#CD7F32',
            descripcion: 'Jabonería Básica + Blog',
            features: ['Jabonería Básica (nivel 1+)', 'Blog y artículos', 'Soporte por email'],
            url: MP_COBRE,
        },
        {
            key: 'plata_jab', nombre: 'Plata', emoji: '🥈', precio: 499, color: '#707B7C',
            descripcion: 'Jabonería Básica + Avanzada',
            features: ['Jabonería Básica + Avanzada', 'Blog y artículos', 'Soporte por email'],
            url: MP_PLATA,
        },
        {
            key: 'oro_jab', nombre: 'Oro', emoji: '🥇', precio: 799, color: '#B8860B',
            descripcion: 'Todo + clase mensual de Jabonería',
            features: ['Jabonería Básica + Avanzada', 'Blog y artículos', '1 clase personal/mes (Jabonería)', 'Soporte 24/7 con Orquídea'],
            url: MP_ORO,
            destacado: true,
        },
    ],
    moldes: [
        {
            key: 'unico_moldes', nombre: 'Único', emoji: '✨', precio: 199, color: '#7c3aed',
            descripcion: 'Acceso completo a Moldes de Silicón',
            features: ['Moldes de Silicón (acceso inmediato)', 'Sin sistema de niveles', 'Blog y artículos', 'Soporte por email'],
            url: MP_UNICO,
        },
    ],
    marketing: [
        {
            key: 'unico_mkt', nombre: 'Único', emoji: '✨', precio: 199, color: '#7c3aed',
            descripcion: 'Acceso completo a Marketing Digital',
            features: ['Marketing Digital (acceso inmediato)', 'Sin sistema de niveles', 'Blog y artículos', 'Soporte por email'],
            url: MP_UNICO,
        },
    ],
};

const GRUPO_LABEL: Record<GrupoCategoria, string> = {
    velas: '🕯️ Velas',
    jaboneria: '🧼 Jabonería',
    moldes: '🧩 Moldes',
    marketing: '📱 Marketing',
};

interface Props {
    grupo: GrupoCategoria;
    videoTitle?: string;
    onClose?: () => void;
}

export const PaywallPlanes = ({ grupo, videoTitle, onClose }: Props) => {
    const planes = PLANES_POR_GRUPO[grupo];

    const handleSuscribirse = (plan: Plan) => {
        // Save category to localStorage so PagoExitoso knows which group to add
        localStorage.setItem('orquidea_categoria', grupo);
        window.open(plan.url, '_blank');
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="animate-fade-in" style={{ maxWidth: '720px', width: '100%', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', padding: '2rem', textAlign: 'center', color: 'white', position: 'relative' }}>
                    {onClose && (
                        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✕
                        </button>
                    )}
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                    {videoTitle && <p style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '0.3rem' }}>"{videoTitle}"</p>}
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.3rem' }}>
                        Contenido Premium — {GRUPO_LABEL[grupo]}
                    </h2>
                    <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
                        Elige el plan que mejor se ajuste a ti
                    </p>
                </div>

                {/* Planes */}
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: `repeat(${planes.length}, 1fr)`, gap: '1rem' }}>
                    {planes.map(plan => (
                        <div key={plan.key} style={{ border: `2px solid ${plan.destacado ? plan.color : plan.color + '33'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', boxShadow: plan.destacado ? `0 8px 24px ${plan.color}33` : 'none' }}>
                            {plan.destacado && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', backgroundColor: plan.color, color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem', letterSpacing: '0.5px' }}>
                                    ⭐ MÁS COMPLETO
                                </div>
                            )}
                            <div style={{ padding: plan.destacado ? '2rem 1.2rem 1.2rem' : '1.5rem 1.2rem 1.2rem', backgroundColor: `${plan.color}08` }}>
                                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>{plan.emoji}</div>
                                    <div style={{ fontWeight: 800, color: plan.color, fontSize: '1rem' }}>{plan.nombre}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)' }}>{plan.descripcion}</div>
                                </div>
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-text-dark)' }}>${plan.precio}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)' }}>/mes</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem' }}>
                                            <CheckCircle size={13} color="#4CAF50" style={{ flexShrink: 0, marginTop: '1px' }} />
                                            <span style={{ color: 'var(--color-text-dark)' }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="btn"
                                    onClick={() => handleSuscribirse(plan)}
                                    style={{
                                        width: '100%', padding: '0.7rem',
                                        backgroundColor: plan.destacado ? plan.color : 'transparent',
                                        color: plan.destacado ? 'white' : plan.color,
                                        border: `2px solid ${plan.color}`,
                                        borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { if (!plan.destacado) { e.currentTarget.style.backgroundColor = `${plan.color}15`; } }}
                                    onMouseLeave={e => { if (!plan.destacado) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
                                >
                                    Suscribirme — {plan.nombre}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-gray-800)', paddingBottom: '1.5rem' }}>
                    Pago seguro con Mercado Pago · Cancela cuando quieras
                </p>
            </div>
        </div>
    );
};

export type { GrupoCategoria };
