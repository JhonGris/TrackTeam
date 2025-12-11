'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { NuevoServicioDialog } from './nuevo-servicio-dialog'

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

type PlantillaSelect = {
  id: string
  nombre: string
  tipo: string
  problemasTipicos: string
  solucionesTipicas: string
  tiempoEstimado: number
  checklist: string | null
}

type NuevoServicioButtonProps = {
  equipos: EquipoSelect[]
  plantillas?: PlantillaSelect[]
}

export function NuevoServicioButton({ equipos, plantillas = [] }: NuevoServicioButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Servicio
      </Button>
      <NuevoServicioDialog 
        open={open} 
        onOpenChange={setOpen} 
        equipos={equipos}
        plantillas={plantillas}
      />
    </>
  )
}
