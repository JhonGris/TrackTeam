/**
 * Types for Servicios Técnicos module
 */

export type TipoServicio = 'Preventivo' | 'Correctivo' | 'Limpieza' | 'Actualización de Software'
export type EstadoResultante = 'Bueno' | 'Regular' | 'Malo'

export interface ServicioTecnico {
  id: string
  equipoId: string
  tipo: TipoServicio
  fechaServicio: Date
  problemas: string
  soluciones: string
  tiempoInvertido: number // minutos
  estadoResultante: EstadoResultante
  createdAt?: Date
  updatedAt?: Date
}

export interface ArchivoServicio {
  id: string
  nombre: string
  tipo: string
  tamanio: number
  ruta: string
  esImagen: boolean
  descripcion?: string | null
  createdAt: string | Date
}

export interface ServicioWithEquipo extends ServicioTecnico {
  equipo: {
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
    colaborador: {
      id: string
      nombre: string
      apellido: string
    } | null
  }
  archivos?: ArchivoServicio[]
}

// Helper para formatear tiempo
export function formatTiempoInvertido(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`
  }
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
}

// Helper para color de tipo de servicio
export function getTipoServicioColor(tipo: TipoServicio): string {
  switch (tipo) {
    case 'Preventivo':
      return 'bg-blue-100 text-blue-800'
    case 'Correctivo':
      return 'bg-orange-100 text-orange-800'
    case 'Limpieza':
      return 'bg-green-100 text-green-800'
    case 'Actualización de Software':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
