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
import { createColaborador } from '@/app/colaboradores/actions'

// ============================================================================
// CLIENT COMPONENT - Nuevo Colaborador Dialog (Progressive Enhancement)
// ============================================================================

interface NuevoColaboradorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog for creating new colaborador
 * Client Component - uses useActionState for progressive enhancement
 * Follows Server Actions pattern from Next.js 16 docs
 */
export function NuevoColaboradorDialog({ open, onOpenChange }: NuevoColaboradorDialogProps) {
  const [state, formAction, pending] = useActionState(createColaborador, null)

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
          <DialogTitle>Nuevo Colaborador</DialogTitle>
          <DialogDescription>
            Crea un nuevo registro de colaborador en el sistema
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
                { name: 'dotacion_basePortatil', label: 'Base Portátil' },
                { name: 'dotacion_audifonos', label: 'Audífonos' },
                { name: 'dotacion_apoyaPies', label: 'Apoya Pies' },
                { name: 'dotacion_escritorio', label: 'Escritorio' },
                { name: 'dotacion_sillaErgonomica', label: 'Silla Ergonómica' },
                { name: 'dotacion_camara', label: 'Cámara' },
                { name: 'dotacion_microfono', label: 'Micrófono' },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name={item.name} className="h-4 w-4 rounded border-gray-300" />
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
              {pending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
