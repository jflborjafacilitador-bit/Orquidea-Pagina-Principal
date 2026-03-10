import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Play, Lock } from 'lucide-react';
import { PaywallPlanes } from '../../components/PaywallPlanes';
import type { GrupoCategoria } from '../../components/PaywallPlanes';
import { tieneAcceso } from '../../types/suscripciones';

type TabKey = 'velas' | 'jaboneria' | 'moldes' | 'marketing';

const TABS: { key: TabKey; label: string; emoji: string; categories: string[] }[] = [
    { key: 'velas', label: 'Velas', emoji: '🕯️', categories: ['velas_basica', 'velas_avanzada'] },
    { key: 'jaboneria', label: 'Jabonería', emoji: '🧼', categories: ['jaboneria_basica', 'jaboneria_avanzada'] },
    { key: 'moldes', label: 'Moldes de Silicón', emoji: '🧩', categories: ['moldes_silicon'] },
    { key: 'marketing', label: 'Marketing Digital', emoji: '📱', categories: ['marketing_digital'] },
];

interface Video {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    category: string;
    planRequerido?: string;
    nivelRequerido?: number;
    requiredLevel?: 'free' | 'premium'; // legacy field
}

interface Props {
    isLoggedView?: boolean;
    userProfile?: any;
}

const isPremiumVideo = (v: Video) =>
    v.planRequerido ? v.planRequerido !== 'free' : v.requiredLevel === 'premium';

export const DashboardHome = ({ isLoggedView = false, userProfile }: Props) => {
    const [activeTab, setActiveTab] = useState<TabKey>('velas');
    const [videosByCategory, setVideosByCategory] = useState<Record<string, Video[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [paywall, setPaywall] = useState<{ video: Video; grupo: GrupoCategoria } | null>(null);

    useEffect(() => { fetchVideos(); }, []);

    const fetchVideos = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'videos'));
            const map: Record<string, Video[]> = {};
            snapshot.forEach(d => {
                const v = { id: d.id, ...d.data() } as Video;
                if (!map[v.category]) map[v.category] = [];
                map[v.category].push(v);
            });
            setVideosByCategory(map);
        } catch (err) {
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    const currentTab = TABS.find(t => t.key === activeTab)!;

    // Gather all videos for the active tab
    const tabVideos: Video[] = currentTab.categories.flatMap(cat => videosByCategory[cat] ?? []);

    const handleVideoClick = (video: Video) => {
        const role = userProfile?.role;
        const isAdmin = role === 'admin';
        const subs = userProfile?.suscripciones;
        const category = video.category;

        const hasSub = isAdmin || tieneAcceso(category, subs, role);
        const isLocked = isPremiumVideo(video) && !hasSub;

        if (isLocked) {
            setActiveVideo(null);
            setPaywall({ video, grupo: activeTab as GrupoCategoria });
        } else {
            setActiveVideo(video);
            setPaywall(null);
        }
    };

    const freeVideos = tabVideos.filter(v => !isPremiumVideo(v));
    const premiumVideos = tabVideos.filter(v => isPremiumVideo(v));

    return (
        <div>
            {/* Page header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.4rem' }}>
                    {isLoggedView ? 'Tus Cursos' : 'Catálogo de Cursos'}
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    {isLoggedView
                        ? 'Explora tu contenido disponible según tu suscripción.'
                        : 'Explora nuestros repositorios. Contenido Premium requiere suscripción.'}
                </p>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {TABS.map(tab => {
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setActiveVideo(null); }}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                                fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, border: '2px solid',
                                borderColor: isActive ? 'var(--color-primary)' : 'rgba(0,0,0,0.12)',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-white)',
                                color: isActive ? 'white' : 'var(--color-gray-800)',
                                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
                        >
                            <span>{tab.emoji}</span> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Active video player */}
            {activeVideo && (
                <div className="glass-dark animate-fade-in" style={{ marginBottom: '2rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe src={activeVideo.video_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen />
                    </div>
                    <div style={{ padding: '1.2rem 1.5rem 1rem' }}>
                        <h2 style={{ color: 'var(--color-accent)', fontSize: '1.3rem', marginBottom: '0.3rem' }}>{activeVideo.title}</h2>
                        <p style={{ color: 'var(--color-gray-100)', fontSize: '0.9rem' }}>{activeVideo.description}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="pulse" style={{ padding: '3rem', textAlign: 'center' }}>Cargando {currentTab.label}...</div>
            ) : tabVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-gray-800)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{currentTab.emoji}</div>
                    <p>Próximamente habrá contenido de {currentTab.label}. ¡Mantente atenta!</p>
                </div>
            ) : (
                <>
                    {/* Free videos */}
                    {freeVideos.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ backgroundColor: '#4CAF5022', color: '#2e7d32', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>GRATIS</span>
                                Clases de muestra
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                                {freeVideos.map(v => (
                                    <VideoCard key={v.id} video={v} isLocked={false} isActive={activeVideo?.id === v.id} onClick={() => handleVideoClick(v)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Premium videos */}
                    {premiumVideos.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>PREMIUM</span>
                                Contenido exclusivo para suscriptoras
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                                {premiumVideos.map(v => {
                                    const role = userProfile?.role;
                                    const isAdmin = role === 'admin';
                                    const hasSub = isAdmin || tieneAcceso(v.category, userProfile?.suscripciones, role);
                                    return (
                                        <VideoCard key={v.id} video={v} isLocked={!hasSub} isActive={activeVideo?.id === v.id} onClick={() => handleVideoClick(v)} />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Paywall modal */}
            {paywall && (
                <PaywallPlanes
                    grupo={paywall.grupo}
                    videoTitle={paywall.video.title}
                    onClose={() => setPaywall(null)}
                />
            )}
        </div>
    );
};

interface VideoCardProps {
    video: Video; isLocked: boolean; isActive: boolean; onClick: () => void;
}

const VideoCard = ({ video, isLocked, isActive, onClick }: VideoCardProps) => (
    <div
        className="glass animate-fade-in"
        style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: isLocked ? 'pointer' : 'pointer', display: 'flex', flexDirection: 'column', border: isActive ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)', transition: 'var(--transition)', backgroundColor: 'var(--color-white)' }}
        onClick={onClick}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
    >
        <div style={{ height: '156px', backgroundColor: isLocked ? '#e0c8c8' : '#f5d5d5', backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {isLocked
                ? <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.6rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                        <Lock size={22} />
                    </div>
                </div>
                : !video.thumbnail_url && <Play size={36} color="white" opacity={0.6} />
            }
            {!isLocked && (
                <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#4CAF50', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>GRATIS</div>
            )}
            {isLocked && (
                <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>PREMIUM</div>
            )}
        </div>
        <div style={{ padding: '1.1rem', flex: 1 }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem', fontWeight: 600 }}>{video.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-800)', lineHeight: 1.4 }}>{video.description}</p>
            <div style={{ marginTop: '0.8rem', fontSize: '0.82rem', fontWeight: 500, color: isLocked ? 'var(--color-primary)' : '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isLocked ? <><Lock size={13} /> Suscríbete para ver</> : <><Play size={13} /> Reproducir lección</>}
            </div>
        </div>
    </div>
);
