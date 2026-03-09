import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';

interface Pago {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    currency: string;
    status: string;
    plan: string;
    createdAt: string;
}

interface MonthSummary {
    [key: string]: number;
}

export const Facturacion = () => {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(true);
    const [suscriptores, setSuscriptores] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch pagos collection
            const pagosQuery = query(collection(db, 'pagos'), orderBy('createdAt', 'desc'));
            const pagosSnap = await getDocs(pagosQuery);
            const pagosData: Pago[] = [];
            pagosSnap.forEach((doc) => {
                pagosData.push({ id: doc.id, ...doc.data() } as Pago);
            });
            setPagos(pagosData);

            // Count premium users
            const usersSnap = await getDocs(collection(db, 'users'));
            let premiumCount = 0;
            usersSnap.forEach((doc) => {
                const data = doc.data();
                if (data.role === 'premium') premiumCount++;
            });
            setSuscriptores(premiumCount);
        } catch (err) {
            console.error("Error fetching billing data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate current month revenue
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const ingresosMes = pagos
        .filter(p => p.status === 'approved' && p.createdAt?.startsWith(currentMonthKey))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const ingresosTotal = pagos
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Build monthly chart data
    const monthSummary: MonthSummary = {};
    pagos.filter(p => p.status === 'approved').forEach(p => {
        const monthKey = p.createdAt?.substring(0, 7) || 'Sin fecha';
        monthSummary[monthKey] = (monthSummary[monthKey] || 0) + (p.amount || 0);
    });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

    const statCards = [
        { label: 'Ingresos este mes', value: formatCurrency(ingresosMes), icon: <TrendingUp size={24} />, color: '#4CAF50' },
        { label: 'Ingresos totales', value: formatCurrency(ingresosTotal), icon: <DollarSign size={24} />, color: 'var(--color-primary)' },
        { label: 'Suscriptores activos', value: suscriptores.toString(), icon: <Users size={24} />, color: 'var(--color-secondary)' },
        { label: 'Pagos registrados', value: pagos.length.toString(), icon: <Calendar size={24} />, color: '#FF9800' },
    ];

    if (loading) {
        return <div className="pulse" style={{ textAlign: 'center', padding: '4rem' }}>Cargando datos de facturación...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Facturación</h1>
                <p style={{ color: 'var(--color-gray-800)' }}>Resumen de ingresos y suscriptores de Orquídea.</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {statCards.map((card) => (
                    <div key={card.label} className="glass animate-fade-in" style={{
                        padding: '1.5rem', borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', gap: '1.2rem'
                    }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: `${card.color}15`, color: card.color
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-800)', marginBottom: '0.3rem' }}>{card.label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Chart */}
            {Object.keys(monthSummary).length > 0 && (
                <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-dark)' }}>Ingresos por Mes</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', minHeight: '120px' }}>
                        {Object.entries(monthSummary).map(([month, amount]) => {
                            const maxVal = Math.max(...Object.values(monthSummary));
                            const height = maxVal > 0 ? (amount / maxVal) * 100 : 10;
                            return (
                                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-800)', fontWeight: 600 }}>{formatCurrency(amount)}</span>
                                    <div style={{
                                        width: '100%', height: `${height}px`, minHeight: '8px',
                                        background: 'linear-gradient(to top, var(--color-primary), var(--color-secondary))',
                                        borderRadius: '6px 6px 0 0', transition: 'height 0.4s ease'
                                    }} />
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-gray-800)' }}>{month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment history table */}
            <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.5rem', overflowX: 'auto' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-dark)' }}>Historial de Pagos</h2>
                {pagos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-800)' }}>
                        <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Sin pagos registrados aún</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>Los pagos aparecerán aquí automáticamente cuando el webhook de Mercado Pago esté activo.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                                {['Usuario', 'Plan', 'Monto', 'Estado', 'Fecha'].map(h => (
                                    <th key={h} style={{ padding: '0.8rem 1rem', color: 'var(--color-gray-800)', fontSize: '0.85rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map(pago => (
                                <tr key={pago.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pago.userName || 'Usuario'}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)' }}>{pago.userEmail}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{pago.plan || 'Premium'}</td>
                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                                        {formatCurrency(pago.amount || 0)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            backgroundColor: pago.status === 'approved' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                            color: pago.status === 'approved' ? '#4CAF50' : '#FF9800',
                                            padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600
                                        }}>
                                            {pago.status === 'approved' ? 'Aprobado' : pago.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-gray-800)' }}>
                                        {pago.createdAt ? new Date(pago.createdAt).toLocaleDateString('es-MX') : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
