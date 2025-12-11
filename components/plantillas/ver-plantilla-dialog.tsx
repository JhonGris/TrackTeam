'use client'

import { Clock, CheckSquare, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { PlantillaMantenimiento } from '@/app/plantillas/actions'

type Props = {
  plantilla: PlantillaMantenimiento
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tipoBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Preventivo': 'default',
  'Correctivo': 'destructive',
  'Limpieza': 'secondary',
  'Actualización de Software': 'outline',
}

export function VerPlantillaDialog({ plantilla, open, onOpenChange }: Props) {
  function getChecklistItems(): string[] {
    if (!plantilla.checklist) return []
    try {
      const items = JSON.parse(plantilla.checklist)
      return Array.isArray(items) ? items : []
    } catch {
      return []
    }
  }

  const checklistItems = getChecklistItems()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            {plantilla.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info básica */}
          <div className="flex items-center gap-4">
            <Badge variant={tipoBadgeVariant[plantilla.tipo] || 'secondary'}>
              {plantilla.tipo}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{plantilla.tiempoEstimado} minutos</span>
            </div>
            <Badge variant={plantilla.activa ? 'default' : 'secondary'}>
              {plantilla.activa ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>

          {plantilla.descripcion && (
            <p className="text-muted-foreground">{plantilla.descripcion}</p>
          )}

          <Separator />

          {/* Problemas Típicos */}
          <div>
            <h4 className="font-semibold mb-2">Problemas Típicos</h4>
            <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {plantilla.problemasTipicos}
            </div>
          </div>

          {/* Soluciones Típicas */}
          <div>
            <h4 className="font-semibold mb-2">Soluciones Típicas</h4>
            <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {plantilla.solucionesTipicas}
            </div>
          </div>

          {/* Checklist */}
          {checklistItems.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Checklist ({checklistItems.length} tareas)
              </h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <ul className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
