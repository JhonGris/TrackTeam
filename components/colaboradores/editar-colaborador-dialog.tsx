'use client'

import { useActionState } from 'react'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { updateColaborador } from '@/app/colaboradores/actions'

// ============================================================================
// CLIENT COMPONENT - Editar Colaborador Dialog (Progressive Enhancement)
// ============================================================================

interface EditarColaboradorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaborador: {
    id: string
    nombre: string
    apellido: string
    cargo: string
    email: string
    cedula: string | null
    direccion: string | null
    ciudad: string | null
    dotacionJson: string | null
    observaciones: string | null
  }
}

/**
 * Dialog for editing existing colaborador
 * Client Component - uses useActionState for progressive enhancement
 * Follows Server Actions pattern from Next.js 16 docs
 */
export function EditarColaboradorDialog({ open, onOpenChange, colaborador }: EditarColaboradorDialogProps) {
  const updateWithId = updateColaborador.bind(null, colaborador.id)
  const [state, formAction, pending] = useActionState(updateWithId, null)

  // Parse dotacion from JSON
  const dotacion = colaborador.dotacionJson
    ? JSON.parse(colaborador.dotacionJson)
    : {}

  // Close dialog on successful submission
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state?.success, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Colaborador</DialogTitle>
          <DialogDescription>
            Actualiza la información del colaborador
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* General Error Message */}
          {state?.message && !state.success && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          {/* Nombre Completo */}
          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
            <Input
              id="nombreCompleto"
              name="nombreCompleto"
              defaultValue={`${colaborador.nombre} ${colaborador.apellido}`.trim()}
              placeholder="Ej: Juan Carlos Pérez García"
              required
              aria-describedby="nombreCompleto-error"
            />
            {state?.errors?.nombreCompleto && (
              <p id="nombreCompleto-error" className="text-sm text-destructive">
                {state.errors.nombreCompleto[0]}
              </p>
            )}
          </div>

          {/* Cargo Field */}
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo *</Label>
            <Input
              id="cargo"
              name="cargo"
              defaultValue={colaborador.cargo}
              placeholder="Ej: Desarrollador, Diseñador, Gerente"
              required
              aria-describedby="cargo-error"
            />
            {state?.errors?.cargo && (
              <p id="cargo-error" className="text-sm text-destructive">
                {state.errors.cargo[0]}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={colaborador.email}
              placeholder="ejemplo@empresa.com"
              required
              aria-describedby="email-error"
            />
            {state?.errors?.email && (
              <p id="email-error" className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Cédula Field */}
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula de Ciudadanía</Label>
            <Input
              id="cedula"
              name="cedula"
              defaultValue={colaborador.cedula || ''}
              placeholder="Ej: 1234567890"
              aria-describedby="cedula-error"
            />
            {state?.errors?.cedula && (
              <p id="cedula-error" className="text-sm text-destructive">
                {state.errors.cedula[0]}
              </p>
            )}
          </div>

          {/* Dirección Field */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección de Vivienda</Label>
            <Input
              id="direccion"
              name="direccion"
              defaultValue={colaborador.direccion || ''}
              placeholder="Ej: Calle 123 #45-67, Barrio Centro"
              aria-describedby="direccion-error"
            />
            {state?.errors?.direccion && (
              <p id="direccion-error" className="text-sm text-destructive">
                {state.errors.direccion[0]}
              </p>
            )}
          </div>

          {/* Ciudad Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              name="ciudad"
              defaultValue={colaborador.ciudad || ''}
              placeholder="Ej: Buenos Aires"
              aria-describedby="ciudad-error"
            />
            {state?.errors?.ciudad && (
              <p id="ciudad-error" className="text-sm text-destructive">
                {state.errors.ciudad[0]}
              </p>
            )}
          </div>

          {/* Dotación / Checklist */}
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Dotación Entregada</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'dotacion_basePortatil', label: 'Base Portátil', key: 'basePortatil' },
                { name: 'dotacion_audifonos', label: 'Audífonos', key: 'audifonos' },
                { name: 'dotacion_apoyaPies', label: 'Apoya Pies', key: 'apoyaPies' },
                { name: 'dotacion_escritorio', label: 'Escritorio', key: 'escritorio' },
                { name: 'dotacion_sillaErgonomica', label: 'Silla Ergonómica', key: 'sillaErgonomica' },
                { name: 'dotacion_camara', label: 'Cámara', key: 'camara' },
                { name: 'dotacion_microfono', label: 'Micrófono', key: 'microfono' },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.name}
                    defaultChecked={dotacion[item.key] === true}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              defaultValue={colaborador.observaciones || ''}
              placeholder="Notas adicionales sobre el colaborador..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
