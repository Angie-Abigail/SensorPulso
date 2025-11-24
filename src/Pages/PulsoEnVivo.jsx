import { useState, useEffect } from "react";

import Navbar from "../Componentes/Navbar";

import { ref, onValue } from "firebase/database";

import { db, firestore } from "../lib/firebase";

import { collection, addDoc } from "firebase/firestore";

import ConfirmModal from "../Componentes/ConfirmModal";

import {

  Activity,

  Heart,

  Droplet,

  Save,

  RotateCcw,

  CheckCircle2,

  Clock // <-- Agregamos el ícono del reloj

} from "lucide-react";



export default function PulsoEnVivo() {

  // ============================

  //  ESTADOS DE DATOS

  // ============================

  // Datos en tiempo real (cambian cada segundo)

  const [bpm, setBpm] = useState(0);

  const [spo2, setSpo2] = useState(0);

  const [estadoBPM, setEstadoBPM] = useState("--");

  const [estadoSpO2, setEstadoSpO2] = useState("--");

  const [horaInstantanea, setHoraInstantanea] = useState("--:--:--"); // NUEVO: Hora lectura instantánea



  // Datos finales (resultado de los 8 segundos)

  const [bpmFinal, setBpmFinal] = useState(0);

  const [spo2Final, setSpo2Final] = useState(0);

  const [estadoBPMFinal, setEstadoBPMFinal] = useState("");

  const [estadoSpO2Final, setEstadoSpO2Final] = useState("");

  const [horaFinal, setHoraFinal] = useState("--:--:--"); // NUEVO: Hora de medición final



  // ============================

  //  ESTADOS DE INTERFAZ

  // ============================

  const [ultimoGuardado, setUltimoGuardado] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);



  // ============================

  //  FUNCIONES DE UTILIDAD

  // ============================

  const formatTimestamp = (timestamp) => {

    if (!timestamp) return "--:--:--";

    // El ESP32 envía milisegundos. Date espera milisegundos.

    const date = new Date(Number(timestamp));



    // Asegura formato HH:mm:ss, usando opciones para incluir segundos

    return date.toLocaleTimeString('es-PE', {

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      hour12: false // Opcional, si prefieres el formato 24h

    });

  };





  // ============================

  //  CONEXIÓN CON FIREBASE (Realtime)

  // ============================

  useEffect(() => {

    const dataRef = ref(db, "ultimasLecturas");

    const finalRef = ref(db, "resultadoFinal");



    // 1. Lectura en Vivo

    const unsubscribeLive = onValue(dataRef, (snapshot) => {

      const v = snapshot.val();

      if (v) {

        setBpm(v.bpm || 0);

        setSpo2(v.spo2 || 0);

        setEstadoBPM(v.estadoBPM || "--");

        setEstadoSpO2(v.estadoSpO2 || "--");



        // RECUPERAR HORA INSTANTÁNEA

        if (v.timestamp) {

          setHoraInstantanea(formatTimestamp(v.timestamp));

        }

      }

    });



    // 2. Resultado Final (Se actualiza cada 8s aprox cuando Arduino termina)

    const unsubscribeFinal = onValue(finalRef, (snapshot) => {

      const v = snapshot.val();

      if (v) {

        setBpmFinal(v.bpmFinal || 0);

        setSpo2Final(v.spo2Final || 0);

        setEstadoBPMFinal(v.estadoBPMFinal);

        setEstadoSpO2Final(v.estadoSpO2Final);



        // RECUPERAR HORA FINAL

        if (v.timestampFinal) {

          setHoraFinal(formatTimestamp(v.timestampFinal));

        }

      }

    });



    // Limpieza de listeners al salir de la pantalla

    return () => {

      unsubscribeLive();

      unsubscribeFinal();

    };

  }, []);



  // ============================

  //  LÓGICA DE GUARDADO

  // ============================



  // Paso 1: Validar y abrir modal

  const handleBotonGuardar = () => {

    // Validación: No guardar si la lectura es 0 o inválida

    if (bpmFinal <= 0 || spo2Final <= 0) {

      alert("Espera a que termine la medición de 8 segundos para guardar.");

      return;

    }



    // Validación: No guardar lo mismo dos veces

    const claveActual = `${bpmFinal.toFixed(1)}-${spo2Final.toFixed(1)}`;

    if (ultimoGuardado === claveActual) {

      alert("Esta medición ya fue guardada anteriormente.");

      return;

    }



    // Si todo ok, abrimos el modal

    setShowModal(true);

  };



  // Paso 2: Confirmar y enviar a Firestore

  const confirmarGuardado = async () => {

    setIsSaving(true);

    try {

      await addDoc(collection(firestore, "mediciones"), {

        bpm: parseFloat(bpmFinal.toFixed(1)),

        spo2: parseFloat(spo2Final.toFixed(1)),

        estadoBPM: estadoBPMFinal,

        estadoSpO2: estadoSpO2Final,

        timestamp: Date.now() / 1000 // Segundos Unix

      });



      // Marcamos como guardado para bloquear el botón

      const claveActual = `${bpmFinal.toFixed(1)}-${spo2Final.toFixed(1)}`;

      setUltimoGuardado(claveActual);



      setShowModal(false); // Cerrar modal

      // Opcional: mostrar un toast o alerta bonita

      // alert("Guardado correctamente");



    } catch (error) {

      console.error("Error al guardar:", error);

      alert("Hubo un error al intentar guardar.");

    } finally {

      setIsSaving(false);

    }

  };



  return (

    <div className="bg-slate-50 min-h-screen pb-28 font-sans relative">



      {/* HEADER Sticky */}

      <div className="bg-white/80 backdrop-blur-md px-6 pt-8 pb-4 shadow-sm border-b border-slate-200 sticky top-0 z-40">

        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">

          <Activity className="text-rose-500 w-6 h-6" />

          Monitor en Vivo

        </h1>

        <p className="text-xs text-slate-400 mt-1">Sincronizado con sensor MAX30102</p>

      </div>



      <div className="px-5 pt-6 space-y-8">



        {/* ============================

             SECCIÓN 1: MONITOR INSTANTÁNEO

           ============================ */}

        <div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">

            <span className="relative flex h-2 w-2">

              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>

              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>

            </span>

            Lectura Instantánea

          </h3>



          <div className="grid grid-cols-2 gap-4">



            {/* Card BPM LIVE */}

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">

              {/* Animación de latido (Scale & Pulse) */}

              <div className={`mb-2 p-3 rounded-full bg-rose-50 text-rose-500 transition-transform duration-200 ${bpm > 40 ? 'scale-110' : 'scale-100'}`}>

                <Heart className={`w-6 h-6 ${bpm > 40 ? 'animate-pulse' : ''}`} fill="currentColor" />

              </div>



              <h2 className="text-4xl font-black text-slate-800 tabular-nums">

                {bpm > 0 ? bpm.toFixed(2) : "--"}

              </h2>

              <p className="text-xs text-slate-400 font-medium mt-1">BPM Actual</p>

            </div>



            {/* Card SpO2 LIVE */}

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">

              <div className="mb-2 p-3 rounded-full bg-sky-50 text-sky-500">

                <Droplet className="w-6 h-6" fill="currentColor" />

              </div>

              <h2 className="text-4xl font-black text-slate-800 tabular-nums">

                {spo2 > 0 ? spo2.toFixed(2) : "--"}

                <span className="text-lg text-slate-300 ml-1 font-normal">%</span>

              </h2>

              <p className="text-xs text-slate-400 font-medium mt-1">Oxígeno</p>

            </div>

          </div>



          {/* HORA INSTANTÁNEA AÑADIDA */}

          <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">

            <Clock size={12} /> Última actualización: {horaInstantanea}

          </p>

          {/* FIN HORA INSTANTÁNEA */}



        </div>





        {/* ============================

             SECCIÓN 2: RESULTADO FINAL (Aparece al terminar los 8s)

           ============================ */}

        {bpmFinal > 0 && (

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">



            {/* Título de sección */}

            <div className="flex items-center justify-between mb-3">

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">

                <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                Medición Completada (8s)

              </h3>

              {/* HORA FINAL AÑADIDA */}

              <p className="text-xs font-medium text-slate-400 flex items-center gap-1">

                <Clock size={12} /> {horaFinal}

              </p>

              {/* FIN HORA FINAL */}

            </div>



            {/* Tarjeta Oscura de Resultados */}

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">



              {/* Decoración de fondo */}

              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">

                <Activity size={120} />

              </div>



              <div className="relative z-10">

                {/* Header de la tarjeta */}

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <p className="text-slate-400 text-xs font-medium mb-1">Promedio calculado</p>

                    <h2 className="text-2xl font-bold">Resultados</h2>

                  </div>



                  {/* Badge de estado (Guardado vs Nueva) */}

                  {ultimoGuardado === `${bpmFinal.toFixed(1)}-${spo2Final.toFixed(1)}` ? (

                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-medium">

                      <CheckCircle2 size={12} /> Guardado

                    </span>

                  ) : (

                    <span className="bg-rose-500/20 text-rose-300 text-xs px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1 font-medium">

                      <RotateCcw size={12} /> Nueva lectura

                    </span>

                  )}

                </div>



                {/* Datos Finales */}

                <div className="flex gap-6">

                  {/* Columna BPM */}

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-2">

                      <Heart size={16} className="text-rose-400" fill="currentColor" />

                      <span className="text-sm font-semibold text-rose-100">Ritmo</span>

                    </div>

                    <p className="text-3xl font-bold">{bpmFinal.toFixed(1)}</p>

                    <p className="text-xs text-slate-400 mt-1 truncate">{estadoBPMFinal}</p>

                  </div>



                  {/* Divisor */}

                  <div className="w-px bg-slate-700/50"></div>



                  {/* Columna SpO2 */}

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-2">

                      <Droplet size={16} className="text-sky-400" fill="currentColor" />

                      <span className="text-sm font-semibold text-sky-100">SpO2</span>

                    </div>

                    <p className="text-3xl font-bold">{spo2Final.toFixed(1)}%</p>

                    <p className="text-xs text-slate-400 mt-1 truncate">{estadoSpO2Final}</p>

                  </div>

                </div>



                {/* Botón Guardar (Solo si no se ha guardado aun) */}

                {ultimoGuardado !== `${bpmFinal.toFixed(1)}-${spo2Final.toFixed(1)}` && (

                  <button

                    onClick={handleBotonGuardar}

                    className="mt-6 w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition flex items-center justify-center gap-2 shadow-lg shadow-black/10"

                  >

                    <Save size={18} />

                    Guardar en Historial

                  </button>

                )}

              </div>

            </div>

          </div>

        )}



      </div>
      {/* ============================

           MODAL DE CONFIRMACIÓN

         ============================ */}

      <ConfirmModal

        isOpen={showModal}

        onClose={() => setShowModal(false)}

        onConfirm={confirmarGuardado}

        isLoading={isSaving}

        title="¿Guardar medición?"

        message="Se registrará en tu historial médico con la fecha y hora actual."

      />

      <Navbar />

    </div>

  );

}