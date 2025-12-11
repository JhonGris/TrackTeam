'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditarEquipoDialog } from './editar-equipo-dialog-extended'
import { ConfirmarEliminarEquipoDialog } from './confirmar-eliminar-equipo-dialog'
import { EquipoArchivosDialog } from './equipo-archivos-dialog'
import { DescargarPDFButton } from './descargar-pdf-button'
import type { EquipoWithRelations } from '@/types/equipos'

// ============================================================================
// CLIENT COMPONENT - Card Actions (Single Responsibility - User Interaction)
// ============================================================================

interface EquipoCardActionsProps {
  equipo: EquipoWithRelations
}

/**
 * Interactive actions for equipo card
 * Client Component - handles edit and delete dialogs
 * Follows Single Responsibility - only manages UI state for actions
 */
export function EquipoCardActions({ equipo }: EquipoCardActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Extract Equipo fields (without relations) for the edit dialog
  const { colaborador, _count, archivos, ...equipoData } = equipo

  // Format archivos for the dialog
  const archivosFormateados = (archivos || []).map(a => ({
    ...a,
    createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
  }))

  return (
    <>
      <div className="flex gap-2 pt-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="flex-1 min-w-[80px]"
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Editar
        </Button>
        <EquipoArchivosDialog
          equipoId={equipo.id}
          equipoNombre={`${equipo.marca} ${equipo.modelo}`}
          archivos={archivosFormateados}
        />
        <DescargarPDFButton
          equipoId={equipo.id}
          equipoNombre={`${equipo.marca}-${equipo.modelo}`}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <EditarEquipoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        equipo={equipoData}
      />

      <ConfirmarEliminarEquipoDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        equipo={equipo}
      />
    </>
  )
}
