import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
    collection, addDoc, getDocs, doc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { Link2, Copy, Check, Users, DollarSign, TrendingUp } from 'lucide-react';

const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'REF-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

const BASE_URL = 'https://miorquidea.com/r/';

interface Referidor {
    id: string;
    nombre: string;
    email: string;
    codigo: string;
    link: string;
    activo: boolean;
    descuento: number;
    createdAt: string;
    totalConversiones: number;
    totalComision: number;
    conversiones?: Conversion[];
}

interface Conversion {
    userEmail: string;
    plan: string;
    monto: number;
    descuentoAplicado: number;
    comisionAdmin: number;
    fecha: string;
}

export const Referidos = () => {
    const [referidores, setReferidores] = useState<Referidor[]>([]);
    const [loading, setLoading] = useState(true);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [detalle, setDetalle] = useState<Referidor | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchReferidores(); }, []);

    const fetchReferidores = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'referidos'), orderBy('createdAt', 'desc')));
            const data: Referidor[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Referidor));
            setReferidores(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim()) return;
        setSaving(true); setMsg('');
        try {
            const codigo = generateCode();
            const link = `${BASE_URL}${codigo}`;
            await addDoc(collection(db, 'referidos'), {
                nombre: nombre.trim(),
                email: email.trim().toLowerCase(),
                codigo,
                link,
                activo: true,
                descuento: 10,
                createdAt: new Date().toISOString(),
                totalConversiones: 0,
                totalComision: 0,
                conversiones: [],
            });
            setMsg(`✅ Código creado: ${codigo}`);
            setNombre(''); setEmail('');
            fetchReferidores();
        } catch { setMsg('❌ Error al crear el código.'); }
        finally { setSaving(false); }
    };

    const handleCopy = (id: string, link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const totalComisiones = referidores.reduce((s, r) => s + (r.totalComision ?? 0), 0);
    const totalConversiones = referidores.reduce((s, r) => s + (r.totalConversiones ?? 0), 0);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    🤝 Sistema de Referidos
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    Genera links únicos para referidores. Cada cliente que use su link obtiene 10% de descuento.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { icon: <Users size={22} />, label: 'Referidores', value: referidores.length },
                    { icon: <TrendingUp size={22} />, label: 'Conversiones', value: totalConversiones },
                    { icon: <DollarSign size={22} />, label: 'Total Comisiones', value: `$${totalComisiones.toFixed(2)}` },
                ].map(s => (
                    <div key={s.label} className="glass" style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: 'var(--color-primary)' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-white)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Link2 size={20} color="var(--color-primary)" /> Crear nuevo link de referido
                </h2>
                <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-dark)' }}>
                            Nombre del referidor
                        </label>
                        <input
                            required value={nombre} onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: María López"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-dark)' }}>
                            Email del referidor
                        </label>
                        <input
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="maria@ejemplo.com"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 1.4rem', whiteSpace: 'nowrap' }}>
                        {saving ? 'Creando...' : '+ Generar Link'}
                    </button>
                </form>
                {msg && <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--color-gray-800)' }}>{msg}</p>}
            </div>

            {/* Tabla de referidores */}
            <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflowX: 'auto', backgroundColor: 'var(--color-white)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                            {['Referidor', 'Código', 'Link', 'Conversiones', 'Comisión', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '0.9rem 1rem', color: 'var(--color-gray-800)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                        ) : referidores.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-800)' }}>No hay referidores aún.</td></tr>
                        ) : referidores.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.nombre}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)' }}>{r.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <code style={{ backgroundColor: 'var(--color-light-bg)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        {r.codigo}
                                    </code>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {r.link}
                                        </span>
                                        <button onClick={() => handleCopy(r.id, r.link)} style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
                                            {copiedId === r.id ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>
                                        {r.totalConversiones ?? 0}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ fontWeight: 700, color: '#4CAF50' }}>
                                        ${(r.totalComision ?? 0).toFixed(2)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                                        onClick={() => setDetalle(detalle?.id === r.id ? null : r)}
                                    >
                                        {detalle?.id === r.id ? 'Cerrar' : 'Ver detalle'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Detalle de conversiones */}
                {detalle && (
                    <div style={{ padding: '1.5rem', borderTop: '2px solid var(--color-light-bg)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-dark)' }}>
                            Conversiones de <strong>{detalle.nombre}</strong>
                        </h3>
                        {(!detalle.conversiones || detalle.conversiones.length === 0) ? (
                            <p style={{ color: 'var(--color-gray-800)', fontSize: '0.9rem' }}>Aún no hay conversiones registradas con este código.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {detalle.conversiones.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', backgroundColor: 'var(--color-light-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 500 }}>{c.userEmail}</span>
                                        <span style={{ textTransform: 'capitalize', color: 'var(--color-primary)', fontWeight: 600 }}>Plan {c.plan}</span>
                                        <span>Pagó: <strong>${c.monto}</strong></span>
                                        <span>Descuento: −${c.descuentoAplicado.toFixed(2)}</span>
                                        <span style={{ color: '#4CAF50', fontWeight: 700 }}>Comisión: ${c.comisionAdmin.toFixed(2)}</span>
                                        <span style={{ color: 'var(--color-gray-800)', fontSize: '0.75rem' }}>{new Date(c.fecha).toLocaleDateString('es-MX')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
