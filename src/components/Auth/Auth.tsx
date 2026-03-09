import React, { useState } from 'react';
import { auth, db, googleProvider } from '../../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Mail, Lock, Sparkles, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthComponent = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleCreateProfileDoc = async (user: any) => {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        // Create the profile if it's the first time
        if (!docSnap.exists()) {
            await setDoc(userRef, {
                id: user.uid,
                email: user.email,
                displayName: user.displayName || email.split('@')[0],
                role: 'free', // Default rule
                createdAt: new Date().toISOString()
            });
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handleCreateProfileDoc(result.user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al conectar con Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await handleCreateProfileDoc(result.user);
            }
            navigate('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError("El correo ya está en uso. Por favor inicia sesión.");
            } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError("Credenciales incorrectas.");
            } else {
                setError(err.message || 'Ha ocurrido un error durante la autenticación.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{
            backgroundImage: 'linear-gradient(135deg, var(--color-light-bg) 0%, #ffffff 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px',
                background: 'var(--color-primary)', filter: 'blur(100px)', opacity: '0.1', borderRadius: '50%', zIndex: 0
            }}></div>

            <div className="glass animate-fade-in" style={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: '430px', padding: '2.5rem',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)'
            }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--color-accent)', color: 'var(--color-primary)',
                        marginBottom: '1rem'
                    }}>
                        <Sparkles size={32} />
                    </div>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', fontWeight: 700 }}>Orquídea</h1>
                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
                        {isLogin ? 'Accede a tus cursos premium' : 'Regístrate para continuar'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(172, 17, 62, 0.1)', color: 'var(--color-primary)',
                        padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem',
                        fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn btn-outline"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    style={{ width: '100%', marginBottom: '1.5rem', backgroundColor: 'white', display: 'flex', gap: '0.8rem' }}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                    Continuar con Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-800)' }}>O con correo</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
                </div>

                <form onSubmit={handleEmailAuth}>
                    <div className="form-group animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <label className="form-label" htmlFor="email">Correo electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-800)', opacity: 0.5 }} />
                            <input
                                id="email" type="email" required className="input-base" style={{ paddingLeft: '2.8rem' }}
                                placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-800)', opacity: 0.5 }} />
                            <input
                                id="password" type="password" required className="input-base" style={{ paddingLeft: '2.8rem' }}
                                placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading} className="btn btn-primary animate-slide-up"
                        style={{ width: '100%', marginTop: '0.5rem', animationDelay: '0.3s' }}
                    >
                        {loading ? <span className="pulse">Procesando...</span> : (isLogin ? <><LogIn size={20} /> Ingresar</> : 'Registrarse')}
                    </button>
                </form>

                <div className="animate-slide-up" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', animationDelay: '0.4s' }}>
                    <span style={{ color: 'var(--color-gray-800)' }}>
                        {isLogin ? "¿No tienes contraseña? " : "¿Ya tienes una cuenta? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Crea una cuenta' : 'Ingresa aquí'}
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
};
