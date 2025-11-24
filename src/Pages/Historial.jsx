import { useEffect, useState } from "react";
import Navbar from "../Componentes/Navbar";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export default function Historial() {
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMediciones = async () => {
      try {
        const q = query(
          collection(firestore, "mediciones"),
          orderBy("timestamp", "desc")
        );

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
  }, []);

  const formatoFecha = (segundos) => {
    return new Date(segundos * 1000).toLocaleString();
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-6 pt-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center">
        Historial de Mediciones
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Cargando...</p>
      ) : mediciones.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No hay mediciones registradas.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {mediciones.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl shadow p-6 flex justify-between items-center"
            >
              <div>
                <p className="text-gray-700 font-semibold">
                  {formatoFecha(m.timestamp)}
                </p>

                <p className="text-gray-800 mt-1">
                  <span className="font-bold">BPM:</span> {m.bpm}{" "}
                  <span className="text-sm text-gray-500">
                    ({m.estadoBPM})
                  </span>
                </p>

                <p className="text-gray-800">
                  <span className="font-bold">SpO₂:</span> {m.spo2}%{" "}
                  <span className="text-sm text-gray-500">
                    ({m.estadoSpO2})
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Navbar />
    </div>
  );
}
