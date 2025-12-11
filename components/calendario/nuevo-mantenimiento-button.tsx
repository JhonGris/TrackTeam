'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NuevoMantenimientoDialog } from './nuevo-mantenimiento-dialog'

type EquipoSelect = {
  id: string
  serial: string
  marca: string
  modelo: string
  colaborador: {
    nombre: string
    apellido: string
  } | null
}

interface NuevoMantenimientoButtonProps {
  equipos: EquipoSelect[]
}

export function NuevoMantenimientoButton({ equipos }: NuevoMantenimientoButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Programar Mantenimiento
      </Button>
      <NuevoMantenimientoDialog
        equipos={equipos}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
