import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Play, Lock } from 'lucide-react';
import { Precios } from '../Premium/Precios';

interface CourseVideo {
    id: string;
    title: string;
    description: string;
    video_url: string;
    requiredLevel: 'free' | 'premium';
    thumbnail_url?: string;
}

interface DashboardHomeProps {
    isLoggedView?: boolean;
    userProfile?: any;
}

export const DashboardHome = ({ isLoggedView = false, userProfile }: DashboardHomeProps) => {
    const [videos, setVideos] = useState<CourseVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
    const [showPaywall, setShowPaywall] = useState<CourseVideo | null>(null);

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

            if (videosData.length === 0) {
                // Mock data if Firestore is empty or rules block it
                setVideos([
                    { id: '1', title: 'Fundamentos de la Cera', description: 'Por qué elegir soya sobre parafina y los tipos de pabilos.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', requiredLevel: 'free' },
                    { id: '2', title: 'Aromas que Perduran (Premium)', description: 'Técnicas avanzadas para maximizar el "throw" de tus velas.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', requiredLevel: 'premium' },
                    { id: '3', title: 'Colorimetría y Moldes (Premium)', description: 'Creando velas esculturales con colores personalizados.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', requiredLevel: 'premium' }
                ]);
            } else {
                setVideos(videosData);
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
            // Mock data on error
            setVideos([
                { id: '1', title: 'Cursos de Muestra (No Conectado a DB)', description: 'Por favor, configura tu API Key de Firebase.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', requiredLevel: 'free' },
                { id: '2', title: 'Aromas que Perduran (Premium)', description: 'Técnicas avanzadas para maximizar el "throw" de tus velas.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', requiredLevel: 'premium' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (video: CourseVideo) => {
        const isPremium = video.requiredLevel === 'premium';
        const hasAccess = userProfile?.role === 'premium' || userProfile?.role === 'admin';

        if (isPremium && !hasAccess) {
            setShowPaywall(video);
            setActiveVideo(null);
        } else {
            setActiveVideo(video);
            setShowPaywall(null);
        }
    };

    if (loading) return <div className="pulse">Cargando la colección de cursos...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {isLoggedView ? 'Tus Cursos' : 'Catálogo de Cursos'}
                </h1>
                <p style={{ color: 'var(--color-gray-800)' }}>
                    {isLoggedView
                        ? 'Bienvenido de vuelta. Continúa tu aprendizaje de creación de velas.'
                        : 'Explora nuestra biblioteca. Contenido Premium requiere suscripción activa.'}
                </p>
            </div>

            {/* Active Video Player */}
            {activeVideo && (
                <div className="glass-dark animate-slide-up" style={{
                    marginBottom: '3rem', padding: '1rem', borderRadius: 'var(--radius-md)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                        <iframe
                            src={activeVideo.video_url}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div style={{ padding: '1.5rem 0.5rem 0.5rem 0.5rem' }}>
                        <h2 style={{ color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeVideo.title}</h2>
                        <p style={{ color: 'var(--color-gray-100)' }}>{activeVideo.description}</p>
                    </div>
                </div>
            )}

            {/* Paywall Popup - 3 planes de suscripción */}
            {showPaywall && (
                <div className="animate-fade-in" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000,
                    padding: '1.5rem', overflowY: 'auto'
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-gray-100)', maxWidth: '1000px', width: '100%',
                        padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg)',
                        position: 'relative', marginTop: '2rem', marginBottom: '2rem'
                    }}>
                        <button
                            onClick={() => setShowPaywall(null)}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                color: 'var(--color-gray-800)', fontSize: '1.5rem', zIndex: 10,
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.05)'
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '56px', height: '56px', borderRadius: '50%',
                                backgroundColor: 'var(--color-light-bg)', color: 'var(--color-primary)', marginBottom: '1rem'
                            }}>
                                <Lock size={28} />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>
                                Desbloquea "{showPaywall.title}"
                            </h2>
                            <p style={{ color: 'var(--color-gray-800)' }}>
                                Este contenido es exclusivo para miembros. Elige el plan que mejor se adapte a ti.
                            </p>
                        </div>

                        <Precios onClose={() => setShowPaywall(null)} showTitle={false} />
                    </div>
                </div>
            )}

            {/* Course Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {videos.map((video) => {
                    const isPremium = video.requiredLevel === 'premium';
                    const hasAccess = userProfile?.role === 'premium' || userProfile?.role === 'admin';
                    const isLocked = isPremium && !hasAccess;
                    const isActive = activeVideo?.id === video.id;

                    return (
                        <div
                            key={video.id}
                            className={`glass animate-slide-up`}
                            style={{
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                transition: 'var(--transition)',
                                cursor: 'pointer',
                                opacity: (isLocked && isLoggedView) ? 0.8 : 1,
                                display: 'flex', flexDirection: 'column',
                                border: isActive ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)'
                            }}
                            onClick={() => handleVideoClick(video)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = isActive ? '0 0 0 2px var(--color-primary)' : 'var(--shadow-sm)';
                            }}
                        >
                            {/* Thumbnail Area */}
                            <div style={{
                                height: '180px',
                                backgroundColor: 'var(--color-accent)',
                                backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {!video.thumbnail_url && <Play size={48} color="white" opacity={0.5} />}

                                {isLocked && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.8rem', borderRadius: '50%',
                                            color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: 'var(--shadow-md)'
                                        }}>
                                            <Lock size={24} />
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    backgroundColor: !isPremium ? 'rgba(255,255,255,0.95)' : 'var(--color-primary)',
                                    color: !isPremium ? 'var(--color-primary)' : 'white',
                                    padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)',
                                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {isPremium ? 'Premium' : 'Gratis'}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-white)' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>{video.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)', flex: 1 }}>{video.description}</p>

                                <div style={{
                                    marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    color: isLocked ? 'var(--color-gray-800)' : 'var(--color-primary)', fontWeight: 500, fontSize: '0.9rem'
                                }}>
                                    {isLocked ? (
                                        <><Lock size={16} /> Suscríbete para ver</>
                                    ) : (
                                        <><Play size={16} /> Reproducir Lección</>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
