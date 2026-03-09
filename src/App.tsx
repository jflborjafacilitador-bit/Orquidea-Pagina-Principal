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
import { PagoExitoso } from './pages/Premium/PagoExitoso';
import { Precios } from './pages/Premium/Precios';

export interface UserProfile {
  id: string;
  email: string | null;
  role: 'free' | 'premium' | 'admin';
  displayName: string | null;
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
        // Fallback for users that just registered and might not have a profile doc yet
        // In a real app, a Cloud Function creates this doc on user registration
        setProfile({
          id: uid,
          email: auth.currentUser?.email || '',
          role: 'free',
          displayName: auth.currentUser?.displayName || ''
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
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

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={
        <DashboardLayout isPublicView={true}>
          <DashboardHome />
        </DashboardLayout>
      } />

      <Route path="/login" element={!user ? <AuthComponent /> : <Navigate to="/dashboard" />} />

      <Route path="/precios" element={
        <DashboardLayout isPublicView={!user} isAdmin={isAdmin} userProfile={profile || undefined}>
          <Precios />
        </DashboardLayout>
      } />

      {/* Rutas Protegidas de Usuario (Dashboard PAGO/GRATIS una vez logueado) */}
      <Route path="/dashboard/*" element={
        user ? (
          <DashboardLayout isAdmin={isAdmin} userProfile={profile}>
            <DashboardHome isLoggedView={true} userProfile={profile} />
          </DashboardLayout>
        ) : <Navigate to="/login" />
      } />

      {/* Rutas Protegidas de Administrador */}
      <Route path="/admin" element={
        user && isAdmin ? (
          <DashboardLayout isAdmin={isAdmin} userProfile={profile}>
            <AdminPanel />
          </DashboardLayout>
        ) : <Navigate to="/" />
      } />

      <Route path="/admin/facturacion" element={
        user && isAdmin ? (
          <DashboardLayout isAdmin={isAdmin} userProfile={profile}>
            <Facturacion />
          </DashboardLayout>
        ) : <Navigate to="/" />
      } />

      {/* Ruta de Pago Exitoso */}
      <Route path="/pago-exitoso" element={
        user ? (
          <DashboardLayout isAdmin={isAdmin} userProfile={profile}>
            <PagoExitoso />
          </DashboardLayout>
        ) : <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default App;
