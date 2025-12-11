'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Calendar, 
  User, 
  Wrench, 
  MapPin, 
  Building2, 
  Clock,
  ArrowLeft,
  Download,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EventoTimeline {
  id: string
  tipo: 'servicio' | 'asignacion'
  fecha: string
  titulo: string
  descripcion: string
  usuario?: string
  departamento?: string
  ciudad?: string
  tecnico?: string
  costo?: number
  motivo?: string
  duracion?: string
}

export default function TimelineEquipoPage() {
  const params = useParams()
  const router = useRouter()
  const equipoId = params?.id as string

  const [eventos, setEventos] = useState<EventoTimeline[]>([])
  const [equipo, setEquipo] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'servicios' | 'asignaciones'>('todos')

  useEffect(() => {
    if (equipoId) {
      cargarDatos()
    }
  }, [equipoId])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError(null)

      // Cargar datos del equipo
      const equipoRes = await fetch(`/api/equipos?id=${equipoId}`)
      if (!equipoRes.ok) throw new Error('Error al cargar equipo')
      const equiposData = await equipoRes.json()
      const equipoEncontrado = equiposData.find((e: any) => e.id === equipoId)
      setEquipo(equipoEncontrado)

      // Cargar servicios
      const serviciosRes = await fetch('/api/servicios')
      if (!serviciosRes.ok) throw new Error('Error al cargar servicios')
      const serviciosData = await serviciosRes.json()
      const serviciosEquipo = serviciosData.filter((s: any) => s.equipoId === equipoId)

      // Cargar historial de asignaciones
      const historialRes = await fetch(`/api/historial-asignaciones?equipoId=${equipoId}`)
      if (!historialRes.ok) throw new Error('Error al cargar historial')
      const historialData = await historialRes.json()

      // Combinar eventos
      const eventosTimeline: EventoTimeline[] = []

      // Agregar servicios
      serviciosEquipo.forEach((servicio: any) => {
        eventosTimeline.push({
          id: `servicio-${servicio.id}`,
          tipo: 'servicio',
          fecha: servicio.fechaServicio,
          titulo: `${servicio.tipoMantenimiento}`,
          descripcion: servicio.diagnostico || 'Sin diagnóstico',
          tecnico: servicio.tecnicoResponsable,
          costo: servicio.costoReparacion,
          usuario: servicio.usuarioAsignado || 'No registrado',
          departamento: servicio.departamentoEnMomento
        })
      })

      // Agregar asignaciones
      historialData.forEach((asignacion: any) => {
        const duracion = calcularDuracion(asignacion.fechaInicio, asignacion.fechaFin)
        eventosTimeline.push({
          id: `asignacion-${asignacion.id}`,
          tipo: 'asignacion',
          fecha: asignacion.fechaInicio,
          titulo: asignacion.motivo,
          descripcion: asignacion.observaciones || `Asignado a ${asignacion.usuarioNombre}`,
          usuario: asignacion.usuarioNombre,
          departamento: asignacion.departamento,
          ciudad: asignacion.ciudad,
          motivo: asignacion.motivo,
          duracion
        })
      })

      // Ordenar por fecha descendente
      eventosTimeline.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

      setEventos(eventosTimeline)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('No se pudo cargar la línea de tiempo del equipo')
    } finally {
      setCargando(false)
    }
  }

  const calcularDuracion = (fechaInicio: string, fechaFin: string | null) => {
    const inicio = new Date(fechaInicio)
    const fin = fechaFin ? new Date(fechaFin) : new Date()
    const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))

    if (dias < 30) return `${dias} día${dias !== 1 ? 's' : ''}`
    if (dias < 365) {
      const meses = Math.floor(dias / 30)
      return `${meses} mes${meses !== 1 ? 'es' : ''}`
    }
    const años = Math.floor(dias / 365)
    return `${años} año${años !== 1 ? 's' : ''}`
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const eventosFiltrados = eventos.filter(e => {
    if (filtro === 'todos') return true
    if (filtro === 'servicios') return e.tipo === 'servicio'
    if (filtro === 'asignaciones') return e.tipo === 'asignacion'
    return true
  })

  const exportarPDF = () => {
    // TODO: Implementar exportación a PDF con jsPDF
    alert('Función de exportar a PDF en desarrollo')
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando línea de tiempo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Línea de Tiempo del Equipo
                </h1>
                {equipo && (
                  <p className="text-gray-600 mt-1">
                    {equipo.marca} {equipo.modelo} - Serial: {equipo.serial}
                  </p>
                )}
              </div>
            </div>
            <Button onClick={exportarPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Mostrar:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltro('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({eventos.length})
              </button>
              <button
                onClick={() => setFiltro('servicios')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === 'servicios'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Servicios ({eventos.filter(e => e.tipo === 'servicio').length})
              </button>
              <button
                onClick={() => setFiltro('asignaciones')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === 'asignaciones'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Asignaciones ({eventos.filter(e => e.tipo === 'asignacion').length})
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {eventosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay eventos en la línea de tiempo</p>
            </div>
          ) : (
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Eventos */}
              <div className="space-y-8">
                {eventosFiltrados.map((evento, index) => (
                  <div key={evento.id} className="relative pl-20">
                    {/* Marcador */}
                    <div
                      className={`absolute left-5 w-7 h-7 rounded-full border-4 flex items-center justify-center ${
                        evento.tipo === 'servicio'
                          ? 'bg-purple-500 border-purple-200'
                          : 'bg-green-500 border-green-200'
                      }`}
                      style={{ top: '4px' }}
                    >
                      {evento.tipo === 'servicio' ? (
                        <Wrench className="h-3 w-3 text-white" />
                      ) : (
                        <User className="h-3 w-3 text-white" />
                      )}
                    </div>

                    {/* Tarjeta del evento */}
                    <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow">
                      {/* Fecha */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatearFecha(evento.fecha)}</span>
                        {evento.duracion && (
                          <>
                            <span className="text-gray-300">•</span>
                            <Clock className="h-4 w-4" />
                            <span>{evento.duracion}</span>
                          </>
                        )}
                      </div>

                      {/* Título */}
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {evento.titulo}
                      </h3>

                      {/* Descripción */}
                      <p className="text-gray-600 mb-3">{evento.descripcion}</p>

                      {/* Detalles adicionales */}
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                        {evento.usuario && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{evento.usuario}</span>
                          </div>
                        )}
                        {evento.departamento && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            <span>{evento.departamento}</span>
                          </div>
                        )}
                        {evento.ciudad && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{evento.ciudad}</span>
                          </div>
                        )}
                        {evento.tecnico && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Wrench className="h-4 w-4" />
                            <span>{evento.tecnico}</span>
                          </div>
                        )}
                        {evento.costo !== undefined && evento.costo > 0 && (
                          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <span>Costo: ${evento.costo.toLocaleString('es-CO')}</span>
                          </div>
                        )}
                      </div>

                      {/* Badge de tipo */}
                      <div className="mt-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            evento.tipo === 'servicio'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {evento.tipo === 'servicio' ? 'Servicio Técnico' : 'Asignación'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
