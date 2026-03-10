import React from 'react';
import { CheckCircle } from 'lucide-react';

const MP_COBRE = import.meta.env.VITE_MP_BRONCE_URL || '#';
const MP_PLATA = import.meta.env.VITE_MP_PLATA_URL || '#';
const MP_ORO = import.meta.env.VITE_MP_ORO_URL || '#';
const MP_UNICO = import.meta.env.VITE_MP_UNICO_URL || '#';
const MP_PLATINO = import.meta.env.VITE_MP_PLATINO_URL || '#';

export type GrupoCategoria = 'velas' | 'jaboneria' | 'moldes' | 'marketing';

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

const ORO_FEATURES = (cat: string) => [
    `${cat} Básica + Avanzada`,
    'Blog y artículos',
    `1 clase personal/mes (${cat})`,
    'Soporte 24/7 con Orquídea',
];

const PLATINO_FEATURES = [
    'Jabonería Básica + Avanzada',
    'Velas Básica + Avanzada',
    'Blog y artículos',
    '6 clases personales/mes (Jabonería, Velas o ambas)',
    'Soporte VIP 24/7 con Orquídea',
];

const PLANES_POR_GRUPO: Record<GrupoCategoria, Plan[]> = {
    velas: [
        {
            key: 'cobre_vel', nombre: 'Cobre', emoji: '🥉', precio: 299, color: '#CD7F32',
            descripcion: 'Velas Básica + Blog',
            features: ['Velas Básica (nivel 1+)', 'Blog y artículos', 'Soporte por email'],
            url: MP_COBRE
        },
        {
            key: 'plata_vel', nombre: 'Plata', emoji: '🥈', precio: 499, color: '#607D8B',
            descripcion: 'Velas Básica + Avanzada',
            features: ['Velas Básica + Avanzada', 'Blog y artículos', 'Soporte por email'],
            url: MP_PLATA
        },
        {
            key: 'oro_vel', nombre: 'Oro', emoji: '🥇', precio: 799, color: '#B8860B',
            descripcion: 'Todo Velas + 1 clase/mes',
            features: ORO_FEATURES('Velas'), url: MP_ORO, destacado: false
        },
        {
            key: 'platino_vel', nombre: 'Platino', emoji: '💎', precio: 1199, color: '#5C35E4',
            descripcion: 'Jabonería + Velas + 6 clases/mes',
            features: PLATINO_FEATURES, url: MP_PLATINO, destacado: true
        },
    ],
    jaboneria: [
        {
            key: 'cobre_jab', nombre: 'Cobre', emoji: '🥉', precio: 299, color: '#CD7F32',
            descripcion: 'Jabonería Básica + Blog',
            features: ['Jabonería Básica (nivel 1+)', 'Blog y artículos', 'Soporte por email'],
            url: MP_COBRE
        },
        {
            key: 'plata_jab', nombre: 'Plata', emoji: '🥈', precio: 499, color: '#607D8B',
            descripcion: 'Jabonería Básica + Avanzada',
            features: ['Jabonería Básica + Avanzada', 'Blog y artículos', 'Soporte por email'],
            url: MP_PLATA
        },
        {
            key: 'oro_jab', nombre: 'Oro', emoji: '🥇', precio: 799, color: '#B8860B',
            descripcion: 'Todo Jabonería + 1 clase/mes',
            features: ORO_FEATURES('Jabonería'), url: MP_ORO, destacado: false
        },
        {
            key: 'platino_jab', nombre: 'Platino', emoji: '💎', precio: 1199, color: '#5C35E4',
            descripcion: 'Jabonería + Velas + 6 clases/mes',
            features: PLATINO_FEATURES, url: MP_PLATINO, destacado: true
        },
    ],
    moldes: [
        {
            key: 'unico_mol', nombre: 'Único', emoji: '✨', precio: 199, color: '#7c3aed',
            descripcion: 'Acceso completo Moldes de Silicón',
            features: ['Moldes de Silicón (acceso inmediato)', 'Sin niveles — acceso completo', 'Blog y artículos', 'Soporte por email'],
            url: MP_UNICO
        },
    ],
    marketing: [
        {
            key: 'unico_mkt', nombre: 'Único', emoji: '✨', precio: 199, color: '#7c3aed',
            descripcion: 'Acceso completo Marketing Digital',
            features: ['Marketing Digital (acceso inmediato)', 'Sin niveles — acceso completo', 'Blog y artículos', 'Soporte por email'],
            url: MP_UNICO
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
    const cols = planes.length;

    const handleSuscribirse = (plan: Plan) => {
        localStorage.setItem('orquidea_categoria', grupo);
        window.open(plan.url, '_blank');
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
            <div className="animate-fade-in" style={{ maxWidth: cols >= 4 ? '920px' : '640px', width: '100%', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', maxHeight: '92vh', overflowY: 'auto' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', padding: '1.8rem 2rem', textAlign: 'center', color: 'white', position: 'relative' }}>
                    {onClose && (
                        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    )}
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>🔒</div>
                    {videoTitle && <p style={{ opacity: 0.8, fontSize: '0.82rem', marginBottom: '0.3rem' }}>"{videoTitle}"</p>}
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.25rem' }}>Contenido Premium — {GRUPO_LABEL[grupo]}</h2>
                    <p style={{ opacity: 0.85, fontSize: '0.85rem' }}>Elige el plan ideal para ti</p>
                </div>

                {/* Plans grid */}
                <div style={{ padding: '1.2rem', display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 2)}, 1fr)`, gap: '0.8rem' }}>
                    {planes.map(plan => (
                        <div key={plan.key} style={{ border: `2px solid ${plan.destacado ? plan.color : plan.color + '33'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', boxShadow: plan.destacado ? `0 8px 20px ${plan.color}33` : 'none' }}>
                            {plan.destacado && (
                                <div style={{ backgroundColor: plan.color, color: 'white', fontSize: '0.68rem', fontWeight: 700, textAlign: 'center', padding: '0.25rem', letterSpacing: '0.5px' }}>
                                    ⭐ MÁS COMPLETO
                                </div>
                            )}
                            <div style={{ padding: '1.2rem', backgroundColor: `${plan.color}08` }}>
                                <div style={{ textAlign: 'center', marginBottom: '0.7rem' }}>
                                    <div style={{ fontSize: '1.6rem' }}>{plan.emoji}</div>
                                    <div style={{ fontWeight: 800, color: plan.color, fontSize: '0.95rem' }}>{plan.nombre}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-gray-800)', minHeight: '1.2rem' }}>{plan.descripcion}</div>
                                </div>
                                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text-dark)' }}>${plan.precio}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)' }}>/mes</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.9rem' }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.78rem' }}>
                                            <CheckCircle size={12} color="#4CAF50" style={{ flexShrink: 0, marginTop: '1px' }} />
                                            <span style={{ color: 'var(--color-text-dark)' }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="btn"
                                    onClick={() => handleSuscribirse(plan)}
                                    style={{ width: '100%', padding: '0.6rem', backgroundColor: plan.destacado ? plan.color : 'transparent', color: plan.destacado ? 'white' : plan.color, border: `2px solid ${plan.color}`, borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Suscribirme — {plan.nombre}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-gray-800)', paddingBottom: '1.2rem' }}>
                    Pago seguro con Mercado Pago · Cancela cuando quieras
                </p>
            </div>
        </div>
    );
};
