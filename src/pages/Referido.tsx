import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Tag, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

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
            // Save referral code to localStorage so PagoExitoso can record it
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
                const data = snap.docs[0].data() as ReferidorData;
                setReferidor(data);
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
            <div className="glass animate-fade-in" style={{ maxWidth: '520px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-lg)' }}>

                {/* Header con descuento */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    padding: '2.5rem', textAlign: 'center', color: 'white'
                }}>
                    <img src="/Logo orquidea.png" alt="Orquídea" style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: '1rem' }} />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
                        <Tag size={16} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>INVITACIÓN ESPECIAL</span>
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                        {referidor?.descuento ?? 10}% de descuento
                    </h1>
                    <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: 1.5 }}>
                        <strong>{referidor?.nombre}</strong> te invita a unirte a Orquídea.<br />
                        Obtén tu descuento exclusivo en cualquier plan.
                    </p>
                </div>

                {/* Beneficios */}
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                        {[
                            'Descuento del 10% en tu suscripción',
                            'Acceso a cursos de Jabonería, Velas, Moldes y Marketing',
                            'Blog y artículos exclusivos incluidos',
                            'Cancela cuando quieras',
                        ].map(b => (
                            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <CheckCircle size={18} color="#4CAF50" style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>{b}</span>
                            </div>
                        ))}
                    </div>

                    {/* Código visible */}
                    <div style={{ backgroundColor: 'var(--color-light-bg)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)', marginBottom: '0.3rem' }}>Tu código de referido</p>
                        <code style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '2px' }}>
                            {referidor?.codigo}
                        </code>
                    </div>

                    <Link
                        to="/precios"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '1rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, boxSizing: 'border-box' }}
                    >
                        Ver planes con {referidor?.descuento ?? 10}% descuento <ArrowRight size={18} />
                    </Link>

                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-gray-800)', marginTop: '1rem' }}>
                        ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
