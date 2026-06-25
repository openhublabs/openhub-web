import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FadingVideo from '../components/ui/FadingVideo';
import { getAuth, signOut } from 'firebase/auth';

// --- MOCK DATA ---
const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Hackathon Global AI',
    type: 'Asistentes VIP',
    date: new Date(Date.now() + 2 * 86400000).toISOString(), // +2 days
    dateText: 'En 2 días',
    city: 'Remoto',
    category: 'IA',
    popularity: 95,
    clicks: 1200,
    link: 'https://example.com/hackathon-ai',
    bgClass: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 2,
    title: 'Q&A Innovación B2B',
    type: 'Sala Virtual en Vivo',
    date: new Date(Date.now() + 1 * 3600000).toISOString(), // +1 hour
    dateText: 'En vivo',
    city: 'Lima',
    category: 'Innovación',
    popularity: 80,
    clicks: 850,
    link: 'https://example.com/qa-b2b',
    bgClass: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    id: 3,
    title: 'DevDays 2026',
    type: 'Conferencia Anual',
    date: new Date(Date.now() + 15 * 86400000).toISOString(), // +15 days
    dateText: 'En 15 días',
    city: 'CDMX',
    category: 'General',
    popularity: 99,
    clicks: 5000,
    link: 'https://example.com/devdays',
    bgClass: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 4,
    title: 'React Avanzado',
    type: 'Taller Interactivo',
    date: new Date(Date.now() + 5 * 86400000).toISOString(), // +5 days
    dateText: 'En 5 días',
    city: 'Bogotá',
    category: 'Frontend',
    popularity: 75,
    clicks: 600,
    link: 'https://example.com/react-avanzado',
    bgClass: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    id: 5,
    title: 'Tendencias Frontend',
    type: 'Mesa Redonda',
    date: new Date(Date.now() + 1 * 86400000).toISOString(), // +1 day
    dateText: 'Mañana',
    city: 'Remoto',
    category: 'Frontend',
    popularity: 85,
    clicks: 950,
    link: 'https://example.com/tendencias-front',
    bgClass: 'from-pink-500/20 to-rose-500/20'
  },
  {
    id: 6,
    title: 'Backend Scaling',
    type: 'Taller',
    date: new Date(Date.now() + 10 * 86400000).toISOString(), // +10 days
    dateText: 'En 10 días',
    city: 'Lima',
    category: 'Backend',
    popularity: 60,
    clicks: 400,
    link: 'https://example.com/backend-scaling',
    bgClass: 'from-slate-500/20 to-gray-500/20'
  }
];

