import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { CalendarDays, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Slot {
    id: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    categoria: 'jaboneria' | 'velas' | 'ambas';
    disponible: boolean;
    reservadoPor?: string;
    reservadoNombre?: string;
}

interface Reserva {
    slotId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    categoria: string;
}

interface Props {
    userProfile?: any;
}

export const MisClases = ({ userProfile }: Props) => {
    const [slotsDisponibles, setSlotsDisponibles] = useState<Slot[]>([]);
    const [misReservas, setMisReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [reservando, setReservando] = useState<string | null>(null);
    const [msg, setMsg] = useState('');

    const subs = userProfile?.suscripciones ?? {};
    const jabSub = subs['jaboneria'];
    const velSub = subs['velas'];
    const isAdmin = userProfile?.role === 'admin';

    // Classes available per month based on plan
    const clasesJab = jabSub?.plan === 'platino' ? 6 : jabSub?.plan === 'oro' ? 1 : 0;
    const clasesVel = velSub?.plan === 'platino' ? 6 : velSub?.plan === 'oro' ? 1 : 0;
    const totalClasesDisponibles = Math.max(clasesJab, clasesVel);
    const clasesUsadas = misReservas.length;
    const clasesRestantes = Math.max(0, totalClasesDisponibles - clasesUsadas);

    // Which categories can the user book for?
    const canBookJab = isAdmin || clasesJab > 0;
    const canBookVel = isAdmin || clasesVel > 0;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Get available slots
            const slotsSnap = await getDocs(
                query(collection(db, 'disponibilidad'), orderBy('fecha'), orderBy('horaInicio'))
            );
            const allSlots = slotsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Slot));

            // Filter slots that match user's categories and are available
            const filtered = allSlots.filter(s => {
                if (!s.disponible) return false;
                const fechaSlot = new Date(s.fecha + 'T12:00:00');
                if (fechaSlot < new Date()) return false; // no past slots
                if (s.categoria === 'jaboneria' && !canBookJab) return false;
                if (s.categoria === 'velas' && !canBookVel) return false;
                return true;
            });
            setSlotsDisponibles(filtered);

            // Get my reservations — slots where reservadoPor === my email
            const myRes = allSlots.filter(s => s.reservadoPor === user.email && !s.disponible);
            setMisReservas(myRes.map(s => ({ slotId: s.id, fecha: s.fecha, horaInicio: s.horaInicio, horaFin: s.horaFin, categoria: s.categoria })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleReservar = async (slot: Slot, categoriaSolicitada: 'jaboneria' | 'velas') => {
        if (clasesRestantes <= 0) { setMsg('Ya usaste todas tus clases de este mes.'); return; }
        const user = auth.currentUser;
        if (!user) return;
        setReservando(slot.id);
        setMsg('');
        try {
            await updateDoc(doc(db, 'disponibilidad', slot.id), {
                disponible: false,
                reservadoPor: user.email,
                reservadoNombre: user.displayName || user.email,
                categoriaReservada: categoriaSolicitada,
            });
            setMsg('✅ ¡Clase reservada! Recibirás confirmación por email.');
            fetchData();
        } catch { setMsg('❌ Error al reservar. Intenta de nuevo.'); }
        finally { setReservando(null); }
    };

    if (totalClasesDisponibles === 0 && !isAdmin) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <AlertCircle size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>Clases personales no disponibles</h2>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Las clases personales están disponibles para suscriptoras de plan <strong>Oro</strong> (1 clase/mes) o <strong>Platino</strong> (6 clases/mes).
                </p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    🎓 Mis Clases Personales
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Reserva tu(s) clase(s) personal(es) del mes.
                </p>
            </div>

            {/* Contador de clases */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>{clasesRestantes}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-800)' }}>Clases disponibles este mes</div>
                </div>
                <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4CAF50' }}>{clasesUsadas}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-800)' }}>Clases reservadas</div>
                </div>
                <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#B8860B' }}>{totalClasesDisponibles}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-800)' }}>Total clases/mes</div>
                </div>
            </div>

            {msg && <div style={{ padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(76,175,80,0.1)', color: '#2e7d32', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{msg}</div>}

            {/* Mis reservas */}
            {misReservas.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.8rem' }}>
                        📌 Mis clases reservadas
                    </h2>
                    {misReservas.map((r, i) => (
                        <div key={i} style={{ padding: '0.9rem 1.2rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(176,0,84,0.06)', border: '1.5px solid rgba(176,0,84,0.2)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>
                                    {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                                <span style={{ marginLeft: '0.8rem', color: 'var(--color-gray-800)', fontSize: '0.85rem' }}>{r.horaInicio} – {r.horaFin}</span>
                            </div>
                            <span style={{ fontSize: '0.82rem', backgroundColor: 'var(--color-light-bg)', padding: '0.25rem 0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 600, color: 'var(--color-primary)' }}>
                                {r.categoria === 'jaboneria' ? '🧼 Jabonería' : r.categoria === 'velas' ? '🕯️ Velas' : '🔄 Ambas'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Slots disponibles para reservar */}
            {loading ? <div className="pulse">Cargando horarios...</div> : slotsDisponibles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-800)' }}>
                    <CalendarDays size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                    <p>No hay horarios disponibles por el momento. Vuelve pronto.</p>
                </div>
            ) : (
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.8rem' }}>
                        ✅ Horarios disponibles para reservar
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {slotsDisponibles.map(slot => {
                            const isAmbas = slot.categoria === 'ambas';
                            return (
                                <div key={slot.id} style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-white)', border: '1.5px solid rgba(76,175,80,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>
                                            {new Date(slot.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </div>
                                        <div style={{ color: 'var(--color-gray-800)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                                            <Clock size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                                            {slot.horaInicio} – {slot.horaFin}
                                            <span style={{ marginLeft: '0.6rem' }}>
                                                {slot.categoria === 'jaboneria' ? '🧼 Jabonería' : slot.categoria === 'velas' ? '🕯️ Velas' : '🔄 Jabonería o Velas'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {(isAmbas ? ['jaboneria', 'velas'] : [slot.categoria]).filter(cat => cat === 'jaboneria' ? canBookJab : canBookVel).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => handleReservar(slot, cat as 'jaboneria' | 'velas')}
                                                disabled={!!reservando || clasesRestantes <= 0}
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', opacity: clasesRestantes <= 0 ? 0.5 : 1 }}
                                            >
                                                {reservando === slot.id ? 'Reservando...' : `Reservar ${cat === 'jaboneria' ? '🧼' : '🕯️'}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
