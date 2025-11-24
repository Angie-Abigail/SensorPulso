import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { firestore } from "../lib/firebase";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from "recharts";

// 💡 Constante para limitar las mediciones a las 5 últimas
const MAX_DATA_POINTS_MOBILE = 5;

export default function GraficaMediciones() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarMediciones = async () => {
            setLoading(true);
            try {
                // 🎯 Solo traemos los últimos 5 puntos
                const q = query(
                    collection(firestore, "mediciones"),
                    orderBy("timestamp", "desc"), 
                    limit(MAX_DATA_POINTS_MOBILE) // Aplicamos el límite de 5
                );

                const snapshot = await getDocs(q);

                const datosFormateados = snapshot.docs.map((doc) => {
                    const medicion = doc.data();
                    
                    // Manejo seguro del Timestamp de Firestore para evitar Invalid Date
                    let timestampMs = Date.now(); 

                    if (medicion.timestamp && typeof medicion.timestamp.seconds === 'number') {
                        timestampMs = medicion.timestamp.seconds * 1000;
                    } else if (typeof medicion.timestamp === 'number') {
                        timestampMs = medicion.timestamp; 
                    }

                    const fecha = new Date(timestampMs);

                    return {
                        // Usamos solo la hora y minuto para el eje X en el móvil
                        name: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        bpm: medicion.bpm,
                        spo2: medicion.spo2,
                    };
                }).reverse(); // Invertimos el orden para que la gráfica vaya de pasado a presente

                setData(datosFormateados);
            } catch (error) {
                console.error("Error obteniendo historial para gráfica:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarMediciones();
    }, []);

    // 4. Mostrar la gráfica:
    if (loading) {
        return <div className="text-center p-10 text-slate-500 font-medium">Cargando datos del historial...</div>;
    }

    if (data.length === 0) {
        return <div className="text-center p-10 text-gray-500">No hay mediciones guardadas para mostrar la gráfica.</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}> 
                    <defs>
                        {/* Degradados */}
                        <linearGradient id="colorBpmFS" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSpo2FS" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                    {/* Eje X (Mejoras de estilo) */}
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }} // Fuente un poco más legible
                        angle={0} // Sin rotación
                        textAnchor="middle" // Centramos el texto
                        height={25} // Altura optimizada
                        interval={0} // Aseguramos que se muestren los 5 puntos
                    />

                    {/* Eje Y BPM */}
                    <YAxis
                        yAxisId="left"
                        stroke="#f43f5e"
                        domain={['dataMin - 5', 'dataMax + 5']}
                        tick={{ fontSize: 9 }}
                        width={30}
                    />
                    {/* Eje Y SpO2 */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                        domain={[85, 100]} // Mantenemos el dominio restringido para SpO2
                        tick={{ fontSize: 9 }}
                        width={30} 
                    />

                    {/* Tooltip */}
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#94a3b8' }}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 10 }} />

                    {/* Gráficas */}
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="bpm"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBpmFS)"
                        name="Ritmo Cardíaco (BPM)"
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="spo2"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSpo2FS)"
                        name="Oxígeno (SpO₂ %)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}