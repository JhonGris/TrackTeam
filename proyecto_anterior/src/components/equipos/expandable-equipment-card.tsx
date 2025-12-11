'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Equipo } from '@/contexts/InventarioContext'
import { EditarEquipoDialog } from './editar-equipo-dialog'
import { HistorialServicios } from './historial-servicios'
import { 
  ChevronDown, 
  ChevronUp, 
  Monitor, 
  User, 
  Building, 
  Calendar,
  MemoryStick,
  HardDrive,
  Cpu,
  Video,
  Eye, 
  Edit,
  FileText,
  Trash2,
  History
} from 'lucide-react'

interface ExpandableEquipmentCardProps {
  equipo: Equipo
  onVerEquipo?: (equipo: Equipo) => void
  onEditarEquipo?: (equipo: Equipo) => void
  onGenerarReporte?: (equipo: Equipo) => void
  onEliminarEquipo?: (equipo: Equipo) => void
}

export function ExpandableEquipmentCard({ 
  equipo, 
  onVerEquipo, 
  onEditarEquipo, 
  onGenerarReporte,
  onEliminarEquipo
}: ExpandableEquipmentCardProps) {
  const router = useRouter()
  const [expandido, setExpandido] = useState(false)

  const toggleExpansion = () => {
    setExpandido(!expandido)
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'status-badge--success'
      case 'En Reparación': return 'status-badge--warning'
      case 'Descontinuado': return 'status-badge--danger'
      case 'En Almacén': return 'status-badge--info'
      default: return 'status-badge'
    }
  }

  return (
    <div className="improved-card overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Vista compacta - siempre visible */}
      <div 
        className="equipment-compact-view"
        onClick={toggleExpansion}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            
            <div className="flex-1">
              <h3 className="equipment-name-title">{equipo.modelo}</h3>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-sm text-gray-600">{equipo.serial}</span>
                {equipo.usuario !== 'Sin asignar' && (
                  <span className="text-sm text-blue-600 font-medium">
                    {equipo.usuario}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {expandido ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Vista expandida - condicional */}
      {expandido && (
        <div className="px-6 pb-6 border-t border-gray-100 bg-gradient-to-r from-gray-50/30 to-blue-50/20">
          <div className="pt-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Serial
                </span>
                <p className="equipment-detail-value font-mono">{equipo.serial}</p>
              </div>
              
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Departamento
                </span>
                <p className="equipment-detail-value">{equipo.departamento}</p>
              </div>
              
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Usuario
                </span>
                <p className="equipment-detail-value">{equipo.usuario}</p>
              </div>
            </div>

            {/* Especificaciones técnicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Procesador
                </span>
                <p className="equipment-detail-value">{equipo.procesador || 'No especificado'}</p>
              </div>
              
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Memoria RAM
                </span>
                <p className="equipment-detail-value">{equipo.ram}GB</p>
              </div>
              
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Almacenamiento
                </span>
                <p className="equipment-detail-value">{equipo.almacenamientoGb}GB {equipo.almacenamientoTipo}</p>
              </div>
              
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Tarjeta de Video
                </span>
                <p className="equipment-detail-value">{equipo.tarjetaVideo || 'Integrada'}</p>
              </div>
            </div>

            {/* Observaciones */}
            {equipo.observaciones && (
              <div className="equipment-detail-card" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)', borderColor: '#fbbf24' }}>
                <span className="equipment-detail-title" style={{ color: '#92400e' }}>
                  Observaciones
                </span>
                <p className="equipment-detail-value" style={{ color: '#78350f' }}>{equipo.observaciones}</p>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Fecha de Adquisición
                </span>
                <p className="equipment-detail-value">
                  {equipo.fechaAdquisicion ? new Date(equipo.fechaAdquisicion).toLocaleDateString() : 'No especificada'}
                </p>
              </div>
              
              <div className="equipment-detail-card">
                <span className="equipment-detail-title">
                  Pantallas
                </span>
                <p className="equipment-detail-value">{equipo.pantallas || 1}</p>
              </div>
            </div>

            {/* Historial de Servicios */}
            <div className="pt-6 border-t border-gray-200/60">
              <HistorialServicios equipoId={equipo.id} />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 pt-5 border-t border-gray-200/60">
              {onVerEquipo && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onVerEquipo(equipo); }}
                  className="equipment-action-btn equipment-action-btn--view"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </button>
              )}
              
              <EditarEquipoDialog 
                equipo={equipo}
                trigger={
                  <button className="equipment-action-btn equipment-action-btn--edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                }
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/equipos/${equipo.id}/timeline`)
                }}
                className="equipment-action-btn bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
              >
                <History className="h-4 w-4 mr-2" />
                Línea de Tiempo
              </button>
              
              {onEliminarEquipo && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEliminarEquipo(equipo); }}
                  className="equipment-action-btn equipment-action-btn--delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
              )}
              
              {onGenerarReporte && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onGenerarReporte(equipo); }}
                  className="equipment-action-btn equipment-action-btn--report"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}