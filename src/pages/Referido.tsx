import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Tag, AlertCircle } from 'lucide-react';

const MP_COBRE_REF = import.meta.env.VITE_MP_COBRE_REF_URL || '#';
const MP_PLATA_REF = import.meta.env.VITE_MP_PLATA_REF_URL || '#';
const MP_ORO_REF = import.meta.env.VITE_MP_ORO_REF_URL || '#';
const MP_UNICO_REF = import.meta.env.VITE_MP_UNICO_REF_URL || '#';

const PLANES_REF = [
    { key: 'cobre', emoji: '🥉', nombre: 'Cobre', normalPrice: 299, refPrice: 269, desc: 'Jabonería Básica O Velas Básica + Blog', url: MP_COBRE_REF, color: '#CD7F32' },
    { key: 'plata', emoji: '🥈', nombre: 'Plata', normalPrice: 499, refPrice: 449, desc: 'Jabonería O Velas (completo) + Blog', url: MP_PLATA_REF, color: '#707B7C' },
    { key: 'oro', emoji: '🥇', nombre: 'Oro', normalPrice: 799, refPrice: 719, desc: 'Todo: Jabonería + Velas + Moldes + Marketing', url: MP_ORO_REF, color: '#B8860B' },
    { key: 'unico', emoji: '✨', nombre: 'Único', normalPrice: 199, refPrice: 179, desc: 'Moldes de Silicón + Marketing Digital', url: MP_UNICO_REF, color: '#7c3aed' },
];

interface ReferidorData {
    nombre: string;
    codigo: string;
    descuento: number;
    activo: boolean;
}

export const Referido = () => {
    const { codigo } = useParams<{ codigo: string }>();
    const [referidor, setReferidor] = useState<ReferidorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (codigo) {
            localStorage.setItem('orquidea_ref', codigo.toUpperCase());
            fetchReferidor(codigo.toUpperCase());
        }
    }, [codigo]);

    const fetchReferidor = async (code: string) => {
        try {
            const q = query(collection(db, 'referidos'), where('codigo', '==', code), where('activo', '==', true));
            const snap = await getDocs(q);
            if (snap.empty) {
                setError('Este link de referido no es válido o ya no está activo.');
            } else {
                setReferidor(snap.docs[0].data() as ReferidorData);
            }
        } catch {
            setError('Error al verificar el código. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse" style={{ color: 'var(--color-primary)' }}>Verificando código...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <AlertCircle size={48} color="#f44336" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Link inválido</h2>
                    <p style={{ color: 'var(--color-gray-800)', marginBottom: '1.5rem' }}>{error}</p>
                    <Link to="/precios" className="btn btn-primary">Ver planes →</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-light-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass animate-fade-in" style={{ maxWidth: '540px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-lg)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', padding: '2.5rem', textAlign: 'center', color: 'white' }}>
                    <img src="/Logo orquidea.png" alt="Orquídea" style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: '1rem' }} />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
                        <Tag size={15} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>INVITACIÓN ESPECIAL · 10% OFF</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                        ¡Bienvenida a Orquídea!
                    </h1>
                    <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.5 }}>
                        <strong>{referidor?.nombre}</strong> te invita a aprender con nosotras.<br />
                        Elige tu plan con precio especial.
                    </p>
                </div>

                {/* Planes con descuento */}
                <div style={{ padding: '1.5rem 2rem 2rem' }}>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Elige tu plan con 10% de descuento
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.5rem' }}>
                        {PLANES_REF.map(plan => (
                            <a key={plan.key} href={plan.url} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem 1.2rem', borderRadius: 'var(--radius-sm)',
                                    border: `2px solid ${plan.color}33`, backgroundColor: `${plan.color}08`,
                                    textDecoration: 'none', transition: 'all 0.15s', gap: '1rem'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${plan.color}18`; e.currentTarget.style.transform = 'translateX(3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${plan.color}08`; e.currentTarget.style.transform = ''; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{plan.emoji}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: plan.color, fontSize: '0.95rem' }}>Orquídea {plan.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)' }}>{plan.desc}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-800)', textDecoration: 'line-through' }}>${plan.normalPrice}/mes</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: plan.color }}>${plan.refPrice}/mes</div>
                                    <div style={{ fontSize: '0.68rem', color: '#4CAF50', fontWeight: 700 }}>−10% OFF</div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-gray-800)' }}>
                        Paga de forma segura con Mercado Pago · Cancela cuando quieras
                    </p>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-gray-800)', marginTop: '0.8rem' }}>
                        ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
