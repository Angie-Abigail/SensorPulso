import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export default function Historial() {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const sensorRef = ref(db, "sensorPulse");
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHistorial((prev) => {
          const nuevo = [...prev, { bpm: data.bpm, spo2: data.spo2, time: data.timestamp }];
          return nuevo.slice(-50); // máximo 50 entradas
        });
      }
    });
  }, []);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-6 pt-10">

      <h1 className="text-2xl font-bold text-gray-800 mb-5 text-center">
        Historial de mediciones
      </h1>

      <div className="mt-6 space-y-3">
        {historial.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow flex justify-between">
            <span className="font-semibold text-gray-700">{item.bpm} BPM | {item.spo2}% SpO₂</span>
            <span className="text-sm text-gray-500">{new Date(item.time).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <Navbar />
    </div>
  );
}
