'use client'

import { useInventario, type Servicio } from '@/contexts/InventarioContext'
import { Wrench, Calendar, User, DollarSign } from 'lucide-react'

interface HistorialServiciosProps {
  equipoId: string
}

export function HistorialServicios({ equipoId }: HistorialServiciosProps) {
  const { servicios } = useInventario()

  // Filtrar servicios del equipo específico
  const serviciosDelEquipo = servicios.filter(s => s.equipoId === equipoId)
    .sort((a, b) => new Date(b.fechaServicio).getTime() - new Date(a.fechaServicio).getTime())

  if (serviciosDelEquipo.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Wrench className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Sin historial de servicios</p>
        <p className="text-gray-400 text-sm mt-1">Este equipo no tiene servicios registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        Historial de Servicios ({serviciosDelEquipo.length})
      </h4>

      <div className="space-y-3">
        {serviciosDelEquipo.map((servicio) => (
          <div 
            key={servicio.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  servicio.tipoMantenimiento === 'Preventivo' 
                    ? 'bg-green-100' 
                    : servicio.tipoMantenimiento === 'Correctivo'
                    ? 'bg-orange-100'
                    : 'bg-blue-100'
                }`}>
                  <Wrench className={`h-4 w-4 ${
                    servicio.tipoMantenimiento === 'Preventivo' 
                      ? 'text-green-600' 
                      : servicio.tipoMantenimiento === 'Correctivo'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{servicio.tipoMantenimiento}</h5>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(servicio.fechaServicio).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {servicio.costoReparacion > 0 && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {servicio.costoReparacion.toLocaleString('es-CO')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="text-gray-500 font-medium">Técnico:</span>
                <span className="ml-2 text-gray-900 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {servicio.tecnicoResponsable}
                </span>
              </div>

              {servicio.diagnostico && (
                <div>
                  <span className="text-gray-500 font-medium">Diagnóstico:</span>
                  <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    {servicio.diagnostico}
                  </p>
                </div>
              )}

              {servicio.descripcionTrabajo && (
                <div>
                  <span className="text-gray-500 font-medium">Trabajo realizado:</span>
                  <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    {servicio.descripcionTrabajo}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
