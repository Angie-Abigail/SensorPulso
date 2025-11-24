import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { Activity, Heart, Droplet, User } from "lucide-react";

import GraficaMediciones from "../Componentes/GraficaMediciones";

export default function Dashboard() {
  // Estados para mostrar el ÚLTIMO RESULTADO FINAL
  const [bpmFinal, setBpmFinal] = useState(0);
  const [spo2Final, setSpo2Final] = useState(0);
  const [estadoBPM, setEstadoBPM] = useState("Cargando...");
  const [estadoSpO2, setEstadoSpO2] = useState("Cargando...");

  useEffect(() => {
    const finalRef = ref(db, "resultadoFinal");

    // Escuchar el resultado final
    const unsubscribeFinal = onValue(finalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 🎯 CAMBIO 1: Aplicar toFixed(2) al actualizar los estados
        setBpmFinal(parseFloat(data.bpmFinal || 0).toFixed(2));
        setSpo2Final(parseFloat(data.spo2Final || 0).toFixed(2));

        // NOTA: La función getStatusColor necesita un número para evaluar > o <. 
        // Por lo tanto, usamos el valor original (data.bpmFinal) o un valor numérico 
        // para el estado, no el string formateado. Aquí usaremos el valor sin formatear
        // o convertiremos el estado BPM/SpO2 a Number antes de pasarlo a getStatusColor
        setEstadoBPM(data.estadoBPMFinal || "Normal");
        setEstadoSpO2(data.estadoSpO2Final || "Normal");

      }
    });

    // Limpieza de listeners
    return () => {
      unsubscribeFinal();
    };
  }, []);

  // Función auxiliar para determinar el color del estado
  const getStatusColor = (val, type) => {
    // 💡 Aseguramos que 'val' sea tratado como número para las comparaciones
    const numVal = parseFloat(val);

    if (type === 'bpm') {
      if (numVal > 100 || numVal < 60) return "text-rose-600 bg-rose-100";
      return "text-emerald-600 bg-emerald-100";
    }
    if (type === 'spo2') {
      if (numVal < 95) return "text-amber-600 bg-amber-100";
      return "text-blue-600 bg-blue-100";
    }
    return "text-gray-500 bg-gray-100";
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">

      <header className="bg-white px-6 pt-8 pb-6 rounded-b-3xl shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm font-medium">Bienvenido de nuevo,</p>
            <h2 className="text-2xl font-bold text-slate-800">Paciente</h2>
          </div>
          <div className="h-12 w-12 rounded-full ring-2 ring-offset-2 ring-rose-500 overflow-hidden">
            <img
              src="https://static.vecteezy.com/system/resources/previews/014/351/455/non_2x/heart-rate-icon-cartoon-beat-pulse-vector.jpg"
              alt="Perfil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <div className="px-5 space-y-6">

        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-700">Signos Vitales</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Card BPM */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Heart className="w-16 h-16 text-rose-500" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                <Heart size={18} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pulso</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">
                {bpmFinal} <span className="text-lg text-slate-400 font-normal">bpm</span> {/* 🎯 Cambio 2: bpmFinal ya es un string con 2 decimales */}
              </h2>
              <span className={`inline-block mt-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(bpmFinal, 'bpm')}`}>
                {estadoBPM}
              </span>
            </div>
          </div>

          {/* Card SpO2 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Droplet className="w-16 h-16 text-blue-500" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <Droplet size={18} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SpO2</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">
                {spo2Final}<span className="text-lg text-slate-400 font-normal">%</span> {/* 🎯 Cambio 2: spo2Final ya es un string con 2 decimales */}
              </h2>
              <span className={`inline-block mt-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(spo2Final, 'spo2')}`}>
                {estadoSpO2}
              </span>
            </div>
          </div>
        </div>


        {/* GRÁFICO DE HISTORIAL DE MEDICIONES (SE MANTIENE) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-700 font-bold text-lg">Historial de Mediciones Guardadas</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Fuente: Historial</span>
          </div>

          <GraficaMediciones />
        </div>

      </div>

      {/* Navbar flotante (SE MANTIENE) */}
      <div className="fixed bottom-0 w-full">
        <Navbar />
      </div>
    </div>
  );
}