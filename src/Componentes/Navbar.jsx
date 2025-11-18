import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-xl py-3 flex justify-around z-50">

      <NavLink to="/" className="flex flex-col items-center text-gray-500 hover:text-red-500">
        <span className="text-xl">🏠</span>
        <p className="text-xs">Inicio</p>
      </NavLink>

      <NavLink to="/live" className="flex flex-col items-center text-gray-500 hover:text-red-500">
        <span className="text-xl">❤️</span>
        <p className="text-xs">Pulso</p>
      </NavLink>

      <NavLink to="/historial" className="flex flex-col items-center text-gray-500 hover:text-red-500">
        <span className="text-xl">📊</span>
        <p className="text-xs">Historial</p>
      </NavLink>

      {/* NUEVA SECCIÓN */}
      <NavLink to="/perfil" className="flex flex-col items-center text-gray-500 hover:text-red-500">
        <span className="text-xl">👤</span>
        <p className="text-xs">Perfil</p>
      </NavLink>

    </nav>
  );
}
