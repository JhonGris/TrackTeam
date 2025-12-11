'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Download, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type MantenimientoData = {
  tipo: string
  descripcion?: string | null
  fechaProgramada: string // ISO date
  horaEstimada?: string | null
  duracionEstimada?: number | null
  esRecurrente: boolean
  frecuencia?: string | null
  equipo: {
    serial: string
    marca: string
    modelo: string
  }
  colaborador?: {
    nombre: string
    apellido: string
  } | null
}

interface CalendarButtonsProps {
  mantenimiento: MantenimientoData
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * Convert maintenance frequency to iCal format
 */
function frecuenciaToRecurrence(frecuencia: string): string | null {
  switch (frecuencia) {
    case 'mensual':
      return 'RRULE:FREQ=MONTHLY'
    case 'trimestral':
      return 'RRULE:FREQ=MONTHLY;INTERVAL=3'
    case 'semestral':
      return 'RRULE:FREQ=MONTHLY;INTERVAL=6'
    case 'anual':
      return 'RRULE:FREQ=YEARLY'
    default:
      return null
  }
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHMMSSZ)
 */
function formatGoogleCalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

/**
 * Format date for iCalendar format
 */
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Escape text for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function buildEventData(mantenimiento: MantenimientoData) {
  // Parse date and time
  let startDate = new Date(mantenimiento.fechaProgramada)
  if (mantenimiento.horaEstimada) {
    const [hours, minutes] = mantenimiento.horaEstimada.split(':').map(Number)
    startDate.setHours(hours, minutes, 0, 0)
  } else {
    startDate.setHours(9, 0, 0, 0) // Default to 9 AM
  }

  // Calculate end date based on duration (default 60 min)
  const duration = mantenimiento.duracionEstimada || 60
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

  // Build title
  const title = `🔧 Mantenimiento ${mantenimiento.tipo} - ${mantenimiento.equipo.marca} ${mantenimiento.equipo.modelo}`

  // Build description
  const lines = [
    `Tipo: ${mantenimiento.tipo}`,
    `Equipo: ${mantenimiento.equipo.marca} ${mantenimiento.equipo.modelo}`,
    `Serial: ${mantenimiento.equipo.serial}`,
  ]

  if (mantenimiento.colaborador) {
    lines.push(
      `Colaborador: ${mantenimiento.colaborador.nombre} ${mantenimiento.colaborador.apellido}`
    )
  }

  if (mantenimiento.descripcion) {
    lines.push('', `Descripción:`, mantenimiento.descripcion)
  }

  const description = lines.join('\n')

  return { startDate, endDate, title, description }
}

export function CalendarButtons({
  mantenimiento,
  variant = 'outline',
  size = 'sm',
}: CalendarButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleGoogleCalendar = () => {
    const { startDate, endDate, title, description } = buildEventData(mantenimiento)

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatGoogleCalDate(startDate)}/${formatGoogleCalDate(endDate)}`,
      details: description,
    })

    // Add recurrence
    if (mantenimiento.esRecurrente && mantenimiento.frecuencia) {
      const recur = frecuenciaToRecurrence(mantenimiento.frecuencia)
      if (recur) {
        params.set('recur', recur)
      }
    }

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleOutlookCalendar = () => {
    const { startDate, endDate, title, description } = buildEventData(mantenimiento)

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: title,
      body: description,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
    })

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleDownloadICS = () => {
    setIsDownloading(true)

    const { startDate, endDate, title, description } = buildEventData(mantenimiento)
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@trackteam.app`
    const now = formatICalDate(new Date())
    const start = formatICalDate(startDate)
    const end = formatICalDate(endDate)

    let rrule = ''
    if (mantenimiento.esRecurrente && mantenimiento.frecuencia) {
      const recur = frecuenciaToRecurrence(mantenimiento.frecuencia)
      if (recur) {
        rrule = `${recur}\r\n`
      }
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TrackTeam//Maintenance Calendar//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
${rrule}SUMMARY:${escapeICalText(title)}
DESCRIPTION:${escapeICalText(description)}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Recordatorio: ${escapeICalText(title)}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Recordatorio: ${escapeICalText(title)}
END:VALARM
END:VEVENT
END:VCALENDAR`

    // Create and download file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mantenimiento-${mantenimiento.equipo.serial}-${mantenimiento.fechaProgramada}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsDownloading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Calendar className="h-4 w-4 mr-2" />
          Agregar al Calendario
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} disabled={isDownloading}>
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Descargando...' : 'Descargar .ics'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
