'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useInventario, type Equipo } from '@/contexts/InventarioContext'
import { X, Monitor, MemoryStick, HardDrive, Cpu, Video, Calendar, Building, MapPin } from 'lucide-react'

interface VerEquiposUsuarioDialogProps {
  usuarioId: number
  nombreUsuario: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerEquiposUsuarioDialog({ 
  usuarioId, 
  nombreUsuario, 
  open, 
  onOpenChange 
}: VerEquiposUsuarioDialogProps) {
  const [mounted, setMounted] = useState(false)
  const { usuarios, equipos } = useInventario()

  const usuario = usuarios.find(u => Number(u.id) === usuarioId)
  const equiposDelUsuario = equipos.filter((equipo: Equipo) => {
    const equipoUsuario = equipo.usuario?.trim() || ''
    const nombreBuscado = nombreUsuario?.trim() || ''
    return equipoUsuario.toLowerCase() === nombreBuscado.toLowerCase()
  })

  // Debug: Ver qué equipos hay y cuáles coinciden
  useEffect(() => {
    if (open) {
      console.log('=== DEBUG EQUIPOS USUARIO ===')
      console.log('Usuario buscado:', nombreUsuario)
      console.log('Total equipos:', equipos.length)
      console.log('Equipos encontrados:', equiposDelUsuario.length)
      equipos.forEach(eq => {
        console.log(`Equipo: ${eq.serial}, Usuario: "${eq.usuario}", Match: ${eq.usuario === nombreUsuario}`)
      })
      console.log('=== FIN DEBUG ===')
    }
  }, [open, equipos, nombreUsuario, equiposDelUsuario])

  useEffect(() => {
    setMounted(true)
    
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (typeof window === 'undefined' || !open || !mounted) {
    return null
  }

  return createPortal(
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChange(false)}
          className="modal-close-button"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="pb-4 border-b border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Equipos de {nombreUsuario}
          </h2>
          <p className="text-gray-600 mt-1">
            {equiposDelUsuario.length} equipo{equiposDelUsuario.length !== 1 ? 's' : ''} asignado{equiposDelUsuario.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {equiposDelUsuario.length > 0 ? (
            equiposDelUsuario.map((equipo: Equipo) => (
              <div key={equipo.id} className="improved-card mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                    <Monitor className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{equipo.serial}</h3>
                    <p className="text-base font-semibold text-gray-700">{equipo.marca} {equipo.modelo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="status-badge">{equipo.tipo}</span>
                      <span className="status-badge status-badge--success">
                        {equipo.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="data-item">
                    <Cpu className="data-item__icon" />
                    <span className="data-item__label">Procesador</span>
                    <span className="data-item__value">{equipo.procesador || 'No especificado'}</span>
                  </div>

                  <div className="data-item">
                    <MemoryStick className="data-item__icon" />
                    <span className="data-item__label">RAM</span>
                    <span className="data-item__value">{equipo.ram}GB</span>
                  </div>

                  <div className="data-item">
                    <HardDrive className="data-item__icon" />
                    <span className="data-item__label">Disco Duro</span>
                    <span className="data-item__value">{equipo.almacenamientoGb}GB {equipo.almacenamientoTipo}</span>
                  </div>

                  <div className="data-item">
                    <Video className="data-item__icon" />
                    <span className="data-item__label">Tarjeta Gráfica</span>
                    <span className="data-item__value">{equipo.tarjetaVideo || 'Integrada'}</span>
                  </div>

                  <div className="data-item">
                    <Monitor className="data-item__icon" />
                    <span className="data-item__label">Pantallas</span>
                    <span className="data-item__value">{equipo.pantallas || 1}</span>
                  </div>
                </div>

                {equipo.observaciones && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Observaciones:</p>
                    <p className="text-sm text-yellow-700">{equipo.observaciones}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Sin Equipos Asignados
              </h3>
              <p className="text-gray-500">
                {nombreUsuario} no tiene equipos asignados actualmente.
              </p>
            </div>
          )}
        </div>

        <div className="modal-form-actions">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}