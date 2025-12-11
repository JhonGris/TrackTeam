'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ContentLayout } from '@/components/ui/content-layout'
import { Button } from '@/components/ui/button'
import { NuevoEquipoDialog } from '@/components/equipos/nuevo-equipo-dialog'
import { ExpandableEquipmentCard } from '@/components/equipos/expandable-equipment-card'
import { ConfirmarEliminarEquipoDialog } from '@/components/equipos/confirmar-eliminar-equipo-dialog'
import { useInventario, type Equipo } from '@/contexts/InventarioContext'
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { Monitor, Filter, Eye, Edit, Cpu, MemoryStick, HardDrive, MapPin, User, Search, Zap } from 'lucide-react'

export default function EquiposPage() {
  const { equipos } = useInventario()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [equipoAEliminar, setEquipoAEliminar] = useState<Equipo | null>(null)
  const [dialogEliminarOpen, setDialogEliminarOpen] = useState(false)

  const handleEliminarEquipo = (equipo: Equipo) => {
    setEquipoAEliminar(equipo)
    setDialogEliminarOpen(true)
  }

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'status-badge status-badge--success'
      case 'En Reparación':
        return 'status-badge status-badge--warning'
      case 'Descontinuado':
        return 'status-badge status-badge--danger'
      default:
        return 'status-badge'
    }
  }

  // Filtrar equipos basado en búsqueda
  const equiposFiltrados = equipos.filter((equipo: Equipo) => {
    const matchesSearch = !searchQuery || 
      equipo.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipo.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipo.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (equipo.usuario && equipo.usuario.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = !filterType || filterType === 'todos' || equipo.tipo === filterType
    const matchesStatus = !filterStatus || filterStatus === 'todos' || equipo.estado === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  }).sort((a, b) => {
    // Ordenar alfabéticamente por usuario
    const usuarioA = a.usuario || 'Sin asignar';
    const usuarioB = b.usuario || 'Sin asignar';
    return usuarioA.localeCompare(usuarioB);
  })

  // Estadísticas
  const stats = {
    total: equipos.length,
    activos: equipos.filter((e: Equipo) => e.estado === 'Activo').length,
    enReparacion: equipos.filter((e: Equipo) => e.estado === 'En Reparación').length,
    descontinuados: equipos.filter((e: Equipo) => e.estado === 'Descontinuado').length
  }

  return (
    <MainLayout>
      <ContentLayout>
        <div className="page-header-section">
          <h1 className="page-title">Equipos</h1>
          <p className="page-description">Gestión completa del inventario de equipos</p>
          <div className="mt-4">
            <NuevoEquipoDialog />
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
                  placeholder="Buscar por serial, marca, modelo o usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <ModalSelect value={filterType} onValueChange={setFilterType}>
                  <ModalSelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <ModalSelectValue placeholder="Tipo" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todos los tipos</ModalSelectItem>
                    <ModalSelectItem value="Portátil">Portátil</ModalSelectItem>
                    <ModalSelectItem value="PC Escritorio">PC Escritorio</ModalSelectItem>
                    <ModalSelectItem value="Monitor">Monitor</ModalSelectItem>
                    <ModalSelectItem value="Servidor">Servidor</ModalSelectItem>
                  </ModalSelectContent>
                </ModalSelect>

                <ModalSelect value={filterStatus} onValueChange={setFilterStatus}>
                  <ModalSelectTrigger className="w-[150px]">
                    <ModalSelectValue placeholder="Estado" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todos los estados</ModalSelectItem>
                    <ModalSelectItem value="Activo">Activo</ModalSelectItem>
                    <ModalSelectItem value="En Reparación">En Reparación</ModalSelectItem>
                    <ModalSelectItem value="Descontinuado">Descontinuado</ModalSelectItem>
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
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Equipos</div>
            </div>
          </div>
          
          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.activos}</div>
              <div className="stat-card__label">Activos</div>
              <div className="stat-card__subtitle">
                {((stats.activos / stats.total) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.enReparacion}</div>
              <div className="stat-card__label">En Reparación</div>
              <div className="stat-card__subtitle">
                {stats.enReparacion > 0 ? "Requieren atención" : "Ninguno"}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__icon">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.descontinuados}</div>
              <div className="stat-card__label">Descontinuados</div>
            </div>
          </div>
        </div>

        {/* Lista de Equipos */}
        <div className="improved-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lista de Equipos</h2>
                <p className="text-gray-600">{equiposFiltrados.length} de {equipos.length} equipos encontrados</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {equiposFiltrados.map((equipo: Equipo) => (
                <ExpandableEquipmentCard
                  key={equipo.id}
                  equipo={equipo}
                  onEliminarEquipo={handleEliminarEquipo}
                />
              ))}
              
              {equiposFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <Monitor className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron equipos</h3>
                  <p>No hay equipos que coincidan con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmarEliminarEquipoDialog
          equipo={equipoAEliminar}
          open={dialogEliminarOpen}
          onOpenChange={setDialogEliminarOpen}
        />
      </ContentLayout>
    </MainLayout>
  )
}