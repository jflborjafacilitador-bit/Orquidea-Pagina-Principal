import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Play, Lock } from 'lucide-react';
import { PaywallPlanes } from '../../components/PaywallPlanes';
import type { GrupoCategoria } from '../../components/PaywallPlanes';
import { tieneAcceso } from '../../types/suscripciones';
import { useCategoria } from '../../context/CategoriaContext';

const TABS = [
    { key: 'velas' as GrupoCategoria, label: 'Velas', emoji: '🕯️', categories: ['velas_basica', 'velas_avanzada'] },
    { key: 'jaboneria' as GrupoCategoria, label: 'Jabonería', emoji: '🧼', categories: ['jaboneria_basica', 'jaboneria_avanzada'] },
    { key: 'moldes' as GrupoCategoria, label: 'Moldes', emoji: '🧩', categories: ['moldes_silicon'] },
    { key: 'marketing' as GrupoCategoria, label: 'Marketing', emoji: '📱', categories: ['marketing_digital'] },
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
    requiredLevel?: 'free' | 'premium';
}

// Demo videos shown when Firestore is empty — one free, one premium per category
const DEMO_VIDEOS: Record<string, Video[]> = {
    velas_basica: [
        { id: 'demo-v1', title: 'Fundamentos de la Cera', description: 'Por qué elegir cera de soya, tipos de pabilos y contenedores.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'velas_basica', requiredLevel: 'free' },
        { id: 'demo-v2', title: 'Fragancias y Colorantes (Premium)', description: 'Técnicas para fijar aromas duraderos y crear paletas de color únicas.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'velas_basica', requiredLevel: 'premium' },
    ],
    velas_avanzada: [
        { id: 'demo-v3', title: 'Aromas que Perduran (Premium)', description: 'Maximiza el throw de tus velas con técnicas avanzadas de fragancia.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'velas_avanzada', requiredLevel: 'premium' },
    ],
    jaboneria_basica: [
        { id: 'demo-j1', title: 'Introducción al Jabón de Glicerina', description: 'Todo sobre el jabón de glicerina, colorantes y fragancias.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'jaboneria_basica', requiredLevel: 'free' },
        { id: 'demo-j2', title: 'Jabones con Exfoliantes (Premium)', description: 'Crea jabones spa con avena, café y sales marinas.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'jaboneria_basica', requiredLevel: 'premium' },
    ],
    jaboneria_avanzada: [
        { id: 'demo-j3', title: 'Técnica Cold Process (Premium)', description: 'Fabrica jabón artesanal desde cero con aceites naturales.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'jaboneria_avanzada', requiredLevel: 'premium' },
    ],
    moldes_silicon: [
        { id: 'demo-m1', title: 'Introducción a los Moldes (Demo)', description: 'Conoce los tipos de silicón y cómo preparar tu primer molde.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'moldes_silicon', requiredLevel: 'free' },
        { id: 'demo-m2', title: 'Moldes Complejos (Premium)', description: 'Creación de moldes con detalles finos para velas y jabones.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'moldes_silicon', requiredLevel: 'premium' },
    ],
    marketing_digital: [
        { id: 'demo-mk1', title: 'Tu Tienda en Instagram (Demo)', description: 'Cómo fotografiar y publicar tus productos artesanales.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'marketing_digital', requiredLevel: 'free' },
        { id: 'demo-mk2', title: 'Estrategia de Ventas Online (Premium)', description: 'Anuncios, historias y catálogos para vender más.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'marketing_digital', requiredLevel: 'premium' },
    ],
};

interface Props {
    isLoggedView?: boolean;
    userProfile?: any;
}

const isPremium = (v: Video) => v.planRequerido ? v.planRequerido !== 'free' : v.requiredLevel === 'premium';

export const DashboardHome = ({ isLoggedView = false, userProfile }: Props) => {
    const { activeTab } = useCategoria();
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
        } catch {
            // If Firestore fails, demo data will be used as fallback
        } finally { setLoading(false); }
    };

    const currentTab = TABS.find(t => t.key === activeTab)!;

    // Get videos for current tab — use Firestore, fall back to demo data
    const tabVideos = currentTab.categories.flatMap(cat => {
        const real = videosByCategory[cat] ?? [];
        return real.length > 0 ? real : (DEMO_VIDEOS[cat] ?? []);
    });

    const handleVideoClick = (video: Video) => {
        const role = userProfile?.role;
        const subs = userProfile?.suscripciones;
        if (!isPremium(video)) {
            setActiveVideo(video);
            setPaywall(null);
        } else if (role === 'admin' || tieneAcceso(video.category, subs, role)) {
            setActiveVideo(video);
            setPaywall(null);
        } else {
            setActiveVideo(null);
            setPaywall({ video, grupo: activeTab });
        }
    };

    const freeVideos = tabVideos.filter(v => !isPremium(v));
    const premiumVideos = tabVideos.filter(v => isPremium(v));

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.4rem' }}>
                    {currentTab.emoji} {isLoggedView ? `Tus cursos de ${currentTab.label}` : `Cursos de ${currentTab.label}`}
                </h1>
                <p style={{ color: 'var(--color-gray-800)', fontSize: '0.95rem' }}>
                    {isLoggedView ? 'Tu contenido según tu suscripción activa.' : 'Videos gratuitos + premium exclusivo para suscriptoras.'}
                </p>
            </div>

            {/* Active video player */}
            {activeVideo && (
                <div className="glass-dark animate-fade-in" style={{ marginBottom: '2rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe src={activeVideo.video_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen />
                    </div>
                    <div style={{ padding: '1.2rem 1.5rem 1rem' }}>
                        <h2 style={{ color: 'var(--color-accent)', fontSize: '1.2rem', marginBottom: '0.3rem' }}>{activeVideo.title}</h2>
                        <p style={{ color: 'var(--color-gray-100)', fontSize: '0.88rem' }}>{activeVideo.description}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="pulse" style={{ padding: '3rem', textAlign: 'center' }}>Cargando {currentTab.label}...</div>
            ) : (
                <>
                    {freeVideos.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                <span style={{ backgroundColor: '#4CAF5022', color: '#2e7d32', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>GRATIS</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>Clases de muestra</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                                {freeVideos.map(v => (
                                    <VideoCard key={v.id} video={v} isLocked={false} isActive={activeVideo?.id === v.id} onClick={() => handleVideoClick(v)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {premiumVideos.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                <span style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>PREMIUM</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>Exclusivo para suscriptoras</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                                {premiumVideos.map(v => {
                                    const hasAccess = userProfile?.role === 'admin' || tieneAcceso(v.category, userProfile?.suscripciones, userProfile?.role);
                                    return <VideoCard key={v.id} video={v} isLocked={!hasAccess} isActive={activeVideo?.id === v.id} onClick={() => handleVideoClick(v)} />;
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {paywall && (
                <PaywallPlanes grupo={paywall.grupo} videoTitle={paywall.video.title} onClose={() => setPaywall(null)} />
            )}
        </div>
    );
};

interface VideoCardProps { video: Video; isLocked: boolean; isActive: boolean; onClick: () => void; }

const VideoCard = ({ video, isLocked, isActive, onClick }: VideoCardProps) => (
    <div
        onClick={onClick}
        className="glass animate-fade-in"
        style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', border: isActive ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)', transition: 'var(--transition)', backgroundColor: 'var(--color-white)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
        <div style={{ height: '150px', backgroundColor: isLocked ? '#ddd' : '#f5d5d5', backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {isLocked && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-primary)' }}><Lock size={20} /></div>
            </div>}
            {!isLocked && !video.thumbnail_url && <Play size={36} color="white" opacity={0.5} />}
            <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: isLocked ? 'var(--color-primary)' : '#4CAF50', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                {isLocked ? 'PREMIUM' : 'GRATIS'}
            </div>
        </div>
        <div style={{ padding: '1rem', flex: 1 }}>
            <h3 style={{ fontSize: '0.92rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem', fontWeight: 600 }}>{video.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-800)', lineHeight: 1.4 }}>{video.description}</p>
            <div style={{ marginTop: '0.7rem', fontSize: '0.8rem', fontWeight: 500, color: isLocked ? 'var(--color-primary)' : '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isLocked ? <><Lock size={12} /> Suscríbete para ver</> : <><Play size={12} /> Reproducir</>}
            </div>
        </div>
    </div>
);
