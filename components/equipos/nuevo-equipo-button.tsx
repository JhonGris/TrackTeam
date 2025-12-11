'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NuevoEquipoDialog } from './nuevo-equipo-dialog-extended'

export function NuevoEquipoButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Equipo
      </Button>
      <NuevoEquipoDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
