import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPulso() {
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    const sensorRef = ref(db, "sensorPulse");
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // agregar al historial
        setHistorial((prev) => {
          const nuevo = [...prev, { bpm: data.bpm, spo2: data.spo2, time: data.timestamp }];
          return nuevo.slice(-20);
        });

        // alerta
        setAlerta(data.bpm >= 100);
      }
    });
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto font-sans">
      <h2 className="text-center text-xl mb-4">📊 Monitor Cardíaco</h2>

      {alerta && (
        <div className="bg-red-400 text-white p-3 rounded mb-4 text-center font-bold">
          ⚠️ ALERTA: BPM demasiado alto
        </div>
      )}

      <div className="bg-white p-4 rounded shadow mb-4">
        {historial.length > 0 && (
          <>
            <p className="text-gray-700">Última lectura: ❤️ {historial[historial.length-1].bpm} BPM | 🩸 {historial[historial.length-1].spo2}% SpO₂</p>
            <p className="text-gray-500 text-xs">
              {new Date(historial[historial.length-1].time).toLocaleString()}
            </p>
          </>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2">Gráfica BPM (últimos 20 puntos)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={historial}>
            <Line type="monotone" dataKey="bpm" stroke="#ff4d4d" strokeWidth={3} dot={false} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[40, 150]} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
