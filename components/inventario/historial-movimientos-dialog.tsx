'use client'

import { useState, useEffect, useTransition } from 'react'
import { History, ArrowUp, ArrowDown, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { getMovimientosRepuesto, deleteMovimiento } from '@/app/inventario/actions'
import type { RepuestoConCategoria } from '@/types/repuestos'

type Movimiento = {
  id: string
  tipo: string
  cantidad: number
  cantidadAnterior: number
  cantidadNueva: number
  motivo: string | null
  referencia: string | null
  createdAt: Date
}

type Props = {
  repuesto: RepuestoConCategoria
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistorialMovimientosDialog({ repuesto, open, onOpenChange }: Props) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [eliminando, setEliminando] = useState<Movimiento | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadMovimientos = () => {
    setLoading(true)
    getMovimientosRepuesto(repuesto.id).then((data) => {
      setMovimientos(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (open) {
      loadMovimientos()
    }
  }, [open, repuesto.id])

  const handleDelete = async () => {
    if (!eliminando) return

    startTransition(async () => {
      const result = await deleteMovimiento(eliminando.id)
      if (result.error) {
        alert(result.error)
      } else {
        // Recargar los movimientos después de eliminar
        loadMovimientos()
      }
      setEliminando(null)
    })
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowDown className="h-4 w-4 text-green-500" />
      case 'salida':
        return <ArrowUp className="h-4 w-4 text-red-500" />
      case 'ajuste':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Entrada</Badge>
      case 'salida':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Salida</Badge>
      case 'ajuste':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ajuste</Badge>
      default:
        return <Badge variant="outline">{tipo}</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumero = (num: number) => {
    return num.toString().padStart(3, '0')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Movimientos
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono bg-muted px-2 py-0.5 rounded mr-2">
              {formatNumero(repuesto.numero)}
            </span>
            <span className="font-medium">{repuesto.nombre}</span>
            <br />
            Stock actual: <strong>{repuesto.cantidad} {repuesto.unidad}s</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando historial...
            </div>
          ) : movimientos.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No hay movimientos registrados
            </div>
          ) : (
            <div className="space-y-3">
              {movimientos.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="mt-1">
                    {getTipoIcon(mov.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTipoBadge(mov.tipo)}
                      <span className="text-sm font-medium">
                        {mov.cantidad > 0 ? '+' : ''}{mov.cantidad} {repuesto.unidad}s
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {mov.cantidadAnterior} → {mov.cantidadNueva} {repuesto.unidad}s
                    </div>
                    {mov.motivo && (
                      <div className="text-sm mt-1">
                        {mov.motivo}
                      </div>
                    )}
                    {mov.referencia && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Ref: {mov.referencia}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(mov.createdAt)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setEliminando(mov)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>

      {/* Alert de confirmación para eliminar */}
      <AlertDialog open={!!eliminando} onOpenChange={(open) => !open && setEliminando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              {eliminando && (
                <>
                  Se eliminará el movimiento de <strong>{getTipoBadge(eliminando.tipo)}</strong> y se revertirá el stock 
                  de <strong>{eliminando.cantidadNueva}</strong> a <strong>{eliminando.cantidadAnterior}</strong> {repuesto.unidad}s.
                  <br /><br />
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
