import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const CATEGORIAS = [
    { value: 'jaboneria_basica', label: '🧼 Jabonería Básica' },
    { value: 'jaboneria_avanzada', label: '🧼 Jabonería Avanzada' },
    { value: 'velas_basica', label: '🕯️ Velas Básica' },
    { value: 'velas_avanzada', label: '🕯️ Velas Avanzada' },
    { value: 'moldes_silicon', label: '🧩 Moldes de Silicón' },
    { value: 'marketing_digital', label: '📱 Marketing Digital' },
];

const PLANES = [
    { value: 'cobre', label: '🥉 Cobre (básico)' },
    { value: 'plata', label: '🥈 Plata (avanzado)' },
    { value: 'oro', label: '🥇 Oro (completo)' },
    { value: 'unico', label: '✨ Único (moldes/marketing)' },
];

const PLAN_BADGE_COLORS: Record<string, string> = {
    cobre: '#b45309',
    plata: '#6b7280',
    oro: '#d97706',
    unico: '#7c3aed',
};

interface CourseVideo {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    category: string;
    planRequerido: string;
    nivelRequerido: number;
}

const emptyForm = (): Omit<CourseVideo, 'id'> => ({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'jaboneria_basica',
    planRequerido: 'cobre',
    nivelRequerido: 0,
});

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--color-light-bg)', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff',
};

const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem',
    fontWeight: 600, color: 'var(--color-text-dark)',
};

const groupStyle: React.CSSProperties = { marginBottom: '1.2rem' };

