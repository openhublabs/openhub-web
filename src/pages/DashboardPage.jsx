import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FadingVideo from '../components/ui/FadingVideo';
import { obtenerEventos, crearEvento, borrarEvento, actualizarEvento } from '../services/EventosService';
import { obtenerUsuarios, crearUsuario, borrarUsuario, actualizarUsuario } from '../services/usuariosService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // === ESTADOS PARA MODALES ===
  const [activeModal, setActiveModal] = useState(null);

  // === ESTADOS PARA EVENTOS (FIREBASE REAL) ===
  const [eventos, setEventos] = useState([]);
  const [isLoadingEventos, setIsLoadingEventos] = useState(true);
  const [filtroTextoEventos, setFiltroTextoEventos] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('todas');
  const [filtroCategoriaEventos, setFiltroCategoriaEventos] = useState('todas');
  const [filtroUbicacionEventos, setFiltroUbicacionEventos] = useState('todas');
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [formDataEvento, setFormDataEvento] = useState({
    titulo: '',
    organizador: '',
    categoria: 'inteligencia artificial',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    isOnline: 'false',
    ubicacion: '',
    imagenUrl: '',
    descripcion: '',
    tags: []
  });

  // === ESTADOS PARA USUARIOS (FIREBASE REAL) ===
  const [usuarios, setUsuarios] = useState([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true);
  const [filtroTextoUsuarios, setFiltroTextoUsuarios] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingUser, setEditingUser] = useState(null);

  const [formDataUsuario, setFormDataUsuario] = useState({
    email: '',
    rol: 'ASISTENTE',
    estado: 'Activo'
  });

  // === ESTADÍSTICAS ===
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalEventos: 0,
    eventosActivos: 0,
    eventosOnline: 0,
    eventosPresenciales: 0,
    adminCount: 0,
    organizadorCount: 0,
    asistenteCount: 0,
    eventosPorCategoria: {},
    usuariosUltimosDias: 0,
    eventosUltimosDias: 0
  });

  // ==========================================
  // CARGAR EVENTOS
  // ==========================================
  const cargarEventos = async () => {
    setIsLoadingEventos(true);
    const data = await obtenerEventos();
    setEventos(data);
    setIsLoadingEventos(false);
  };

  // ==========================================
  // CARGAR USUARIOS
  // ==========================================
  const cargarUsuarios = async () => {
    setIsLoadingUsuarios(true);
    const data = await obtenerUsuarios();
    setUsuarios(data);
    setIsLoadingUsuarios(false);
  };

  // ==========================================
  // CALCULAR ESTADÍSTICAS
  // ==========================================
  const calcularEstadisticas = () => {
    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Contar usuarios
    const adminCount = usuarios.filter(u => u.rol === 'ADMINISTRADOR').length;
    const organizadorCount = usuarios.filter(u => u.rol === 'ORGANIZADOR').length;
    const asistenteCount = usuarios.filter(u => u.rol === 'ASISTENTE').length;
    const usuariosActivos = usuarios.filter(u => u.estado === 'Activo').length;

    // Contar eventos
    const eventosOnline = eventos.filter(e => e.isOnline === true).length;
    const eventosPresenciales = eventos.filter(e => e.isOnline === false).length;

    // Eventos por categoría
    const eventosPorCategoria = {};
    eventos.forEach(e => {
      const cat = e.categoria || 'Sin categoría';
      eventosPorCategoria[cat] = (eventosPorCategoria[cat] || 0) + 1;
    });

    setEstadisticas({
      totalUsuarios: usuarios.length,
      usuariosActivos,
      totalEventos: eventos.length,
      eventosActivos: eventos.length,
      eventosOnline,
      eventosPresenciales,
      adminCount,
      organizadorCount,
      asistenteCount,
      eventosPorCategoria,
      usuariosUltimosDias: usuarios.filter(u => {
        const createdAt = u.createdAt?.toDate?.() || new Date();
        return createdAt > hace7Dias;
      }).length,
      eventosUltimosDias: eventos.filter(e => {
        const updatedAt = e.updatedAt?.toDate?.() || new Date();
        return updatedAt > hace7Dias;
      }).length
    });
  };

  // ==========================================
  // EFECTOS - CARGAR DATOS
  // ==========================================
  useEffect(() => {
    cargarEventos();
    cargarUsuarios();
  }, []);

  // Recalcular estadísticas cuando cambien eventos o usuarios
  useEffect(() => {
    calcularEstadisticas();
  }, [eventos, usuarios]);

  // ==========================================
  // LÓGICA DE EVENTOS
  // ==========================================
  const handleCrearEvento = async (e) => {
    e.preventDefault();
    try {
      await crearEvento({
        ...formDataEvento,
        isOnline: formDataEvento.isOnline === 'true',
        clips: 0
      });
      cargarEventos();
      setFormDataEvento({
        titulo: '',
        organizador: '',
        categoria: 'inteligencia artificial',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        isOnline: 'false',
        ubicacion: '',
        imagenUrl: '',
        descripcion: '',
        tags: []
      });
      setActiveModal('eventsList');
    } catch (error) {
      alert("Error al crear evento: " + error.message);
    }
  };

  const handleActualizarEvento = async (e) => {
    e.preventDefault();
    try {
      await actualizarEvento(editingEvent.id, {
        ...editingEvent,
        isOnline: editingEvent.isOnline === 'true' || editingEvent.isOnline === true
      });
      cargarEventos();
      setEditingEvent(null);
      setActiveModal('eventsList');
    } catch (error) {
      alert("Error al actualizar evento: " + error.message);
    }
  };

  const handleBorrarEvento = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este evento?")) {
      try {
        await borrarEvento(id);
        cargarEventos();
      } catch (error) {
        alert("Error al borrar evento: " + error.message);
      }
    }
  };

  // ==========================================
  // LÓGICA DE USUARIOS
  // ==========================================
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (!formDataUsuario.email) {
      alert('El correo es requerido');
      return;
    }
    try {
      await crearUsuario(formDataUsuario);
      cargarUsuarios();
      setFormDataUsuario({ email: '', rol: 'ASISTENTE', estado: 'Activo' });
      setActiveModal('usersList');
    } catch (error) {
      alert("Error al crear usuario: " + error.message);
    }
  };

  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    try {
      await actualizarUsuario(editingUser.id, editingUser);
      cargarUsuarios();
      setEditingUser(null);
      setActiveModal('usersList');
    } catch (error) {
      alert("Error al actualizar usuario: " + error.message);
    }
  };

  const handleBorrarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de banear permanentemente a este usuario?")) {
      try {
        await borrarUsuario(id);
        cargarUsuarios();
      } catch (error) {
        alert("Error al borrar usuario: " + error.message);
      }
    }
  };

  // ==========================================
  // FILTRADOS
  // ==========================================
  const eventosFiltrados = eventos.filter(ev => {
    const titulo = (ev.titulo || '').toLowerCase();
    const organizador = (ev.organizador || '').toLowerCase();
    const categoria = ev.categoria || 'sin-categoria';
    const ubicacion = (ev.ubicacion || '').toLowerCase();
    const filtro = filtroTextoEventos.toLowerCase();

    const matchTexto = titulo.includes(filtro) || organizador.includes(filtro);
    const matchModalidad = filtroModalidad === 'todas' ? true : 
      (filtroModalidad === 'online' ? ev.isOnline : !ev.isOnline);
    const matchCategoria = filtroCategoriaEventos === 'todas' ? true : 
      categoria.includes(filtroCategoriaEventos.toLowerCase());
    const matchUbicacion = filtroUbicacionEventos === 'todas' ? true : 
      ubicacion.includes(filtroUbicacionEventos.toLowerCase());

    return matchTexto && matchModalidad && matchCategoria && matchUbicacion;
  });

  const usuariosFiltrados = usuarios.filter(u => {
    const email = (u.email || '').toLowerCase();
    const matchTexto = email.includes(filtroTextoUsuarios.toLowerCase());
    const matchRol = filtroRol === 'todos' ? true : u.rol === filtroRol;
    const matchEstado = filtroEstado === 'todos' ? true : u.estado === filtroEstado;
    return matchTexto && matchRol && matchEstado;
  });

  // ==========================================
  // COMPONENTES REUTILIZABLES
  // ==========================================
  const LiquidAvatar = ({ size = "w-8 h-8", border = "border-2", colorClass = "text-white" }) => (
    <div className={`${size} rounded-full liquid-glass ${border} border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] relative overflow-hidden flex items-center justify-center`}>
      <svg className={`w-[120%] h-[120%] ${colorClass} relative z-10 translate-y-[10%]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  const StatCard = ({ label, value, icon, color = "blue" }) => (
    <div className={`liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-white/70">{label}</h3>
        <div className={`w-10 h-10 rounded-full liquid-glass border border-${color}-400/30 flex items-center justify-center group-hover:bg-${color}-400/10 transition-colors`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <span className="text-3xl font-light text-white">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white font-body selection:bg-white/30 overflow-hidden relative">
      <FadingVideo 
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_102933_4e8f73b5-775a-4179-b2fb-472f59063dcd.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10 w-full h-screen flex flex-col p-4 md:p-6">
        
        {/* === TOP NAVBAR === */}
        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex items-center justify-between w-full max-w-7xl mx-auto mb-6 md:mb-10 relative z-50 gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 transition-colors relative z-50">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="relative">
              <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="liquid-glass rounded-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-colors ${isConfigOpen ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isConfigOpen ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="hidden sm:inline text-sm font-medium pr-2 text-white/90">Configuración</span>
              </button>
              
              <AnimatePresence>
                {isConfigOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 mt-3 w-64 liquid-glass rounded-2xl p-4 flex flex-col gap-3 shadow-2xl border border-white/10 z-50">
                    <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><span className="text-sm font-medium">Perfil</span></div>
                    <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></div><span className="text-sm font-medium">Notificaciones</span></div>
                    <div className="w-full h-px bg-white/10 my-1"></div>
                    <div className="flex items-center gap-3 p-2 hover:bg-red-500/20 text-red-400 rounded-xl cursor-pointer transition-colors"><div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div><span className="text-sm font-medium">Cerrar Sesión</span></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="liquid-glass rounded-full px-5 py-2 flex items-center gap-4 hidden md:flex">
            <span className="text-sm font-medium">Panel de Administración</span>
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Online</span>
          </div>

          <div className="flex items-center gap-3 relative z-50">
            <div className="liquid-glass rounded-full p-1.5 flex items-center relative">
              <button onClick={() => setActiveTab('directorio')} className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'directorio' ? 'text-black' : 'text-white/80 hover:text-white'}`}>
                {activeTab === 'directorio' && <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                <span className="relative z-10">Directorio</span>
              </button>
              <button onClick={() => setActiveTab('dashboard')} className={`relative px-3 py-1.5 md:px-4 text-xs md:text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-black' : 'text-white/80 hover:text-white'}`}>
                {activeTab === 'dashboard' && <motion.div layoutId="navPill" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                <span className="relative z-10">Dashboard</span>
              </button>
            </div>
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </motion.header>

        {/* === BUSCADOR === */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-black/20 backdrop-blur-3xl">
              <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSearchOpen(false)}></div>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-[calc(100%-2rem)] md:w-full max-w-2xl bg-white/10 liquid-glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative z-10 flex flex-col">
                <div className="flex items-center px-4 py-4 border-b border-white/10">
                  <svg className="w-6 h-6 text-white/50 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" autoFocus placeholder="Buscar eventos..." className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-white/30 font-body" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <div className="hidden sm:block px-3 py-1 liquid-glass rounded-[0.4rem] text-[10px] text-white/70 font-heading tracking-widest border border-white/20 shadow-sm">ESC</div>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-heading italic text-white/60 tracking-wider">Eventos en la Red</div>
                  {eventos.filter(e => (e.titulo || '').toLowerCase().includes(searchQuery.toLowerCase())).map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between p-3 mx-1 my-1 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-[0.8rem] liquid-glass border border-white/20 flex items-center justify-center text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                        <div>
                          <div className="text-base font-medium font-heading text-white group-hover:text-blue-300 transition-colors">{ev.titulo || 'Sin título'}</div>
                          <div className="text-xs font-body font-light text-white/50 mt-0.5">{ev.categoria} • {ev.fecha}</div>
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

        {/* === ÁREA CENTRAL === */}
        <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto pb-24 scrollbar-hide relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
                
                {/* CARD 1: USUARIOS */}
                <div onClick={() => setActiveModal('usersList')} className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-heading italic text-white">Usuarios</h3>
                    <div className="w-10 h-10 rounded-full liquid-glass border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-light text-white">{estadisticas.totalUsuarios}</span>
                    <p className="text-xs text-white/60 mt-1">Cuentas Registradas</p>
                  </div>
                  <button className="w-full mt-4 bg-white/10 group-hover:bg-white/20 border border-white/10 rounded-xl py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                    Gestionar Accesos
                  </button>
                </div>

                {/* CARD 2: EVENTOS */}
                <div onClick={() => setActiveModal('eventsList')} className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-heading italic text-white">Eventos</h3>
                    <div className="w-10 h-10 rounded-full liquid-glass border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-light text-white">{isLoadingEventos ? '-' : estadisticas.totalEventos}</span>
                    <p className="text-xs text-white/60 mt-1">Sincronizados en Firebase</p>
                  </div>
                  <button className="w-full mt-4 bg-white text-black group-hover:bg-white/90 rounded-xl py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                    Administrar Catálogo
                  </button>
                </div>

                {/* CARD 3: ROLES DISTRIBUTION */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Distribución de Roles</h3>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Admin</span>
                      <span className="font-semibold text-blue-400">{estadisticas.adminCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Organizador</span>
                      <span className="font-semibold text-purple-400">{estadisticas.organizadorCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Asistente</span>
                      <span className="font-semibold text-emerald-400">{estadisticas.asistenteCount}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 4: MODALIDAD EVENTOS */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Modalidad</h3>
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Online</span>
                        <span className="font-semibold text-blue-400">{estadisticas.eventosOnline}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(estadisticas.eventosOnline / estadisticas.totalEventos * 100) || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Presencial</span>
                        <span className="font-semibold text-emerald-400">{estadisticas.eventosPresenciales}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(estadisticas.eventosPresenciales / estadisticas.totalEventos * 100) || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 5: ACTIVIDAD ÚLTIMOS 7 DÍAS */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Actividad (7 días)</h3>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                      <div>
                        <div className="text-xs text-white/70">Usuarios nuevos</div>
                        <div className="text-lg font-semibold text-white">{estadisticas.usuariosUltimosDias}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.12-2.59-4.04 5.09h15.5L9.96 6.5z"/></svg>
                      <div>
                        <div className="text-xs text-white/70">Eventos actualizados</div>
                        <div className="text-lg font-semibold text-white">{estadisticas.eventosUltimosDias}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 6: CATEGORÍAS POPULARES */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Categorías Top</h3>
                  <div className="space-y-2 flex-1 text-sm">
                    {Object.entries(estadisticas.eventosPorCategoria)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-white/70 truncate">{cat}</span>
                          <span className="font-semibold text-cyan-400">{count}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* CARD 7: USUARIOS ACTIVOS */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Estado Usuarios</h3>
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Activos</span>
                        <span className="font-semibold text-emerald-400">{estadisticas.usuariosActivos}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(estadisticas.usuariosActivos / estadisticas.totalUsuarios * 100) || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Inactivos</span>
                        <span className="font-semibold text-red-400">{estadisticas.totalUsuarios - estadisticas.usuariosActivos}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${((estadisticas.totalUsuarios - estadisticas.usuariosActivos) / estadisticas.totalUsuarios * 100) || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 8: HEALTH CHECK */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Sistema</h3>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-white/70">Firebase Activo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-white/70">Sincronización OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-white/70">Conexión Estable</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* VISTA DIRECTORIO */
              <motion.div key="directorio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="liquid-glass rounded-3xl p-8 flex flex-col">
                <h2 className="font-heading italic text-4xl mb-6">Directorio de Comunidades</h2>
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="liquid-glass border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <LiquidAvatar colorClass="text-purple-400" size="w-12 h-12" border="border" />
                        <div>
                          <div className="font-medium">Comunidad Tech {item}</div>
                          <div className="text-sm text-white/50">{120 * item} Miembros activos</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">Ver Perfil</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === BOTTOM DOCK === */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 liquid-glass-strong rounded-full px-2 py-2 flex items-center gap-2 md:gap-4 z-50 scale-90 md:scale-100 origin-bottom">
          <div className="flex items-center pl-2">
            <div className="flex space-x-2">
              <LiquidAvatar colorClass="text-slate-400" size="w-10 h-10" />
              <LiquidAvatar colorClass="text-pink-400" size="w-10 h-10" />
              <LiquidAvatar colorClass="text-emerald-400" size="w-10 h-10" />
            </div>
            <div className="w-10 h-10 rounded-full liquid-glass border-2 border-white/10 flex items-center justify-center text-xs font-medium ml-2 shadow-sm">+{Math.max(0, usuarios.length - 3)}</div>
          </div>
          <div className="w-px h-8 bg-white/20 mx-2"></div>
          <div className="flex gap-2 pr-2">
            <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
            <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          </div>
        </motion.div>

        {/* ========= MODALES ========= */}
        <AnimatePresence>

          {/* MODAL: LISTA DE EVENTOS */}
          {activeModal === 'eventsList' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
              <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal(null)}></div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-heading italic text-white">Catálogo de Eventos</h3>
                    <p className="text-xs text-white/50">Firestore - {estadisticas.totalEventos} eventos</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingEvent(null); setFormDataEvento({ titulo: '', organizador: '', categoria: 'inteligencia artificial', fecha: '', horaInicio: '', horaFin: '', isOnline: 'false', ubicacion: '', imagenUrl: '', descripcion: '', tags: [] }); setActiveModal('newEvent'); }} className="px-4 py-2 bg-white text-black font-bold text-sm rounded-xl transition-colors hover:bg-white/90">+ Añadir Evento</button>
                    <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">✕</button>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 shrink-0 flex-wrap">
                  <input type="text" placeholder="Filtrar por título..." value={filtroTextoEventos} onChange={e => setFiltroTextoEventos(e.target.value)} className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none placeholder-white/40" />
                  <select value={filtroModalidad} onChange={e => setFiltroModalidad(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="todas">Todas</option>
                    <option className="bg-slate-900" value="online">Online</option>
                    <option className="bg-slate-900" value="presencial">Presencial</option>
                  </select>
                  <select value={filtroCategoriaEventos} onChange={e => setFiltroCategoriaEventos(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="todas">Todas las Categorías</option>
                    <option className="bg-slate-900" value="inteligencia">IA</option>
                    <option className="bg-slate-900" value="conferencia">Conferencia</option>
                    <option className="bg-slate-900" value="web">Web</option>
                    <option className="bg-slate-900" value="mobile">Mobile</option>
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-2">
                  {isLoadingEventos ? <div className="text-center py-10 text-white/50">Cargando eventos...</div> : 
                    eventosFiltrados.length === 0 ? <div className="text-center py-10 text-white/50">No hay eventos que coincidan.</div> :
                    eventosFiltrados.map((ev) => (
                      <div key={ev.id} className="flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl group transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          {ev.imagenUrl && <img src={ev.imagenUrl} className="w-14 h-14 rounded-lg object-cover border border-white/10" />}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{ev.titulo}</div>
                            <div className="text-xs text-white/50">{ev.categoria} • {ev.fecha} • {ev.isOnline ? '🌐 Online' : '📍 Presencial'}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingEvent(ev); setActiveModal('editEvent'); }} className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium">Editar</button>
                          <button onClick={() => handleBorrarEvento(ev.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium">Eliminar</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* MODAL: CREAR/EDITAR EVENTO */}
          {(activeModal === 'newEvent' || activeModal === 'editEvent') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <div className="absolute inset-0 cursor-pointer" onClick={() => { setActiveModal('eventsList'); setEditingEvent(null); }}></div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-heading italic text-white">{editingEvent ? 'Editar Evento' : 'Desplegar Nuevo Evento'}</h3>
                  <button onClick={() => { setActiveModal('eventsList'); setEditingEvent(null); }} className="text-xs text-white/50 hover:text-white">← Volver</button>
                </div>
                <form className="flex flex-col gap-4" onSubmit={editingEvent ? handleActualizarEvento : handleCrearEvento}>
                  <input required type="text" value={editingEvent ? editingEvent.titulo : formDataEvento.titulo} onChange={e => editingEvent ? setEditingEvent({...editingEvent, titulo: e.target.value}) : setFormDataEvento({...formDataEvento, titulo: e.target.value})} placeholder="Título del Evento" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" value={editingEvent ? editingEvent.organizador : formDataEvento.organizador} onChange={e => editingEvent ? setEditingEvent({...editingEvent, organizador: e.target.value}) : setFormDataEvento({...formDataEvento, organizador: e.target.value})} placeholder="Organizador" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                    <input required type="text" value={editingEvent ? editingEvent.fecha : formDataEvento.fecha} onChange={e => editingEvent ? setEditingEvent({...editingEvent, fecha: e.target.value}) : setFormDataEvento({...formDataEvento, fecha: e.target.value})} placeholder="Fecha (ej. 27 jun 2026)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={editingEvent ? editingEvent.horaInicio : formDataEvento.horaInicio} onChange={e => editingEvent ? setEditingEvent({...editingEvent, horaInicio: e.target.value}) : setFormDataEvento({...formDataEvento, horaInicio: e.target.value})} placeholder="Hora inicio" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                    <input type="text" value={editingEvent ? editingEvent.horaFin : formDataEvento.horaFin} onChange={e => editingEvent ? setEditingEvent({...editingEvent, horaFin: e.target.value}) : setFormDataEvento({...formDataEvento, horaFin: e.target.value})} placeholder="Hora fin" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={editingEvent ? (editingEvent.isOnline ? 'true' : 'false') : formDataEvento.isOnline} onChange={e => editingEvent ? setEditingEvent({...editingEvent, isOnline: e.target.value}) : setFormDataEvento({...formDataEvento, isOnline: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                      <option className="bg-slate-900" value="false">Presencial</option>
                      <option className="bg-slate-900" value="true">Virtual</option>
                    </select>
                    <select value={editingEvent ? editingEvent.categoria : formDataEvento.categoria} onChange={e => editingEvent ? setEditingEvent({...editingEvent, categoria: e.target.value}) : setFormDataEvento({...formDataEvento, categoria: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                      <option className="bg-slate-900" value="inteligencia artificial">IA</option>
                      <option className="bg-slate-900" value="web">Web</option>
                      <option className="bg-slate-900" value="mobile">Mobile</option>
                      <option className="bg-slate-900" value="conferencia">Conferencia</option>
                      <option className="bg-slate-900" value="hackathon">Hackathon</option>
                    </select>
                  </div>
                  <input required type="text" value={editingEvent ? editingEvent.ubicacion : formDataEvento.ubicacion} onChange={e => editingEvent ? setEditingEvent({...editingEvent, ubicacion: e.target.value}) : setFormDataEvento({...formDataEvento, ubicacion: e.target.value})} placeholder="Ubicación o URL de Meet" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  <input type="text" value={editingEvent ? editingEvent.imagenUrl : formDataEvento.imagenUrl} onChange={e => editingEvent ? setEditingEvent({...editingEvent, imagenUrl: e.target.value}) : setFormDataEvento({...formDataEvento, imagenUrl: e.target.value})} placeholder="URL de la imagen (Cover)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  <textarea rows="3" value={editingEvent ? editingEvent.descripcion : formDataEvento.descripcion} onChange={e => editingEvent ? setEditingEvent({...editingEvent, descripcion: e.target.value}) : setFormDataEvento({...formDataEvento, descripcion: e.target.value})} placeholder="Descripción general..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40 resize-none"></textarea>
                  <button type="submit" className="w-full bg-white text-black font-bold rounded-xl py-3 hover:bg-white/90 transition-colors mt-2">{editingEvent ? 'Guardar Cambios' : 'Guardar en Firebase'} →</button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* MODAL: LISTA DE USUARIOS */}
          {activeModal === 'usersList' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
              <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal(null)}></div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl h-[80vh] flex flex-col">
                
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-heading italic text-white">Directorio de Accesos</h3>
                    <p className="text-xs text-white/50">Firestore - {estadisticas.totalUsuarios} usuarios</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setFormDataUsuario({ email: '', rol: 'ASISTENTE', estado: 'Activo' }); setActiveModal('newUser'); }} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm rounded-xl transition-colors">+ Añadir Usuario</button>
                    <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">✕</button>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 shrink-0 flex-wrap">
                  <input type="text" placeholder="Buscar por correo..." value={filtroTextoUsuarios} onChange={e => setFiltroTextoUsuarios(e.target.value)} className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none placeholder-white/40" />
                  <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="todos">Todos los Roles</option>
                    <option className="bg-slate-900" value="ADMINISTRADOR">Administradores</option>
                    <option className="bg-slate-900" value="ORGANIZADOR">Organizadores</option>
                    <option className="bg-slate-900" value="ASISTENTE">Asistentes</option>
                  </select>
                  <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="todos">Todos los Estados</option>
                    <option className="bg-slate-900" value="Activo">Activos</option>
                    <option className="bg-slate-900" value="Inactivo">Inactivos</option>
                  </select>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex-1 flex flex-col">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-semibold text-white/50 uppercase">
                    <div className="col-span-5">Identidad</div>
                    <div className="col-span-3">Privilegios</div>
                    <div className="col-span-4 text-right">Acciones</div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {isLoadingUsuarios ? <div className="text-center py-10 text-white/50">Cargando usuarios...</div> :
                      usuariosFiltrados.length === 0 ? <div className="text-center py-10 text-white/50">No hay usuarios que coincidan.</div> :
                      usuariosFiltrados.map((u) => (
                        <div key={u.id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors group">
                          <div className="col-span-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 text-xs">{u.email[0].toUpperCase()}</div>
                            <span className="text-sm font-medium truncate">{u.email}</span>
                          </div>
                          <div className="col-span-3"><span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/70 border border-white/20">{u.rol}</span></div>
                          <div className="col-span-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingUser(u); setActiveModal('editUser'); }} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white">Editar</button>
                            <button onClick={() => handleBorrarUsuario(u.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium">Banear</button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* MODAL: CREAR USUARIO */}
          {activeModal === 'newUser' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal('usersList')}></div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heading italic text-white">Añadir Cuenta</h3>
                  <button onClick={() => setActiveModal('usersList')} className="text-xs text-white/50 hover:text-white">Cancelar</button>
                </div>
                <form className="flex flex-col gap-4" onSubmit={handleCrearUsuario}>
                  <input required type="email" value={formDataUsuario.email} onChange={e => setFormDataUsuario({...formDataUsuario, email: e.target.value})} placeholder="correo@ejemplo.com" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  <select value={formDataUsuario.rol} onChange={e => setFormDataUsuario({...formDataUsuario, rol: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option className="bg-slate-900" value="ORGANIZADOR">ORGANIZADOR</option>
                    <option className="bg-slate-900" value="ASISTENTE">ASISTENTE</option>
                  </select>
                  <select value={formDataUsuario.estado} onChange={e => setFormDataUsuario({...formDataUsuario, estado: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="Activo">Activo</option>
                    <option className="bg-slate-900" value="Inactivo">Inactivo</option>
                  </select>
                  <button type="submit" className="w-full bg-blue-500 text-white font-bold rounded-xl py-3 hover:bg-blue-400 mt-2 transition-colors">Registrar Perfil</button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* MODAL: EDITAR USUARIO */}
          {activeModal === 'editUser' && editingUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal('usersList')}></div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heading italic text-white">Modificar Usuario</h3>
                  <button onClick={() => setActiveModal('usersList')} className="text-xs text-white/50 hover:text-white">Cancelar</button>
                </div>
                <form className="flex flex-col gap-4" onSubmit={handleActualizarUsuario}>
                  <input disabled type="email" value={editingUser.email} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 focus:outline-none cursor-not-allowed" />
                  <select value={editingUser.rol} onChange={e => setEditingUser({...editingUser, rol: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option className="bg-slate-900" value="ORGANIZADOR">ORGANIZADOR</option>
                    <option className="bg-slate-900" value="ASISTENTE">ASISTENTE</option>
                  </select>
                  <select value={editingUser.estado} onChange={e => setEditingUser({...editingUser, estado: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                    <option className="bg-slate-900" value="Activo">Activo</option>
                    <option className="bg-slate-900" value="Inactivo">Inactivo</option>
                  </select>
                  <button type="submit" className="w-full bg-white text-black font-bold rounded-xl py-3 hover:bg-white/90 mt-2 transition-colors">Guardar Cambios</button>
                </form>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};

export default DashboardPage;
