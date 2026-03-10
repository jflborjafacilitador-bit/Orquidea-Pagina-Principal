import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { LayoutDashboard, PlaySquare, ShieldAlert, LogOut, Menu, X, LogIn, Receipt, BookOpen, Flame, Layers, TrendingUp, UserCheck, Link2, CreditCard, CalendarDays } from 'lucide-react';
import type { MapaSuscripciones, GrupoCategoria } from '../../types/suscripciones';
import { useCategoria } from '../../context/CategoriaContext';
import type { TabCategoria } from '../../context/CategoriaContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
    isAdmin?: boolean;
    isPublicView?: boolean;
    userProfile?: any;
}

export const DashboardLayout = ({ children, isAdmin = false, isPublicView = false, userProfile }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const location = useLocation();
    const { activeTab, setActiveTab } = useCategoria();
    const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';

    const handleLogout = async () => {
        await auth.signOut();
    };

    const role = userProfile?.role || 'free';
    const subs = userProfile?.suscripciones ?? {};

    const hasSub = (g: string) => subs[g]?.activa === true;
    const hasPlata = (g: string) => hasSub(g) && (subs[g]?.plan === 'plata' || subs[g]?.plan === 'oro');

    // Legacy access
    const isLegacy = role === 'legacy';
    const legacyCats: string[] = userProfile?.legacyCategories ?? [];
    const legacyTier: string = userProfile?.legacyTier ?? 'cobre';
    const legacyHas = (cat: string) => isLegacy && legacyCats.includes(cat);
    const legacyHasAdv = (cat: string) => legacyHas(cat) && legacyTier === 'plata';

    const showBasicJab = isAdmin || hasSub('jaboneria') || legacyHas('jaboneria_basica');
    const showAdvJab = isAdmin || hasPlata('jaboneria') || legacyHasAdv('jaboneria_avanzada');
    const showBasicVel = isAdmin || hasSub('velas') || legacyHas('velas_basica');
    const showAdvVel = isAdmin || hasPlata('velas') || legacyHasAdv('velas_avanzada');
    const showMoldes = isAdmin || hasSub('moldes') || legacyHas('moldes_silicon');
    const showMkt = isAdmin || hasSub('marketing') || legacyHas('marketing_digital');
    const isLoggedIn = !!userProfile && role !== 'free';

    const navItems = [
        { label: 'Inicio', icon: <LayoutDashboard size={18} />, path: '/dashboard', always: true },
        ...(isLoggedIn ? [{ label: '📋 Mis Suscripciones', icon: <CreditCard size={18} />, path: '/dashboard/mis-suscripciones' }] : []),
        // Jabonería
        ...(showBasicJab ? [{ label: '🧼 Jabonería Básica', icon: <BookOpen size={18} />, path: '/dashboard/jaboneria-basica' }] : []),
        ...(showAdvJab ? [{ label: '🧼 Jabonería Avanzada', icon: <TrendingUp size={18} />, path: '/dashboard/jaboneria-avanzada' }] : []),
        // Velas
        ...(showBasicVel ? [{ label: '🕯️ Velas Básica', icon: <Flame size={18} />, path: '/dashboard/velas-basica' }] : []),
        ...(showAdvVel ? [{ label: '🕯️ Velas Avanzada', icon: <TrendingUp size={18} />, path: '/dashboard/velas-avanzada' }] : []),
        // Especiales
        ...(showMoldes ? [{ label: '🧩 Moldes de Silicón', icon: <Layers size={18} />, path: '/dashboard/moldes-silicon' }] : []),
        ...(showMkt ? [{ label: '📱 Marketing Digital', icon: <PlaySquare size={18} />, path: '/dashboard/marketing-digital' }] : []),
        // Mis Clases (Oro or Platino subscribers)
        ...(() => {
            const hasOroPlatino = ['jaboneria', 'velas'].some(
                g => subs[g]?.activa && (subs[g]?.plan === 'oro' || subs[g]?.plan === 'platino')
            );
            return (isAdmin || hasOroPlatino) ? [{ label: '🎓 Mis Clases', icon: <CalendarDays size={18} />, path: '/dashboard/mis-clases' }] : [];
        })(),
        // Admin
        ...isAdmin ? [
            { label: 'Panel Admin', icon: <ShieldAlert size={18} />, path: '/admin' },
            { label: 'Facturación', icon: <Receipt size={18} />, path: '/admin/facturacion' },
            { label: 'Calendario', icon: <CalendarDays size={18} />, path: '/admin/calendario' },
            { label: 'Acceso Legacy', icon: <UserCheck size={18} />, path: '/admin/legacy' },
            { label: 'Referidos', icon: <Link2 size={18} />, path: '/admin/referidos' },
        ] : []
    ];

    return (
        <div className="app-container" style={{ backgroundColor: 'var(--color-gray-100)', minHeight: '100vh', display: 'flex' }}>

            {/* Sidebar */}
            <aside
                className="glass-dark animate-fade-in"
                style={{
                    width: isSidebarOpen ? '260px' : '0px',
                    overflow: 'hidden',
                    transition: 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                {isSidebarOpen && (
                    <>
                        <div style={{ padding: '1.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <img
                                src="/Logo orquidea.png"
                                alt="Orquídea"
                                style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                            />
                            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>Orquídea</h2>
                        </div>

                        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)',
                                            backgroundColor: isActive ? 'rgba(172, 17, 62, 0.2)' : 'transparent',
                                            color: isActive ? 'var(--color-accent)' : 'var(--color-gray-100)',
                                            fontWeight: isActive ? 600 : 400,
                                            transition: 'var(--transition)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            {isPublicView ? (
                                <Link
                                    to="/login"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
                                        padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)',
                                        color: 'var(--color-gray-100)', transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogIn size={20} />
                                    <span>Iniciar Sesión</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
                                        padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)',
                                        color: 'var(--color-gray-100)', transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={20} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            )}
                        </div>
                    </>
                )}
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
                {/* Top Navbar */}
                <header style={{
                    height: '70px', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '1rem',
                    backgroundColor: 'var(--color-white)', borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ color: 'var(--color-gray-800)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Category tabs — only on home pages */}
                    {isHomePage && (
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {([['velas', '🕯️', 'Velas'], ['jaboneria', '🧼', 'Jabonería'], ['moldes', '🧩', 'Moldes'], ['marketing', '📱', 'Marketing']] as [TabCategoria, string, string][]).map(([key, emoji, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    style={{ padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', border: '1.5px solid', borderColor: activeTab === key ? 'var(--color-primary)' : 'rgba(0,0,0,0.12)', backgroundColor: activeTab === key ? 'var(--color-primary)' : 'transparent', color: activeTab === key ? 'white' : 'var(--color-gray-800)', fontSize: '0.82rem', fontWeight: activeTab === key ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                    {emoji} {label}
                                </button>
                            ))}
                        </div>
                    )}
                    {!isHomePage && <div style={{ flex: 1 }} />}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {userProfile && (
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{userProfile.displayName || userProfile.email}</span>
                                <span style={{ fontSize: '0.75rem', color: userProfile.role === 'premium' ? 'var(--color-primary)' : 'var(--color-gray-800)', textTransform: 'uppercase', fontWeight: 600 }}>
                                    {userProfile.role}
                                </span>
                            </div>
                        )}
                        {!isPublicView && (
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-primary)', fontWeight: 600, fontSize: '1.2rem',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                {userProfile?.displayName?.charAt(0).toUpperCase() || userProfile?.email?.charAt(0).toUpperCase() || 'O'}
                            </div>
                        )}
                        {isPublicView && (
                            <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                Acceder
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ flex: 1, padding: '2rem' }}>
                    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
