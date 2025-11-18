import Navbar from "../Componentes/Navbar";

export default function Dashboard() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-5 pt-8">

      {/* Perfil redondo con gráfico estilo Google Fit */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-red-400">
            <img
              src="https://www.shutterstock.com/image-vector/cardiologist-checking-heart-health-cardiology-260nw-2121610613.jpg"
              alt="user"
              className="w-full h-full object-cover"
            />
          </div>

          {/* círculo decorativo */}
          <div className="absolute inset-0 rounded-full border-8 border-red-300 opacity-50"></div>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-gray-800">Bienvenida, Abigail 👋</h2>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 mt-10">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm">Pulso actual</p>
          <h2 className="text-3xl font-bold text-red-500">74</h2>
          <p className="text-xs text-gray-400">BPM</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm">Oxigenación</p>
          <h2 className="text-3xl font-bold text-blue-500">97%</h2>
          <p className="text-xs text-gray-400">SpO₂</p>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white p-5 mt-8 shadow rounded-xl">
        <h3 className="text-gray-700 font-semibold mb-3">Puntos cardiacos</h3>
        <div className="h-36 flex items-center justify-center text-gray-400">
          <p>(Aquí va la gráfica de Recharts)</p>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
