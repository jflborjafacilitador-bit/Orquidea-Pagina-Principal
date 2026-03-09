import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface CourseVideo {
    id: string;
    title: string;
    description: string;
    video_url: string;
    requiredLevel: 'free' | 'premium';
}

export const AdminPanel = () => {
    const [videos, setVideos] = useState<CourseVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<CourseVideo, 'id'>>({
        title: '',
        description: '',
        video_url: '',
        requiredLevel: 'free'
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'videos'));
            const videosData: CourseVideo[] = [];
            querySnapshot.forEach((doc) => {
                videosData.push({ id: doc.id, ...doc.data() } as CourseVideo);
            });
            setVideos(videosData);
        } catch (err) {
            console.error("Error fetching videos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                const videoRef = doc(db, 'videos', editingId);
                await updateDoc(videoRef, { ...formData });
            } else {
                await addDoc(collection(db, 'videos'), formData);
            }
            setIsFormOpen(false);
            setEditingId(null);
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error("Error saving video:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Seguro que deseas eliminar este video?")) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, 'videos', id));
                fetchVideos();
            } catch (err) {
                console.error("Error deleting video", err);
                setLoading(false);
            }
        }
    };

    const startEdit = (video: CourseVideo) => {
        setFormData({
            title: video.title,
            description: video.description,
            video_url: video.video_url,
            requiredLevel: video.requiredLevel
        });
        setEditingId(video.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', video_url: '', requiredLevel: 'free' });
    };

    if (loading && videos.length === 0) return <div className="pulse">Consultando Firebase...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Panel de Administración</h1>
                    <p style={{ color: 'var(--color-gray-800)' }}>Gestiona los videos y su nivel de acceso (Gratis/Premium). Recuerda usar enlaces de YouTube.</p>
                </div>
                {!isFormOpen && (
                    <button
                        className="btn btn-primary"
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                    >
                        <Plus size={20} />
                        Agregar Video
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="glass animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: 'var(--color-text-dark)' }}>{editingId ? 'Editar Video' : 'Nuevo Video'}</h2>
                        <button onClick={() => setIsFormOpen(false)} style={{ color: 'var(--color-gray-800)' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="form-label">Título del Video</label>
                            <input
                                required className="input-base"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descripción</label>
                            <textarea
                                required className="input-base" rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">URL del Video (Ejemplo: https://www.youtube.com/embed/...)</label>
                            <input
                                required className="input-base"
                                value={formData.video_url}
                                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nivel de Acceso</label>
                            <select
                                className="input-base"
                                value={formData.requiredLevel}
                                onChange={e => setFormData({ ...formData, requiredLevel: e.target.value as 'free' | 'premium' })}
                                style={{ appearance: 'none', backgroundColor: '#fff' }}
                            >
                                <option value="free">Gratis (Público)</option>
                                <option value="premium">Premium (Solo Suscriptores)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="submit" className="btn btn-primary">
                                {loading ? <span className="pulse">Guardando...</span> : <><Save size={20} /> Guardar</>}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List of videos */}
            <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                            <th style={{ padding: '1rem', color: 'var(--color-gray-800)' }}>Título</th>
                            <th style={{ padding: '1rem', color: 'var(--color-gray-800)' }}>Acceso</th>
                            <th style={{ padding: '1rem', color: 'var(--color-gray-800)', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-800)' }}>
                                    No hay videos registrados o Firebase no está conectado correctamente.
                                </td>
                            </tr>
                        ) : (
                            videos.map(video => (
                                <tr key={video.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '1.2rem 1rem', fontWeight: 500 }}>{video.title}</td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <span style={{
                                            backgroundColor: video.requiredLevel === 'free' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(172, 17, 62, 0.1)',
                                            color: video.requiredLevel === 'free' ? '#4CAF50' : 'var(--color-primary)',
                                            padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600
                                        }}>
                                            {video.requiredLevel === 'free' ? 'Gratis' : 'Premium'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => startEdit(video)}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="btn btn-outline" style={{ padding: '0.5rem', borderColor: 'rgba(172, 17, 62, 0.3)' }} onClick={() => handleDelete(video.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
