import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from '../icons';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-4 left-0 right-0 px-8 lg:px-16 z-50 flex items-center justify-between">
      <div className="h-12 px-5 liquid-glass rounded-full flex items-center justify-center font-heading italic text-3xl text-white tracking-tight">OpenHub</div>
      
      <div className="hidden lg:flex liquid-glass rounded-full px-1.5 py-1.5 items-center">
        <a href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors rounded-full">Inicio</a>
        
        {/* Cambiado de "Admin" a "Login" para cumplir con el estándar UX */}
        <button 
          onClick={() => navigate('/Login')} 
          className="px-4 py-2 text-sm font-medium text-white/80 font-body hover:text-white transition-colors rounded-full text-left"
        >
          Unete
        </button>

        <button className="bg-white text-black px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 ml-2 whitespace-nowrap hover:bg-white/90 transition-colors">
          Descargar App <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="w-12 h-12 invisible"></div>
    </nav>
  );
};

export default Navbar;