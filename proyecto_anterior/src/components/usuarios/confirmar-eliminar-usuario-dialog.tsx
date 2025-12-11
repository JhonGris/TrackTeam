'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useInventario, type Usuario } from '@/contexts/InventarioContext'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmarEliminarUsuarioDialogProps {
  usuario: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmarEliminarUsuarioDialog({ usuario, open, onOpenChange }: ConfirmarEliminarUsuarioDialogProps) {
  const { eliminarUsuario } = useInventario()
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Validar si se puede eliminar (no tiene equipos)
  const puedeEliminar = usuario?.equiposAsignados === 0

  const handleEliminar = async () => {
    if (!usuario) return

    setIsDeleting(true)
    
    try {
      const eliminado = await eliminarUsuario(usuario.id)
      
      if (eliminado) {
        onOpenChange(false)
      } else {
        // Esto no debería pasar si validamos correctamente
        console.error('No se pudo eliminar el usuario')
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (typeof window === 'undefined' || !open || !usuario || !mounted) {
    return null
  }

  return createPortal(
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChange(false)}
          className="modal-close-button"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="pb-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-full ${puedeEliminar ? 'bg-red-100' : 'bg-yellow-100'}`}>
              {puedeEliminar ? (
                <Trash2 className="h-6 w-6 text-red-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${puedeEliminar ? 'text-red-800' : 'text-yellow-800'}`}>
                {puedeEliminar ? 'Eliminar Usuario' : 'No se puede eliminar'}
              </h2>
            </div>
          </div>

          {puedeEliminar ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Acción Irreversible</h4>
                <p className="text-sm text-red-700">
                  Estás a punto de eliminar permanentemente al usuario:
                </p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="font-semibold">{usuario.nombre}</p>
                  <p className="text-sm text-gray-600">{usuario.email}</p>
                  <p className="text-sm text-gray-600">{usuario.departamento}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Lo que sucederá:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Se eliminará completamente de la base de datos</li>
                  <li>✓ Se eliminará todo su historial de equipos</li>
                  <li>✓ No se podrá recuperar esta información</li>
                  <li className="text-red-600">⚠️ Esta acción NO se puede deshacer</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Alternativa recomendada:</strong> En lugar de eliminar, considera usar 
                  "Retirar Usuario" para mantener el historial pero liberar los equipos.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-900 mb-2">No se puede eliminar</h4>
                <p className="text-sm text-yellow-700">
                  El usuario <strong>{usuario.nombre}</strong> tiene equipos asignados y no puede ser eliminado.
                </p>
              </div>

              <div className="bg-white border rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Usuario:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipos asignados:</span>
                    <span className="font-semibold text-red-600">{usuario.equiposAsignados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departamento:</span>
                    <span>{usuario.departamento}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">¿Qué puedes hacer?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usar "Retirar Usuario" para liberar los equipos automáticamente</li>
                  <li>• Reasignar manualmente los equipos a otros usuarios</li>
                  <li>• Marcar los equipos como disponibles</li>
                </ul>
              </div>
            </div>
          )}
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
          {puedeEliminar && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleEliminar}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Permanentemente
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}