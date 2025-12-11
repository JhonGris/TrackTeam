/**
 * Shared types for Equipos module
 * Centralized type definitions to avoid duplication
 */

export type TipoEquipo = 'Desktop' | 'Portátil'
export type EstadoSalud = 'Bueno' | 'Regular' | 'Malo'
export type EstadoOperativo = 'Activo' | 'En Reparación' | 'Descontinuado' | 'En Garantía'

// Tipos para detalles JSON
export interface RamModule {
  slot: string
  capacidad: number // GB
  tipo: string // DDR3, DDR4, DDR5
  velocidad: string // MHz
}

export interface DiscoDetalle {
  tipo: string // SSD, HDD, NVMe
  capacidad: number // GB
  interfaz: string // SATA, NVMe, M.2
  salud: string // Porcentaje o estado
}

export interface GpuDetalle {
  modelo: string
  memoria: number // GB
  tipo: string // Integrada, Dedicada
}

export interface ArchivoEquipo {
  id: string
  nombre: string
  tipo: string
  tamanio: number
  ruta: string
  esImagen: boolean
  descripcion?: string | null
  createdAt: string
}

export interface Equipo {
  id: string
  serial: string
  marca: string
  modelo: string
  tipo: TipoEquipo
  procesador: string
  ram: number
  almacenamiento: string
  gpu: string
  estadoSalud: EstadoSalud
  estado: EstadoOperativo
  fechaAdquisicion: Date
  colaboradorId: string | null
  // Campos detallados opcionales
  ramDetalle?: string | null
  discosDetalle?: string | null
  gpuDetalle?: string | null
  almacenamientoTipo?: string | null
  almacenamientoGb?: number | null
  tarjetaVideo?: string | null
  pantallas?: number
  resolucionPantalla?: string | null
  tieneTeclado?: boolean
  tieneMouse?: boolean
  otrosPeriferico?: string | null
  fechaGarantia?: Date | null
  departamento?: string | null
  ubicacion?: string | null
  observaciones?: string | null
}

export interface EquipoWithRelations extends Equipo {
  colaborador: {
    id: string
    nombre: string
    apellido: string
    cargo: string
  } | null
  _count: {
    servicios: number
  }
  archivos?: ArchivoEquipo[]
}

// Helper functions para parsear JSON
export function parseRamDetalle(ramDetalle: string | null | undefined): RamModule[] {
  if (!ramDetalle) return []
  try {
    return JSON.parse(ramDetalle)
  } catch {
    return []
  }
}

export function parseDiscosDetalle(discosDetalle: string | null | undefined): DiscoDetalle[] {
  if (!discosDetalle) return []
  try {
    return JSON.parse(discosDetalle)
  } catch {
    return []
  }
}

export function parseGpuDetalle(gpuDetalle: string | null | undefined): GpuDetalle | null {
  if (!gpuDetalle) return null
  try {
    return JSON.parse(gpuDetalle)
  } catch {
    return null
  }
}
