'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditarColaboradorDialog } from './editar-colaborador-dialog'
import { ConfirmarEliminarColaboradorDialog } from './confirmar-eliminar-colaborador-dialog'

// ============================================================================
// CLIENT COMPONENT - Card Actions (Single Responsibility - User Interaction)
// ============================================================================

interface ColaboradorCardActionsProps {
  colaborador: {
    id: string
    nombre: string
    apellido: string
    cargo: string
    email: string
    ciudad: string | null
  }
}

/**
 * Interactive actions for colaborador card
 * Client Component - handles edit and delete dialogs
 * Follows Single Responsibility - only manages UI state for actions
 */
export function ColaboradorCardActions({ colaborador }: ColaboradorCardActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="flex-1"
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>

      <EditarColaboradorDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        colaborador={colaborador}
      />

      <ConfirmarEliminarColaboradorDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        colaborador={colaborador}
      />
    </>
  )
}
