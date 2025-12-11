'use client'

import { useState } from 'react'
import { Tags, Pencil, Trash2, MoreHorizontal, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { updateCategoria, deleteCategoria } from '@/app/inventario/actions'
import type { CategoriaRepuesto } from '@/types/repuestos'

const COLORES_PREDEFINIDOS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
]

type CategoriaConCount = CategoriaRepuesto & {
  _count?: { repuestos: number }
}

type Props = {
  categorias: CategoriaConCount[]
}

export function CategoriasSection({ categorias }: Props) {
  const [editando, setEditando] = useState<CategoriaConCount | null>(null)
  const [eliminando, setEliminando] = useState<CategoriaConCount | null>(null)

  if (categorias.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay categorías</h3>
          <p className="text-muted-foreground">
            Crea categorías para organizar tus repuestos
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categorías de Repuestos</CardTitle>
          <CardDescription>
            {categorias.length} categoría(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: categoria.color + '20' }}
                  >
                    <Tags
                      className="h-5 w-5"
                      style={{ color: categoria.color }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{categoria.nombre}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      {categoria._count?.repuestos || 0} repuesto(s)
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditando(categoria)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setEliminando(categoria)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      {editando && (
        <EditarCategoriaDialog
          categoria={editando}
          open={!!editando}
          onOpenChange={(open: boolean) => !open && setEditando(null)}
        />
      )}

      {/* Diálogo de eliminación */}
      {eliminando && (
        <EliminarCategoriaDialog
          categoria={eliminando}
          open={!!eliminando}
          onOpenChange={(open: boolean) => !open && setEliminando(null)}
        />
      )}
    </>
  )
}

// Componente interno para editar categoría
function EditarCategoriaDialog({
  categoria,
  open,
  onOpenChange,
}: {
  categoria: CategoriaConCount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(categoria.color)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('color', selectedColor)
    const result = await updateCategoria(categoria.id, formData)

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Modifica la información de la categoría
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={categoria.nombre}
                required
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={categoria.descripcion || ''}
                rows={2}
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORES_PREDEFINIDOS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
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
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente interno para eliminar categoría
function EliminarCategoriaDialog({
  categoria,
  open,
  onOpenChange,
}: {
  categoria: CategoriaConCount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const result = await deleteCategoria(categoria.id)

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Eliminar Categoría</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la categoría{' '}
            <strong>{categoria.nombre}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {(categoria._count?.repuestos || 0) > 0 ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Esta categoría tiene {categoria._count?.repuestos} repuesto(s) asociado(s).
                Debes reasignarlos a otra categoría antes de eliminar.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
          )}

          {error && (
            <div className="mt-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || (categoria._count?.repuestos || 0) > 0}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
