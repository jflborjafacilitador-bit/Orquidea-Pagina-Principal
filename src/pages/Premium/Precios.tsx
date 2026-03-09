import { Link } from 'react-router-dom';
import { Check, Sparkles, Star, Crown } from 'lucide-react';

const MP_BRONCE = import.meta.env.VITE_MP_BRONCE_URL || '#';
const MP_PLATA = import.meta.env.VITE_MP_PLATA_URL || '#';
const MP_ORO = import.meta.env.VITE_MP_ORO_URL || '#';

const plans = [
    {
        key: 'bronce',
        name: 'Bronce',
        price: 299,
        icon: <Sparkles size={28} />,
        color: '#CD7F32',
        gradient: 'linear-gradient(135deg, #CD7F32, #E8A96B)',
        features: [
            'Acceso a todos los cursos básicos',
            'Videos en alta calidad (YouTube)',
            'Actualizaciones de contenido',
            'Soporte por email',
        ],
        notIncluded: ['Blog y artículos exclusivos', 'Clase personal semanal'],
        url: MP_BRONCE,
        popular: false,
    },
    {
        key: 'plata',
        name: 'Plata',
        price: 499,
        icon: <Star size={28} />,
        color: '#A8A9AD',
        gradient: 'linear-gradient(135deg, #707B7C, #BFC9CA)',
        features: [
            'Todo lo de Bronce',
            'Blog y artículos exclusivos',
            'Técnicas avanzadas de diseño',
            'Comunidad de miembros',
            'Soporte prioritario',
        ],
        notIncluded: ['Clase personal semanal'],
        url: MP_PLATA,
        popular: true,
    },
    {
        key: 'oro',
        name: 'Oro',
        price: 799,
        icon: <Crown size={28} />,
        color: '#D4AF37',
        gradient: 'linear-gradient(135deg, #B8860B, #FFD700)',
        features: [
            'Todo lo de Plata',
            '1 clase personal por semana (1 hora)',
            'Mentoría individual exclusiva',
            'Acceso anticipado a contenido nuevo',
            'Soporte 24/7 directo con Joseph',
        ],
        notIncluded: [],
        url: MP_ORO,
        popular: false,
    },
];

interface PreciosProps {
    onClose?: () => void;
    showTitle?: boolean;
}

export const Precios = ({ onClose, showTitle = true }: PreciosProps) => {
    return (
        <div>
            {showTitle && (
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>
                        Elige tu Plan Orquídea
                    </h1>
                    <p style={{ color: 'var(--color-gray-800)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                        Transforma tu pasión por las velas en un arte. Cancela cuando quieras.
                    </p>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start',
            }}>
                {plans.map((plan) => (
                    <div
                        key={plan.key}
                        className="glass animate-fade-in"
                        style={{
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            position: 'relative',
                            border: plan.popular ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)',
                            transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                            boxShadow: plan.popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                backgroundColor: 'var(--color-primary)', color: 'white',
                                textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px'
                            }}>
                                ⭐ MÁS POPULAR
                            </div>
                        )}

                        {/* Plan Header */}
                        <div style={{
                            background: plan.gradient, padding: '2rem',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'white'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%',
                                width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {plan.icon}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Orquídea {plan.name}</h2>
                            <div style={{ marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>${plan.price}</span>
                                <span style={{ opacity: 0.85, marginLeft: '0.3rem' }}>MXN/mes</span>
                            </div>
                        </div>

                        {/* Features */}
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-white)' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {plan.features.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
                                        <Check size={18} color="#4CAF50" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span style={{ color: 'var(--color-text-dark)' }}>{f}</span>
                                    </li>
                                ))}
                                {plan.notIncluded.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem', opacity: 0.4 }}>
                                        <span style={{ flexShrink: 0, marginTop: '2px', fontSize: '1rem' }}>✕</span>
                                        <span style={{ color: 'var(--color-text-dark)' }}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={plan.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onClose}
                                className={plan.popular ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'center',
                                    padding: '0.9rem', fontSize: '1rem', fontWeight: 700,
                                    textDecoration: 'none', borderRadius: 'var(--radius-sm)',
                                    background: plan.popular ? 'var(--color-primary)' : undefined,
                                    color: plan.popular ? 'white' : plan.color,
                                    border: plan.popular ? 'none' : `2px solid ${plan.color}`,
                                }}
                            >
                                Suscribirse — {plan.name}
                            </a>

                            <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)', textAlign: 'center', marginTop: '0.8rem' }}>
                                Paga de forma segura con Mercado Pago. Cancela cuando quieras.
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {showTitle && (
                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>
                    ¿Ya eres miembro? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inicia sesión aquí</Link>
                </p>
            )}
        </div>
    );
};
