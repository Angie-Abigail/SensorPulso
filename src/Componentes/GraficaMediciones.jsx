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

// ====================================================================
// 🎯 Nuevo Componente para el Tooltip Personalizado
// Esto permite formatear los números (BPM y SpO2) a 2 decimales en el hover.
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 p-2 rounded-lg text-white shadow-lg border border-slate-700 text-xs">
                <p className="font-bold text-slate-400 mb-1">{`Hora: ${label}`}</p>
                {payload.map((item, index) => (
                    <p key={index} style={{ color: item.stroke }}>
                        {/* 🎯 Aplicamos toFixed(2) al valor */}
                        {`${item.name}: ${parseFloat(item.value).toFixed(2)} ${item.dataKey === 'bpm' ? 'bpm' : '%'}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
// ====================================================================


export default function GraficaMediciones() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarMediciones = async () => {
            setLoading(true);
            try {
                // Solo traemos los últimos 5 puntos
                const q = query(
                    collection(firestore, "mediciones"),
                    orderBy("timestamp", "desc"),
                    limit(MAX_DATA_POINTS_MOBILE) 
                );

                const snapshot = await getDocs(q);

                const datosFormateados = snapshot.docs.map((doc) => {
                    const medicion = doc.data();
                    
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
                }).reverse(); 

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
        return <div className="h-64 flex items-center justify-center text-slate-500 font-medium">Cargando datos del historial...</div>;
    }

    if (data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-500">No hay mediciones guardadas para mostrar la gráfica.</div>;
    }

    return (
        // El contenedor con h-64 y w-full asegura la responsividad
        <div className="h-64 w-full"> 
            <ResponsiveContainer width="100%" height="100%">
                {/* 🚀 CAMBIO 1: Reducción de margen horizontal (right: 5, left: 5) para móviles */}
                <AreaChart data={data} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}> 
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

                    {/* Eje X: Optimizaciones para móvil (sin rotación, interval=0, fuente pequeña) */}
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={0}
                        textAnchor="middle" 
                        height={25}
                        interval={0} 
                    />

                    {/* Eje Y BPM: Ancho reducido a 25 */}
                    <YAxis
                        yAxisId="left"
                        stroke="#f43f5e"
                        domain={['dataMin - 5', 'dataMax + 5']}
                        tick={{ fontSize: 9 }}
                        width={25} 
                    />
                    {/* Eje Y SpO2: Ancho reducido a 25 */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                        domain={[85, 100]}
                        tick={{ fontSize: 9 }}
                        width={25} 
                    />

                    {/* 🚀 CAMBIO 2: Usar el Tooltip Personalizado para formatear a 2 decimales */}
                    <Tooltip content={<CustomTooltip />} /> 
                    
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