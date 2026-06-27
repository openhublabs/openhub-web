import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadingVideo from '../components/ui/FadingVideo';
import BlurText from '../components/ui/BlurText';
import Navbar from '../components/layout/Navbar';
import { ArrowUpRight, Play, SceneryIcon, MovieIcon, LightbulbIcon } from '../components/icons';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black min-h-screen text-white font-body selection:bg-white/30">
      {/* Section 1 - Hero */}
      <section className="relative w-full h-screen overflow-hidden flex flex-col justify-between">
        <FadingVideo 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: "120%", height: "120%" }}
        />
        
        <div className="z-10 flex flex-col h-full relative">
          <Navbar />

          {/* Hero content */}
          <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center">
            <motion.div 
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="liquid-glass rounded-full flex items-center p-1 mb-8"
            >
              <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full">Nuevo</span>
              <span className="text-sm text-white/90 pr-4 pl-3 font-medium">Acceso a la comunidad de desarrolladores global</span>
            </motion.div>

            <BlurText 
              text="Eventos de Tecnología en un Solo Lugar" 
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl justify-center tracking-[-2px] md:tracking-[-4px]"
            />

            <motion.p
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight mx-auto px-4 md:px-0"
            >
              Filtra y regístrate en conferencias, hackathons y talleres. Olvídate del ruido digital y nunca vuelvas a perder una oportunidad de networking o aprendizaje colaborativo.
            </motion.p>

            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-6"
            >
              <button 
                onClick={() => navigate('/login')}
                className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 hover:scale-105 transition-transform w-full sm:w-auto justify-center"
              >
                Entrar al Sistema <ArrowUpRight className="h-5 w-5" />
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors w-full sm:w-auto justify-center py-2 sm:py-0">
                Ver Demo <Play className="h-4 w-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-stretch gap-4 mt-8 w-full max-w-sm sm:max-w-none sm:w-auto justify-center"
            >
              <div className="liquid-glass p-5 w-full sm:w-[220px] rounded-[1.25rem] flex flex-col text-left">
                <svg className="h-7 w-7 text-white mb-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <div className="mt-8">
                  <div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">+500</div>
                  <div className="text-xs text-white font-body font-light mt-2">Eventos Mensuales</div>
                </div>
              </div>
              <div className="liquid-glass p-5 w-full sm:w-[220px] rounded-[1.25rem] flex flex-col text-left">
                <svg className="h-7 w-7 text-white mb-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <div className="mt-8">
                  <div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">+10k</div>
                  <div className="text-xs text-white font-body font-light mt-2">Usuarios Activos</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Partners */}
          <motion.div
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 pb-8 px-4"
          >
            <div className="liquid-glass rounded-full px-3.5 py-1 text-[10px] md:text-xs font-medium text-white text-center">
              Comunidades e institutos que confían en Openhub
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-16 font-heading italic text-white text-xl sm:text-2xl md:text-3xl tracking-tight">
              <span>GDG</span>
              <span className="text-white/50 text-xl hidden sm:inline">&middot;</span>
              <span>TechMeet</span>
              <span className="text-white/50 text-xl hidden sm:inline">&middot;</span>
              <span>Hackers</span>
              <span className="text-white/50 text-xl hidden sm:inline">&middot;</span>
              <span>Devs</span>
              <span className="text-white/50 text-xl hidden sm:inline">&middot;</span>
              <span>Innova</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2 - Capabilities */}
      <section className="relative w-full min-h-screen overflow-hidden flex flex-col">
        <FadingVideo 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        <div className="relative z-10 px-6 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
          <div className="mb-auto">
            <div className="text-sm font-body text-white/80 mb-6">// La Solución</div>
            <h2 className="font-heading italic text-white text-5xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] md:tracking-[-3px]">
              Conexión<br/>sin ruido
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="liquid-glass rounded-[1.25rem] p-6 md:p-8 min-h-[400px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 liquid-glass rounded-[0.75rem] flex items-center justify-center shrink-0">
                  <SceneryIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-4xl md:text-5xl tracking-tight leading-none">Encuentra lo que buscas</h3>
                <p className="mt-4 text-base text-white/80 font-body font-light leading-relaxed">
                  Actuamos como un directorio interactivo. Filtra por categoría, fecha o ubicación, y regístrate de forma totalmente gratuita.
                </p>
              </div>
            </div>

            <div className="liquid-glass rounded-[1.25rem] p-6 md:p-8 min-h-[400px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 liquid-glass rounded-[0.75rem] flex items-center justify-center shrink-0">
                  <MovieIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-4xl md:text-5xl tracking-tight leading-none">Impulsa tus eventos</h3>
                <p className="mt-4 text-base text-white/80 font-body font-light leading-relaxed">
                  Soluciones para organizadores: destaca tus eventos en la red, obtén métricas detalladas y envía notificaciones push segmentadas.
                </p>
              </div>
            </div>

            <div className="liquid-glass rounded-[1.25rem] p-6 md:p-8 min-h-[400px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 liquid-glass rounded-[0.75rem] flex items-center justify-center shrink-0">
                  <LightbulbIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-4xl md:text-5xl tracking-tight leading-none">Nativo Móvil</h3>
                <p className="mt-4 text-base text-white/80 font-body font-light leading-relaxed">
                  Desarrollada en Kotlin con arquitectura limpia y encriptación robusta en tránsito, cumpliendo normativas de protección de datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;