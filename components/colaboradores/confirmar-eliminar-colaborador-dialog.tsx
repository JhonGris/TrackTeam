'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteColaborador } from '@/app/colaboradores/actions'
import { useRouter } from 'next/navigation'

// ============================================================================
// CLIENT COMPONENT - Confirmar Eliminar Dialog (Progressive Enhancement)
// ============================================================================

interface ConfirmarEliminarColaboradorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaborador: {
    id: string
    nombre: string
    apellido: string
  }
}

/**
 * Confirmation dialog for deleting colaborador
 * Client Component - uses useTransition for Server Action
 * Follows Server Actions pattern from Next.js 16 docs
 */
export function ConfirmarEliminarColaboradorDialog({
  open,
  onOpenChange,
  colaborador,
}: ConfirmarEliminarColaboradorDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteColaborador(colaborador.id)
      
      if (result.success) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(result.error || 'Error al eliminar el colaborador')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>¿Eliminar Colaborador?</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar a{' '}
            <span className="font-semibold">
              {colaborador.nombre} {colaborador.apellido}
            </span>
            ?
            {' '}Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
