'use client'

import { ServicioCard } from './servicio-card'
import { ServicioListRow } from './servicio-list-row'
import type { ArchivoServicio } from '@/types/servicios'

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

type ServicioWithEquipo = {
  id: string
  equipoId: string
  tipo: string
  fechaServicio: Date
  problemas: string
  soluciones: string
  tiempoInvertido: number
  estadoResultante: string
  archivos?: ArchivoServicio[]
  equipo: {
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
    colaborador: {
      id: string
      nombre: string
      apellido: string
    } | null
  }
}

type ServiciosListProps = {
  servicios: ServicioWithEquipo[]
  equipos: EquipoSelect[]
  view?: 'grid' | 'list'
}

export function ServiciosList({ servicios, equipos, view = 'grid' }: ServiciosListProps) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {servicios.map((servicio) => (
          <ServicioListRow key={servicio.id} servicio={servicio} equipos={equipos} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servicios.map((servicio) => (
        <ServicioCard 
          key={servicio.id} 
          servicio={servicio} 
          equipos={equipos}
        />
      ))}
    </div>
  )
}
