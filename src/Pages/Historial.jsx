import { useEffect, useState } from "react";
import Navbar from "../Componentes/Navbar";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { firestore } from "../lib/firebase";
import { Calendar, Clock, Heart, Droplet, Activity, AlertCircle, CheckCircle2, Search, X } from "lucide-react";

export default function Historial() {
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState(""); // Estado para la fecha (YYYY-MM-DD)

  useEffect(() => {
    const cargarMediciones = async () => {
      setLoading(true);
      try {
        const medRef = collection(firestore, "mediciones");
        let q;

        if (fechaFiltro) {
          // --- LÓGICA DE FILTRADO POR FECHA ESPECÍFICA ---
          // Creamos el rango de tiempo para ese día (00:00:00 a 23:59:59)
          // Asumiendo que tu timestamp en Firebase es numérico (segundos Unix)
          
          const fechaInicio = new Date(fechaFiltro);
          // Ajustamos zona horaria local para evitar desfaces
          fechaInicio.setMinutes(fechaInicio.getMinutes() + fechaInicio.getTimezoneOffset());
          fechaInicio.setHours(0, 0, 0, 0);
          
          const fechaFin = new Date(fechaInicio);
          fechaFin.setHours(23, 59, 59, 999);

          // Convertimos a segundos (si tu DB usa milisegundos, quita el / 1000)
          const startTimestamp = Math.floor(fechaInicio.getTime() / 1000);
          const endTimestamp = Math.floor(fechaFin.getTime() / 1000);

          q = query(
            medRef,
            where("timestamp", ">=", startTimestamp),
            where("timestamp", "<=", endTimestamp),
            orderBy("timestamp", "desc")
          );
        } else {
          // --- LÓGICA POR DEFECTO (Últimos 50) ---
          q = query(
            medRef,
            orderBy("timestamp", "desc"),
            limit(50)
          );
        }

        const snapshot = await getDocs(q);
        const datos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMediciones(datos);
      } catch (error) {
        console.error("Error obteniendo historial:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMediciones();
  }, [fechaFiltro]); // Se ejecuta cada vez que cambia la fecha

  // Helpers de formato (Igual que antes)
  const getFecha = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getHora = (seconds) => {
    return new Date(seconds * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const isAlert = (m) => {
    if (m.bpm > 100 || m.bpm < 60) return true;
    if (m.spo2 < 90) return true;
    return false;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-28 font-sans">
      
      {/* Header Sticky con Buscador */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    Historial
                </h1>
                
                {/* Contador de resultados */}
                {!loading && (
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        {mediciones.length} resultados
                    </span>
                )}
            </div>

            {/* Barra de Búsqueda */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors duration-200 text-slate-600"
                />
                {/* Botón limpiar fecha */}
                {fechaFiltro && (
                    <button 
                        onClick={() => setFechaFiltro("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                        <div className="bg-slate-200 rounded-full p-0.5 hover:bg-slate-300 transition">
                             <X className="h-3 w-3 text-slate-500" />
                        </div>
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        
        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : mediciones.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center mt-20 opacity-60">
            <div className="bg-slate-100 p-4 rounded-full mb-3">
                <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No se encontraron datos</p>
            <p className="text-sm text-slate-400">Prueba con otra fecha</p>
            {fechaFiltro && (
                <button 
                    onClick={() => setFechaFiltro("")}
                    className="mt-4 text-rose-500 text-sm font-semibold hover:underline"
                >
                    Ver todo el historial
                </button>
            )}
          </div>
        ) : (
          /* Lista de Mediciones */
          <div className="space-y-4 relative">
             <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 -z-10"></div>

            {mediciones.map((m) => {
              const alerta = isAlert(m);
              return (
                <div
                  key={m.id}
                  className={`relative bg-white rounded-2xl p-4 shadow-sm border transition-all duration-200
                    ${alerta ? 'border-l-4 border-l-rose-500' : 'border-slate-100 border-l-4 border-l-emerald-400'}
                  `}
                >
                  {/* Encabezado */}
                  <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${alerta ? 'bg-rose-500' : 'bg-emerald-400'}`}></div>
                        <span className="text-sm font-bold text-slate-600 capitalize">
                            {getFecha(m.timestamp)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Clock size={12} />
                        {getHora(m.timestamp)}
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                            <Heart size={10} /> Ritmo
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-black ${alerta && (m.bpm > 100 || m.bpm < 60) ? 'text-rose-600' : 'text-slate-800'}`}>
                                {m.bpm}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">BPM</span>
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-slate-100 pl-4">
                         <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                            <Droplet size={10} /> Oxígeno
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-black ${m.spo2 < 90 ? 'text-amber-500' : 'text-slate-800'}`}>
                                {m.spo2}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">%</span>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full">
        <Navbar />
      </div>
    </div>
  );
}