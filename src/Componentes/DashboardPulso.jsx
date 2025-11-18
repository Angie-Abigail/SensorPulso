import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import {db} from "../lib/firebase"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardPulso() {
  const [bpm, setBpm] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    const sensorRef = ref(db, "sensorPulse");

    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setBpm(data.bpm);
        setSpo2(data.spo2);
        setFecha(data.date);

        // Guardar historial (máximo 20 puntos)
        setHistorial((prev) => {
          const nuevo = [...prev, { bpm: data.bpm, time: Date.now() }];
          return nuevo.slice(-20);
        });

        // Alerta automática
        if (data.bpm >= 100) {
          setAlerta(true);
        } else {
          setAlerta(false);
        }
      }
    });
  }, []);

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "480px",
        margin: "0 auto"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        📊 Monitor Cardíaco
      </h2>

      {/* ALERTA */}
      {alerta && (
        <div
          style={{
            background: "#ff7272",
            color: "white",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
            textAlign: "center",
            fontWeight: "bold"
          }}
        >
          ⚠️ ALERTA: BPM demasiado alto ({bpm})
        </div>
      )}

      {/* TARJETA VALORES */}
      <div
        style={{
          background: "white",
          padding: "18px",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px"
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Datos en Tiempo Real</h3>

        <p style={{ fontSize: "20px", margin: 0 }}>
          ❤️ <strong>{bpm !== null ? bpm : "..."}</strong> BPM
        </p>

        <p style={{ fontSize: "18px", margin: "6px 0" }}>
          🩸 <strong>{spo2 !== null ? spo2 : "..."}%</strong> SpO2
        </p>

        <p style={{ fontSize: "14px", opacity: 0.6 }}>
          🕒 Timestamp: {fecha}
        </p>
      </div>

      {/* GRÁFICA */}
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Gráfica de BPM</h3>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={historial}>
            <Line type="monotone" dataKey="bpm" stroke="#ff4d4d" strokeWidth={3} dot={false} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[40, 150]} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* HISTORIAL */}
      <div style={{ marginTop: "20px" }}>
        <h3>Historial (últimos 20)</h3>

        <ul style={{ paddingLeft: "14px" }}>
          {historial.map((item, index) => (
            <li key={index}>
              {item.bpm} BPM
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
