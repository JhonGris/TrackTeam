'use client'

import { useState, useEffect } from 'react'
import { Package, User } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateRepuesto, getAsignadoActual } from '@/app/inventario/actions'
import { asignarRepuestoAColaborador, desasignarRepuestoDeColaborador } from '@/app/colaboradores/actions'
import type { RepuestoConCategoria, CategoriaRepuesto } from '@/types/repuestos'
import type { Colaborador } from '@/types/models'

const UNIDADES = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'pieza', label: 'Pieza' },
  { value: 'metro', label: 'Metro' },
  { value: 'litro', label: 'Litro' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'caja', label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
]

type Props = {
  repuesto: RepuestoConCategoria
  categorias: CategoriaRepuesto[]
  colaboradores: Colaborador[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditarRepuestoDialog({ repuesto, categorias, colaboradores, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAssigneeId, setCurrentAssigneeId] = useState<string | null>(null)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null)
  const [loadingAssignee, setLoadingAssignee] = useState(false)

  // Load current assignee when dialog opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      setLoadingAssignee(true)
      getAsignadoActual(repuesto.id).then(result => {
        const id = result?.colaboradorId || null
        setCurrentAssigneeId(id)
        setSelectedAssigneeId(id)
        setLoadingAssignee(false)
      }).catch(() => {
        setLoadingAssignee(false)
      })
    }
  }, [open, repuesto.id])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updateRepuesto(repuesto.id, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Handle assignment change
    try {
      if (currentAssigneeId !== selectedAssigneeId) {
        if (currentAssigneeId) {
          const unassignResult = await desasignarRepuestoDeColaborador(currentAssigneeId, repuesto.id)
          if (unassignResult.error) {
            setError(unassignResult.error)
            setLoading(false)
            return
          }
        }
        if (selectedAssigneeId) {
          const assignResult = await asignarRepuestoAColaborador(selectedAssigneeId, repuesto.id)
          if (assignResult.error) {
            setError(assignResult.error)
            setLoading(false)
            return
          }
        }
      }
    } catch {
      setError('Error al actualizar la asignación')
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
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Editar Objeto de Inventario
          </DialogTitle>
          <DialogDescription>
            Modifica la información del objeto de inventario
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  defaultValue={repuesto.nombre}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  defaultValue={repuesto.descripcion || ''}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="codigoInterno">Código Interno</Label>
                <Input
                  id="codigoInterno"
                  name="codigoInterno"
                  defaultValue={repuesto.codigoInterno || ''}
                />
              </div>

              <div>
                <Label htmlFor="categoriaId">Categoría</Label>
                <Select name="categoriaId" defaultValue={repuesto.categoriaId || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.nombre}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock - Solo cantidad mínima, para cambiar stock usar movimientos */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Stock</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Stock actual: <strong>{repuesto.cantidad} {repuesto.unidad}s</strong>. 
                Para modificar el stock, usa &quot;Registrar Movimiento&quot;.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cantidadMinima">Cantidad Mínima</Label>
                  <Input
                    id="cantidadMinima"
                    name="cantidadMinima"
                    type="number"
                    min="0"
                    defaultValue={repuesto.cantidadMinima}
                  />
                </div>

                <div>
                  <Label htmlFor="unidad">Unidad</Label>
                  <Select name="unidad" defaultValue={repuesto.unidad}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Información Adicional</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    name="ubicacion"
                    defaultValue={repuesto.ubicacion || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    name="proveedor"
                    defaultValue={repuesto.proveedor || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="asignadoA" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Asignado a
                  </Label>
                  <Select 
                    value={selectedAssigneeId || 'none'} 
                    onValueChange={(val) => setSelectedAssigneeId(val === 'none' ? null : val)}
                    disabled={loadingAssignee}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={loadingAssignee ? "Cargando..." : "Sin asignar"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {colaboradores.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.nombre} {col.apellido} — {col.cargo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    La asignación se reflejará en la tarjeta del colaborador y su hoja de vida
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="activo"
                    name="activo"
                    defaultChecked={repuesto.activo}
                    value="true"
                  />
                  <Label htmlFor="activo" className="cursor-pointer">
                    Activo en inventario
                  </Label>
                </div>
              </div>
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
