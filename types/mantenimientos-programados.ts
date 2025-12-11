// Types for Mantenimientos Programados module

export type FrecuenciaMantenimiento = 
  | 'mensual'
  | 'trimestral'
  | 'semestral'
  | 'anual'
  | 'personalizado'

export type EstadoMantenimientoProgramado = 
  | 'Pendiente'
  | 'Completado'
  | 'Cancelado'
  | 'Vencido'

export type TipoMantenimiento = 
  | 'Preventivo'
  | 'Correctivo'
  | 'Limpieza'
  | 'Actualización de Software'

export interface MantenimientoProgramado {
  id: string
  tipo: TipoMantenimiento
  descripcion: string | null
  fechaProgramada: Date
  horaEstimada: string | null
  duracionEstimada: number | null
  esRecurrente: boolean
  frecuencia: FrecuenciaMantenimiento | null
  diasIntervalo: number | null
  fechaFinRecurrencia: Date | null
  estado: EstadoMantenimientoProgramado
  fechaCompletado: Date | null
  equipoId: string
  servicioTecnicoId: string | null
  notificacion7dias: boolean
  notificacion3dias: boolean
  notificacion1dia: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MantenimientoProgramadoWithEquipo extends MantenimientoProgramado {
  equipo: {
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
    colaborador?: {
      id: string
      nombre: string
      apellido: string
    } | null
  }
}

// For calendar display
export interface EventoCalendario {
  id: string
  title: string
  start: Date
  end: Date
  tipo: TipoMantenimiento
  estado: EstadoMantenimientoProgramado
  equipo: {
    marca: string
    modelo: string
    serial: string
  }
}
