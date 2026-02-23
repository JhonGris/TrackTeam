import * as XLSX from 'xlsx'

// ============================================================================
// EXPORT UTILITIES - Excel/CSV Generation
// ============================================================================

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Datos'
): void {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Auto-size columns
  const colWidths = calculateColumnWidths(data)
  worksheet['!cols'] = colWidths
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  // Generate and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' })
}

/**
 * Calculate optimal column widths based on content
 */
function calculateColumnWidths<T extends Record<string, unknown>>(
  data: T[]
): { wch: number }[] {
  if (data.length === 0) return []
  
  const keys = Object.keys(data[0])
  return keys.map((key) => {
    // Get max length of column header and all values
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => {
        const value = row[key]
        return String(value ?? '').length
      })
    )
    // Add some padding, max 50 chars
    return { wch: Math.min(maxLength + 2, 50) }
  })
}

// ============================================================================
// DATA FORMATTERS - Transform DB data to export format
// ============================================================================

/**
 * Format equipment data for export
 */
export function formatEquiposForExport(equipos: EquipoExportData[]): Record<string, unknown>[] {
  return equipos.map((equipo) => ({
    'Serial': equipo.serial,
    'Tipo': equipo.tipo,
    'Marca': equipo.marca,
    'Modelo': equipo.modelo,
    'Procesador': equipo.procesador || '',
    'RAM (GB)': equipo.ram || '',
    'Almacenamiento': equipo.almacenamiento || '',
    'GPU': equipo.gpu || '',
    'Estado de Salud': equipo.estadoSalud,
    'Estado': equipo.estado || 'Activo',
    'Colaborador': equipo.colaborador 
      ? `${equipo.colaborador.nombre} ${equipo.colaborador.apellido}`
      : 'Sin asignar',
    'Departamento': equipo.departamento || '',
    'Ubicación': equipo.ubicacion || '',
    'Fecha Adquisición': equipo.fechaAdquisicion 
      ? formatDate(equipo.fechaAdquisicion)
      : '',
    'Fecha Garantía': equipo.fechaGarantia
      ? formatDate(equipo.fechaGarantia)
      : '',
    'Observaciones': equipo.observaciones || '',
  }))
}

/**
 * Format services/maintenance data for export
 */
export function formatServiciosForExport(servicios: ServicioExportData[]): Record<string, unknown>[] {
  return servicios.map((servicio) => ({
    'Fecha': formatDate(servicio.fechaServicio),
    'Tipo': servicio.tipo,
    'Equipo': servicio.equipo 
      ? `${servicio.equipo.marca} ${servicio.equipo.modelo}`
      : '',
    'Serial': servicio.equipo?.serial || '',
    'Colaborador': servicio.equipo?.colaborador
      ? `${servicio.equipo.colaborador.nombre} ${servicio.equipo.colaborador.apellido}`
      : 'Sin asignar',
    'Problemas': servicio.problemas,
    'Soluciones': servicio.soluciones,
    'Tiempo (min)': servicio.tiempoInvertido,
    'Estado Resultante': servicio.estadoResultante,
  }))
}

const DOTACION_LABELS: Record<string, string> = {
  basePortatil: 'Base Portátil',
  audifonos: 'Audífonos',
  apoyaPies: 'Apoya Pies',
  escritorio: 'Escritorio',
  sillaErgonomica: 'Silla Ergonómica',
  camara: 'Cámara',
  microfono: 'Micrófono',
}

/**
 * Format collaborators data for export (all fields)
 */
