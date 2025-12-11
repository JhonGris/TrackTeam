'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Monitor, User, Wrench } from 'lucide-react'
import { ServicioCardActions } from './servicio-card-actions'
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

type Props = {
  servicio: ServicioWithEquipo
  equipos: EquipoSelect[]
}

const estadoStyles: Record<string, string> = {
  Bueno: 'bg-primary/10 text-primary border-primary/20',
  Regular: 'bg-accent/10 text-accent border-accent/20',
  Malo: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function ServicioListRow({ servicio, equipos }: Props) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span className="font-semibold text-foreground">{servicio.tipo}</span>
            <Badge variant="outline" className={estadoStyles[servicio.estadoResultante] || ''}>
              {servicio.estadoResultante}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(servicio.fechaServicio).toLocaleDateString('es-CO')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {servicio.tiempoInvertido} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Monitor className="h-3.5 w-3.5" />
              {servicio.equipo.marca} {servicio.equipo.modelo} ({servicio.equipo.serial})
            </span>
            {servicio.equipo.colaborador && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {servicio.equipo.colaborador.nombre} {servicio.equipo.colaborador.apellido}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {servicio.problemas}
          </p>
        </div>

        <ServicioCardActions servicio={servicio} equipos={equipos} />
      </CardContent>
    </Card>
  )
}