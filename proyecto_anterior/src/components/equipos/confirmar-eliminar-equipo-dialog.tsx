'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { type Equipo, useInventario } from '@/contexts/InventarioContext'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmarEliminarEquipoDialogProps {
  equipo: Equipo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmarEliminarEquipoDialog({ 
  equipo, 
  open, 
  onOpenChange 
}: ConfirmarEliminarEquipoDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { eliminarEquipo } = useInventario()

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

  const handleEliminar = async () => {
    if (!equipo) return
    
    setIsDeleting(true)
    const success = await eliminarEquipo(equipo.id)
    setIsDeleting(false)
    
    if (success) {
      onOpenChange(false)
    }
  }

  if (typeof window === 'undefined' || !open || !mounted || !equipo) {
    return null
  }

  return createPortal(
    <div className="modal-overlay" onClick={() => !isDeleting && onOpenChange(false)}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChange(false)}
          className="modal-close-button"
          type="button"
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ¿Eliminar Equipo?
          </h2>
          
          <p className="text-gray-600 mb-2">
            Estás a punto de eliminar el siguiente equipo:
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-gray-900">{equipo.serial}</p>
            <p className="text-sm text-gray-600">{equipo.marca} {equipo.modelo}</p>
            {equipo.usuario && equipo.usuario !== 'Sin asignar' && (
              <p className="text-sm text-blue-600 mt-2">Asignado a: {equipo.usuario}</p>
            )}
          </div>
          
          <p className="text-sm text-red-600 mb-6">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminar}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Equipo'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
