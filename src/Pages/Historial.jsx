import Navbar from "../Componentes/Navbar";

export default function Historial() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-6 pt-10">

      <h1 className="text-2xl font-bold text-gray-800 mb-5 text-center">
        Historial de mediciones
      </h1>

      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-gray-700 font-semibold mb-3">Gráfica</h3>
        <div className="h-40 flex items-center justify-center text-gray-400">
          (Aquí irá la gráfica con Recharts)
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="bg-white p-4 rounded-xl shadow flex justify-between">
          <span className="font-semibold text-gray-700">72 BPM</span>
          <span className="text-sm text-gray-500">Hoy, 10:24 AM</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex justify-between">
          <span className="font-semibold text-gray-700">80 BPM</span>
          <span className="text-sm text-gray-500">Ayer</span>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
