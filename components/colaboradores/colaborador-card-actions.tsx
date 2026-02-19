'use client'

import { useState } from 'react'
import { Pencil, Trash2, Paperclip, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditarColaboradorDialog } from './editar-colaborador-dialog'
import { ConfirmarEliminarColaboradorDialog } from './confirmar-eliminar-colaborador-dialog'
import { ColaboradorArchivosDialog } from './colaborador-archivos-dialog'
import { ColaboradorHistorialDialog } from './colaborador-historial-dialog'
import { DescargarHojaVidaButton } from './descargar-hoja-vida-button'
import type { Colaborador } from './colaboradores-list'

// ============================================================================
// CLIENT COMPONENT - Card Actions (Single Responsibility - User Interaction)
// ============================================================================

interface ColaboradorCardActionsProps {
  colaborador: Colaborador
}

/**
 * Interactive actions for colaborador card
 * Client Component - handles edit, delete, archivos, and historial dialogs
 */
export function ColaboradorCardActions({ colaborador }: ColaboradorCardActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [archivosOpen, setArchivosOpen] = useState(false)
  const [historialOpen, setHistorialOpen] = useState(false)

  const archivosFormateados = (colaborador.archivos || []).map(a => ({
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setArchivosOpen(true)}
          className="gap-1"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {colaborador._count.archivos > 0 && `(${colaborador._count.archivos})`}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHistorialOpen(true)}
          className="gap-1"
        >
          <History className="h-3.5 w-3.5" />
        </Button>
        <DescargarHojaVidaButton
          colaboradorId={colaborador.id}
          colaboradorNombre={`${colaborador.nombre} ${colaborador.apellido}`}
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

      <EditarColaboradorDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        colaborador={colaborador}
      />

      <ColaboradorArchivosDialog
        open={archivosOpen}
        onOpenChange={setArchivosOpen}
        colaboradorId={colaborador.id}
        colaboradorNombre={`${colaborador.nombre} ${colaborador.apellido}`}
        archivos={archivosFormateados}
      />

      <ColaboradorHistorialDialog
        open={historialOpen}
        onOpenChange={setHistorialOpen}
        colaboradorId={colaborador.id}
        colaboradorNombre={`${colaborador.nombre} ${colaborador.apellido}`}
      />

      <ConfirmarEliminarColaboradorDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        colaborador={colaborador}
      />
    </>
  )
}
