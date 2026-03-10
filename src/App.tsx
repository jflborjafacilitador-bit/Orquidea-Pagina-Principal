import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { AuthComponent } from './components/Auth/Auth';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { DashboardHome } from './pages/Dashboard/DashboardHome';
import { AdminPanel } from './pages/Admin/AdminPanel';
import { Facturacion } from './pages/Admin/Facturacion';
import { LegacyAccess } from './pages/Admin/LegacyAccess';
import { Referidos } from './pages/Admin/Referidos';
import { PagoExitoso } from './pages/Premium/PagoExitoso';
import { Precios } from './pages/Premium/Precios';
import { Canjear } from './pages/Canjear';
import { Referido } from './pages/Referido';
import { JaboneriBasica } from './pages/Dashboard/JaboneriBasica';
import { JaboneriAvanzada } from './pages/Dashboard/JaboneriAvanzada';
import { VelasBasica } from './pages/Dashboard/VelasBasica';
import { VelasAvanzada } from './pages/Dashboard/VelasAvanzada';
import { MoldesSilicon } from './pages/Dashboard/MoldesSilicon';
import { MarketingDigital } from './pages/Dashboard/MarketingDigital';

import { MisSuscripciones } from './pages/Dashboard/MisSuscripciones';
import { MisClases } from './pages/Dashboard/MisClases';
import { AdminCalendario } from './pages/Admin/AdminCalendario';
import { CategoriaProvider } from './context/CategoriaContext';
import React from 'react';

export interface UserProfile {
  id: string;
  email: string | null;
  role: string;
  displayName: string | null;
  suscripciones?: Record<string, { plan: string; nivel: number; activa: boolean; desde?: string }>;
  legacyCategories?: string[];
  legacyTier?: string;
  legacyExpiry?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile({ id: uid, email: auth.currentUser?.email || '', role: 'free', displayName: auth.currentUser?.displayName || '' });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
          Cargando Orquídea...
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  // Helper para rutas protegidas de usuario
  const userRoute = (element: React.ReactElement) =>
    user ? (
      <DashboardLayout isAdmin={isAdmin} userProfile={profile}>
        {element}
      </DashboardLayout>
    ) : <Navigate to="/login" />;

  // Helper para rutas protegidas de admin
  const adminRoute = (element: React.ReactElement) =>
    user && isAdmin ? (
      <DashboardLayout isAdmin={isAdmin} userProfile={profile}>
        {element}
      </DashboardLayout>
    ) : <Navigate to="/" />;

  return (
    <CategoriaProvider>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<DashboardLayout isPublicView={true}><DashboardHome /></DashboardLayout>} />
        <Route path="/login" element={!user ? <AuthComponent /> : <Navigate to="/dashboard" />} />
        <Route path="/precios" element={<DashboardLayout isPublicView={!user} isAdmin={isAdmin} userProfile={profile || undefined}><Precios /></DashboardLayout>} />
        <Route path="/canjear" element={<Canjear />} />
        <Route path="/r/:codigo" element={<Referido />} />

        {/* Dashboard privado */}
        <Route path="/dashboard" element={userRoute(<DashboardHome isLoggedView={true} userProfile={profile} />)} />
        <Route path="/dashboard/mis-suscripciones" element={userRoute(<MisSuscripciones />)} />
        <Route path="/dashboard/mis-clases" element={userRoute(<MisClases userProfile={profile} />)} />
        <Route path="/dashboard/jaboneria-basica" element={userRoute(<JaboneriBasica userProfile={profile} />)} />
        <Route path="/dashboard/jaboneria-avanzada" element={userRoute(<JaboneriAvanzada userProfile={profile} />)} />
        <Route path="/dashboard/velas-basica" element={userRoute(<VelasBasica userProfile={profile} />)} />
        <Route path="/dashboard/velas-avanzada" element={userRoute(<VelasAvanzada userProfile={profile} />)} />
        <Route path="/dashboard/moldes-silicon" element={userRoute(<MoldesSilicon userProfile={profile} />)} />
        <Route path="/dashboard/marketing-digital" element={userRoute(<MarketingDigital userProfile={profile} />)} />

        {/* Admin */}
        <Route path="/admin" element={adminRoute(<AdminPanel />)} />
        <Route path="/admin/facturacion" element={adminRoute(<Facturacion />)} />
        <Route path="/admin/calendario" element={adminRoute(<AdminCalendario />)} />
        <Route path="/admin/legacy" element={adminRoute(<LegacyAccess />)} />
        <Route path="/admin/referidos" element={adminRoute(<Referidos />)} />

        {/* Confirmación de pago */}
        <Route path="/pago-exitoso" element={userRoute(<PagoExitoso />)} />
      </Routes>
    </CategoriaProvider >
  );
}

export default App;
