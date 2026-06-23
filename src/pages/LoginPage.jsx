import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor, ingresa tus credenciales completas.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Firebase Auth Error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Credenciales incorrectas. Verifica tus datos.');
            } else {
                setError('Error al iniciar sesión. Inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white font-body relative flex items-center justify-center overflow-hidden selection:bg-white/30">
            {/* Luces Espaciales de fondo */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
            
            {/* Botón flotante para regresar a la Landing */}
            <button 
                type="button"
                onClick={() => navigate('/')}
                className="absolute top-6 left-8 liquid-glass rounded-full px-4 py-2 text-xs font-medium text-white/80 hover:text-white transition-colors z-50 flex items-center gap-1"
            >
                ← Volver al inicio
            </button>

            {/* Contenedor con Animación Fluida */}
            <motion.div 
                initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 w-full max-w-md px-4 py-8"
            >
                <div className="liquid-glass-strong rounded-[2rem] p-10 relative border border-white/10 backdrop-blur-xl bg-black/40 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="font-heading italic text-white text-4xl md:text-5xl tracking-tight leading-none mb-3">OpenHub</h2>
                        <p className="text-sm text-white/60 font-light font-body">Ingresa al ecosistema administrativo</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-light mb-6 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-white/50 pl-1">// Identidad</label>
                            <input
                                type="email"
                                placeholder="nombre@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:bg-white/10 transition-all font-body font-light"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 mb-2">
                            <label className="text-xs font-medium text-white/50 pl-1">// Clave de acceso</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:bg-white/10 transition-all font-body font-light"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-white text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 mt-2"
                        >
                            {isLoading ? 'Cargando...' : 'Autenticar Entrada →'}
                        </button>
                        
                        <div className="mt-4 text-center">
                            <span className="text-xs text-white/50">¿No tienes una cuenta? </span>
                            <Link to="/register" className="text-xs text-white hover:text-white/80 transition-colors font-medium">
                                Regístrate
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}