export function formatColaboradoresForExport(colaboradores: ColaboradorExportData[]): Record<string, unknown>[] {
  return colaboradores.map((colab) => {
    // Parse dotacion
    const dotacion = colab.dotacionJson ? JSON.parse(colab.dotacionJson) : {}
    const dotacionEntregada = Object.entries(DOTACION_LABELS)
      .filter(([key]) => dotacion[key] === true)
      .map(([, label]) => label)
      .join(', ')

    // Format equipos
    const equiposTexto = (colab.equipos ?? []).map(e => 
      `${e.marca} ${e.modelo} (${e.serial}) - ${e.tipo} - ${e.estadoSalud}`
    ).join(' | ')

    // Format inventario (agrupar por repuesto)
    const inventarioMap = new Map<string, { nombre: string; cantidad: number }>()
    for (const mov of colab.movimientosRepuestos ?? []) {
      const key = mov.repuesto.id
      const existing = inventarioMap.get(key)
      if (existing) {
        existing.cantidad += Math.abs(mov.cantidad)
      } else {
        inventarioMap.set(key, { nombre: mov.repuesto.nombre, cantidad: Math.abs(mov.cantidad) })
      }
    }
    const inventarioTexto = Array.from(inventarioMap.values())
      .map(i => i.cantidad > 1 ? `${i.nombre} ×${i.cantidad}` : i.nombre)
      .join(', ')

    return {
      'Nombre': colab.nombre,
      'Apellido': colab.apellido,
      'Cédula': colab.cedula || '',
      'Cargo': colab.cargo,
      'Email': colab.email,
      'Dirección': colab.direccion || '',
      'Ciudad': colab.ciudad || '',
      'Equipos Asignados': equiposTexto || 'Ninguno',
      'Nº Equipos': colab._count?.equipos || 0,
      'Inventario Asignado': inventarioTexto || 'Ninguno',
      'Dotación Entregada': dotacionEntregada || 'Ninguna',
      'Observaciones': colab.observaciones || '',
      'Documentos': colab._count?.archivos || 0,
      'Eventos Historial': colab._count?.historial || 0,
    }
  })
}

/**
 * Format inventory/repuestos data for export
 */
export function formatRepuestosForExport(repuestos: RepuestoExportData[]): Record<string, unknown>[] {
  return repuestos.map((rep) => ({
    'N°': String(rep.numero).padStart(3, '0'),
    'Nombre': rep.nombre,
    'Descripción': rep.descripcion || '',
    'Categoría': rep.categoria?.nombre || 'Sin categoría',
    'Cantidad': rep.cantidad,
    'Cantidad Mínima': rep.cantidadMinima,
    'Unidad': rep.unidad,
    'Ubicación': rep.ubicacion || '',
    'Proveedor': rep.proveedor || '',
    'Asignado a': rep.asignadoA || '',
    'Código Interno': rep.codigoInterno || '',
    'Estado': rep.activo ? 'Activo' : 'Inactivo',
  }))
}

/**
 * Format date for export
 */
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ============================================================================
// TYPES
// ============================================================================

export type EquipoExportData = {
  serial: string
  tipo: string
  marca: string
  modelo: string
  procesador?: string | null
  ram?: number | null
  almacenamiento?: string | null
  gpu?: string | null
  estadoSalud: string
  estado?: string | null
  departamento?: string | null
  ubicacion?: string | null
  fechaAdquisicion?: Date | null
  fechaGarantia?: Date | null
  observaciones?: string | null
  colaborador?: {
    nombre: string
    apellido: string
  } | null
}

export type ServicioExportData = {
  fechaServicio: Date
  tipo: string
  problemas: string
  soluciones: string
  tiempoInvertido: number
  estadoResultante: string
  equipo?: {
    serial: string
    marca: string
    modelo: string
    colaborador?: {
      nombre: string
      apellido: string
    } | null
  } | null
}

export type ColaboradorExportData = {
  nombre: string
  apellido: string
  cargo: string
  email: string
  cedula?: string | null
  direccion?: string | null
  ciudad?: string | null
  dotacionJson?: string | null
  observaciones?: string | null
  _count?: {
    equipos: number
    archivos: number
    historial: number
  }
  equipos?: Array<{
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
    estadoSalud: string
    estado: string
  }>
  movimientosRepuestos?: Array<{
    id: string
    cantidad: number
    repuesto: {
      id: string
      nombre: string
    }
  }>
}

export type RepuestoExportData = {
  numero: number
  nombre: string
  descripcion?: string | null
  cantidad: number
  cantidadMinima: number
  unidad: string
  ubicacion?: string | null
  proveedor?: string | null
  asignadoA?: string | null
  codigoInterno?: string | null
  activo: boolean
  categoria?: {
    nombre: string
  } | null
}
