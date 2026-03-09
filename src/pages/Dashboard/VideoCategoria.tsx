import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Play, Lock } from 'lucide-react';
import { NivelProgreso } from './NivelProgreso';

export type CategoryKey =
    | 'jaboneria_basica'
    | 'jaboneria_avanzada'
    | 'velas_basica'
    | 'velas_avanzada'
    | 'moldes_silicon'
    | 'marketing_digital';

export type PlanRole = 'cobre' | 'plata' | 'oro' | 'unico' | 'legacy' | 'free' | 'admin'
    | 'premium_bronce' | 'premium_plata' | 'premium_oro';

interface Video {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    category: CategoryKey;
    planRequerido: string;
    nivelRequerido: number;
}

interface Props {
    category: CategoryKey;
    categoryLabel: string;
    userProfile: {
        role?: PlanRole;
        niveles?: Record<string, number>;
    } | null;
    hasLevels?: boolean; // false for "unico" plan categories
}

// Which roles can access which categories
const CATEGORY_ACCESS: Record<CategoryKey, PlanRole[]> = {
    jaboneria_basica: ['cobre', 'plata', 'oro', 'legacy', 'admin', 'premium_bronce', 'premium_plata', 'premium_oro'],
    jaboneria_avanzada: ['plata', 'oro', 'admin', 'premium_plata', 'premium_oro'],
    velas_basica: ['cobre', 'plata', 'oro', 'legacy', 'admin', 'premium_bronce', 'premium_plata', 'premium_oro'],
    velas_avanzada: ['plata', 'oro', 'admin', 'premium_plata', 'premium_oro'],
    moldes_silicon: ['oro', 'unico', 'admin', 'premium_oro'],
    marketing_digital: ['oro', 'unico', 'admin', 'premium_oro'],
};

export const VideoCategoria = ({ category, categoryLabel, userProfile, hasLevels = true }: Props) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);

    const userRole = (userProfile?.role || 'free') as PlanRole;
    const userNivel = userProfile?.niveles?.[category] ?? 0;
    const hasAccess = CATEGORY_ACCESS[category]?.includes(userRole) || false;

    useEffect(() => {
        fetchVideos();
    }, [category]);

    const fetchVideos = async () => {
        try {
            const q = query(collection(db, 'videos'), where('category', '==', category));
            const snapshot = await getDocs(q);
            const data: Video[] = [];
            snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Video));
            // Sort by nivelRequerido, then by title
            data.sort((a, b) => a.nivelRequerido - b.nivelRequerido || a.title.localeCompare(b.title));
            setVideos(data);
        } catch (err) {
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!hasAccess) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Lock size={48} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--color-primary)' }}>Contenido no incluido en tu plan</h2>
                <p style={{ color: 'var(--color-gray-800)', marginTop: '0.5rem' }}>
                    {categoryLabel} no está disponible en tu suscripción actual.
                    <br />Considera actualizar tu plan para acceder.
                </p>
            </div>
        );
    }

    if (loading) return <div className="pulse">Cargando {categoryLabel}...</div>;

    const unlockedVideos = videos.filter(v => !hasLevels || v.nivelRequerido <= userNivel);
    const lockedVideos = videos.filter(v => hasLevels && v.nivelRequerido > userNivel);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {categoryLabel}
                </h1>
                {hasLevels && (
                    <NivelProgreso
                        nivelActual={userNivel}
                        totalDesbloqueados={unlockedVideos.length}
                        totalPorDesbloquear={lockedVideos.length}
                    />
                )}
            </div>

            {/* Active Video Player */}
            {activeVideo && (
                <div className="glass-dark animate-slide-up" style={{
                    marginBottom: '2rem', padding: '1rem', borderRadius: 'var(--radius-md)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                        <iframe
                            src={activeVideo.video_url}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                        <h2 style={{ color: 'var(--color-accent)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>{activeVideo.title}</h2>
                        <p style={{ color: 'var(--color-gray-100)' }}>{activeVideo.description}</p>
                    </div>
                </div>
            )}

            {/* Unlocked Videos */}
            {unlockedVideos.length > 0 && (
                <>
                    <h3 style={{ color: 'var(--color-text-dark)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
                        ✅ Disponibles ({unlockedVideos.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                        {unlockedVideos.map(video => (
                            <VideoCard key={video.id} video={video} isLocked={false} isActive={activeVideo?.id === video.id} onClick={() => setActiveVideo(video)} />
                        ))}
                    </div>
                </>
            )}

            {/* Locked Videos (next levels) */}
            {lockedVideos.length > 0 && (
                <>
                    <h3 style={{ color: 'var(--color-gray-800)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
                        🔒 Se desbloquean con más tiempo de suscripción ({lockedVideos.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                        {lockedVideos.map(video => (
                            <VideoCard key={video.id} video={video} isLocked={true} isActive={false} onClick={() => { }} />
                        ))}
                    </div>
                </>
            )}

            {videos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-gray-800)' }}>
                    <p>Próximamente habrá contenido en esta sección. ¡Mantente atenta!</p>
                </div>
            )}
        </div>
    );
};

interface VideoCardProps {
    video: Video;
    isLocked: boolean;
    isActive: boolean;
    onClick: () => void;
}

const VideoCard = ({ video, isLocked, isActive, onClick }: VideoCardProps) => (
    <div
        className="glass animate-fade-in"
        style={{
            borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: isLocked ? 'default' : 'pointer',
            opacity: isLocked ? 0.6 : 1, display: 'flex', flexDirection: 'column',
            border: isActive ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)',
            transition: 'var(--transition)',
        }}
        onClick={onClick}
        onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; } }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
    >
        <div style={{
            height: '160px', backgroundColor: isLocked ? '#ccc' : 'var(--color-accent)',
            backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }}>
            {isLocked ? (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.6rem', borderRadius: '50%',
                        color: 'var(--color-primary)'
                    }}>
                        <Lock size={20} />
                    </div>
                </div>
            ) : (
                !video.thumbnail_url && <Play size={40} color="white" opacity={0.5} />
            )}
            <div style={{
                position: 'absolute', top: '8px', right: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem', fontWeight: 700
            }}>
                Nv. {video.nivelRequerido}
            </div>
        </div>
        <div style={{ padding: '1.2rem', flex: 1, backgroundColor: 'var(--color-white)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-dark)', marginBottom: '0.4rem', fontWeight: 600 }}>{video.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-800)' }}>{video.description}</p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: isLocked ? 'var(--color-gray-800)' : 'var(--color-primary)' }}>
                {isLocked ? <><Lock size={14} /> Suscripción mes {video.nivelRequerido + 1}+</> : <><Play size={14} /> Ver clase</>}
            </div>
        </div>
    </div>
);
