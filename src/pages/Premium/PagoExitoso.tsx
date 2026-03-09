import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';

export const PagoExitoso = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // NOTE: In a production app, role updates should happen via webhook (Cloud Function).
        // This is a temporary visual confirmation page only.
        // The actual role update is handled by the Mercado Pago webhook backend.
        const timer = setTimeout(() => navigate('/dashboard'), 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', minHeight: '60vh' }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                backgroundColor: 'rgba(76, 175, 80, 0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '2rem'
            }}>
                <CheckCircle size={48} color="#4CAF50" />
            </div>

            <h1 style={{ color: '#4CAF50', fontSize: '2.2rem', marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
            <p style={{ color: 'var(--color-gray-800)', fontSize: '1.1rem', maxWidth: '450px', lineHeight: 1.6 }}>
                Tu suscripción Premium está siendo activada. En unos momentos tendrás acceso a todos los cursos.
            </p>
            <p style={{ color: 'var(--color-gray-800)', marginTop: '2rem', fontSize: '0.9rem' }}>
                Redirigiendo a tu panel en 5 segundos...
            </p>

            <button
                className="btn btn-primary"
                style={{ marginTop: '2rem' }}
                onClick={() => navigate('/dashboard')}
            >
                Ir a Mis Cursos
            </button>
        </div>
    );
};
