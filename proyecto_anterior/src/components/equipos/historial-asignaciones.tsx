'use client'

import { useState, useEffect } from 'react'
import { User, Calendar, MapPin, Building2, FileText, Clock } from 'lucide-react'

interface AsignacionHistorial {
  id: string
  equipoSerial: string
  usuarioNombre: string
  departamento: string | null
  ciudad: string | null
  fechaInicio: string
  fechaFin: string | null
  motivo: string
  observaciones: string | null
  creadoPor: string | null
  createdAt: string
}

interface HistorialAsignacionesProps {
  equipoId: string
  equipoSerial: string
}

export function HistorialAsignaciones({ equipoId, equipoSerial }: HistorialAsignacionesProps) {
  const [historial, setHistorial] = useState<AsignacionHistorial[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarHistorial()
  }, [equipoId])

  const cargarHistorial = async () => {
    try {
      setCargando(true)
      setError(null)
      
      const response = await fetch(`/api/historial-asignaciones?equipoId=${equipoId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial')
      }
      
      const data = await response.json()
      setHistorial(data)
    } catch (err) {
      console.error('Error cargando historial:', err)
      setError('No se pudo cargar el historial de asignaciones')
    } finally {
      setCargando(false)
    }
  }

  const calcularDuracion = (fechaInicio: string, fechaFin: string | null) => {
    const inicio = new Date(fechaInicio)
    const fin = fechaFin ? new Date(fechaFin) : new Date()
    
    const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
    
    if (dias < 30) {
      return `${dias} día${dias !== 1 ? 's' : ''}`
    } else if (dias < 365) {
      const meses = Math.floor(dias / 30)
      return `${meses} mes${meses !== 1 ? 'es' : ''}`
    } else {
      const años = Math.floor(dias / 365)
      const mesesRestantes = Math.floor((dias % 365) / 30)
      return `${años} año${años !== 1 ? 's' : ''}${mesesRestantes > 0 ? ` ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}` : ''}`
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const obtenerColorMotivo = (motivo: string) => {
    const colores: Record<string, string> = {
      'Asignación inicial': 'bg-green-100 text-green-800 border-green-200',
      'Reasignación': 'bg-blue-100 text-blue-800 border-blue-200',
      'Devolución': 'bg-orange-100 text-orange-800 border-orange-200',
      'Reparación': 'bg-purple-100 text-purple-800 border-purple-200',
      'Mantenimiento': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Retiro': 'bg-red-100 text-red-800 border-red-200'
    }
    return colores[motivo] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={cargarHistorial}
          className="mt-4 text-blue-600 hover:text-blue-700 underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (historial.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay historial de asignaciones para este equipo</p>
        <p className="text-sm text-gray-400 mt-2">
          Las asignaciones futuras se registrarán automáticamente
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Asignaciones
        </h3>
        <span className="text-sm text-gray-500">
          {historial.length} registro{historial.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Lista de asignaciones */}
        <div className="space-y-6">
          {historial.map((asignacion, index) => {
            const esActual = !asignacion.fechaFin
            const duracion = calcularDuracion(asignacion.fechaInicio, asignacion.fechaFin)

            return (
              <div key={asignacion.id} className="relative pl-16">
                {/* Marcador en la línea de tiempo */}
                <div 
                  className={`absolute left-6 w-5 h-5 rounded-full border-4 ${
                    esActual 
                      ? 'bg-green-500 border-green-200 ring-4 ring-green-100' 
                      : 'bg-white border-gray-300'
                  }`}
                  style={{ top: '8px' }}
                />

                {/* Tarjeta de asignación */}
                <div 
                  className={`bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${
                    esActual ? 'border-green-300' : 'border-gray-200'
                  }`}
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">
                        {asignacion.usuarioNombre}
                      </h4>
                      {esActual && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Actual
                        </span>
                      )}
                    </div>
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded border ${obtenerColorMotivo(asignacion.motivo)}`}
                    >
                      {asignacion.motivo}
                    </span>
                  </div>

                  {/* Información de departamento y ciudad */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {asignacion.departamento && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{asignacion.departamento}</span>
                      </div>
                    )}
                    {asignacion.ciudad && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{asignacion.ciudad}</span>
                      </div>
                    )}
                  </div>

                  {/* Fechas y duración */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatearFecha(asignacion.fechaInicio)}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-1">
                      {esActual ? (
                        <span className="text-green-600 font-medium">Actual</span>
                      ) : (
                        <span>{formatearFecha(asignacion.fechaFin!)}</span>
                      )}
                    </div>
                  </div>

                  {/* Duración */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Clock className="h-4 w-4" />
                    <span>{duracion}</span>
                  </div>

                  {/* Observaciones */}
                  {asignacion.observaciones && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">
                        "{asignacion.observaciones}"
                      </p>
                    </div>
                  )}

                  {/* Footer con info de creación */}
                  {asignacion.creadoPor && (
                    <div className="mt-2 text-xs text-gray-400">
                      Registrado por {asignacion.creadoPor} el {formatearFecha(asignacion.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Estadísticas resumen */}
      <div className="mt-8 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {historial.length}
          </div>
          <div className="text-sm text-gray-600">Asignaciones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {historial.filter(a => !a.fechaFin).length}
          </div>
          <div className="text-sm text-gray-600">Actual</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(historial.map(a => a.usuarioNombre)).size}
          </div>
          <div className="text-sm text-gray-600">Usuarios</div>
        </div>
      </div>
    </div>
  )
}
