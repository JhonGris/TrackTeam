"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Servicio } from '@/contexts/InventarioContext';

interface ServiciosPorMesChartProps {
  servicios: Servicio[];
}

export function ServiciosPorMesChart({ servicios }: ServiciosPorMesChartProps) {
  // Agrupar servicios por mes (memoizado)
  const data = useMemo(() => {
    const mesesCount: { [key: string]: { correctivos: number; preventivos: number; total: number } } = {};
    
    servicios.forEach(servicio => {
      const fecha = new Date(servicio.fechaServicio);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!mesesCount[mesKey]) {
        mesesCount[mesKey] = { correctivos: 0, preventivos: 0, total: 0 };
      }
      
      mesesCount[mesKey].total += 1;
      if (servicio.tipoMantenimiento === 'Correctivo') {
        mesesCount[mesKey].correctivos += 1;
      } else if (servicio.tipoMantenimiento === 'Preventivo') {
        mesesCount[mesKey].preventivos += 1;
      }
    });

    // Convertir a array y ordenar por fecha
    return Object.entries(mesesCount)
      .map(([mes, counts]) => {
        const [year, month] = mes.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return {
          mes: `${monthNames[parseInt(month) - 1]} ${year}`,
          Correctivos: counts.correctivos,
          Preventivos: counts.preventivos,
          Total: counts.total
        };
      })
      .slice(-6); // Últimos 6 meses
  }, [servicios]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios por Mes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Correctivos" stroke="#EF4444" strokeWidth={2} />
          <Line type="monotone" dataKey="Preventivos" stroke="#10B981" strokeWidth={2} />
          <Line type="monotone" dataKey="Total" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
