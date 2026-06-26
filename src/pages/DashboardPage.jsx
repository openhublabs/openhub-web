/* eslint-disable */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Users, Calendar, Activity, ChevronDown, Check, Home } from 'lucide-react';
import FadingVideo from '../components/ui/FadingVideo';
import { obtenerEventos, crearEvento, borrarEvento, actualizarEvento } from '../services/EventosService';
import { obtenerUsuarios, crearUsuario, borrarUsuario, actualizarUsuario } from '../services/usuariosService';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';



const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative min-w-[160px] flex-1">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white flex items-center justify-between hover:bg-white/10 transition-colors h-10"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-black/80 backdrop-blur-3xl border border-white/20 rounded-xl overflow-hidden shadow-2xl z-50 p-1"
            >
              {options.map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center justify-between transition-colors ${value === opt.value ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // === ESTADOS PARA MODALES ===
  const [activeModal, setActiveModal] = useState(null);

  // === ESTADOS PARA EVENTOS ===
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

  // === ESTADOS PARA USUARIOS ===
  const [usuarios, setUsuarios] = useState([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true);
  const [filtroTextoUsuarios, setFiltroTextoUsuarios] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [editingUser, setEditingUser] = useState(null);

  const [formDataUsuario, setFormDataUsuario] = useState({
    email: '',
    rol: 'MIEMBRO',
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
  // LÓGICA DE CERRAR SESIÓN
  // ==========================================
  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión: " + error.message);
    }
  };

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
  // CALCULAR ESTADÍSTICAS (ADAPTADO A AUTH)
  // ==========================================
  // ESC global listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const calcularEstadisticas = () => {
    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    const adminCount = usuarios.filter(u => u.rol === 'ADMINISTRADOR').length;
    const organizadorCount = usuarios.filter(u => u.rol === 'ORGANIZADOR').length;
    const asistenteCount = usuarios.filter(u => u.rol === 'ASISTENTE').length;
    const usuariosActivos = usuarios.filter(u => u.estado === 'Activo').length;

    const eventosOnline = eventos.filter(e => e.isOnline === true).length;
    const eventosPresenciales = eventos.filter(e => e.isOnline === false).length;

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
        if (!u.createdAt) return true;
        const fechaUser = new Date(u.createdAt);
        return fechaUser > hace7Dias;
      }).length,
      eventosUltimosDias: eventos.filter(e => {
        if (!e.updatedAt) return true;
        const createdAt = e.updatedAt?.toDate?.() || new Date();
        return createdAt > hace7Dias;
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
        titulo: '', organizador: '', categoria: 'inteligencia artificial', fecha: '',
        horaInicio: '', horaFin: '', isOnline: 'false', ubicacion: '', imagenUrl: '',
        descripcion: '', tags: []
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
      setFormDataUsuario({ email: '', rol: 'MIEMBRO', estado: 'Activo' });
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

  // === FILTRADOS ===
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

  // === COMPONENTES INTERNOS ===
  const LiquidAvatar = ({ size = "w-8 h-8", border = "border-2", colorClass = "text-white" }) => (
    <div className={`${size} rounded-full liquid-glass ${border} border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] relative overflow-hidden flex items-center justify-center`}>
      <svg className={`w-[120%] h-[120%] ${colorClass} relative z-10 translate-y-[10%]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
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
              <Home className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
            <button onClick={handleCerrarSesion} className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 hover:text-white/90 transition-colors cursor-pointer text-white/90">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium pr-1">Cerrar Sesión</span>
            </button>
          </div>

          <div className="liquid-glass rounded-full px-5 py-2 flex items-center gap-4 hidden md:flex">
            <span className="text-sm font-medium">Panel de Administración</span>
            
          </div>

          <div className="flex items-center gap-3 relative z-50">
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/20 transition-colors">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.header>

        {/* === BUSCADOR === */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-black/20 backdrop-blur-3xl">
              <motion.div exit={{ opacity: 0 }} className="absolute inset-0 cursor-pointer" onClick={() => setIsSearchOpen(false)}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-[calc(100%-2rem)] md:w-full max-w-2xl bg-white/10 liquid-glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative z-10 flex flex-col">
                <div className="flex items-center px-4 py-4 border-b border-white/10">
                  <Search className="w-6 h-6 text-white/50 mr-3" />
                  <input type="text" autoFocus placeholder="Buscar eventos..." className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-white/30 font-body" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if(e.key === 'Escape') setIsSearchOpen(false); }} />
                  <div className="hidden sm:block px-3 py-1 liquid-glass rounded-[0.4rem] text-[10px] text-white/70 font-heading tracking-widest border border-white/20 shadow-sm">ESC</div>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
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
                      <Users className="w-5 h-5 text-white/80" />
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
                      <Calendar className="w-5 h-5 text-white/80" />
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
                      <span className="font-semibold text-white/90">{estadisticas.adminCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Organizador</span>
                      <span className="font-semibold text-white/90">{estadisticas.organizadorCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Asistente</span>
                      <span className="font-semibold text-white/90">{estadisticas.asistenteCount}</span>
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
                        <span className="font-semibold text-white/90">{estadisticas.eventosOnline}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80" style={{ width: `${(estadisticas.eventosOnline / estadisticas.totalEventos * 100) || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Presencial</span>
                        <span className="font-semibold text-white/90">{estadisticas.eventosPresenciales}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80" style={{ width: `${(estadisticas.eventosPresenciales / estadisticas.totalEventos * 100) || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 5: ACTIVIDAD ÚLTIMOS 7 DÍAS */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Actividad (7 días)</h3>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-white" />
                      <div>
                        <div className="text-xs text-white/70">Usuarios nuevos</div>
                        <div className="text-lg font-semibold text-white">{estadisticas.usuariosUltimosDias}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-white" />
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
                          <span className="font-semibold text-white/90">{count}</span>
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
                        <span className="font-semibold text-white/90">{estadisticas.usuariosActivos}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80" style={{ width: `${(estadisticas.usuariosActivos / estadisticas.totalUsuarios * 100) || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Inactivos</span>
                        <span className="font-semibold text-white/90">{estadisticas.totalUsuarios - estadisticas.usuariosActivos}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80" style={{ width: `${((estadisticas.totalUsuarios - estadisticas.usuariosActivos) / estadisticas.totalUsuarios * 100) || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 8: HEALTH CHECK */}
                <div className="liquid-glass rounded-[1.75rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
                  <h3 className="text-xl font-heading italic text-white mb-4">Sistema</h3>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
                      <span className="text-xs text-white/70">Firebase Activo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
                      <span className="text-xs text-white/70">Sincronización OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
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
                        <LiquidAvatar colorClass="text-white/90" size="w-12 h-12" border="border" />
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

        {/* ========= MODALES ========= */}
        <AnimatePresence>

          {/* MODAL: LISTA DE EVENTOS */}
          {activeModal === 'eventsList' && (
            <motion.div key="eventsList" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
              <motion.div exit={{ opacity: 0 }} className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal(null)}></motion.div>
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
                  <CustomSelect value={filtroModalidad} onChange={setFiltroModalidad} options={[{value: 'todas', label: 'Todas'}, {value: 'online', label: 'Online'}, {value: 'presencial', label: 'Presencial'}]} />
                  <CustomSelect value={filtroCategoriaEventos} onChange={setFiltroCategoriaEventos} options={[{value: 'todas', label: 'Todas las Categorías'}, {value: 'inteligencia', label: 'IA'}, {value: 'conferencia', label: 'Conferencia'}, {value: 'web', label: 'Web'}, {value: 'mobile', label: 'Mobile'}, {value: 'hackathon', label: 'Hackathon'}]} />
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
                          <button onClick={() => { setEditingEvent(ev); setActiveModal('editEvent'); }} className="px-3 py-1.5 rounded-lg bg-white/80/20 hover:bg-white/80/30 text-blue-300 text-xs font-medium">Editar</button>
                          <button onClick={() => handleBorrarEvento(ev.id)} className="px-3 py-1.5 rounded-lg bg-white/80/10 hover:bg-white/20 text-white/90 text-xs font-medium">Eliminar</button>
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
            <motion.div key={activeModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div exit={{ opacity: 0 }} className="absolute inset-0 cursor-pointer" onClick={() => { setActiveModal('eventsList'); setEditingEvent(null); }}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heading italic text-white">{editingEvent ? 'Editar Evento' : 'Desplegar Nuevo Evento'}</h3>
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
                    <CustomSelect value={editingEvent ? (editingEvent.isOnline ? 'true' : 'false') : formDataEvento.isOnline} onChange={v => editingEvent ? setEditingEvent({...editingEvent, isOnline: v}) : setFormDataEvento({...formDataEvento, isOnline: v})} options={[{value: 'false', label: 'Presencial'}, {value: 'true', label: 'Virtual'}]} />
                    <CustomSelect value={editingEvent ? editingEvent.categoria : formDataEvento.categoria} onChange={v => editingEvent ? setEditingEvent({...editingEvent, categoria: v}) : setFormDataEvento({...formDataEvento, categoria: v})} options={[{value: 'inteligencia artificial', label: 'IA'}, {value: 'web', label: 'Web'}, {value: 'mobile', label: 'Mobile'}, {value: 'conferencia', label: 'Conferencia'}, {value: 'hackathon', label: 'Hackathon'}]} />
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
            <motion.div key="usersList" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
              <motion.div exit={{ opacity: 0 }} className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal(null)}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl h-[80vh] flex flex-col">
                
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-heading italic text-white">Directorio de Accesos</h3>
                    <p className="text-xs text-white/50">Firebase Authentication - {estadisticas.totalUsuarios} usuarios</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setFormDataUsuario({ email: '', rol: 'MIEMBRO', estado: 'Activo' }); setActiveModal('newUser'); }} className="px-4 py-2 bg-white/80 hover:bg-blue-400 text-white font-bold text-sm rounded-xl transition-colors">+ Añadir Usuario</button>
                    <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">✕</button>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 shrink-0 flex-wrap">
                  <input type="text" placeholder="Buscar por correo..." value={filtroTextoUsuarios} onChange={e => setFiltroTextoUsuarios(e.target.value)} className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none placeholder-white/40" />
                  <CustomSelect value={filtroRol} onChange={setFiltroRol} options={[{value: 'todos', label: 'Todos los Roles'}, {value: 'MIEMBRO', label: 'Miembro'}, {value: 'ORGANIZADOR', label: 'Organizador'}, {value: 'ADMINISTRADOR', label: 'Administrador'}, {value: 'ASISTENTE', label: 'Asistente'}]} />
                  <CustomSelect value={filtroEstado} onChange={setFiltroEstado} options={[{value: 'todos', label: 'Todos los Estados'}, {value: 'Activo', label: 'Activo'}, {value: 'Inactivo', label: 'Inactivo'}]} />
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
                            <div className="w-8 h-8 rounded-full bg-white/80/20 text-white/90 flex items-center justify-center font-bold border border-blue-500/30 text-xs">
                              {u.email ? u.email[0].toUpperCase() : 'U'}
                            </div>
                            <span className="text-sm font-medium truncate">{u.email}</span>
                          </div>
                          <div className="col-span-3">
                            <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/70 border border-white/20">
                              {u.rol === 'ASISTENTE' ? 'MIEMBRO' : u.rol}
                            </span>
                          </div>
                          <div className="col-span-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleBorrarUsuario(u.id)} className="px-3 py-1.5 rounded-lg bg-white/80/10 hover:bg-white/20 text-white/90 text-xs font-medium">Banear</button>
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
            <motion.div key="newUser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div exit={{ opacity: 0 }} className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal('usersList')}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md liquid-glass-strong border border-white/20 rounded-3xl p-8 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heading italic text-white">Añadir Cuenta</h3>
                  <button onClick={() => setActiveModal('usersList')} className="text-xs text-white/50 hover:text-white">Cancelar</button>
                </div>
                <form className="flex flex-col gap-4" onSubmit={handleCrearUsuario}>
                  <input required type="email" value={formDataUsuario.email} onChange={e => setFormDataUsuario({...formDataUsuario, email: e.target.value})} placeholder="correo@ejemplo.com" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/40" />
                  <CustomSelect value={formDataUsuario.rol} onChange={v => setFormDataUsuario({...formDataUsuario, rol: v})} options={[{value: 'MIEMBRO', label: 'Miembro'}, {value: 'ORGANIZADOR', label: 'Organizador'}, {value: 'ADMINISTRADOR', label: 'Administrador'}, {value: 'ASISTENTE', label: 'Asistente'}]} />
                  <CustomSelect value={formDataUsuario.estado} onChange={v => setFormDataUsuario({...formDataUsuario, estado: v})} options={[{value: 'Activo', label: 'Activo'}, {value: 'Inactivo', label: 'Inactivo'}]} />
                  <button type="submit" className="w-full bg-white/80 text-white font-bold rounded-xl py-3 hover:bg-blue-400 mt-2 transition-colors">Registrar Perfil</button>
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