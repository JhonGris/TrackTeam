"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Equipo } from '@/contexts/InventarioContext';

interface EquiposPorTipoChartProps {
  equipos: Equipo[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export function EquiposPorTipoChart({ equipos }: EquiposPorTipoChartProps) {
  // Agrupar equipos por tipo (memoizado)
  const data = useMemo(() => {
    const tiposCount: { [key: string]: number } = {};
    equipos.forEach(equipo => {
      tiposCount[equipo.tipo] = (tiposCount[equipo.tipo] || 0) + 1;
    });

    return Object.entries(tiposCount).map(([tipo, cantidad]) => ({
      name: tipo,
      value: cantidad
    }));
  }, [equipos]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipos por Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
