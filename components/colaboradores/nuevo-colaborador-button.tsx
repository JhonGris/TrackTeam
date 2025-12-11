'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NuevoColaboradorDialog } from './nuevo-colaborador-dialog'

// ============================================================================
// CLIENT COMPONENT - Button with Dialog State (Single Responsibility)
// ============================================================================

/**
 * Button component that triggers new colaborador dialog
 * Client Component - manages dialog open/closed state
 * Follows Single Responsibility - only handles button UI and dialog visibility
 */
export function NuevoColaboradorButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Colaborador
      </Button>

      <NuevoColaboradorDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