const CITIES = ['Todas', 'Remoto', 'Lima', 'CDMX', 'Bogotá'];
const CATEGORIES = ['Todas', 'IA', 'Innovación', 'Frontend', 'Backend', 'General'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'directorio' | 'perfil'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters & State
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [exploreSortMode, setExploreSortMode] = useState('popular'); // 'popular' | 'clicks'
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('openhub_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('openhub_favorites', JSON.stringify(favorites));
  }, [favorites]);

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

  // Actions
  const toggleFavorite = (e, id) => {
    e.stopPropagation(); // Evitar click en la card
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleShare = async (e, event) => {
    e.stopPropagation(); // Evitar click en la card
    const shareData = {
      title: event.title,
      text: `¡Mira este evento en OpenHub: ${event.title}!`,
      url: event.link
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(event.link);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // App.jsx routing takes care of redirecting to login
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Avatares "liquid glass"
  const LiquidAvatar = ({ size = "w-8 h-8", border = "border-2", colorClass = "" }) => (
    <div className={`${size} rounded-full liquid-glass ${border} border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] relative overflow-hidden flex items-center justify-center`}>
      <svg className={`w-[120%] h-[120%] text-white/90 relative z-10 translate-y-[10%]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      {colorClass && <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-40 mix-blend-color`}></div>}
    </div>
  );

  // Render Event Card
  const EventCard = ({ event }) => {
    const isFav = favorites.includes(event.id);
    
    return (
      <div 
        onClick={() => window.open(event.link, '_blank')}
        className={`liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-2xl`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${event.bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-heading italic">{event.title}</h3>
            <p className="text-sm text-white/60 mt-1">{event.type}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => handleShare(e, event)}
              className="w-8 h-8 rounded-full liquid-glass border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Compartir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={(e) => toggleFavorite(e, event.id)}
              className={`w-8 h-8 rounded-full liquid-glass border border-white/20 flex items-center justify-center transition-colors ${isFav ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'hover:bg-white/10 text-white'}`}
              title="Favorito"
            >
              <svg className="w-4 h-4" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between mt-6">
          <div className="flex flex-col gap-1 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {event.city}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {event.dateText}
            </span>
          </div>
          <div className="flex space-x-[-8px]">
            <LiquidAvatar colorClass="from-blue-400 to-emerald-400" />
            <LiquidAvatar colorClass="from-purple-400 to-pink-400" />
            <div className="w-8 h-8 rounded-full liquid-glass border border-white/20 flex items-center justify-center text-[10px] font-medium bg-black/40">
              +{Math.floor(Math.random() * 20) + 1}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Data processing
  const homeEvents = MOCK_EVENTS
    .filter(e => selectedCity === 'Todas' || e.city === selectedCity)
    .filter(e => selectedCategory === 'Todas' || e.category === selectedCategory)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Closest first

  const exploreEvents = [...MOCK_EVENTS].sort((a, b) => {
    if (exploreSortMode === 'popular') return b.popularity - a.popularity;
    return b.clicks - a.clicks;
  });

  const favoriteEvents = MOCK_EVENTS.filter(e => favorites.includes(e.id));

  return (
    <div className="bg-black min-h-screen text-white font-body selection:bg-white/30 overflow-hidden relative">
      <FadingVideo 
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_102933_4e8f73b5-775a-4179-b2fb-472f59063dcd.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10 w-full h-screen flex flex-col p-4 md:p-6">
        
        {/* Top Navbar */}
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
              
              <AnimatePresence>
                {isConfigOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 w-64 liquid-glass rounded-2xl p-4 flex flex-col gap-3 shadow-2xl border border-white/10 z-50"
                  >
                    <div 
                      onClick={() => { setActiveTab('perfil'); setIsConfigOpen(false); }}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <span className="text-sm font-medium">Mi Perfil / Favoritos</span>
                    </div>
                    <div className="w-full h-px bg-white/10 my-1"></div>
                    <div 
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-2 hover:bg-red-500/20 text-red-400 rounded-xl cursor-pointer transition-colors"
                    >
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

          {/* Right Navigation */}
          <div className="flex items-center gap-2 md:gap-3 relative z-50">
            <div className="liquid-glass rounded-full p-1.5 flex items-center relative">
              <button 
                onClick={() => setActiveTab('perfil')}
                className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'perfil' ? 'text-black' : 'text-white/80 hover:text-white'}`}
              >
                {activeTab === 'perfil' && (
                  <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                )}
                <span className="relative z-10 hidden md:inline">Perfil</span>
                <svg className="w-4 h-4 md:hidden relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              <button 
                onClick={() => setActiveTab('directorio')}
                className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'directorio' ? 'text-black' : 'text-white/80 hover:text-white'}`}
              >
                {activeTab === 'directorio' && (
                  <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                )}
                <span className="relative z-10">Explorar</span>
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-black' : 'text-white/80 hover:text-white'}`}
              >
                {activeTab === 'dashboard' && (
                  <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                )}
                <span className="relative z-10">Home</span>
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

        {/* Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto pb-24 scrollbar-hide relative z-10">
          <AnimatePresence mode="wait">
            
            {/* --- HOME TAB --- */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-6"
              >
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4 bg-black/20 p-4 rounded-3xl liquid-glass border border-white/5">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    <span className="text-sm font-medium text-white/60 mr-2">Filtros:</span>
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <div className="relative">
                      <select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-full px-4 py-2 pr-8 outline-none transition-colors cursor-pointer"
                      >
                        {CITIES.map(c => <option key={c} value={c} className="bg-neutral-900">{c === 'Todas' ? '🏙️ Ciudad' : c}</option>)}
                      </select>
                      <svg className="w-3 h-3 text-white/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    <div className="relative">
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-full px-4 py-2 pr-8 outline-none transition-colors cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-neutral-900">{c === 'Todas' ? '📁 Categoría' : c}</option>)}
                      </select>
                      <svg className="w-3 h-3 text-white/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-heading italic text-2xl md:text-3xl">Próximos eventos para ti</h2>
                  <span className="text-xs text-white/50 font-medium bg-white/5 px-3 py-1.5 rounded-full">{homeEvents.length} resultados</span>
                </div>

                {homeEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]">
                    {/* Create New Card */}
                    <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 border border-white/5 border-dashed transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-white/20 transition-colors flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white/80">Crear nuevo evento</span>
                    </div>

                    {homeEvents.map(event => <EventCard key={event.id} event={event} />)}
                  </div>
                ) : (
                  <div className="liquid-glass rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-white/5 mt-4">
                    <svg className="w-16 h-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="text-xl font-heading italic text-white/80">No hay eventos cercanos</h3>
                    <p className="text-sm text-white/50 mt-2 max-w-sm">Prueba ajustando los filtros de ciudad o categoría para encontrar lo que buscas.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* --- EXPLORE TAB --- */}
            {activeTab === 'directorio' && (
              <motion.div 
                key="directorio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h2 className="font-heading italic text-3xl md:text-4xl">Explorar Eventos</h2>
                  
                  <div className="liquid-glass rounded-full p-1 inline-flex self-start">
                    <button 
                      onClick={() => setExploreSortMode('popular')}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${exploreSortMode === 'popular' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                    >
                      🔥 Más Populares
                    </button>
                    <button 
                      onClick={() => setExploreSortMode('clicks')}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${exploreSortMode === 'clicks' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                    >
                      🖱️ Más Clickeados
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]">
                  {exploreEvents.map((event, idx) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="h-full"
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- PROFILE TAB --- */}
            {activeTab === 'perfil' && (
              <motion.div 
                key="perfil"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8"
              >
                {/* Profile Header */}
                <div className="liquid-glass rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative">
                    <LiquidAvatar size="w-24 h-24" border="border-4" colorClass="from-indigo-500 to-purple-500" />
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>

                  <div className="text-center md:text-left z-10 flex-1">
                    <h2 className="font-heading italic text-3xl md:text-4xl mb-1">{auth.currentUser?.email?.split('@')[0] || 'Desarrollador'}</h2>
                    <p className="text-sm text-white/50 mb-4">{auth.currentUser?.email || 'usuario@correo.com'}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                        <div className="text-xs text-white/40 mb-1">Favoritos</div>
                        <div className="font-heading italic text-xl">{favorites.length}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                        <div className="text-xs text-white/40 mb-1">Inscripciones</div>
                        <div className="font-heading italic text-xl">2</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="md:self-start liquid-glass border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-4 py-2 rounded-full text-xs font-medium transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>

                {/* Favorites Grid */}
                <div>
                  <h3 className="font-heading italic text-2xl mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Mis Favoritos
                  </h3>
                  
                  {favoriteEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]">
                      {favoriteEvents.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                  ) : (
                    <div className="liquid-glass rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-white/5 border-dashed">
                      <svg className="w-16 h-16 text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <h3 className="text-xl font-heading italic text-white/80">Aún no tienes favoritos</h3>
                      <p className="text-sm text-white/50 mt-2 max-w-sm">Explora el directorio o el inicio y presiona el corazón en los eventos que te interesen para guardarlos aquí.</p>
                      <button onClick={() => setActiveTab('directorio')} className="mt-6 bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                        Explorar eventos
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
                <div className="px-4 py-2 text-xs font-heading italic text-white/60 tracking-wider">Resultados</div>
                
                {MOCK_EVENTS.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())).map(event => (
                  <div key={event.id} onClick={() => window.open(event.link, '_blank')} className="flex items-center justify-between p-3 mx-1 my-1 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[0.8rem] liquid-glass border border-white/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center text-white relative overflow-hidden">
                        <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <div className="text-base font-medium font-heading text-white group-hover:text-blue-300 transition-colors">{event.title}</div>
                        <div className="text-xs font-body font-light text-white/50 mt-0.5">{event.category} • {event.dateText}</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/20 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
