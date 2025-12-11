'use client'

import { useActionState, useEffect } from 'react'
import { createEquipo } from '@/app/equipos/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type NuevoEquipoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevoEquipoDialog({ open, onOpenChange }: NuevoEquipoDialogProps) {
  const [state, formAction, isPending] = useActionState(createEquipo, null)

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state?.success, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Equipo</DialogTitle>
          <DialogDescription>
            Registra un nuevo equipo en el inventario
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.message && !state.errors && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {state.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial">Serial *</Label>
              <Input
                id="serial"
                name="serial"
                placeholder="ABC123456"
                required
                aria-describedby="serial-error"
              />
              {state?.errors?.serial && (
                <p id="serial-error" className="text-sm text-destructive">
                  {state.errors.serial}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue="Desktop" required>
                <SelectTrigger id="tipo" aria-describedby="tipo-error">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Portátil">Portátil</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.tipo && (
                <p id="tipo-error" className="text-sm text-destructive">
                  {state.errors.tipo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                name="marca"
                placeholder="Dell, HP, Lenovo..."
                required
                aria-describedby="marca-error"
              />
              {state?.errors?.marca && (
                <p id="marca-error" className="text-sm text-destructive">
                  {state.errors.marca}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                name="modelo"
                placeholder="Inspiron 15, ThinkPad..."
                required
                aria-describedby="modelo-error"
              />
              {state?.errors?.modelo && (
                <p id="modelo-error" className="text-sm text-destructive">
                  {state.errors.modelo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="procesador">Procesador *</Label>
              <Input
                id="procesador"
                name="procesador"
                placeholder="Intel Core i5-12400"
                required
                aria-describedby="procesador-error"
              />
              {state?.errors?.procesador && (
                <p id="procesador-error" className="text-sm text-destructive">
                  {state.errors.procesador}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ram">RAM (GB) *</Label>
              <Input
                id="ram"
                name="ram"
                type="number"
                min="1"
                placeholder="8, 16, 32..."
                required
                aria-describedby="ram-error"
              />
              {state?.errors?.ram && (
                <p id="ram-error" className="text-sm text-destructive">
                  {state.errors.ram}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="almacenamiento">Almacenamiento *</Label>
              <Input
                id="almacenamiento"
                name="almacenamiento"
                placeholder="512GB SSD, 1TB HDD..."
                required
                aria-describedby="almacenamiento-error"
              />
              {state?.errors?.almacenamiento && (
                <p id="almacenamiento-error" className="text-sm text-destructive">
                  {state.errors.almacenamiento}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu">GPU *</Label>
              <Input
                id="gpu"
                name="gpu"
                placeholder="Integrada, NVIDIA GTX..."
                required
                aria-describedby="gpu-error"
              />
              {state?.errors?.gpu && (
                <p id="gpu-error" className="text-sm text-destructive">
                  {state.errors.gpu}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoSalud">Estado de Salud *</Label>
              <Select name="estadoSalud" defaultValue="Bueno" required>
                <SelectTrigger id="estadoSalud" aria-describedby="estadoSalud-error">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bueno">Bueno</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Malo">Malo</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.estadoSalud && (
                <p id="estadoSalud-error" className="text-sm text-destructive">
                  {state.errors.estadoSalud}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaAdquisicion">Fecha de Adquisición *</Label>
              <Input
                id="fechaAdquisicion"
                name="fechaAdquisicion"
                type="date"
                required
                aria-describedby="fechaAdquisicion-error"
              />
              {state?.errors?.fechaAdquisicion && (
                <p id="fechaAdquisicion-error" className="text-sm text-destructive">
                  {state.errors.fechaAdquisicion}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
