import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { crearUsuario } from '../services/usuariosService';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 1. Crea la cuenta en Firebase Authentication y nos da el UID
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Guarda al usuario en Firestore automáticamente como ADMINISTRADOR
            await crearUsuario({
                id: user.uid, 
                email: user.email,
                rol: 'ADMINISTRADOR', 
                estado: 'Activo',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // 3. Te manda al dashboard con el contador actualizado
            navigate('/dashboard');
        } catch (err) {
            console.error('Firebase Auth Error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('El correo electrónico ya está en uso.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else if (err.code === 'auth/invalid-email') {
                setError('El correo electrónico no es válido.');
            } else {
                setError('Error al crear la cuenta. Inténtalo de nuevo.');
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
                        <p className="text-sm text-white/60 font-light font-body">Crea tu cuenta en el ecosistema</p>
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

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-white/50 pl-1">// Clave de acceso</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:bg-white/10 transition-all font-body font-light"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 mb-2">
                            <label className="text-xs font-medium text-white/50 pl-1">// Confirmar clave</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:bg-white/10 transition-all font-body font-light"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-white text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 mt-2"
                        >
                            {isLoading ? 'Cargando...' : 'Crear Cuenta →'}
                        </button>
                        
                        <div className="mt-4 text-center">
                            <span className="text-xs text-white/50">¿Ya tienes una cuenta? </span>
                            <Link to="/login" className="text-xs text-white hover:text-white/80 transition-colors font-medium">
                                Iniciar sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