export const AdminPanel = () => {
    const [videos, setVideos] = useState<CourseVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [filterCat, setFilterCat] = useState('todas');

    useEffect(() => { fetchVideos(); }, []);

    const fetchVideos = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'videos'));
            const data: CourseVideo[] = [];
            snapshot.forEach(d => data.push({ id: d.id, ...d.data() } as CourseVideo));
            data.sort((a, b) => a.category.localeCompare(b.category) || a.nivelRequerido - b.nivelRequerido);
            setVideos(data);
        } catch (err) { console.error('Error fetching videos:', err); }
        finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            const payload = { ...formData, nivelRequerido: Number(formData.nivelRequerido) };
            if (editingId) {
                await updateDoc(doc(db, 'videos', editingId), payload);
            } else {
                await addDoc(collection(db, 'videos'), payload);
            }
            setIsFormOpen(false); setEditingId(null); setFormData(emptyForm()); fetchVideos();
        } catch (err) { console.error('Error saving:', err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este video?')) return;
        await deleteDoc(doc(db, 'videos', id));
        fetchVideos();
    };

    const startEdit = (v: CourseVideo) => {
        setFormData({
            title: v.title, description: v.description, video_url: v.video_url,
            thumbnail_url: v.thumbnail_url || '', category: v.category,
            planRequerido: v.planRequerido, nivelRequerido: v.nivelRequerido ?? 0,
        });
        setEditingId(v.id); setIsFormOpen(true);
    };

    const field = (key: keyof Omit<CourseVideo, 'id'>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setFormData(f => ({ ...f, [key]: e.target.value }));

    const filtered = filterCat === 'todas' ? videos : videos.filter(v => v.category === filterCat);

    if (loading && videos.length === 0) return <div className="pulse">Consultando Firebase...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        🎬 Panel de Videos
                    </h1>
                    <p style={{ color: 'var(--color-gray-800)' }}>
                        Agrega o edita videos. Usa URLs de YouTube embed (<code>youtube.com/embed/...</code>).
                    </p>
                </div>
                {!isFormOpen && (
                    <button className="btn btn-primary" onClick={() => { setFormData(emptyForm()); setEditingId(null); setIsFormOpen(true); }}>
                        <Plus size={18} /> Agregar Video
                    </button>
                )}
            </div>

            {/* Form */}
            {isFormOpen && (
                <div className="glass animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h2 style={{ color: 'var(--color-text-dark)', fontSize: '1.2rem' }}>
                            {editingId ? '✏️ Editar Video' : '➕ Nuevo Video'}
                        </h2>
                        <button onClick={() => setIsFormOpen(false)} style={{ color: 'var(--color-gray-800)' }}><X size={22} /></button>
                    </div>

                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>

                            {/* Título */}
                            <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Título del Video *</label>
                                <input required style={inputStyle} value={formData.title} onChange={field('title')} placeholder="Ej: Introducción a la Jabonería" />
                            </div>

                            {/* Descripción */}
                            <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Descripción</label>
                                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={formData.description} onChange={field('description')} placeholder="Breve descripción de la clase..." />
                            </div>

                            {/* URL video */}
                            <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>URL del Video (embed de YouTube) *</label>
                                <input required style={inputStyle} value={formData.video_url} onChange={field('video_url')} placeholder="https://www.youtube.com/embed/XXXXXXXX" />
                            </div>

                            {/* Thumbnail */}
                            <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>URL de Miniatura (opcional)</label>
                                <input style={inputStyle} value={formData.thumbnail_url} onChange={field('thumbnail_url')} placeholder="https://img.youtube.com/vi/XXXXXXXX/maxresdefault.jpg" />
                            </div>

                            {/* Categoría */}
                            <div style={groupStyle}>
                                <label style={labelStyle}>Categoría *</label>
                                <select required style={{ ...inputStyle, appearance: 'none' }} value={formData.category} onChange={field('category')}>
                                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>

                            {/* Plan Requerido */}
                            <div style={groupStyle}>
                                <label style={labelStyle}>Plan mínimo requerido *</label>
                                <select required style={{ ...inputStyle, appearance: 'none' }} value={formData.planRequerido} onChange={field('planRequerido')}>
                                    {PLANES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>

                            {/* Nivel Requerido */}
                            <div style={groupStyle}>
                                <label style={labelStyle}>
                                    Nivel requerido *
                                    <span style={{ fontWeight: 400, color: 'var(--color-gray-800)', marginLeft: '0.5rem' }}>
                                        (0 = visible desde el mes 1)
                                    </span>
                                </label>
                                <input
                                    type="number" min={0} max={24} required style={inputStyle}
                                    value={formData.nivelRequerido}
                                    onChange={field('nivelRequerido')}
                                />
                                <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-800)', marginTop: '0.3rem', display: 'block' }}>
                                    {formData.nivelRequerido === 0
                                        ? '✅ Visible para todos en este plan desde el primer mes'
                                        : `🔒 Se desbloquea al mes ${Number(formData.nivelRequerido) + 1} de suscripción`}
                                </span>
                            </div>

                            {/* Preview */}
                            {formData.video_url && (
                                <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Vista previa</label>
                                    <div style={{ position: 'relative', paddingBottom: '25%', minHeight: '140px', backgroundColor: '#000', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                        <iframe src={formData.video_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Guardando...' : <><Save size={18} /> Guardar Video</>}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtro por categoría */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                <button
                    style={{
                        padding: '0.3rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        border: filterCat === 'todas' ? '2px solid var(--color-primary)' : '2px solid var(--color-light-bg)',
                        backgroundColor: filterCat === 'todas' ? 'rgba(172,17,62,0.08)' : 'transparent',
                        color: filterCat === 'todas' ? 'var(--color-primary)' : 'var(--color-gray-800)'
                    }}
                    onClick={() => setFilterCat('todas')}
                >Todas ({videos.length})</button>
                {CATEGORIAS.map(c => {
                    const count = videos.filter(v => v.category === c.value).length;
                    return (
                        <button key={c.value}
                            style={{
                                padding: '0.3rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                border: filterCat === c.value ? '2px solid var(--color-primary)' : '2px solid var(--color-light-bg)',
                                backgroundColor: filterCat === c.value ? 'rgba(172,17,62,0.08)' : 'transparent',
                                color: filterCat === c.value ? 'var(--color-primary)' : 'var(--color-gray-800)'
                            }}
                            onClick={() => setFilterCat(c.value)}
                        >{c.label} ({count})</button>
                    );
                })}
            </div>

            {/* Tabla */}
            <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflowX: 'auto', backgroundColor: 'var(--color-white)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                            {['Título', 'Categoría', 'Plan', 'Nivel', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '1rem', color: 'var(--color-gray-800)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-800)' }}>No hay videos en esta categoría aún.</td></tr>
                        ) : filtered.map(video => (
                            <tr key={video.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                                <td style={{ padding: '1rem', fontWeight: 500, maxWidth: '200px' }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-gray-800)' }}>
                                    {CATEGORIAS.find(c => c.value === video.category)?.label ?? video.category}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        backgroundColor: `${PLAN_BADGE_COLORS[video.planRequerido] ?? '#999'}22`,
                                        color: PLAN_BADGE_COLORS[video.planRequerido] ?? '#999',
                                        padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize'
                                    }}>{video.planRequerido}</span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        backgroundColor: 'rgba(0,0,0,0.06)', padding: '0.2rem 0.6rem',
                                        borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700
                                    }}>Nv. {video.nivelRequerido ?? 0}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }} onClick={() => startEdit(video)}>
                                            <Edit2 size={15} />
                                        </button>
                                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', borderColor: 'rgba(172,17,62,0.3)', color: 'var(--color-primary)' }} onClick={() => handleDelete(video.id)}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
