'use client'

import { useState, useTransition } from 'react'
import { deleteEquipo } from '@/app/equipos/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

type ConfirmarEliminarEquipoDialogProps = {
  equipo: {
    id: string
    serial: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmarEliminarEquipoDialog({
  equipo,
  open,
  onOpenChange,
}: ConfirmarEliminarEquipoDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteEquipo(equipo.id)
      if (result.success) {
        onOpenChange(false)
      } else {
        setError(result.error || 'Error al eliminar el equipo')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-3 p-4 bg-destructive/15 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                ¿Estás seguro de eliminar el equipo <strong>{equipo.serial}</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No podrás eliminar este equipo si tiene servicios técnicos registrados.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
