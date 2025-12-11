'use client'

import { useState } from 'react'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Clock,
  CheckSquare,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { deletePlantilla, togglePlantillaActiva, type PlantillaMantenimiento } from '@/app/plantillas/actions'
import { EditarPlantillaDialog } from './editar-plantilla-dialog'
import { VerPlantillaDialog } from './ver-plantilla-dialog'

type Props = {
  plantillas: PlantillaMantenimiento[]
}

const tipoBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Preventivo': 'default',
  'Correctivo': 'destructive',
  'Limpieza': 'secondary',
  'Actualización de Software': 'outline',
}

export function PlantillasTable({ plantillas }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editPlantilla, setEditPlantilla] = useState<PlantillaMantenimiento | null>(null)
  const [viewPlantilla, setViewPlantilla] = useState<PlantillaMantenimiento | null>(null)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await deletePlantilla(deleteId)
    setDeleting(false)
    setDeleteId(null)
  }

  async function handleToggle(id: string) {
    await togglePlantillaActiva(id)
  }

  function getChecklistCount(checklist: string | null): number {
    if (!checklist) return 0
    try {
      const items = JSON.parse(checklist)
      return Array.isArray(items) ? items.length : 0
    } catch {
      return 0
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Tiempo Est.</TableHead>
              <TableHead className="text-center">Checklist</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plantillas.map((plantilla) => (
              <TableRow key={plantilla.id} className={!plantilla.activa ? 'opacity-50' : ''}>
                <TableCell>
                  <div>
                    <div className="font-medium">{plantilla.nombre}</div>
                    {plantilla.descripcion && (
                      <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {plantilla.descripcion}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={tipoBadgeVariant[plantilla.tipo] || 'secondary'}>
                    {plantilla.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{plantilla.tiempoEstimado} min</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getChecklistCount(plantilla.checklist) > 0 ? (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      <span>{getChecklistCount(plantilla.checklist)} tareas</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={plantilla.activa ? 'default' : 'secondary'}>
                    {plantilla.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewPlantilla(plantilla)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditPlantilla(plantilla)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggle(plantilla.id)}>
                        {plantilla.activa ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(plantilla.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar plantilla?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La plantilla será eliminada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editPlantilla && (
        <EditarPlantillaDialog
          plantilla={editPlantilla}
          open={!!editPlantilla}
          onOpenChange={(open: boolean) => !open && setEditPlantilla(null)}
        />
      )}

      {/* View Dialog */}
      {viewPlantilla && (
        <VerPlantillaDialog
          plantilla={viewPlantilla}
          open={!!viewPlantilla}
          onOpenChange={(open: boolean) => !open && setViewPlantilla(null)}
        />
      )}
    </>
  )
}
