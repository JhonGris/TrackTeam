'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Monitor,
  Package,
  FileText,
  PenLine,
  UserPlus,
  UserMinus,
  Clock,
  Loader2,
} from 'lucide-react'
import { getColaboradorHistorial } from '@/app/colaboradores/actions'

// ============================================================================
// TYPES
// ============================================================================

type HistorialEntry = {
  id: string
  tipo: string
  descripcion: string
  itemId: string | null
  itemTipo: string | null
  responsable: string | null
  detalleJson: string | null
  createdAt: Date
}

// ============================================================================
// UTILITIES
// ============================================================================

function getEventIcon(tipo: string) {
  switch (tipo) {
    case 'equipo_asignado':
      return <Monitor className="h-4 w-4 text-green-600" />
    case 'equipo_removido':
      return <Monitor className="h-4 w-4 text-red-500" />
    case 'inventario_asignado':
      return <Package className="h-4 w-4 text-blue-500" />
    case 'inventario_removido':
      return <Package className="h-4 w-4 text-orange-500" />
    case 'documento_agregado':
      return <FileText className="h-4 w-4 text-purple-500" />
    case 'dato_actualizado':
      return <PenLine className="h-4 w-4 text-amber-600" />
    case 'colaborador_creado':
      return <UserPlus className="h-4 w-4 text-green-600" />
    case 'colaborador_eliminado':
      return <UserMinus className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getEventLabel(tipo: string): string {
  switch (tipo) {
    case 'equipo_asignado':
      return 'Equipo asignado'
    case 'equipo_removido':
      return 'Equipo removido'
    case 'inventario_asignado':
      return 'Inventario asignado'
    case 'inventario_removido':
      return 'Inventario removido'
    case 'documento_agregado':
      return 'Documento agregado'
    case 'dato_actualizado':
      return 'Dato actualizado'
    case 'colaborador_creado':
      return 'Registro creado'
    case 'colaborador_eliminado':
      return 'Registro eliminado'
    default:
      return tipo
  }
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================================
// COMPONENT
// ============================================================================

interface ColaboradorHistorialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaboradorId: string
  colaboradorNombre: string
}

export function ColaboradorHistorialDialog({
  open,
  onOpenChange,
  colaboradorId,
  colaboradorNombre,
}: ColaboradorHistorialDialogProps) {
  const [historial, setHistorial] = useState<HistorialEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && colaboradorId) {
      setLoading(true)
      getColaboradorHistorial(colaboradorId)
        .then((data) => setHistorial(data as HistorialEntry[]))
        .catch(() => setHistorial([]))
        .finally(() => setLoading(false))
    }
  }, [open, colaboradorId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Historial del Colaborador</DialogTitle>
          <DialogDescription>
            {colaboradorNombre} — Línea de tiempo de eventos
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-10 w-10 mb-3" />
            <p className="text-sm">No hay eventos registrados</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[450px] pr-4">
            <div className="relative pl-6">
              {/* Vertical timeline line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-4">
                {historial.map((entry) => (
                  <div key={entry.id} className="relative flex gap-3">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border-2 border-border">
                      {getEventIcon(entry.tipo)}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 rounded-lg border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-primary">
                          {getEventLabel(entry.tipo)}
                        </span>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">
                        {entry.descripcion}
                      </p>
                      {entry.responsable && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Por: {entry.responsable}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
