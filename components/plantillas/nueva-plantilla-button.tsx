'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createPlantilla } from '@/app/plantillas/actions'

const TIPOS_MANTENIMIENTO = [
  'Preventivo',
  'Correctivo',
  'Limpieza',
  'Actualización de Software',
]

export function NuevaPlantillaButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createPlantilla(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Mantenimiento</DialogTitle>
          <DialogDescription>
            Crea una plantilla para pre-llenar formularios de servicio técnico
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
                placeholder="Ej: Limpieza Preventiva Trimestral"
                required
              />
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                placeholder="Breve descripción de cuándo usar esta plantilla"
              />
            </div>

            {/* Tipo */}
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Mantenimiento *</Label>
              <Select name="tipo" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
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
                defaultValue="30"
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
                placeholder="Describe los problemas comunes que se encuentran en este tipo de mantenimiento..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Este texto se usará para pre-llenar el campo "Problemas encontrados"
              </p>
            </div>

            {/* Soluciones Típicas */}
            <div className="grid gap-2">
              <Label htmlFor="solucionesTipicas">Soluciones Típicas *</Label>
              <Textarea
                id="solucionesTipicas"
                name="solucionesTipicas"
                rows={3}
                placeholder="Describe las soluciones típicas aplicadas..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Este texto se usará para pre-llenar el campo "Soluciones aplicadas"
              </p>
            </div>

            {/* Checklist */}
            <div className="grid gap-2">
              <Label htmlFor="checklist">Checklist de Tareas (opcional)</Label>
              <Textarea
                id="checklist"
                name="checklist"
                rows={4}
                placeholder="Escribe una tarea por línea:
Revisar ventiladores
Limpiar polvo interno
Verificar temperaturas
Actualizar drivers"
              />
              <p className="text-xs text-muted-foreground">
                Una tarea por línea. Se mostrará como checklist al usar la plantilla
              </p>
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
