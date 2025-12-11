'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useInventario, type Usuario } from '@/contexts/InventarioContext'
import { Button } from '@/components/ui/button'
import { X, UserX, AlertCircle, Archive } from 'lucide-react'

interface ConfirmarRetirarUsuarioDialogProps {
  usuario: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmarRetirarUsuarioDialog({ usuario, open, onOpenChange }: ConfirmarRetirarUsuarioDialogProps) {
  const { retirarUsuario } = useInventario()
  const [isRetiring, setIsRetiring] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRetirar = async () => {
    if (!usuario) return

    setIsRetiring(true)
    
    try {
      const retirado = retirarUsuario(usuario.id)
      
      if (retirado) {
        onOpenChange(false)
      } else {
        console.error('No se pudo retirar el usuario')
      }
    } catch (error) {
      console.error('Error al retirar usuario:', error)
    } finally {
      setIsRetiring(false)
    }
  }

  if (typeof window === 'undefined' || !open || !usuario || !mounted) {
    return null
  }

  return createPortal(
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChange(false)}
          className="modal-close-button"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="pb-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <UserX className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Retirar Usuario</h2>
              <p className="text-gray-600">Archivar usuario y liberar equipos</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <h4 className="font-medium text-orange-900 mb-2">Usuario a retirar:</h4>
              <div className="bg-white rounded border p-3">
                <p className="font-semibold">{usuario.nombre}</p>
                <p className="text-sm text-gray-600">{usuario.email}</p>
                <p className="text-sm text-gray-600">{usuario.departamento}</p>
                {usuario.equiposAsignados > 0 && (
                  <p className="text-sm font-medium text-orange-600 mt-1">
                    {usuario.equiposAsignados} equipo(s) asignado(s)
                  </p>
                )}
              </div>
            </div>

            {usuario.equiposAsignados > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Equipos que serán liberados:
                </h4>
                <p className="text-sm text-blue-800">
                  Los <strong>{usuario.equiposAsignados} equipo(s)</strong> asignados a este usuario 
                  serán marcados como <span className="font-semibold">"Disponible"</span> y 
                  quedarán libres para asignar a otros usuarios.
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                <Archive className="h-4 w-4 inline mr-1" />
                Lo que sucederá:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ El usuario se marcará como "Retirado"</li>
                <li>✓ Se liberarán todos sus equipos automáticamente</li>
                <li>✓ Los equipos quedarán disponibles para otros usuarios</li>
                <li>✓ Se mantendrá el historial completo de asignaciones</li>
                <li>✓ Se registrará la fecha de retiro</li>
                <li>✓ El usuario se moverá a la sección "Usuarios Retirados"</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="font-medium text-green-900 mb-2">✨ Ventajas de "Retirar":</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Se conserva todo el historial para auditorías</li>
                <li>• Se puede reactivar el usuario si regresa</li>
                <li>• Los equipos quedan inmediatamente disponibles</li>
                <li>• Permite seguimiento completo de activos</li>
              </ul>
            </div>

            {usuario.equiposAsignados === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-900 mb-2">💡 Sugerencia:</h4>
                <p className="text-sm text-yellow-800">
                  Este usuario no tiene equipos asignados. También podrías considerar 
                  "Eliminar" permanentemente si no necesitas conservar el historial.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            onClick={handleRetirar}
            disabled={isRetiring}
          >
            {isRetiring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Retirando...
              </>
            ) : (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Retirar Usuario
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}