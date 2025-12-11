'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MantenimientoDetalleDialog } from './mantenimiento-detalle-dialog'

type MantenimientoConEquipo = {
  id: string
  tipo: string
  descripcion: string | null
  fechaProgramada: Date
  horaEstimada: string | null
  duracionEstimada: number | null
  esRecurrente: boolean
  frecuencia: string | null
  estado: string
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

interface MantenimientosCalendarioProps {
  mantenimientos: MantenimientoConEquipo[]
  equipos: EquipoSelect[]
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function getTipoColor(tipo: string): string {
  switch (tipo) {
    case 'Preventivo': return 'bg-blue-500'
    case 'Correctivo': return 'bg-red-500'
    case 'Limpieza': return 'bg-green-500'
    case 'Actualización de Software': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'Pendiente': return <Badge variant="outline" className="text-blue-600 border-blue-300">Pendiente</Badge>
    case 'Completado': return <Badge variant="default" className="bg-green-500">Completado</Badge>
    case 'Cancelado': return <Badge variant="secondary">Cancelado</Badge>
    case 'Vencido': return <Badge variant="destructive">Vencido</Badge>
    default: return <Badge variant="outline">{estado}</Badge>
  }
}

export function MantenimientosCalendario({ mantenimientos, equipos }: MantenimientosCalendarioProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoConEquipo | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const totalDays = lastDayOfMonth.getDate()

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Group mantenimientos by day
  const mantenimientosByDay = mantenimientos.reduce((acc, m) => {
    const day = new Date(m.fechaProgramada).getDate()
    if (!acc[day]) acc[day] = []
    acc[day].push(m)
    return acc
  }, {} as Record<number, MantenimientoConEquipo[]>)

  // Generate calendar days
  const calendarDays = []
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  // Empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-24 border-b border-r bg-muted/20" />)
  }

  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const isToday = isCurrentMonth && today.getDate() === day
    const dayMantenimientos = mantenimientosByDay[day] || []

    calendarDays.push(
      <div
        key={day}
        className={cn(
          'h-24 border-b border-r p-1 overflow-hidden',
          isToday && 'bg-blue-50'
        )}
      >
        <div className={cn(
          'text-sm font-medium mb-1',
          isToday && 'text-blue-600'
        )}>
          {day}
        </div>
        <div className="space-y-0.5 overflow-y-auto max-h-16">
          {dayMantenimientos.slice(0, 3).map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMantenimiento(m)}
              className={cn(
                'w-full text-left text-xs px-1 py-0.5 rounded truncate text-white',
                getTipoColor(m.tipo),
                m.estado === 'Completado' && 'opacity-50',
                m.estado === 'Cancelado' && 'opacity-30 line-through'
              )}
              title={`${m.tipo} - ${m.equipo.marca} ${m.equipo.modelo}`}
            >
              {m.horaEstimada && `${m.horaEstimada} `}
              {m.equipo.marca}
            </button>
          ))}
          {dayMantenimientos.length > 3 && (
            <div className="text-xs text-muted-foreground pl-1">
              +{dayMantenimientos.length - 3} más
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Hoy
            </Button>
          </div>
          <h2 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Preventivo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Correctivo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Limpieza</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span>Software</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-muted">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center text-sm font-medium py-2 border-b">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedMantenimiento && (
        <MantenimientoDetalleDialog
          mantenimiento={selectedMantenimiento}
          equipos={equipos}
          open={!!selectedMantenimiento}
          onOpenChange={(open: boolean) => !open && setSelectedMantenimiento(null)}
        />
      )}
    </>
  )
}
