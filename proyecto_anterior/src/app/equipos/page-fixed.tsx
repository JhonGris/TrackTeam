'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/ui/page-header'
import { ContentLayout } from '@/components/ui/content-layout'
import { FilterBar } from '@/components/ui/filter-bar'
import { StatCard, StatsGrid } from '@/components/ui/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NuevoEquipoDialog } from '@/components/equipos/nuevo-equipo-dialog'
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { Monitor, Filter, Eye, Edit, Cpu, HardDrive, MemoryStick, MapPin } from 'lucide-react'

export default function EquiposPage() {
  // Estado para los equipos (inicialmente con datos simulados)
  const [equipos, setEquipos] = useState([
    {
      id: 1,
      serial: 'LT-2024-001',
      marca: 'Dell',
      modelo: 'Latitude 5520',
      tipo: 'Portátil',
      estado: 'Activo',
      usuario: 'Juan Pérez',
      departamento: 'Desarrollador',
      procesador: 'Intel i7-11850H',
      ram: 16,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 512,
      fechaAdquisicion: '2024-01-15'
    },
    {
      id: 2,
      serial: 'PC-2024-025',
      marca: 'HP',
      modelo: 'EliteDesk 800',
      tipo: 'PC Escritorio',
      estado: 'En Reparación',
      usuario: 'María García',
      departamento: 'Administrativo',
      procesador: 'Intel i5-12400',
      ram: 8,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 256,
      fechaAdquisicion: '2024-02-20'
    },
    {
      id: 3,
      serial: 'LT-2024-002',
      marca: 'Lenovo',
      modelo: 'ThinkPad X1',
      tipo: 'Portátil',
      estado: 'Activo',
      usuario: 'Carlos López',
      departamento: 'KAM',
      procesador: 'Intel i7-13700H',
      ram: 32,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 1000,
      fechaAdquisicion: '2024-03-05'
    },
    {
      id: 4,
      serial: 'MAC-2024-001',
      marca: 'Apple',
      modelo: 'MacBook Pro M2',
      tipo: 'Portátil',
      estado: 'Activo',
      usuario: 'Ana Rodriguez',
      departamento: 'Diseñador Industrial',
      procesador: 'Apple M2 Pro',
      ram: 32,
      almacenamientoTipo: 'SSD',
      almacenamientoGb: 1000,
      fechaAdquisicion: '2024-04-12'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')

  const handleEquipoCreado = (nuevoEquipo: any) => {
    setEquipos(prev => [...prev, nuevoEquipo])
    alert('Equipo agregado exitosamente')
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'default'
      case 'En Reparación':
        return 'destructive'
      case 'Descontinuado':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Filtrar equipos basado en búsqueda
  const equiposFiltrados = equipos.filter(equipo => {
    const matchesSearch = !searchQuery || 
      equipo.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipo.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipo.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (equipo.usuario && equipo.usuario.toLowerCase().includes(searchQuery.toLowerCase()))
    
  const matchesType = filterType === 'todos' || equipo.tipo === filterType
  const matchesStatus = filterStatus === 'todos' || equipo.estado === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Estadísticas
  const stats = {
    total: equipos.length,
    activos: equipos.filter(e => e.estado === 'Activo').length,
    enReparacion: equipos.filter(e => e.estado === 'En Reparación').length,
    descontinuados: equipos.filter(e => e.estado === 'Descontinuado').length
  }

  return (
    <MainLayout>
      <ContentLayout>
        <PageHeader 
          title="Equipos" 
          description="Gestión completa del inventario de equipos"
        >
          <NuevoEquipoDialog onEquipoCreado={handleEquipoCreado} />
        </PageHeader>

        {/* Filtros y búsqueda */}
        <FilterBar 
          searchPlaceholder="Buscar por serial, marca, modelo o usuario..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        >
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
        </FilterBar>

        {/* Estadísticas rápidas */}
        <StatsGrid>
          <StatCard
            title="Total Equipos"
            value={stats.total}
            icon={<Monitor className="h-4 w-4" />}
            valueColor="text-blue-600"
          />
          <StatCard
            title="Activos"
            value={stats.activos}
            subtitle={`${((stats.activos / stats.total) * 100).toFixed(1)}% del total`}
            valueColor="text-green-600"
          />
          <StatCard
            title="En Reparación"
            value={stats.enReparacion}
            subtitle={stats.enReparacion > 0 ? "Requieren atención" : "Ninguno"}
            valueColor="text-orange-600"
          />
          <StatCard
            title="Descontinuados"
            value={stats.descontinuados}
            valueColor="text-gray-600"
          />
        </StatsGrid>

        {/* Lista de Equipos */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Lista de Equipos
            </CardTitle>
            <CardDescription>
              {equiposFiltrados.length} de {equipos.length} equipos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {equiposFiltrados.map((equipo) => (
                <div key={equipo.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{equipo.serial}</h3>
                            <p className="text-lg font-medium text-gray-800">{equipo.marca} {equipo.modelo}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{equipo.tipo}</Badge>
                              <Badge variant={getEstadoBadgeVariant(equipo.estado)}>
                                {equipo.estado}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Cpu className="h-4 w-4" />
                            <span>{equipo.procesador}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <MemoryStick className="h-4 w-4" />
                            <span>{equipo.ram}GB RAM</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <HardDrive className="h-4 w-4" />
                            <span>{equipo.almacenamientoTipo} {equipo.almacenamientoGb}GB</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{equipo.departamento}</span>
                          </div>
                        </div>

                        {equipo.usuario && (
                          <div className="text-sm text-gray-700">
                            <strong>Asignado a:</strong> {equipo.usuario}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {equiposFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No se encontraron equipos que coincidan con los filtros</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    </MainLayout>
  )
}