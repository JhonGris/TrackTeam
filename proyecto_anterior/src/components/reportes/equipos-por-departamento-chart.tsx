"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Equipo, Usuario } from '@/contexts/InventarioContext';

interface EquiposPorDepartamentoChartProps {
  equipos: Equipo[];
  usuarios: Usuario[];
}

export function EquiposPorDepartamentoChart({ equipos, usuarios }: EquiposPorDepartamentoChartProps) {
  // Contar equipos por departamento (memoizado)
  const data = useMemo(() => {
    const departamentosCount: { [key: string]: number } = {};
    
    equipos.forEach(equipo => {
      if (equipo.usuario && equipo.usuario !== 'Sin asignar') {
        const usuario = usuarios.find(u => u.nombre === equipo.usuario);
        const depto = usuario?.departamento || 'Sin Departamento';
        departamentosCount[depto] = (departamentosCount[depto] || 0) + 1;
      }
    });

    return Object.entries(departamentosCount)
      .map(([departamento, cantidad]) => ({
        departamento: departamento.length > 15 ? departamento.substring(0, 15) + '...' : departamento,
        cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [equipos, usuarios]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipos por Departamento</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="departamento" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" fill="#3B82F6" name="Equipos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
