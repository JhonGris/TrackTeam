'use client'

import { useState, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { MainLayout } from '@/components/layout/main-layout'
import { ContentLayout } from '@/components/ui/content-layout'
import { Button } from '@/components/ui/button'
import { NuevoReporteDialog } from '@/components/reportes/nuevo-reporte-dialog'
import { useInventario } from '@/contexts/InventarioContext'
import { generarPDF } from '@/lib/reportes/generador-pdf'
import { generarExcel } from '@/lib/reportes/generador-excel'

// Lazy loading de gráficos pesados
const EquiposPorTipoChart = dynamic(
  () => import('@/components/reportes/equipos-por-tipo-chart').then(mod => ({ default: mod.EquiposPorTipoChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
)

const EquiposPorDepartamentoChart = dynamic(
  () => import('@/components/reportes/equipos-por-departamento-chart').then(mod => ({ default: mod.EquiposPorDepartamentoChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
)

const ServiciosPorMesChart = dynamic(
  () => import('@/components/reportes/servicios-por-mes-chart').then(mod => ({ default: mod.ServiciosPorMesChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
)
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Monitor, 
  Wrench, 
  Users, 
  DollarSign,
  Search,
  Eye,
  Plus,
  Activity,
  PieChart,
  TrendingDown
} from 'lucide-react'

export default function ReportesPage() {
  const { equipos, usuarios, servicios } = useInventario()
  
  // Funciones para generar reportes
  const handleGenerarReporte = (id: number, tipo: 'PDF' | 'Excel') => {
    switch (id) {
      case 1: // Inventario Completo
        if (tipo === 'PDF') {
          generarPDF.inventarioCompleto(equipos);
        } else {
          generarExcel.inventarioCompleto(equipos);
        }
        break;
      case 2: // Equipos por Departamento
        if (tipo === 'PDF') {
          generarPDF.equiposPorDepartamento(equipos, usuarios);
        } else {
          generarExcel.equiposPorDepartamento(equipos, usuarios);
        }
        break;
      case 3: // Servicios Técnicos
        if (tipo === 'PDF') {
          generarPDF.serviciosTecnicos(servicios);
        } else {
          generarExcel.serviciosTecnicos(servicios);
        }
        break;
      case 4: // Análisis de Costos
        generarExcel.analisisCostos(servicios);
        break;
      default:
        alert('Reporte en desarrollo');
    }
  };
  
  // Datos de reportes disponibles
  const reportesDisponibles = [
    {
      id: 1,
      titulo: 'Inventario Completo',
      descripcion: 'Listado completo de todos los equipos registrados con especificaciones técnicas detalladas',
      tipo: 'PDF',
      ultimaGeneracion: new Date().toISOString().split('T')[0],
      tamano: `${equipos.length} equipos`,
      categoria: 'Inventario',
      icono: Monitor,
      tipoAlt: 'Excel'
    },
    {
      id: 2,
      titulo: 'Equipos por Departamento',
      descripcion: 'Distribución de equipos asignados organizados por departamento y usuario responsable',
      tipo: 'Excel',
      ultimaGeneracion: new Date().toISOString().split('T')[0],
      tamano: `${usuarios.length} usuarios`,
      categoria: 'Inventario',
      icono: Users,
      tipoAlt: 'PDF'
    },
    {
      id: 3,
      titulo: 'Servicios Técnicos del Mes',
      descripcion: 'Detalle completo de todos los servicios de mantenimiento realizados',
      tipo: 'PDF',
      ultimaGeneracion: new Date().toISOString().split('T')[0],
      tamano: `${servicios.length} servicios`,
      categoria: 'Servicios',
      icono: Wrench,
      tipoAlt: 'Excel'
    },
    {
      id: 4,
      titulo: 'Análisis de Costos',
      descripcion: 'Reporte financiero de gastos en mantenimiento, reparaciones y upgrades por período',
      tipo: 'Excel',
      ultimaGeneracion: new Date().toISOString().split('T')[0],
      tamano: `${servicios.length} registros`,
      categoria: 'Financiero',
      icono: DollarSign,
      tipoAlt: undefined
    }
  ]

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [nuevoReporteDialog, setNuevoReporteDialog] = useState(false)

  // Filtrar reportes (memoizado)
  const reportesFiltrados = useMemo(() => 
    reportesDisponibles.filter(reporte => {
      const matchesSearch = !searchQuery || 
        reporte.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reporte.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategoria = filterCategoria === 'todos' || reporte.categoria === filterCategoria
      const matchesTipo = filterTipo === 'todos' || reporte.tipo === filterTipo
      
      return matchesSearch && matchesCategoria && matchesTipo
    }), [reportesDisponibles, searchQuery, filterCategoria, filterTipo]
  )

  // Estadísticas calculadas desde datos reales (memoizadas para rendimiento)
  const stats = useMemo(() => ({
    equiposTotales: equipos.length,
    equiposActivos: equipos.filter(e => e.estado === 'Activo').length,
    usuariosActivos: usuarios.filter(u => u.estado === 'activo').length,
    serviciosEstesMes: servicios.length,
    costoTotalServicios: servicios.reduce((total, s) => total + (s.costoReparacion || 0), 0),
    reportesDisponibles: reportesDisponibles.length
  }), [equipos, usuarios, servicios, reportesDisponibles.length])

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Inventario':
        return 'bg-blue-100 text-blue-800'
      case 'Servicios':
        return 'bg-green-100 text-green-800'
      case 'Financiero':
        return 'bg-purple-100 text-purple-800'
      case 'Ejecutivo':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return 'status-badge status-badge--error'
      case 'Excel':
        return 'status-badge status-badge--success'
      default:
        return 'status-badge'
    }
  }
  return (
    <MainLayout>
      <ContentLayout>
        <div className="page-header-section">
          <h1 className="page-title">Reportes y Analytics</h1>
          <p className="page-description">Generación y descarga de reportes del sistema de inventario</p>
          <div className="mt-4">
            <Button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setNuevoReporteDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="improved-card">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar reportes por título o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <ModalSelect value={filterCategoria} onValueChange={setFilterCategoria}>
                  <ModalSelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <ModalSelectValue placeholder="Categoría" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todas</ModalSelectItem>
                    <ModalSelectItem value="Inventario">Inventario</ModalSelectItem>
                    <ModalSelectItem value="Servicios">Servicios</ModalSelectItem>
                    <ModalSelectItem value="Financiero">Financiero</ModalSelectItem>
                    <ModalSelectItem value="Ejecutivo">Ejecutivo</ModalSelectItem>
                  </ModalSelectContent>
                </ModalSelect>

                <ModalSelect value={filterTipo} onValueChange={setFilterTipo}>
                  <ModalSelectTrigger className="w-[120px]">
                    <ModalSelectValue placeholder="Formato" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todos</ModalSelectItem>
                    <ModalSelectItem value="PDF">PDF</ModalSelectItem>
                    <ModalSelectItem value="Excel">Excel</ModalSelectItem>
                  </ModalSelectContent>
                </ModalSelect>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas del Sistema */}
        <div className="stats-grid" style={{
          '--stats-columns': '4'
        } as React.CSSProperties}>
          <div className="stat-card">
            <div className="stat-card__icon">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.equiposTotales}</div>
              <div className="stat-card__label">Total Equipos</div>
              <div className="stat-card__subtitle">
                {stats.equiposActivos} activos
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <Users className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.usuariosActivos}</div>
              <div className="stat-card__label">Usuarios Activos</div>
              <div className="stat-card__subtitle">
                Con equipos asignados
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card--info">
            <div className="stat-card__icon">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.serviciosEstesMes}</div>
              <div className="stat-card__label">Servicios Registrados</div>
              <div className="stat-card__subtitle">
                En el sistema
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__icon">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.reportesDisponibles}</div>
              <div className="stat-card__label">Reportes Disponibles</div>
              <div className="stat-card__subtitle">
                Para descarga
              </div>
            </div>
          </div>
        </div>

        {/* Dashboards con Gráficos */}
        <div className="improved-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dashboards Analíticos</h2>
                <p className="text-gray-600">Visualización de datos en tiempo real</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <Suspense fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-full bg-gray-100 rounded"></div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-full bg-gray-100 rounded"></div>
                </div>
              </div>
            }>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <EquiposPorTipoChart equipos={equipos} />
                <EquiposPorDepartamentoChart equipos={equipos} usuarios={usuarios} />
              </div>
            </Suspense>
            
            {servicios.length > 0 && (
              <Suspense fallback={
                <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-full bg-gray-100 rounded"></div>
                </div>
              }>
                <div className="grid grid-cols-1 gap-6">
                  <ServiciosPorMesChart servicios={servicios} />
                </div>
              </Suspense>
            )}
          </div>
        </div>

        {/* Lista de Reportes Disponibles */}
        <div className="improved-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Reportes Disponibles</h2>
                <p className="text-gray-600">{reportesFiltrados.length} de {reportesDisponibles.length} reportes encontrados</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid gap-6">
              {reportesFiltrados.map((reporte) => {
                const IconoReporte = reporte.icono
                return (
                  <div key={reporte.id} className="improved-card">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                        <IconoReporte className="h-7 w-7 text-blue-700" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{reporte.titulo}</h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{reporte.descripcion}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-gray-900">{reporte.tamano}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(reporte.ultimaGeneracion).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <span className={getTipoColor(reporte.tipo)}>
                            {reporte.tipo}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(reporte.categoria)}`}>
                            {reporte.categoria}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Actualizado hace {Math.floor((Date.now() - new Date(reporte.ultimaGeneracion).getTime()) / (1000 * 60 * 60 * 24))} días</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {reporte.tipoAlt && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGenerarReporte(reporte.id, reporte.tipoAlt as 'PDF' | 'Excel')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar {reporte.tipoAlt}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleGenerarReporte(reporte.id, reporte.tipo as 'PDF' | 'Excel')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar {reporte.tipo}
                      </Button>
                    </div>
                  </div>
                )
              })}
              
              {reportesFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron reportes</h3>
                  <p>No hay reportes que coincidan con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generadores Rápidos */}
        <div className="improved-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Generadores Rápidos</h2>
                <p className="text-gray-600">Crea reportes personalizados al instante</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center gap-3 text-center hover:bg-blue-50 hover:border-blue-300"
                onClick={() => generarPDF.inventarioCompleto(equipos)}
              >
                <Monitor className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">Inventario Completo</div>
                  <div className="text-xs text-gray-500">PDF con todos los equipos</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center gap-3 text-center hover:bg-green-50 hover:border-green-300"
                onClick={() => generarPDF.serviciosTecnicos(servicios)}
              >
                <Wrench className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-900">Servicios Técnicos</div>
                  <div className="text-xs text-gray-500">Reporte de servicios</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center gap-3 text-center hover:bg-purple-50 hover:border-purple-300"
                onClick={() => generarExcel.equiposPorDepartamento(equipos, usuarios)}
              >
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-900">Por Departamento</div>
                  <div className="text-xs text-gray-500">Excel por departamento</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center gap-3 text-center hover:bg-orange-50 hover:border-orange-300"
                onClick={() => generarExcel.analisisCostos(servicios)}
              >
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="font-semibold text-gray-900">Análisis de Costos</div>
                  <div className="text-xs text-gray-500">Reporte financiero</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center gap-3 text-center hover:bg-indigo-50 hover:border-indigo-300"
                onClick={() => generarExcel.inventarioCompleto(equipos)}
              >
                <Calendar className="h-8 w-8 text-indigo-600" />
                <div>
                  <div className="font-semibold text-gray-900">Inventario Excel</div>
                  <div className="text-xs text-gray-500">Hojas múltiples</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center gap-3 text-center hover:bg-cyan-50 hover:border-cyan-300"
                onClick={() => generarExcel.serviciosTecnicos(servicios)}
              >
                <BarChart3 className="h-8 w-8 text-cyan-600" />
                <div>
                  <div className="font-semibold text-gray-900">Servicios Excel</div>
                  <div className="text-xs text-gray-500">Con estadísticas</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="improved-card bg-blue-50 border-blue-200">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Información sobre reportes</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Los reportes se actualizan automáticamente cada noche</li>
                  <li>• Los formatos PDF son ideales para presentaciones y archivo</li>
                  <li>• Los formatos Excel permiten análisis y filtrado de datos</li>
                  <li>• Los generadores rápidos crean reportes con datos en tiempo real</li>
                  <li>• Todos los reportes incluyen marca de tiempo y metadatos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>

      {/* Dialog para nuevo reporte */}
      <NuevoReporteDialog 
        open={nuevoReporteDialog}
        onOpenChange={setNuevoReporteDialog}
      />
    </MainLayout>
  )
}