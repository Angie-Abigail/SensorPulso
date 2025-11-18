import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export default function PulsoEnVivo() {
  const [bpm, setBpm] = useState(0);
  const [spo2, setSpo2] = useState(0);

  useEffect(() => {
    const dataRef = ref(db, "sensorPulse");
    onValue(dataRef, (snapshot) => {
      const v = snapshot.val();
      setBpm(v.bpm);
      setSpo2(v.spo2);
    });
  }, []);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-6 pt-10">

      <h1 className="text-2xl font-bold text-gray-800 text-center">Pulso en Vivo</h1>

      {/* Tarjeta de pulso */}
      <div className="mt-10 bg-white p-8 rounded-3xl shadow text-center">
        <h2 className="text-gray-500">BPM</h2>
        <p className="text-6xl font-bold text-red-500">{bpm}</p>
      </div>

      {/* Tarjeta de SPO2 */}
      <div className="mt-6 bg-white p-8 rounded-3xl shadow text-center">
        <h2 className="text-gray-500">Oxigenación SpO₂</h2>
        <p className="text-6xl font-bold text-blue-500">{spo2}%</p>
      </div>

      <Navbar />
    </div>
  );
}
