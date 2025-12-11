'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ContentLayout } from '@/components/ui/content-layout'
import { Button } from '@/components/ui/button'
import { NuevoUsuarioDialog } from '@/components/usuarios/nuevo-usuario-dialog'
import { VerEquiposUsuarioDialog } from '@/components/usuarios/ver-equipos-usuario-dialog'
import { EditarUsuarioDialog } from '@/components/usuarios/editar-usuario-dialog'
import { ConfirmarEliminarUsuarioDialog } from '@/components/usuarios/confirmar-eliminar-usuario-dialog'
import { ConfirmarRetirarUsuarioDialog } from '@/components/usuarios/confirmar-retirar-usuario-dialog'
import { ExpandableUserCard } from '@/components/usuarios/expandable-user-card'
import { useInventario, type Usuario } from '@/contexts/InventarioContext'
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { Users, Filter, Mail, Phone, Monitor, User, Building, Search, Edit, Eye, Trash2, UserX, MapPin, TrendingUp } from 'lucide-react'

export default function UsuariosPage() {
  const { usuarios, equipos, isLoading } = useInventario()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartamento, setFilterDepartamento] = useState('todos')
  
  // Estados para diálogos
  const [verEquiposDialog, setVerEquiposDialog] = useState<{open: boolean, usuario: Usuario | null}>({
    open: false,
    usuario: null
  })
  const [editarUsuarioDialog, setEditarUsuarioDialog] = useState<{open: boolean, usuario: Usuario | null}>({
    open: false,
    usuario: null
  })
  const [eliminarUsuarioDialog, setEliminarUsuarioDialog] = useState<{open: boolean, usuario: Usuario | null}>({
    open: false,
    usuario: null
  })
  const [retirarUsuarioDialog, setRetirarUsuarioDialog] = useState<{open: boolean, usuario: Usuario | null}>({
    open: false,
    usuario: null
  })

  // Handlers para abrir diálogos
  const handleVerEquipos = (usuario: Usuario) => {
    setVerEquiposDialog({ open: true, usuario })
  }

  const handleEditarUsuario = (usuario: Usuario) => {
    setEditarUsuarioDialog({ open: true, usuario })
  }

  const handleEliminarUsuario = (usuario: Usuario) => {
    setEliminarUsuarioDialog({ open: true, usuario })
  }

  const handleRetirarUsuario = (usuario: Usuario) => {
    setRetirarUsuarioDialog({ open: true, usuario })
  }

  // Filtrar usuarios basado en búsqueda (solo usuarios activos)
  const usuariosFiltrados = usuarios.filter((usuario: Usuario) => {
    // Solo mostrar usuarios activos en esta vista
    if (usuario.estado !== 'activo') return false
    
    const matchesSearch = !searchQuery || 
      usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.departamento.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartamento = !filterDepartamento || filterDepartamento === 'todos' || usuario.departamento === filterDepartamento
    
    return matchesSearch && matchesDepartamento
  })

  // Estadísticas calculadas dinámicamente desde los equipos
  const stats = {
    total: usuarios.filter((u: Usuario) => u.estado === 'activo').length,
    conEquipos: usuarios.filter((u: Usuario) => {
      if (u.estado !== 'activo') return false
      const equiposDelUsuario = equipos.filter(e => e.usuario?.toLowerCase() === u.nombre.toLowerCase())
      return equiposDelUsuario.length > 0
    }).length,
    sinEquipos: usuarios.filter((u: Usuario) => {
      if (u.estado !== 'activo') return false
      const equiposDelUsuario = equipos.filter(e => e.usuario?.toLowerCase() === u.nombre.toLowerCase())
      return equiposDelUsuario.length === 0
    }).length,
    totalDepartamentos: new Set(usuarios.filter((u: Usuario) => u.estado === 'activo').map(u => u.departamento)).size
  }

  // Prevenir hydration errors
  if (!mounted) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <ContentLayout>
          <div className="page-header-section">
            <h1 className="page-title">Usuarios</h1>
            <p className="page-description">Cargando...</p>
          </div>
        </ContentLayout>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <ContentLayout>
        <div className="page-header-section">
          <h1 className="page-title">Usuarios</h1>
          <p className="page-description">Gestión de usuarios y asignaciones de equipos</p>
          <div className="mt-4">
            <NuevoUsuarioDialog />
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
                  placeholder="Buscar por nombre, email o departamento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <ModalSelect value={filterDepartamento} onValueChange={setFilterDepartamento}>
                  <ModalSelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <ModalSelectValue placeholder="Departamento" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    <ModalSelectItem value="todos">Todos</ModalSelectItem>
                    <ModalSelectItem value="Diseñador Gráfico">Diseñador Gráfico</ModalSelectItem>
                    <ModalSelectItem value="Diseño Industrial">Diseño Industrial</ModalSelectItem>
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
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid" style={{
          '--stats-columns': '4'
        } as React.CSSProperties}>
          <div className="stat-card">
            <div className="stat-card__icon">
              <Users className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Usuarios</div>
            </div>
          </div>
          
          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.conEquipos}</div>
              <div className="stat-card__label">Con Equipos</div>
              <div className="stat-card__subtitle">
                {((stats.conEquipos / stats.total) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <User className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.sinEquipos}</div>
              <div className="stat-card__label">Sin Equipos</div>
              <div className="stat-card__subtitle">
                {stats.sinEquipos > 0 ? "Pendientes de asignación" : "Todos asignados"}
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card--purple">
            <div className="stat-card__icon">
              <Building className="h-5 w-5" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.totalDepartamentos}</div>
              <div className="stat-card__label">Departamentos</div>
              <div className="stat-card__subtitle">
                Áreas activas
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="improved-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
                <p className="text-gray-600">{usuariosFiltrados.length} de {usuarios.length} usuarios encontrados</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {usuariosFiltrados.map((usuario: Usuario) => (
                <ExpandableUserCard
                  key={usuario.id}
                  usuario={usuario}
                  onVerEquipos={handleVerEquipos}
                  onEditar={handleEditarUsuario}
                  onRetirar={handleRetirarUsuario}
                  onEliminar={handleEliminarUsuario}
                />
              ))}
              
              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron usuarios</h3>
                  <p>No hay usuarios que coincidan con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>

      {/* Diálogos */}
      <VerEquiposUsuarioDialog 
        usuarioId={Number(verEquiposDialog.usuario?.id) || 0}
        nombreUsuario={verEquiposDialog.usuario?.nombre || ''}
        open={verEquiposDialog.open}
        onOpenChange={(open) => setVerEquiposDialog({open, usuario: null})}
      />
      
      <EditarUsuarioDialog 
        usuario={editarUsuarioDialog.usuario}
        open={editarUsuarioDialog.open}
        onOpenChange={(open) => setEditarUsuarioDialog({open, usuario: null})}
      />

      <ConfirmarEliminarUsuarioDialog 
        usuario={eliminarUsuarioDialog.usuario}
        open={eliminarUsuarioDialog.open}
        onOpenChange={(open) => setEliminarUsuarioDialog({open, usuario: null})}
      />

      <ConfirmarRetirarUsuarioDialog 
        usuario={retirarUsuarioDialog.usuario}
        open={retirarUsuarioDialog.open}
        onOpenChange={(open) => setRetirarUsuarioDialog({open, usuario: null})}
      />
    </MainLayout>
  )
}