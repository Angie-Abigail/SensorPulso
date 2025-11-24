import { NavLink } from "react-router-dom";
import { LayoutGrid, Activity, CalendarClock, User } from "lucide-react";

export default function Navbar() {
  
  // Clase base para todos los botones
  const linkClass = "flex flex-col items-center justify-center w-full h-full gap-1 py-2 transition-all duration-300 relative group";

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe pt-2 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-2 pb-4">

        {/* INICIO */}
        <NavLink to="/" className={({ isActive }) => 
            `${linkClass} ${isActive ? "text-rose-500" : "text-slate-400 hover:text-slate-600"}`
        }>
            {({ isActive }) => (
                <>
                    {/* Indicador superior animado */}
                    <span className={`absolute -top-2 w-8 h-1 rounded-b-full bg-rose-500 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
                    
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-rose-50' : 'bg-transparent'}`}>
                        <LayoutGrid size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">Inicio</span>
                </>
            )}
        </NavLink>

        {/* PULSO (LIVE) */}
        <NavLink to="/live" className={({ isActive }) => 
            `${linkClass} ${isActive ? "text-rose-500" : "text-slate-400 hover:text-slate-600"}`
        }>
             {({ isActive }) => (
                <>
                    <span className={`absolute -top-2 w-8 h-1 rounded-b-full bg-rose-500 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-rose-50' : 'bg-transparent'}`}>
                        <Activity size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">Pulso</span>
                </>
            )}
        </NavLink>

        {/* HISTORIAL */}
        <NavLink to="/historial" className={({ isActive }) => 
            `${linkClass} ${isActive ? "text-rose-500" : "text-slate-400 hover:text-slate-600"}`
        }>
             {({ isActive }) => (
                <>
                    <span className={`absolute -top-2 w-8 h-1 rounded-b-full bg-rose-500 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-rose-50' : 'bg-transparent'}`}>
                        <CalendarClock size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">Historial</span>
                </>
            )}
        </NavLink>

        {/* PERFIL */}
        <NavLink to="/perfil" className={({ isActive }) => 
            `${linkClass} ${isActive ? "text-rose-500" : "text-slate-400 hover:text-slate-600"}`
        }>
             {({ isActive }) => (
                <>
                    <span className={`absolute -top-2 w-8 h-1 rounded-b-full bg-rose-500 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-rose-50' : 'bg-transparent'}`}>
                        <User size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">Perfil</span>
                </>
            )}
        </NavLink>

      </div>
    </nav>
  );
}