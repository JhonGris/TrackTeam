'use client'

import { useState } from 'react'
import { useInventario, type Servicio } from '@/contexts/InventarioContext'
import { NuevoServicioDialog } from '@/components/servicios/nuevo-servicio-dialog'
import { MainLayout } from '@/components/layout/main-layout'
import { ContentLayout } from '@/components/ui/content-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { 
  Wrench, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  Monitor, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Edit,
  Eye,
  FileText,
  Camera
} from 'lucide-react'

export default function ServiciosPage() {
  const { servicios, isLoading } = useInventario()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')

  // Mostrar loading si está cargando
  if (isLoading) {
    return (
      <MainLayout>
        <ContentLayout>
          <PageHeader title="Servicios" />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          </div>
        </ContentLayout>
      </MainLayout>
    )
  }

  // Filtrar servicios (con protección para undefined)
  const serviciosFiltrados = (servicios || []).filter((servicio: Servicio) => {
    const matchesSearch = !searchQuery || 
      servicio.equipoSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.equipoMarca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.equipoModelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.tecnico.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.diagnostico.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTipo = filterTipo === 'todos' || servicio.tipo === filterTipo
    const matchesEstado = filterEstado === 'todos' || servicio.estado === filterEstado
    
    return matchesSearch && matchesTipo && matchesEstado
  })

  // Estadísticas
  const stats = {
    total: servicios.length,
    completados: servicios.filter(s => s.estado === 'Completado').length,
    enProgreso: servicios.filter(s => s.estado === 'En Progreso').length,
    pendientes: servicios.filter(s => s.estado === 'Pendiente').length,
    costoTotal: servicios.reduce((total, s) => total + s.costo, 0),
    correctivos: servicios.filter(s => s.tipo === 'Correctivo').length,
    preventivos: servicios.filter(s => s.tipo === 'Preventivo').length
  }

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'status-badge status-badge--success'
      case 'En Progreso':
        return 'status-badge status-badge--info'
      case 'Pendiente':
        return 'status-badge status-badge--warning'
      default:
        return 'status-badge'
    }
  }

  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Correctivo':
        return 'status-badge status-badge--error'
      case 'Preventivo':
        return 'status-badge status-badge--success'
      case 'Instalación/Upgrade':
        return 'status-badge status-badge--info'
      default:
        return 'status-badge'
    }
  }

  return (
    <MainLayout>
      <ContentLayout>
        <div className="page-header-section">
          <h1 className="page-title">Servicio Técnico</h1>
          <p className="page-description">Gestión de servicios de mantenimiento, reparaciones y upgrades</p>
          <div className="mt-4">
            <NuevoServicioDialog />
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
                  placeholder="Buscar por serial, marca, técnico o diagnóstico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <ModalSelect value={filterTipo} onValueChange={setFilterTipo}>
                  <ModalSelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <ModalSelectValue placeholder="Tipo" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todos los tipos</ModalSelectItem>
                    <ModalSelectItem value="Correctivo">Correctivo</ModalSelectItem>
                    <ModalSelectItem value="Preventivo">Preventivo</ModalSelectItem>
                    <ModalSelectItem value="Instalación/Upgrade">Instalación/Upgrade</ModalSelectItem>
                  </ModalSelectContent>
                </ModalSelect>

                <ModalSelect value={filterEstado} onValueChange={setFilterEstado}>
                  <ModalSelectTrigger className="w-[150px]">
                    <ModalSelectValue placeholder="Estado" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todos los estados</ModalSelectItem>
                    <ModalSelectItem value="Completado">Completado</ModalSelectItem>
                    <ModalSelectItem value="En Progreso">En Progreso</ModalSelectItem>
                    <ModalSelectItem value="Pendiente">Pendiente</ModalSelectItem>
                  </ModalSelectContent>
                </ModalSelect>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid" style={{
          '--stats-columns': '4'
        } as React.CSSProperties}>
          <div className="stat-card">
            <div className="stat-card__icon">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Servicios</div>
            </div>
          </div>
          
          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.completados}</div>
              <div className="stat-card__label">Completados</div>
              <div className="stat-card__subtitle">
                {stats.total > 0 ? ((stats.completados / stats.total) * 100).toFixed(1) : 0}% del total
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <Clock className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.enProgreso + stats.pendientes}</div>
              <div className="stat-card__label">Pendientes</div>
              <div className="stat-card__subtitle">
                {stats.enProgreso} en progreso, {stats.pendientes} por iniciar
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__icon">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">${stats.costoTotal.toFixed(0)}</div>
              <div className="stat-card__label">Costo Total</div>
              <div className="stat-card__subtitle">
                {stats.correctivos} correctivos, {stats.preventivos} preventivos
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Servicios */}
        <div className="improved-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lista de Servicios</h2>
                <p className="text-gray-600">{serviciosFiltrados.length} de {servicios.length} servicios encontrados</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid gap-6">
              {serviciosFiltrados.map((servicio: Servicio) => (
                <div key={servicio.id} className="improved-card">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                      <Wrench className="h-7 w-7 text-blue-700" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Servicio #{servicio.id.toString().padStart(4, '0')}
                        </h3>
                        <span className={getEstadoBadgeClass(servicio.estado)}>
                          {servicio.estado}
                        </span>
                        <span className={getTipoBadgeClass(servicio.tipo)}>
                          {servicio.tipo}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-700">
                        {servicio.equipoMarca} {servicio.equipoModelo}
                      </p>
                      <p className="text-sm text-gray-600 font-mono">
                        Serial: {servicio.equipoSerial}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {servicio.costo > 0 ? `$${servicio.costo.toFixed(2)}` : 'Sin costo'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="data-item">
                      <FileText className="data-item__icon" />
                      <span className="data-item__label">Diagnóstico</span>
                      <span className="data-item__value">{servicio.diagnostico}</span>
                    </div>
                    
                    <div className="data-item">
                      <User className="data-item__icon" />
                      <span className="data-item__label">Técnico</span>
                      <span className="data-item__value">{servicio.tecnico}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Descripción del Trabajo</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
                      {servicio.descripcion}
                    </p>
                  </div>

                  {servicio.fotografias && servicio.fotografias.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Fotografías ({servicio.fotografias.length})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {servicio.fotografias.slice(0, 3).map((foto, index) => (
                          <div key={index} className="w-16 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                            <Camera className="h-6 w-6 text-gray-400" />
                          </div>
                        ))}
                        {servicio.fotografias.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{servicio.fotografias.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
              
              {serviciosFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron servicios</h3>
                  <p>No hay servicios que coincidan con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>
    </MainLayout>
  )
}