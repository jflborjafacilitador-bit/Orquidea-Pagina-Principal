import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Star, Crown, ChevronLeft } from 'lucide-react';

const MP_BRONCE = import.meta.env.VITE_MP_BRONCE_URL || '#';
const MP_PLATA = import.meta.env.VITE_MP_PLATA_URL || '#';
const MP_ORO = import.meta.env.VITE_MP_ORO_URL || '#';
const MP_UNICO = import.meta.env.VITE_MP_UNICO_URL || '#';

// ─────────────────────────────────────────────
// Paso 1: Selector de interés
// ─────────────────────────────────────────────
const INTERESES = [
    {
        key: 'jaboneria',
        emoji: '🧼',
        label: 'Jabonería',
        desc: 'Aprende a elaborar jabones artesanales desde cero hasta técnicas avanzadas.',
        color: '#CD7F32',
    },
    {
        key: 'velas',
        emoji: '🕯️',
        label: 'Velas Artesanales',
        desc: 'Domina el arte de las velas: aromas, acabados premium y técnicas de coloración.',
        color: '#A8A9AD',
    },
    {
        key: 'moldes',
        emoji: '🧩',
        label: 'Moldes de Silicón',
        desc: 'Crea y usa moldes de silicón para tus productos. Acceso único sin niveles.',
        color: '#7c3aed',
    },
    {
        key: 'marketing',
        emoji: '📱',
        label: 'Marketing Digital',
        desc: 'Vende tus creaciones en línea. Estrategias reales para emprendedoras.',
        color: '#0ea5e9',
    },
];

// ─────────────────────────────────────────────
// Paso 2: Planes según interés
// ─────────────────────────────────────────────
const getPlans = (interes: string) => {
    const categoriaLabel = interes === 'jaboneria' ? 'Jabonería' : 'Velas';

    if (interes === 'jaboneria' || interes === 'velas') {
        return [
            {
                key: 'cobre',
                name: 'Cobre',
                subtitle: `${categoriaLabel} Básica`,
                price: 299,
                icon: <Sparkles size={26} />,
                color: '#CD7F32',
                gradient: 'linear-gradient(135deg, #CD7F32, #E8A96B)',
                features: [
                    `Cursos básicos de ${categoriaLabel}`,
                    'Blog y artículos exclusivos',
                    'Videos en alta calidad',
                    'Soporte por email con Orquídea',
                ],
                notIncluded: [`Cursos avanzados de ${categoriaLabel}`, 'Clase personal mensual'],
                url: MP_BRONCE,
                popular: false,
            },
            {
                key: 'plata',
                name: 'Plata',
                subtitle: `${categoriaLabel} Completa`,
                price: 499,
                icon: <Star size={26} />,
                color: '#707B7C',
                gradient: 'linear-gradient(135deg, #707B7C, #BFC9CA)',
                features: [
                    `Cursos básicos y avanzados de ${categoriaLabel}`,
                    'Blog y artículos exclusivos',
                    'Técnicas avanzadas de diseño',
                    'Comunidad de miembros',
                    'Soporte prioritario con Orquídea',
                ],
                notIncluded: ['Clase personal mensual'],
                url: MP_PLATA,
                popular: true,
            },
            {
                key: 'oro',
                name: 'Oro',
                subtitle: 'Todo incluido',
                price: 799,
                icon: <Crown size={26} />,
                color: '#B8860B',
                gradient: 'linear-gradient(135deg, #B8860B, #FFD700)',
                features: [
                    `Cursos básicos y avanzados de ${categoriaLabel}`,
                    'Moldes de Silicón + Marketing Digital',
                    'Blog y artículos exclusivos',
                    '1 clase personal por mes (1 hora)',
                    'Soporte 24/7 con Orquídea',
                ],
                notIncluded: [],
                url: MP_ORO,
                popular: false,
            },
        ];
    }

    // Moldes o Marketing → solo plan Único + Oro
    const catLabel = interes === 'moldes' ? 'Moldes de Silicón' : 'Marketing Digital';
    return [
        {
            key: 'unico',
            name: 'Único',
            subtitle: catLabel,
            price: 199,
            icon: <Sparkles size={26} />,
            color: '#7c3aed',
            gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            features: [
                `Acceso completo a ${catLabel}`,
                'Sin sistema de niveles — acceso inmediato',
                'Blog y artículos exclusivos',
                'Soporte por email con Orquídea',
            ],
            notIncluded: ['Jabonería / Velas', 'Clase personal mensual'],
            url: MP_UNICO,
            popular: false,
        },
        {
            key: 'oro',
            name: 'Oro',
            subtitle: 'Todo incluido',
            price: 799,
            icon: <Crown size={26} />,
            color: '#B8860B',
            gradient: 'linear-gradient(135deg, #B8860B, #FFD700)',
            features: [
                'Jabonería + Velas (básico y avanzado)',
                'Moldes de Silicón + Marketing Digital',
                'Blog y artículos exclusivos',
                '1 clase personal por mes (1 hora)',
                'Soporte 24/7 con Orquídea',
            ],
            notIncluded: [],
            url: MP_ORO,
            popular: true,
        },
    ];
};

