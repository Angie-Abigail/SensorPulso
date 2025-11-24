import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { ref, onValue } from "firebase/database";
import { db, firestore } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function PulsoEnVivo() {
  const [bpm, setBpm] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [estadoBPM, setEstadoBPM] = useState("");
  const [estadoSpO2, setEstadoSpO2] = useState("");
  const [hora, setHora] = useState("");

  // **NUEVOS ESTADOS PARA EL RESULTADO FINAL DE 8 SEGUNDOS**
  const [bpmFinal, setBpmFinal] = useState(0);
  const [spo2Final, setSpo2Final] = useState(0);
  const [estadoBPMFinal, setEstadoBPMFinal] = useState("");
  const [estadoSpO2Final, setEstadoSpO2Final] = useState("");

  // Para evitar guardar la misma medición dos veces
  const [ultimoGuardado, setUltimoGuardado] = useState(null);

  // ============================
  //  LECTURA EN TIEMPO REAL Y FINAL
  // ============================
  useEffect(() => {
    const dataRef = ref(db, "ultimasLecturas");
    const finalRef = ref(db, "resultadoFinal"); // <-- Nuevo puntero

    // 1. Lectura en tiempo real (Lectura constante)
    onValue(dataRef, (snapshot) => {
      const v = snapshot.val();
      if (v) {
        setBpm(v.bpm);
        setSpo2(v.spo2);
        setEstadoBPM(v.estadoBPM);
        setEstadoSpO2(v.estadoSpO2);
        if (v.timestamp && !isNaN(v.timestamp)) {
          setHora(new Date(Number(v.timestamp)).toLocaleTimeString());
        }
      }
    });

    // 2. Lectura del resultado final (Actualiza solo después de 8 segundos)
    onValue(finalRef, (snapshot) => {
      const v = snapshot.val();
      if (v) {
        // **Guardamos los valores promediados**
        setBpmFinal(v.bpmFinal);
        setSpo2Final(v.spo2Final);
        setEstadoBPMFinal(v.estadoBPMFinal);
        setEstadoSpO2Final(v.estadoSpO2Final);
      }
    });

  }, []);

  // ============================
  //   GUARDAR EN FIRESTORE
  // ============================
  const guardarMedicion = async () => {
    // 1. Validar que tengamos un resultado final válido
    if (bpmFinal <= 0 || spo2Final <= 0) {
      alert("Aún no hay un resultado final promediado válido para guardar (debe esperar a que termine la medición de 8s).");
      return;
    }

    // Usaremos bpmFinal y spo2Final para la clave de control
    const claveActual = `${bpmFinal.toFixed(1)}-${spo2Final.toFixed(1)}`;

    // Comprobación de duplicados
    if (ultimoGuardado === claveActual) {
      alert("Esta medición final ya fue guardada.");
      return;
    }

    try {
      await addDoc(collection(firestore, "mediciones"), {
        // Utilizamos los valores finales (promediados de 8 segundos)
        bpm: parseFloat(bpmFinal.toFixed(1)), // Guardamos con 1 decimal y como número
        spo2: parseFloat(spo2Final.toFixed(1)), // Guardamos con 1 decimal y como número
        estadoBPM: estadoBPMFinal,
        estadoSpO2: estadoSpO2Final,
        timestamp: Date.now() / 1000 // en segundos
      });

      setUltimoGuardado(claveActual);
      alert("Medición final guardada correctamente en el historial 🩺✨");
    } catch (error) {
      console.error("Error guardando medición:", error);
      alert("Hubo un error al guardar la medición.");
    }
  };

  // ============================
  //           UI
  // ============================
  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-6 pt-10">

      <h1 className="text-2xl font-bold text-gray-800 text-center">Pulso en Vivo</h1>

      {/* TARJETA DE RESULTADO FINAL (NUEVA SECCIÓN) */}
      <div className="mt-6 bg-green-500 p-6 rounded-3xl shadow text-center text-white">
        <h2 className="text-xl font-bold">Resultado de Medición (8s)</h2>
        <div className="flex justify-around mt-3">
          <div>
            <p className="text-4xl font-bold">{bpmFinal.toFixed(1)}</p>
            <p className="text-sm">BPM ({estadoBPMFinal})</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{spo2Final.toFixed(1)}%</p>
            <p className="text-sm">SpO₂ ({estadoSpO2Final})</p>
          </div>
        </div>
      </div>
      {/* FIN TARJETA DE RESULTADO FINAL */}

      <h3 className="text-lg font-semibold text-gray-800 mt-8 text-center">Lectura Instantánea</h3>

      <div className="mt-4 bg-white p-8 rounded-3xl shadow text-center">
        <h2 className="text-gray-500">BPM</h2>
        <p className="text-6xl font-bold text-red-500">{bpm.toFixed(1)}</p>
        <p className="text-sm text-gray-400">{estadoBPM}</p>
      </div>

      <div className="mt-6 bg-white p-8 rounded-3xl shadow text-center">
        <h2 className="text-gray-500">Oxigenación SpO₂</h2>
        <p className="text-6xl font-bold text-blue-500">{spo2.toFixed(1)}%</p>
        <p className="text-sm text-gray-400">{estadoSpO2}</p>
      </div>

      {/*... el resto del código es igual...*/}
      <p className="text-center text-xs text-gray-400 mt-2">Última lectura: {hora}</p>

      {/* BOTÓN PARA GUARDAR */}
      <button
        onClick={guardarMedicion}
        className="w-full mt-6 bg-red-500 text-white py-3 rounded-2xl text-lg font-semibold shadow hover:bg-red-600 transition"
      >
        Guardar medición
      </button>

      <Navbar />
    </div>
  );
}
