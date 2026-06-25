import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FadingVideo from '../components/ui/FadingVideo';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'directorio'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cerrar buscador con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Avatares "liquid glass" puros con silueta
  const LiquidAvatar = ({ size = "w-8 h-8", border = "border-2" }) => (
    <div className={`${size} rounded-full liquid-glass ${border} border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] relative overflow-hidden flex items-center justify-center`}>
      <svg className="w-[120%] h-[120%] text-white/90 relative z-10 translate-y-[10%]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white font-body selection:bg-white/30 overflow-hidden relative">
      {/* Background Video */}
      <FadingVideo 
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_102933_4e8f73b5-775a-4179-b2fb-472f59063dcd.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10 w-full h-screen flex flex-col p-4 md:p-6">
        
        {/* Top Navbar / Pill */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-between w-full max-w-7xl mx-auto mb-6 md:mb-10 relative z-50 gap-2"
        >
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 transition-colors relative z-50"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="liquid-glass rounded-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-colors ${isConfigOpen ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isConfigOpen ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="hidden sm:inline text-sm font-medium pr-2 text-white/90">Configuración</span>
              </button>
              
              {/* Config Popover */}
              <AnimatePresence>
                {isConfigOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 w-64 liquid-glass rounded-2xl p-4 flex flex-col gap-3 shadow-2xl border border-white/10 z-50"
                  >
                    <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <span className="text-sm font-medium">Perfil</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      </div>
                      <span className="text-sm font-medium">Notificaciones</span>
                    </div>
                    <div className="w-full h-px bg-white/10 my-1"></div>
                    <div className="flex items-center gap-3 p-2 hover:bg-red-500/20 text-red-400 rounded-xl cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      </div>
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center Activity */}
          <div className="liquid-glass rounded-full px-5 py-2 flex items-center gap-4 hidden md:flex">
            <span className="text-sm font-medium">Hackathon a punto de empezar</span>
            <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">-5:23</span>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-3 relative z-50">
            <div className="liquid-glass rounded-full p-1.5 flex items-center relative">
              <button 
                onClick={() => setActiveTab('directorio')}
                className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'directorio' ? 'text-black' : 'text-white/80 hover:text-white'}`}
              >
                {activeTab === 'directorio' && (
                  <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                )}
                <span className="relative z-10">Directorio</span>
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-black' : 'text-white/80 hover:text-white'}`}
              >
                {activeTab === 'dashboard' && (
                  <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                )}
                <span className="relative z-10">Dashboard</span>
              </button>
            </div>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </motion.header>

        {/* Search Modal (Raycast Style) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-black/20 backdrop-blur-3xl"
            >
              {/* Overlay background to close */}
              <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSearchOpen(false)}></div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-[calc(100%-2rem)] md:w-full max-w-2xl bg-white/10 liquid-glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative z-10 flex flex-col"
              >
                <div className="flex items-center px-4 py-4 border-b border-white/10">
                  <svg className="w-6 h-6 text-white/50 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Buscar eventos, asistentes o comunidades..." 
                    className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-white/30 font-body"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="hidden sm:block px-3 py-1 liquid-glass rounded-[0.4rem] text-[10px] text-white/70 font-heading tracking-widest border border-white/20 shadow-sm">ESC</div>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-heading italic text-white/60 tracking-wider">Eventos Recientes</div>
                  
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-3 mx-1 my-1 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[0.8rem] liquid-glass border border-white/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center text-white relative overflow-hidden">
                        <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <div className="text-base font-medium font-heading text-white group-hover:text-blue-300 transition-colors">Hackathon Global AI</div>
                        <div className="text-xs font-body font-light text-white/50 mt-0.5">Directorio • En 2 días</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/20 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-3 mx-1 my-1 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[0.8rem] liquid-glass border border-white/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center text-white relative overflow-hidden">
                        <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <div className="text-base font-medium font-heading text-white group-hover:text-emerald-300 transition-colors">Q&A Innovación B2B</div>
                        <div className="text-xs font-body font-light text-white/50 mt-0.5">Sala Virtual • En vivo</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/20 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto pb-24 scrollbar-hide relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]"
              >
                {/* Card 1: Add New */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white/80">Crear nuevo evento</span>
                </div>

                {/* Card 2 */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-heading italic">Hackathon Global AI</h3>
                    <p className="text-sm text-white/60 mt-1">Asistentes VIP</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <LiquidAvatar colorClass="from-blue-400 to-emerald-400" />
                      <LiquidAvatar colorClass="from-orange-400 to-rose-400" />
                      <LiquidAvatar colorClass="from-purple-400 to-indigo-400" />
                    </div>
                    <div className="w-8 h-8 rounded-full liquid-glass border border-white/20 shadow-sm flex items-center justify-center text-xs font-medium">9</div>
                  </div>
                </div>

                {/* Card 3: Chart placeholder */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">Actividad Semanal</h3>
                  </div>
                  <div className="flex items-end gap-1 h-20 mt-4">
                    {[40, 70, 45, 90, 65, 85, 30, 50, 80, 40, 60, 100].map((h, i) => (
                      <div key={i} className="w-full liquid-glass border border-white/20 rounded-t-sm transition-all duration-1000 ease-out" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-1">
                      <LiquidAvatar colorClass="from-pink-500 to-orange-400" size="w-7 h-7" border="border" />
                      <LiquidAvatar colorClass="from-teal-400 to-emerald-500" size="w-7 h-7" border="border" />
                    </div>
                    <button className="w-8 h-8 rounded-full liquid-glass border border-white/20 text-white flex items-center justify-center hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                    </button>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-medium">DevDays 2026</h3>
                    <p className="text-sm text-white/60 mt-1">Conferencia Anual</p>
                  </div>
                  <div className="relative z-10 flex justify-end">
                    <span className="text-sm text-white/40">32 registrados</span>
                  </div>
                </div>

                {/* Card 5 */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-heading italic">React Avanzado</h3>
                    <p className="text-sm text-white/60 mt-1">Taller Interactivo</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <LiquidAvatar colorClass="from-red-400 to-pink-500" />
                      <LiquidAvatar colorClass="from-yellow-400 to-orange-500" />
                    </div>
                    <div className="w-8 h-8 rounded-full liquid-glass border border-white/20 shadow-sm flex items-center justify-center text-xs font-medium">3</div>
                  </div>
                </div>

                {/* Card 6: Video/Live placeholder */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-medium">Q&A Innovación B2B</h3>
                    <p className="text-sm text-white/60 mt-1">Sala Virtual en Vivo</p>
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <LiquidAvatar colorClass="from-purple-500 to-indigo-500" />
                    <div className="w-8 h-8 rounded-full liquid-glass border border-white/20 shadow-sm flex items-center justify-center text-xs font-medium">6</div>
                  </div>
                </div>

                {/* Card 7 */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-medium">Tendencias Frontend</h3>
                      <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                    <p className="text-sm text-white/60 mt-1">Mesa Redonda</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <LiquidAvatar colorClass="from-orange-400 to-red-400" />
                    <div className="w-8 h-8 rounded-full liquid-glass border border-white/20 shadow-sm flex items-center justify-center text-xs font-medium">2</div>
                  </div>
                </div>

                {/* Card 8: Media Gallery */}
                <div className="liquid-glass rounded-[1.75rem] p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center px-2 mb-2">
                    <div className="flex gap-2">
                      <span className="text-xs liquid-glass border border-white/20 text-white/90 px-2 py-0.5 rounded-sm shadow-sm">Transmisión</span>
                      <span className="text-xs text-white/60">En vivo</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="rounded-xl liquid-glass border border-white/10 overflow-hidden relative group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity mix-blend-luminosity" alt="Audience" />
                    </div>
                    <div className="rounded-xl liquid-glass border border-white/10 overflow-hidden relative group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity mix-blend-luminosity" alt="Speaker" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2 mt-3">
                    <div className="flex space-x-1">
                      <LiquidAvatar colorClass="from-cyan-400 to-blue-500" size="w-7 h-7" border="border" />
                      <LiquidAvatar colorClass="from-amber-400 to-orange-500" size="w-7 h-7" border="border" />
                    </div>
                    <span className="text-xs text-white/60">1.2k views</span>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* Directorio View */
              <motion.div 
                key="directorio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                className="liquid-glass rounded-3xl p-8 flex flex-col"
              >
                <h2 className="font-heading italic text-4xl mb-6">Directorio de Comunidades</h2>
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="liquid-glass border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <LiquidAvatar colorClass="from-purple-400 to-pink-500" size="w-12 h-12" border="border" />
                        <div>
                          <div className="font-medium">Comunidad Tech {item}</div>
                          <div className="text-sm text-white/50">{120 * item} Miembros activos</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                        Ver Perfil
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Dock */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 liquid-glass-strong rounded-full px-2 py-2 flex items-center gap-2 md:gap-4 z-50 scale-90 md:scale-100 origin-bottom"
        >
          <div className="flex items-center pl-2">
            <div className="flex space-x-2">
              <LiquidAvatar colorClass="from-slate-400 to-slate-600" size="w-10 h-10" />
              <LiquidAvatar colorClass="from-pink-400 to-rose-600" size="w-10 h-10" />
              <LiquidAvatar colorClass="from-emerald-400 to-teal-600" size="w-10 h-10" />
            </div>
            <div className="w-10 h-10 rounded-full liquid-glass border-2 border-white/10 flex items-center justify-center text-xs font-medium ml-2 shadow-sm">
              +17
            </div>
          </div>
          
          <div className="w-px h-8 bg-white/20 mx-2"></div>
          
          <div className="flex gap-2 pr-2">
            <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DashboardPage;