interface PreciosProps {
    onClose?: () => void;
    showTitle?: boolean;
}

export const Precios = ({ onClose, showTitle = true }: PreciosProps) => {
    const [interes, setInteres] = useState<string | null>(null);

    const handleSelectInteres = (key: string) => {
        // Save category preference so PagoExitoso can apply it
        localStorage.setItem('orquidea_categoria', key);
        setInteres(key);
    };

    const plans = interes ? getPlans(interes) : [];
    const interesData = INTERESES.find(i => i.key === interes);

    return (
        <div>
            {/* Header */}
            {showTitle && (
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    {interes ? (
                        <button
                            onClick={() => setInteres(null)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: 'var(--color-gray-800)', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            <ChevronLeft size={16} /> Cambiar interés
                        </button>
                    ) : null}
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2.2rem', marginBottom: '0.8rem', fontWeight: 800 }}>
                        {interes ? `Planes de ${interesData?.label}` : '¿Qué quieres aprender?'}
                    </h1>
                    <p style={{ color: 'var(--color-gray-800)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
                        {interes
                            ? `Elige el nivel que mejor se adapte a ti. Cancela cuando quieras.`
                            : 'Cada área es independiente. Suscríbete a lo que te apasiona.'}
                    </p>
                </div>
            )}

            {/* Paso 1: Selección de interés */}
            {!interes && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1rem' }}>
                    {INTERESES.map(item => (
                        <button
                            key={item.key}
                            onClick={() => handleSelectInteres(item.key)}
                            style={{
                                padding: '2rem 1.5rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                                border: '2px solid rgba(0,0,0,0.06)', backgroundColor: 'var(--color-white)',
                                textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.8rem'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                        >
                            <div style={{ fontSize: '2.5rem' }}>{item.emoji}</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: item.color, marginBottom: '0.4rem' }}>{item.label}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-800)', lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                            <div style={{ marginTop: 'auto', fontSize: '0.82rem', fontWeight: 600, color: item.color }}>
                                Ver planes →
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Paso 2: Planes según interés */}
            {interes && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                    {plans.map(plan => (
                        <div
                            key={plan.key}
                            className="glass animate-fade-in"
                            style={{
                                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                border: plan.popular ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)',
                                transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                                boxShadow: plan.popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                            }}
                        >
                            {plan.popular && (
                                <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
                                    ⭐ MÁS POPULAR
                                </div>
                            )}
                            {/* Header */}
                            <div style={{ background: plan.gradient, padding: '1.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'white' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {plan.icon}
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Orquídea {plan.name}</h2>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{plan.subtitle}</div>
                                <div style={{ marginTop: '0.4rem' }}>
                                    <span style={{ fontSize: '2.6rem', fontWeight: 800 }}>${plan.price}</span>
                                    <span style={{ opacity: 0.85, marginLeft: '0.3rem', fontSize: '0.9rem' }}>MXN/mes</span>
                                </div>
                            </div>
                            {/* Features */}
                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-white)' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem 0', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                                    {plan.features.map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.88rem' }}>
                                            <Check size={17} color="#4CAF50" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span style={{ color: 'var(--color-text-dark)' }}>{f}</span>
                                        </li>
                                    ))}
                                    {plan.notIncluded.map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.88rem', opacity: 0.4 }}>
                                            <span style={{ flexShrink: 0, marginTop: '2px' }}>✕</span>
                                            <span style={{ color: 'var(--color-text-dark)' }}>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href={plan.url} target="_blank" rel="noopener noreferrer" onClick={onClose}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'center', padding: '0.9rem',
                                        fontSize: '1rem', fontWeight: 700, textDecoration: 'none', borderRadius: 'var(--radius-sm)',
                                        background: plan.popular ? 'var(--color-primary)' : 'transparent',
                                        color: plan.popular ? 'white' : plan.color,
                                        border: plan.popular ? 'none' : `2px solid ${plan.color}`,
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    Suscribirse — {plan.name}
                                </a>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)', textAlign: 'center', marginTop: '0.7rem' }}>
                                    Paga de forma segura con Mercado Pago. Cancela cuando quieras.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showTitle && (
                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>
                    ¿Ya eres miembro? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inicia sesión aquí</Link>
                </p>
            )}
        </div>
    );
};
