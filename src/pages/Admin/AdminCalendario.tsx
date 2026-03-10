import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
    collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc
} from 'firebase/firestore';
import { CalendarDays, Plus, Trash2, Clock, CheckCircle, Users } from 'lucide-react';

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

const today = () => new Date().toISOString().split('T')[0];

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export const AdminCalendario = () => {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ fecha: today(), horaInicio: '10:00', horaFin: '11:00', categoria: 'ambas' as 'jaboneria' | 'velas' | 'ambas' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [viewMonth, setViewMonth] = useState(today().slice(0, 7));

    useEffect(() => { fetchSlots(); }, []);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'disponibilidad'), orderBy('fecha'), orderBy('horaInicio')));
            setSlots(snap.docs.map(d => ({ id: d.id, ...d.data() } as Slot)));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAgregar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            await addDoc(collection(db, 'disponibilidad'), { ...form, disponible: true });
            setMsg('✅ Slot agregado');
            fetchSlots();
        } catch { setMsg('❌ Error al guardar.'); }
        finally { setSaving(false); }
    };

    const handleEliminar = async (id: string) => {
        if (!confirm('¿Eliminar este horario?')) return;
        await deleteDoc(doc(db, 'disponibilidad', id));
        fetchSlots();
    };

    const handleCancelarReserva = async (slot: Slot) => {
        if (!confirm(`¿Cancelar la reserva de ${slot.reservadoNombre}?`)) return;
        await updateDoc(doc(db, 'disponibilidad', slot.id), { disponible: true, reservadoPor: null, reservadoNombre: null });
        fetchSlots();
    };

    const filteredSlots = slots.filter(s => s.fecha.startsWith(viewMonth));
    const disponibles = filteredSlots.filter(s => s.disponible);
    const reservados = filteredSlots.filter(s => !s.disponible);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    📅 Calendario de Clases
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Gestiona tu disponibilidad para clases personales de alumnas Oro y Platino.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { icon: <CalendarDays size={20} />, label: 'Disponibles', value: disponibles.length, color: '#4CAF50' },
                    { icon: <Users size={20} />, label: 'Reservadas', value: reservados.length, color: 'var(--color-primary)' },
                    { icon: <Clock size={20} />, label: 'Total mes', value: filteredSlots.length, color: '#B8860B' },
                ].map(s => (
                    <div key={s.label} style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ color: s.color }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form agregar slot */}
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-dark)' }}>
                    <Plus size={18} color="var(--color-primary)" /> Agregar disponibilidad
                </h2>
                <form onSubmit={handleAgregar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--color-text-dark)' }}>Fecha</label>
                        <input type="date" value={form.fecha} min={today()} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--color-text-dark)' }}>Hora inicio</label>
                        <select value={form.horaInicio} onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                            {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--color-text-dark)' }}>Hora fin</label>
                        <select value={form.horaFin} onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                            {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--color-text-dark)' }}>Categoría</label>
                        <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as any }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                            <option value="ambas">🔄 Ambas (Jabonería o Velas)</option>
                            <option value="jaboneria">🧼 Solo Jabonería</option>
                            <option value="velas">🕯️ Solo Velas</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                        {saving ? 'Guardando...' : '+ Agregar'}
                    </button>
                </form>
                {msg && <p style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>{msg}</p>}
            </div>

            {/* Filtro mes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>Ver mes:</label>
                <input type="month" value={viewMonth} onChange={e => setViewMonth(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem' }} />
            </div>

            {/* Reservados primero */}
            {reservados.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.8rem' }}>
                        📌 Clases reservadas ({reservados.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {reservados.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.2rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(176,0,84,0.06)', border: '1.5px solid rgba(176,0,84,0.2)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <span style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    <span style={{ marginLeft: '0.8rem', color: 'var(--color-gray-800)', fontSize: '0.85rem' }}>{s.horaInicio} – {s.horaFin}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                        👤 {s.reservadoNombre || s.reservadoPor}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', backgroundColor: 'var(--color-light-bg)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                                        {s.categoria === 'jaboneria' ? '🧼' : s.categoria === 'velas' ? '🕯️' : '🔄'}
                                    </span>
                                    <button onClick={() => handleCancelarReserva(s)} style={{ fontSize: '0.78rem', color: '#f44336', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                        Cancelar reserva
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Disponibles */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4CAF50', marginBottom: '0.8rem' }}>
                    ✅ Horarios disponibles ({disponibles.length})
                </h3>
                {loading ? <div className="pulse">Cargando...</div> : disponibles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-800)', fontSize: '0.9rem' }}>
                        No hay horarios disponibles en este mes. Agrega tu disponibilidad arriba.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {disponibles.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.2rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(76,175,80,0.06)', border: '1.5px solid rgba(76,175,80,0.25)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text-dark)', fontSize: '0.9rem' }}>{new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    <span style={{ marginLeft: '0.8rem', color: 'var(--color-gray-800)', fontSize: '0.85rem' }}>{s.horaInicio} – {s.horaFin}</span>
                                    <span style={{ marginLeft: '0.8rem', fontSize: '0.78rem' }}>
                                        {s.categoria === 'jaboneria' ? '🧼 Jabonería' : s.categoria === 'velas' ? '🕯️ Velas' : '🔄 Ambas'}
                                    </span>
                                </div>
                                <button onClick={() => handleEliminar(s.id)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}>
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
