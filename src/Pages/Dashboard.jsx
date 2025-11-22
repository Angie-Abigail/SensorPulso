import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [bpm, setBpm] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [estadoBPM, setEstadoBPM] = useState("");
  const [estadoSpO2, setEstadoSpO2] = useState("");
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const sensorRef = ref(db, "sensorPulse");

    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBpm(data.bpm);
        setSpo2(data.spo2);
        setEstadoBPM(data.estadoBPM);
        setEstadoSpO2(data.estadoSpO2);

        // Guardar historial (últimos 20 puntos)
        setHistorial((prev) => {
          const nuevo = [...prev, { bpm: data.bpm, time: data.timestamp }];
          return nuevo.slice(-20);
        });
      }
    });
  }, []);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-5 pt-8">

      {/* Perfil redondo */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-red-400 shadow-md">
            <img
              src="https://www.shutterstock.com/image-vector/cardiologist-checking-heart-health-cardiology-260nw-2121610613.jpg"
              alt="user"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full border-8 border-red-300 opacity-40"></div>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Bienvenido 👋</h2>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 mt-10">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm">Pulso actual</p>
          <h2 className="text-3xl font-bold text-red-500">{bpm}</h2>
          <p className="text-xs text-gray-400">{estadoBPM}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm">Oxigenación</p>
          <h2 className="text-3xl font-bold text-blue-500">{spo2}%</h2>
          <p className="text-xs text-gray-400">{estadoSpO2}</p>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white p-5 mt-8 shadow rounded-xl">
        <h3 className="text-gray-700 font-semibold mb-3">Gráfica de BPM</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historial}>
              <Line type="monotone" dataKey="bpm" stroke="#ff4d4d" strokeWidth={2} dot={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={[40, 150]} />
              <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
