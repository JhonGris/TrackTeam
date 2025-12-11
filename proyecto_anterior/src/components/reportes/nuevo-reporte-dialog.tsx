'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useInventario } from '@/contexts/InventarioContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { X, FileText, Download, Calendar, Filter, BarChart3 } from 'lucide-react'

interface NuevoReporteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevoReporteDialog({ open, onOpenChange }: NuevoReporteDialogProps) {
  const { equipos, usuarios, servicios } = useInventario()

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    tipoReporte: '',
    formato: 'PDF',
    incluirFechas: false,
    fechaInicio: '',
    fechaFin: '',
    filtros: {
      departamento: 'todos',
      estado: 'todos',
      tipoServicio: 'todos'
    }
  })

  // Estados de generación
  const [isGenerating, setIsGenerating] = useState(false)
  const [reporteGenerado, setReporteGenerado] = useState<{
    url: string
    tamano: string
    tiempo: string
  } | null>(null)

  // Opciones de tipos de reporte
  const tiposReporte = [
    { value: 'inventario-completo', label: 'Inventario Completo', descripcion: 'Todos los equipos con especificaciones' },
    { value: 'equipos-por-departamento', label: 'Equipos por Departamento', descripcion: 'Distribución por departamentos' },
    { value: 'servicios-periodo', label: 'Servicios por Período', descripcion: 'Servicios en rango de fechas' },
    { value: 'analisis-costos', label: 'Análisis de Costos', descripcion: 'Gastos y presupuestos' },
    { value: 'usuarios-activos', label: 'Usuarios Activos', descripcion: 'Lista de usuarios con equipos' },
    { value: 'equipos-disponibles', label: 'Equipos Disponibles', descripcion: 'Equipos sin asignar' },
    { value: 'historial-asignaciones', label: 'Historial de Asignaciones', descripcion: 'Movimientos de equipos' },
    { value: 'personalizado', label: 'Reporte Personalizado', descripcion: 'Configurar campos específicos' }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFiltroChange = (filtro: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      filtros: {
        ...prev.filtros,
        [filtro]: value
      }
    }))
  }

  const getDescripcionReporte = () => {
    const tipo = tiposReporte.find(t => t.value === formData.tipoReporte)
    return tipo?.descripcion || 'Selecciona un tipo de reporte'
  }

  const generarTituloAutomatico = () => {
    const tipo = tiposReporte.find(t => t.value === formData.tipoReporte)
    if (tipo) {
      const fecha = new Date().toLocaleDateString('es-ES')
      return `${tipo.label} - ${fecha}`
    }
    return ''
  }

  const calcularDatosReporte = () => {
    switch (formData.tipoReporte) {
      case 'inventario-completo':
        return { registros: equipos.length, paginas: Math.ceil(equipos.length / 20) }
      case 'equipos-por-departamento':
        const departamentos = [...new Set(usuarios.map(u => u.departamento))]
        return { registros: departamentos.length, paginas: Math.ceil(departamentos.length / 10) }
      case 'servicios-periodo':
        return { registros: servicios.length, paginas: Math.ceil(servicios.length / 15) }
      case 'usuarios-activos':
        const usuariosActivos = usuarios.filter(u => u.estado === 'activo')
        return { registros: usuariosActivos.length, paginas: Math.ceil(usuariosActivos.length / 25) }
      default:
        return { registros: 0, paginas: 1 }
    }
  }

  const handleGenerar = async () => {
    if (!formData.tipoReporte) return

    setIsGenerating(true)
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const datos = calcularDatosReporte()
      const tamanoMB = (datos.registros * 0.05 + Math.random() * 0.5).toFixed(1)
      
      setReporteGenerado({
        url: `/reportes/${formData.tipoReporte}-${Date.now()}.${formData.formato.toLowerCase()}`,
        tamano: `${tamanoMB} MB`,
        tiempo: new Date().toLocaleTimeString('es-ES')
      })
      
    } catch (error) {
      console.error('Error generando reporte:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDescargar = () => {
    if (reporteGenerado) {
      // Simular descarga
      const link = document.createElement('a')
      link.href = '#'
      link.download = `${formData.titulo || 'reporte'}.${formData.formato.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cerrar modal después de descargar
      setTimeout(() => {
        onOpenChange(false)
        setReporteGenerado(null)
        setFormData({
          titulo: '',
          tipoReporte: '',
          formato: 'PDF',
          incluirFechas: false,
          fechaInicio: '',
          fechaFin: '',
          filtros: {
            departamento: 'todos',
            estado: 'todos',
            tipoServicio: 'todos'
          }
        })
      }, 1000)
    }
  }

  // Auto-generar título cuando se selecciona tipo
  useEffect(() => {
    if (formData.tipoReporte && !formData.titulo) {
      setFormData(prev => ({
        ...prev,
        titulo: generarTituloAutomatico()
      }))
    }
  }, [formData.tipoReporte])

  // Efecto para bloquear scroll del body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (typeof window === 'undefined' || !open) {
    return null
  }

  return createPortal(
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChange(false)}
          className="modal-close-button"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="pb-4 border-b border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Generar Nuevo Reporte</h2>
          <p className="text-gray-600 mt-1">
            Configura y genera reportes personalizados del sistema
          </p>
        </div>

        {!reporteGenerado ? (
          <form onSubmit={(e) => { e.preventDefault(); handleGenerar() }} className="space-y-6">
            {/* Información básica */}
            <div className="modal-form-section">
              <h3>
                <FileText className="h-4 w-4" />
                Información del Reporte
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipoReporte">Tipo de Reporte *</Label>
                  <ModalSelect 
                    value={formData.tipoReporte} 
                    onValueChange={(value) => handleInputChange('tipoReporte', value)}
                  >
                    <ModalSelectTrigger>
                      <ModalSelectValue placeholder="Seleccionar tipo de reporte" />
                    </ModalSelectTrigger>
                    <ModalSelectContent>
                      {tiposReporte.map(tipo => (
                        <ModalSelectItem key={tipo.value} value={tipo.value}>
                          <div>
                            <div className="font-medium">{tipo.label}</div>
                            <div className="text-xs text-gray-500">{tipo.descripcion}</div>
                          </div>
                        </ModalSelectItem>
                      ))}
                    </ModalSelectContent>
                  </ModalSelect>
                  {formData.tipoReporte && (
                    <p className="text-sm text-gray-600 mt-1">
                      {getDescripcionReporte()}
                    </p>
                  )}
                </div>

                <div className="modal-form-grid">
                  <div>
                    <Label htmlFor="titulo">Título del Reporte</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Nombre descriptivo del reporte"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formato">Formato de Salida</Label>
                    <ModalSelect 
                      value={formData.formato} 
                      onValueChange={(value) => handleInputChange('formato', value)}
                    >
                      <ModalSelectTrigger>
                        <ModalSelectValue />
                      </ModalSelectTrigger>
                      <ModalSelectContent>
                        <ModalSelectItem value="PDF">PDF (Presentación)</ModalSelectItem>
                        <ModalSelectItem value="Excel">Excel (Análisis de datos)</ModalSelectItem>
                      </ModalSelectContent>
                    </ModalSelect>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de filtros */}
            <div className="modal-form-section">
              <h3>
                <Filter className="h-4 w-4" />
                Filtros y Configuración
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirFechas"
                    checked={formData.incluirFechas}
                    onChange={(e) => handleInputChange('incluirFechas', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="incluirFechas" className="text-sm font-medium text-gray-700">
                    Filtrar por rango de fechas
                  </Label>
                </div>

                {formData.incluirFechas && (
                  <div className="modal-form-grid">
                    <div>
                      <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaFin">Fecha de Fin</Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="modal-form-grid">
                  <div>
                    <Label>Departamento</Label>
                    <ModalSelect 
                      value={formData.filtros.departamento} 
                      onValueChange={(value) => handleFiltroChange('departamento', value)}
                    >
                      <ModalSelectTrigger>
                        <ModalSelectValue />
                      </ModalSelectTrigger>
                      <ModalSelectContent>
                        <ModalSelectItem value="todos">Todos los departamentos</ModalSelectItem>
                        <ModalSelectItem value="Diseñador Gráfico">Diseñador Gráfico</ModalSelectItem>
                        <ModalSelectItem value="Copy">Copy</ModalSelectItem>
                        <ModalSelectItem value="Project Manager">Project Manager</ModalSelectItem>
                        <ModalSelectItem value="Administrativo">Administrativo</ModalSelectItem>
                        <ModalSelectItem value="Logistica">Logistica</ModalSelectItem>
                        <ModalSelectItem value="Motion Graphics">Motion Graphics</ModalSelectItem>
                        <ModalSelectItem value="Desarrollador">Desarrollador</ModalSelectItem>
                        <ModalSelectItem value="Gerencia">Gerencia</ModalSelectItem>
                        <ModalSelectItem value="KAM">KAM</ModalSelectItem>
                      </ModalSelectContent>
                    </ModalSelect>
                  </div>

                  <div>
                    <Label>Estado de Equipos</Label>
                    <ModalSelect 
                      value={formData.filtros.estado} 
                      onValueChange={(value) => handleFiltroChange('estado', value)}
                    >
                      <ModalSelectTrigger>
                        <ModalSelectValue />
                      </ModalSelectTrigger>
                      <ModalSelectContent>
                        <ModalSelectItem value="todos">Todos los estados</ModalSelectItem>
                        <ModalSelectItem value="Activo">Activo</ModalSelectItem>
                        <ModalSelectItem value="Disponible">Disponible</ModalSelectItem>
                        <ModalSelectItem value="Mantenimiento">Mantenimiento</ModalSelectItem>
                        <ModalSelectItem value="Retirado">Retirado</ModalSelectItem>
                      </ModalSelectContent>
                    </ModalSelect>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa de datos */}
            {formData.tipoReporte && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">Vista Previa del Reporte</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Registros estimados:</span>
                    <span className="ml-2 font-semibold">{calcularDatosReporte().registros}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Páginas aproximadas:</span>
                    <span className="ml-2 font-semibold">{calcularDatosReporte().paginas}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Formato:</span>
                    <span className="ml-2 font-semibold">{formData.formato}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tamaño estimado:</span>
                    <span className="ml-2 font-semibold">{(calcularDatosReporte().registros * 0.05).toFixed(1)} MB</span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-form-actions">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.tipoReporte || isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Reporte Generado Exitosamente!</h3>
            <p className="text-gray-600 mb-6">
              Tu reporte "{formData.titulo}" está listo para descargar
            </p>
            
            <div className="bg-gray-50 rounded-md p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Archivo:</span>
                  <span className="ml-2 font-medium">{formData.titulo}.{formData.formato.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tamaño:</span>
                  <span className="ml-2 font-medium">{reporteGenerado.tamano}</span>
                </div>
                <div>
                  <span className="text-gray-600">Generado:</span>
                  <span className="ml-2 font-medium">{reporteGenerado.tiempo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Formato:</span>
                  <span className="ml-2 font-medium">{formData.formato}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cerrar
              </Button>
              <Button onClick={handleDescargar} className="flex-1 bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}