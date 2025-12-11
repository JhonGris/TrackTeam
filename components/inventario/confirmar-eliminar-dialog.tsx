'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteRepuesto } from '@/app/inventario/actions'
import type { RepuestoConCategoria } from '@/types/repuestos'

type Props = {
  repuesto: RepuestoConCategoria
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmarEliminarDialog({ repuesto, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const result = await deleteRepuesto(repuesto.id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Repuesto
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el repuesto{' '}
            <strong>{repuesto.nombre}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Esta acción no se puede deshacer. Si el repuesto tiene registros de uso en servicios técnicos, 
            será desactivado en lugar de eliminado.
          </p>

          {repuesto.cantidad > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Este repuesto aún tiene {repuesto.cantidad} {repuesto.unidad}(s) en stock.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
