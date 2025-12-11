// TrackTeam - Tipos para el módulo de Inventario de Repuestos

export type CategoriaRepuesto = {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    repuestos: number
  }
}

export type Repuesto = {
  id: string
  numero: number // Número consecutivo 000, 001, 002...
  nombre: string
  descripcion: string | null
  fotoUrl: string | null // URL/ruta de la foto del repuesto
  categoriaId: string | null
  categoria?: CategoriaRepuesto | null
  cantidad: number
  cantidadMinima: number
  unidad: string
  ubicacion: string | null
  proveedor: string | null
  asignadoA: string | null // Persona o área asignada
  codigoInterno: string | null
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export type RepuestoConCategoria = Repuesto & {
  categoria: CategoriaRepuesto | null
}

export type MovimientoRepuesto = {
  id: string
  repuestoId: string
  repuesto?: Repuesto
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  cantidadAnterior: number
  cantidadNueva: number
  motivo: string | null
  referencia: string | null
  colaboradorId: string | null
  notificacionEnviada: boolean
  createdAt: Date
}

export type UsoRepuesto = {
  id: string
  repuestoId: string
  repuesto?: Repuesto
  servicioTecnicoId: string
  cantidad: number
  notas: string | null
  createdAt: Date
}

// Input types para formularios
export type RepuestoCreateInput = {
  nombre: string
  descripcion?: string
  categoriaId?: string
  cantidad: number
  cantidadMinima: number
  unidad: string
  ubicacion?: string
  proveedor?: string
  asignadoA?: string
  codigoInterno?: string
}

export type RepuestoUpdateInput = Partial<RepuestoCreateInput>

export type CategoriaRepuestoCreateInput = {
  nombre: string
  descripcion?: string
  color?: string
}

export type MovimientoCreateInput = {
  repuestoId: string
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  motivo?: string
  referencia?: string
}

// Estadísticas del inventario
export type InventarioStats = {
  totalRepuestos: number
  repuestosActivos: number
  repuestosStockBajo: number
  totalCategorias: number
  movimientosRecientes: number
}
