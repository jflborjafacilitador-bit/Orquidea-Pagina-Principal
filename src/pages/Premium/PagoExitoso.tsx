import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';

const PLAN_PRICES: Record<string, number> = {
    cobre: 299, plata: 499, oro: 799, unico: 199,
};

export const PagoExitoso = () => {
    const navigate = useNavigate();

    useEffect(() => {
        recordReferralIfExists();
        const timer = setTimeout(() => navigate('/dashboard'), 6000);
        return () => clearTimeout(timer);
    }, [navigate]);

    const recordReferralIfExists = async () => {
        try {
            const refCode = localStorage.getItem('orquidea_ref');
            const categoria = localStorage.getItem('orquidea_categoria') ?? 'desconocido';
            const user = auth.currentUser;
            if (!refCode || !user) return;

            // Find the referidor document
            const q = query(collection(db, 'referidos'), where('codigo', '==', refCode), where('activo', '==', true));
            const snap = await getDocs(q);
            if (snap.empty) return;

            const referidorDoc = snap.docs[0];

            // Determine plan from category
            const planKey = ['moldes', 'marketing'].includes(categoria) ? 'unico' : 'cobre';
            const monto = PLAN_PRICES[planKey];
            const descuentoAplicado = monto * 0.10;
            const comisionAdmin = descuentoAplicado; // commission = same as discount

            const conversion = {
                userEmail: user.email ?? '',
                plan: planKey,
                monto,
                descuentoAplicado,
                comisionAdmin,
                fecha: new Date().toISOString(),
            };

            await updateDoc(doc(db, 'referidos', referidorDoc.id), {
                conversiones: arrayUnion(conversion),
                totalConversiones: increment(1),
                totalComision: increment(comisionAdmin),
            });

            // Clear localStorage
            localStorage.removeItem('orquidea_ref');
        } catch (e) {
            console.error('Error recording referral:', e);
        }
    };

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
                Tu suscripción está siendo activada. En unos momentos tendrás acceso a tus cursos.
            </p>
            <p style={{ color: 'var(--color-gray-800)', marginTop: '2rem', fontSize: '0.9rem' }}>
                Redirigiendo a tu panel en 6 segundos...
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
