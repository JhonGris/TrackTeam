'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { type Usuario, useInventario } from '@/contexts/InventarioContext'
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Mail, 
  Phone, 
  Monitor, 
  Building, 
  MapPin,
  Calendar,
  Edit, 
  Eye, 
  Trash2, 
  UserX 
} from 'lucide-react'

interface ExpandableUserCardProps {
  usuario: Usuario
  onVerEquipos: (usuario: Usuario) => void
  onEditar: (usuario: Usuario) => void
  onEliminar: (usuario: Usuario) => void
  onRetirar: (usuario: Usuario) => void
}

export function ExpandableUserCard({ 
  usuario, 
  onVerEquipos, 
  onEditar, 
  onEliminar, 
  onRetirar 
}: ExpandableUserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { equipos } = useInventario()

  // Calcular equipos asignados dinámicamente
  const equiposAsignados = useMemo(() => {
    return equipos.filter(equipo => {
      const equipoUsuario = equipo.usuario?.trim().toLowerCase() || ''
      const nombreUsuario = usuario.nombre?.trim().toLowerCase() || ''
      return equipoUsuario === nombreUsuario
    }).length
  }, [equipos, usuario.nombre])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div 
      className="improved-card overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{
        background: equiposAsignados > 0 
          ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
          : 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
        borderColor: equiposAsignados > 0 ? '#bbf7d0' : '#fde68a'
      }}
    >
      {/* Vista compacta - siempre visible */}
      <div 
        className="user-compact-view"
        onClick={toggleExpanded}
      >
        <div className="flex justify-between items-center">
          <h3 className="user-name-title">{usuario.nombre}</h3>
          
          <div className="flex items-center gap-3">
            <div className="user-equipment-badge">
              {equiposAsignados} {equiposAsignados === 1 ? 'equipo' : 'equipos'}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-blue-500 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-500 transition-transform duration-200" />
            )}
          </div>
        </div>
      </div>

      {/* Vista expandida - condicional */}
      {isExpanded && (
        <div className="px-5 pb-4 border-t border-blue-100 bg-gradient-to-r from-blue-50/20 to-indigo-50/20">
          <div className="pt-3 space-y-2">
            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="user-detail-card">
                <span className="user-detail-title">Email</span>
                <p className="user-detail-value">{usuario.email}</p>
              </div>
              
              {usuario.telefono && (
                <div className="user-detail-card">
                  <span className="user-detail-title">Teléfono</span>
                  <p className="user-detail-value">{usuario.telefono}</p>
                </div>
              )}
              
              <div className="user-detail-card">
                <span className="user-detail-title">Departamento</span>
                <p className="user-detail-value">{usuario.departamento}</p>
              </div>
              
              <div className="user-detail-card">
                <span className="user-detail-title">Ciudad</span>
                <p className="user-detail-value">{usuario.ciudad}</p>
              </div>
              
              <div className="user-detail-card">
                <span className="user-detail-title">Equipos Asignados</span>
                <p className="user-detail-value">{equiposAsignados}</p>
              </div>
              
              <div className="user-detail-card">
                <span className="user-detail-title">Fecha de Creación</span>
                <p className="user-detail-value">
                  {new Date(usuario.fechaCreacion).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="user-actions-container">
              <button 
                onClick={(e) => { e.stopPropagation(); onVerEquipos(usuario); }}
                className="user-action-btn user-action-btn--view"
              >
                <Eye className="h-4 w-4" />
                Ver Equipos
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onEditar(usuario); }}
                className="user-action-btn user-action-btn--edit"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              
              {usuario.estado === 'activo' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRetirar(usuario); }}
                  className="user-action-btn user-action-btn--retire"
                >
                  <UserX className="h-4 w-4" />
                  Retirar
                </button>
              )}
              
              <button 
                onClick={(e) => { e.stopPropagation(); onEliminar(usuario); }}
                className="user-action-btn user-action-btn--delete"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}