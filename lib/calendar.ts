// ============================================================================
// GOOGLE CALENDAR INTEGRATION
// Generate iCalendar (.ics) files and Google Calendar links
// ============================================================================

export type CalendarEventData = {
  title: string
  description: string
  location?: string
  startDate: Date
  endDate: Date
  // For recurrent events
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    interval?: number
    until?: Date
    count?: number
  }
}

/**
 * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHMMSS)
 */
function formatGoogleCalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
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

/**
 * Generate iCalendar (.ics) file content
 */
export function generateICalEvent(event: CalendarEventData): string {
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@trackteam.app`
  const now = formatICalDate(new Date())
  const start = formatICalDate(event.startDate)
  const end = formatICalDate(event.endDate)
  
  let rrule = ''
  if (event.recurrence) {
    const parts = [`FREQ=${event.recurrence.frequency}`]
    if (event.recurrence.interval && event.recurrence.interval > 1) {
      parts.push(`INTERVAL=${event.recurrence.interval}`)
    }
    if (event.recurrence.until) {
      parts.push(`UNTIL=${formatICalDate(event.recurrence.until)}`)
    }
    if (event.recurrence.count) {
      parts.push(`COUNT=${event.recurrence.count}`)
    }
    rrule = `RRULE:${parts.join(';')}\r\n`
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TrackTeam//Maintenance Calendar//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
${rrule}SUMMARY:${escapeICalText(event.title)}
DESCRIPTION:${escapeICalText(event.description)}
${event.location ? `LOCATION:${escapeICalText(event.location)}\r\n` : ''}STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Recordatorio: ${escapeICalText(event.title)}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Recordatorio: ${escapeICalText(event.title)}
END:VALARM
END:VEVENT
END:VCALENDAR`
}

/**
 * Generate Google Calendar URL for adding event
 * This creates a link that opens Google Calendar with the event pre-filled
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const baseUrl = 'https://calendar.google.com/calendar/render'
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleCalDate(event.startDate)}/${formatGoogleCalDate(event.endDate)}`,
    details: event.description,
  })
  
  if (event.location) {
    params.set('location', event.location)
  }
  
  // Add recurrence
  if (event.recurrence) {
    let recur = `RRULE:FREQ=${event.recurrence.frequency}`
    if (event.recurrence.interval && event.recurrence.interval > 1) {
      recur += `;INTERVAL=${event.recurrence.interval}`
    }
    if (event.recurrence.until) {
      recur += `;UNTIL=${formatGoogleCalDate(event.recurrence.until)}`
    }
    params.set('recur', recur)
  }
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEventData): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose'
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
  })
  
  if (event.location) {
    params.set('location', event.location)
  }
  
  return `${baseUrl}?${params.toString()}`
}

// ============================================================================
// MAINTENANCE-SPECIFIC FUNCTIONS
// ============================================================================

type MantenimientoCalendarData = {
  tipo: string
  descripcion?: string | null
  fechaProgramada: Date
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

/**
 * Convert maintenance frequency to iCal format
 */
function frecuenciaToICalFrequency(
  frecuencia: string
): 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null {
  switch (frecuencia) {
    case 'mensual':
      return 'MONTHLY'
    case 'trimestral':
      return 'MONTHLY' // Will use interval 3
    case 'semestral':
      return 'MONTHLY' // Will use interval 6
    case 'anual':
      return 'YEARLY'
    default:
      return null
  }
}

/**
 * Get interval for trimestral/semestral frequencies
 */
function getFrecuenciaInterval(frecuencia: string): number | undefined {
  switch (frecuencia) {
    case 'trimestral':
      return 3
    case 'semestral':
      return 6
    default:
      return undefined
  }
}

/**
 * Create calendar event data from maintenance
 */
export function createMaintenanceCalendarEvent(data: MantenimientoCalendarData): CalendarEventData {
  // Parse time from horaEstimada (format: HH:mm)
  let startDate = new Date(data.fechaProgramada)
  if (data.horaEstimada) {
    const [hours, minutes] = data.horaEstimada.split(':').map(Number)
    startDate.setHours(hours, minutes, 0, 0)
  } else {
    startDate.setHours(9, 0, 0, 0) // Default to 9 AM
  }
  
  // Calculate end date based on duration (default 60 min)
  const duration = data.duracionEstimada || 60
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000)
  
  // Build title
  const title = `🔧 Mantenimiento ${data.tipo} - ${data.equipo.marca} ${data.equipo.modelo}`
  
  // Build description
  const lines = [
    `Tipo: ${data.tipo}`,
    `Equipo: ${data.equipo.marca} ${data.equipo.modelo}`,
    `Serial: ${data.equipo.serial}`,
  ]
  
  if (data.colaborador) {
    lines.push(`Colaborador: ${data.colaborador.nombre} ${data.colaborador.apellido}`)
  }
  
  if (data.descripcion) {
    lines.push(``, `Descripción:`, data.descripcion)
  }
  
  const description = lines.join('\n')
  
  // Build recurrence if applicable
  let recurrence: CalendarEventData['recurrence'] = undefined
  if (data.esRecurrente && data.frecuencia) {
    const frequency = frecuenciaToICalFrequency(data.frecuencia)
    if (frequency) {
      recurrence = {
        frequency,
        interval: getFrecuenciaInterval(data.frecuencia),
      }
    }
  }
  
  return {
    title,
    description,
    startDate,
    endDate,
    recurrence,
  }
}

/**
 * Generate all calendar URLs for a maintenance
 */
export function generateMaintenanceCalendarUrls(data: MantenimientoCalendarData): {
  google: string
  outlook: string
  icsContent: string
} {
  const event = createMaintenanceCalendarEvent(data)
  
  return {
    google: generateGoogleCalendarUrl(event),
    outlook: generateOutlookCalendarUrl(event),
    icsContent: generateICalEvent(event),
  }
}
