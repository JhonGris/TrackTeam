'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { updatePlantilla, type PlantillaMantenimiento } from '@/app/plantillas/actions'

const TIPOS_MANTENIMIENTO = [
  'Preventivo',
  'Correctivo',
  'Limpieza',
  'Actualización de Software',
]

type Props = {
  plantilla: PlantillaMantenimiento
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditarPlantillaDialog({ plantilla, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activa, setActiva] = useState(plantilla.activa)

  // Parse checklist for textarea
  function getChecklistText(): string {
    if (!plantilla.checklist) return ''
    try {
      const items = JSON.parse(plantilla.checklist)
      return Array.isArray(items) ? items.join('\n') : ''
    } catch {
      return ''
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('activa', activa.toString())
    const result = await updatePlantilla(plantilla.id, formData)

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Plantilla</DialogTitle>
          <DialogDescription>
            Modifica los datos de la plantilla de mantenimiento
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la Plantilla *</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={plantilla.nombre}
                required
              />
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={plantilla.descripcion || ''}
              />
            </div>

            {/* Tipo */}
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Mantenimiento *</Label>
              <Select name="tipo" defaultValue={plantilla.tipo} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MANTENIMIENTO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tiempo Estimado */}
            <div className="grid gap-2">
              <Label htmlFor="tiempoEstimado">Tiempo Estimado (minutos) *</Label>
              <Input
                id="tiempoEstimado"
                name="tiempoEstimado"
                type="number"
                min="1"
                defaultValue={plantilla.tiempoEstimado}
                required
              />
            </div>

            {/* Problemas Típicos */}
            <div className="grid gap-2">
              <Label htmlFor="problemasTipicos">Problemas Típicos *</Label>
              <Textarea
                id="problemasTipicos"
                name="problemasTipicos"
                rows={3}
                defaultValue={plantilla.problemasTipicos}
                required
              />
            </div>

            {/* Soluciones Típicas */}
            <div className="grid gap-2">
              <Label htmlFor="solucionesTipicas">Soluciones Típicas *</Label>
              <Textarea
                id="solucionesTipicas"
                name="solucionesTipicas"
                rows={3}
                defaultValue={plantilla.solucionesTipicas}
                required
              />
            </div>

            {/* Checklist */}
            <div className="grid gap-2">
              <Label htmlFor="checklist">Checklist de Tareas</Label>
              <Textarea
                id="checklist"
                name="checklist"
                rows={4}
                defaultValue={getChecklistText()}
                placeholder="Una tarea por línea"
              />
            </div>

            {/* Activa */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="activa">Plantilla Activa</Label>
                <p className="text-sm text-muted-foreground">
                  Las plantillas inactivas no aparecen en el formulario de servicios
                </p>
              </div>
              <Switch
                id="activa"
                checked={activa}
                onCheckedChange={setActiva}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
