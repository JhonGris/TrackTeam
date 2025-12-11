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
      <DialogContent className="sm:max-w-[500px]">
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
