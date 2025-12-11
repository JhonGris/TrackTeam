import { Resend } from 'resend'

// ============================================================================
// EMAIL SERVICE - Resend Configuration
// ============================================================================

/**
 * Lazy-initialized Resend client for sending emails
 * Set RESEND_API_KEY in your .env file
 * Get your API key at: https://resend.com/api-keys
 */
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured. Please set it in your .env file.')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Email configuration from environment
 */
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'TrackTeam <noreply@trackteam.app>',
  technicianEmail: process.env.TECHNICIAN_EMAIL || '',
  companyName: process.env.COMPANY_NAME || 'TrackTeam',
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export type MantenimientoEmailData = {
  colaborador: {
    nombre: string
    apellido: string
    email: string
  }
  equipo: {
    serial: string
    marca: string
    modelo: string
    tipo: string
  }
  mantenimiento: {
    tipo: string
    descripcion?: string | null
    fechaProgramada: Date
    horaEstimada?: string | null
  }
}

export type ReminderType = '7dias' | '3dias' | '1dia' | 'hoy'

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getReminderText(type: ReminderType): string {
  switch (type) {
    case '7dias':
      return 'dentro de 7 días'
    case '3dias':
      return 'dentro de 3 días'
    case '1dia':
      return 'mañana'
    case 'hoy':
      return 'hoy'
  }
}

/**
 * Generate HTML email template for maintenance reminder
 */
function generateReminderEmailHtml(data: MantenimientoEmailData, reminderType: ReminderType): string {
  const reminderText = getReminderText(reminderType)
  const formattedDate = formatDate(data.mantenimiento.fechaProgramada)
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 24px; margin: 0;">🔧 Recordatorio de Mantenimiento</h1>
      <p style="color: #64748b; margin-top: 8px;">Tienes un mantenimiento programado ${reminderText}</p>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">Detalles del Mantenimiento</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Tipo:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.mantenimiento.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Fecha:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${formattedDate}</td>
        </tr>
        ${data.mantenimiento.horaEstimada ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Hora estimada:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.mantenimiento.horaEstimada}</td>
        </tr>
        ` : ''}
        ${data.mantenimiento.descripcion ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Descripción:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.mantenimiento.descripcion}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <!-- Equipment Info -->
    <div style="background-color: #ecfeff; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #a5f3fc;">
      <h3 style="color: #0891b2; font-size: 16px; margin: 0 0 12px 0;">💻 Equipo</h3>
      <p style="color: #0f172a; margin: 0;">
        <strong>${data.equipo.marca} ${data.equipo.modelo}</strong><br>
        <span style="color: #64748b;">Serial: ${data.equipo.serial}</span><br>
        <span style="color: #64748b;">Tipo: ${data.equipo.tipo}</span>
      </p>
    </div>
    
    <!-- User Info -->
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; border: 1px solid #fcd34d;">
      <h3 style="color: #b45309; font-size: 16px; margin: 0 0 12px 0;">👤 Colaborador</h3>
      <p style="color: #0f172a; margin: 0;">
        <strong>${data.colaborador.nombre} ${data.colaborador.apellido}</strong><br>
        <span style="color: #64748b;">${data.colaborador.email}</span>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        Este es un correo automático enviado por ${emailConfig.companyName}.<br>
        Por favor, no responda a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Generate HTML email template for technician
 */
function generateTechnicianReminderHtml(data: MantenimientoEmailData, reminderType: ReminderType): string {
  const reminderText = getReminderText(reminderType)
  const formattedDate = formatDate(data.mantenimiento.fechaProgramada)
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 24px; margin: 0;">🛠️ Mantenimiento Programado</h1>
      <p style="color: #64748b; margin-top: 8px;">Recordatorio: Mantenimiento ${reminderText}</p>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #86efac;">
      <h2 style="color: #166534; font-size: 18px; margin: 0 0 16px 0;">📋 Detalles</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Tipo:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.mantenimiento.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Fecha:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${formattedDate}</td>
        </tr>
        ${data.mantenimiento.horaEstimada ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Hora:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.mantenimiento.horaEstimada}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <!-- Equipment -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      <div style="flex: 1; background-color: #f1f5f9; border-radius: 8px; padding: 16px;">
        <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 8px 0;">💻 Equipo</h3>
        <p style="color: #0f172a; margin: 0; font-weight: 600;">${data.equipo.marca} ${data.equipo.modelo}</p>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Serial: ${data.equipo.serial}</p>
      </div>
    </div>
    
    <!-- User -->
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; border: 1px solid #93c5fd;">
      <h3 style="color: #1d4ed8; font-size: 14px; margin: 0 0 8px 0;">👤 Colaborador</h3>
      <p style="color: #0f172a; margin: 0;">
        <strong>${data.colaborador.nombre} ${data.colaborador.apellido}</strong><br>
        <a href="mailto:${data.colaborador.email}" style="color: #2563eb;">${data.colaborador.email}</a>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        ${emailConfig.companyName} - Sistema de Gestión de Equipos
      </p>
    </div>
  </div>
</body>
</html>
`
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send maintenance reminder to collaborator
 */
export async function sendColaboradorReminder(
  data: MantenimientoEmailData,
  reminderType: ReminderType
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'Email not configured' }
  }

  const reminderText = getReminderText(reminderType)
  
  try {
    const { error } = await getResendClient().emails.send({
      from: emailConfig.from,
      to: data.colaborador.email,
      subject: `🔧 Recordatorio: Mantenimiento de tu equipo ${reminderText}`,
      html: generateReminderEmailHtml(data, reminderType),
    })

    if (error) {
      console.error('Error sending collaborator reminder:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending email:', err)
    return { success: false, error: 'Error sending email' }
  }
}

/**
 * Send maintenance reminder to technician
 */
export async function sendTechnicianReminder(
  data: MantenimientoEmailData,
  reminderType: ReminderType
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || !emailConfig.technicianEmail) {
    console.warn('Email configuration incomplete, skipping technician reminder')
    return { success: false, error: 'Email not configured' }
  }

  const reminderText = getReminderText(reminderType)
  
  try {
    const { error } = await getResendClient().emails.send({
      from: emailConfig.from,
      to: emailConfig.technicianEmail,
      subject: `🛠️ Mantenimiento programado ${reminderText} - ${data.equipo.serial}`,
      html: generateTechnicianReminderHtml(data, reminderType),
    })

    if (error) {
      console.error('Error sending technician reminder:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending email:', err)
    return { success: false, error: 'Error sending email' }
  }
}

/**
 * Send reminders to both collaborator and technician
 */
export async function sendMaintenanceReminders(
  data: MantenimientoEmailData,
  reminderType: ReminderType
): Promise<{ colaborador: boolean; technician: boolean }> {
  const [colaboradorResult, technicianResult] = await Promise.all([
    sendColaboradorReminder(data, reminderType),
    sendTechnicianReminder(data, reminderType),
  ])

  return {
    colaborador: colaboradorResult.success,
    technician: technicianResult.success,
  }
}

// ============================================================================
// SERVICE REPORT EMAIL TYPES & TEMPLATES
// ============================================================================

export type ServicioReporteEmailData = {
  colaborador: {
    nombre: string
    apellido: string
    email: string
  }
  equipo: {
    serial: string
    marca: string
    modelo: string
    tipo: string
  }
  servicio: {
    id: string
    tipo: string
    fechaServicio: Date
    problemas: string
    soluciones: string
    tiempoInvertido: number
    estadoResultante: string
  }
}

/**
 * Get badge color for service type
 */
function getServiceTypeBadge(tipo: string): { bg: string; text: string; border: string } {
  switch (tipo) {
    case 'Preventivo':
      return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' }
    case 'Correctivo':
      return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }
    case 'Limpieza':
      return { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' }
    case 'Actualización de Software':
      return { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' }
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }
  }
}

/**
 * Get badge color for health status
 */
function getHealthStatusBadge(estado: string): { bg: string; text: string; emoji: string } {
  switch (estado) {
    case 'Bueno':
      return { bg: '#d1fae5', text: '#059669', emoji: '✅' }
    case 'Regular':
      return { bg: '#fef3c7', text: '#d97706', emoji: '⚠️' }
    case 'Malo':
      return { bg: '#fee2e2', text: '#dc2626', emoji: '❌' }
    default:
      return { bg: '#f1f5f9', text: '#475569', emoji: '❓' }
  }
}

/**
 * Format time in minutes to human readable format
 */
function formatTiempo(minutos: number): string {
  if (minutos < 60) return `${minutos} minutos`
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  if (mins === 0) return `${horas} hora${horas > 1 ? 's' : ''}`
  return `${horas}h ${mins}min`
}

/**
 * Generate HTML email template for service report
 */
function generateServicioReporteHtml(data: ServicioReporteEmailData): string {
  const formattedDate = formatDate(data.servicio.fechaServicio)
  const tipoBadge = getServiceTypeBadge(data.servicio.tipo)
  const estadoBadge = getHealthStatusBadge(data.servicio.estadoResultante)
  const tiempoFormateado = formatTiempo(data.servicio.tiempoInvertido)

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
      <h1 style="color: #0f172a; font-size: 26px; margin: 0;">📋 Reporte de Servicio Técnico</h1>
      <p style="color: #64748b; margin-top: 8px; font-size: 15px;">Se ha completado un servicio en tu equipo</p>
    </div>
    
    <!-- Service Type & Date -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <span style="background-color: ${tipoBadge.bg}; color: ${tipoBadge.text}; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; border: 1px solid ${tipoBadge.border};">
        ${data.servicio.tipo}
      </span>
      <span style="color: #64748b; font-size: 14px;">
        📅 ${formattedDate}
      </span>
    </div>
    
    <!-- Equipment Info -->
    <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h2 style="color: #0f172a; font-size: 16px; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
        💻 Equipo Atendido
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 100px;">Marca/Modelo:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.equipo.marca} ${data.equipo.modelo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Serial:</td>
          <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${data.equipo.serial}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Tipo:</td>
          <td style="padding: 6px 0; color: #0f172a;">${data.equipo.tipo}</td>
        </tr>
      </table>
    </div>
    
    <!-- Problems Found -->
    <div style="background-color: #fef2f2; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #fecaca;">
      <h2 style="color: #991b1b; font-size: 16px; margin: 0 0 12px 0;">
        🔍 Problemas Encontrados
      </h2>
      <p style="color: #0f172a; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.servicio.problemas}</p>
    </div>
    
    <!-- Solutions Applied -->
    <div style="background-color: #f0fdf4; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
      <h2 style="color: #166534; font-size: 16px; margin: 0 0 12px 0;">
        ✅ Soluciones Aplicadas
      </h2>
      <p style="color: #0f172a; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.servicio.soluciones}</p>
    </div>
    
    <!-- Summary -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 140px; background-color: #f1f5f9; border-radius: 10px; padding: 16px; text-align: center;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 4px 0;">Tiempo Invertido</p>
        <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">⏱️ ${tiempoFormateado}</p>
      </div>
      <div style="flex: 1; min-width: 140px; background-color: ${estadoBadge.bg}; border-radius: 10px; padding: 16px; text-align: center;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 4px 0;">Estado Resultante</p>
        <p style="color: ${estadoBadge.text}; font-size: 18px; font-weight: 700; margin: 0;">${estadoBadge.emoji} ${data.servicio.estadoResultante}</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
        Si tienes alguna pregunta sobre este servicio, contacta al equipo de TI.
      </p>
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">
        Este es un correo automático enviado por ${emailConfig.companyName}.<br>
        Por favor, no responda a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Generate HTML email template for technician (copy of service report)
 */
function generateServicioReporteTechnicianHtml(data: ServicioReporteEmailData): string {
  const formattedDate = formatDate(data.servicio.fechaServicio)
  const tipoBadge = getServiceTypeBadge(data.servicio.tipo)
  const estadoBadge = getHealthStatusBadge(data.servicio.estadoResultante)
  const tiempoFormateado = formatTiempo(data.servicio.tiempoInvertido)

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
      <h1 style="color: #0f172a; font-size: 26px; margin: 0;">📋 Servicio Técnico Registrado</h1>
      <p style="color: #64748b; margin-top: 8px; font-size: 15px;">Copia del reporte enviado al colaborador</p>
    </div>
    
    <!-- Collaborator Info -->
    <div style="background-color: #eff6ff; border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid #bfdbfe;">
      <p style="color: #1d4ed8; font-size: 14px; margin: 0;">
        👤 <strong>${data.colaborador.nombre} ${data.colaborador.apellido}</strong> - 
        <a href="mailto:${data.colaborador.email}" style="color: #2563eb;">${data.colaborador.email}</a>
      </p>
    </div>
    
    <!-- Service Type & Date -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <span style="background-color: ${tipoBadge.bg}; color: ${tipoBadge.text}; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; border: 1px solid ${tipoBadge.border};">
        ${data.servicio.tipo}
      </span>
      <span style="color: #64748b; font-size: 14px;">
        📅 ${formattedDate}
      </span>
    </div>
    
    <!-- Equipment Info -->
    <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h2 style="color: #0f172a; font-size: 16px; margin: 0 0 12px 0;">
        💻 Equipo: ${data.equipo.marca} ${data.equipo.modelo}
      </h2>
      <p style="color: #64748b; margin: 0;">Serial: <span style="font-family: monospace; color: #0f172a;">${data.equipo.serial}</span> | Tipo: ${data.equipo.tipo}</p>
    </div>
    
    <!-- Problems & Solutions -->
    <div style="display: grid; gap: 16px; margin-bottom: 20px;">
      <div style="background-color: #fef2f2; border-radius: 10px; padding: 16px; border: 1px solid #fecaca;">
        <h3 style="color: #991b1b; font-size: 14px; margin: 0 0 8px 0;">🔍 Problemas</h3>
        <p style="color: #0f172a; margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${data.servicio.problemas}</p>
      </div>
      <div style="background-color: #f0fdf4; border-radius: 10px; padding: 16px; border: 1px solid #bbf7d0;">
        <h3 style="color: #166534; font-size: 14px; margin: 0 0 8px 0;">✅ Soluciones</h3>
        <p style="color: #0f172a; margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${data.servicio.soluciones}</p>
      </div>
    </div>
    
    <!-- Summary -->
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 120px; background-color: #f1f5f9; border-radius: 8px; padding: 12px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">Tiempo</p>
        <p style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 4px 0 0 0;">${tiempoFormateado}</p>
      </div>
      <div style="flex: 1; min-width: 120px; background-color: ${estadoBadge.bg}; border-radius: 8px; padding: 12px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">Estado</p>
        <p style="color: ${estadoBadge.text}; font-size: 16px; font-weight: 700; margin: 4px 0 0 0;">${estadoBadge.emoji} ${data.servicio.estadoResultante}</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        ${emailConfig.companyName} - Sistema de Gestión de Equipos
      </p>
    </div>
  </div>
</body>
</html>
`
}

// ============================================================================
// SERVICE REPORT EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send service report to collaborator
 */
export async function sendServicioReporteColaborador(
  data: ServicioReporteEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'Email no configurado' }
  }

  try {
    const { error } = await getResendClient().emails.send({
      from: emailConfig.from,
      to: data.colaborador.email,
      subject: `📋 Reporte de Servicio Técnico - ${data.equipo.marca} ${data.equipo.modelo}`,
      html: generateServicioReporteHtml(data),
    })

    if (error) {
      console.error('Error sending service report to collaborator:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending email:', err)
    return { success: false, error: 'Error al enviar el correo' }
  }
}

/**
 * Send service report copy to technician
 */
export async function sendServicioReporteTechnician(
  data: ServicioReporteEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || !emailConfig.technicianEmail) {
    console.warn('Email configuration incomplete, skipping technician copy')
    return { success: false, error: 'Email del técnico no configurado' }
  }

  try {
    const { error } = await getResendClient().emails.send({
      from: emailConfig.from,
      to: emailConfig.technicianEmail,
      subject: `📋 Servicio Completado - ${data.equipo.serial} (${data.colaborador.nombre} ${data.colaborador.apellido})`,
      html: generateServicioReporteTechnicianHtml(data),
    })

    if (error) {
      console.error('Error sending service report to technician:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending email:', err)
    return { success: false, error: 'Error al enviar el correo' }
  }
}

/**
 * Send service report to both collaborator and technician
 */
export async function sendServicioReporte(
  data: ServicioReporteEmailData
): Promise<{ colaborador: boolean; technician: boolean; error?: string }> {
  const [colaboradorResult, technicianResult] = await Promise.all([
    sendServicioReporteColaborador(data),
    sendServicioReporteTechnician(data),
  ])

  return {
    colaborador: colaboradorResult.success,
    technician: technicianResult.success,
    error: colaboradorResult.error || technicianResult.error,
  }
}

// ============================================================================
// INVENTORY MOVEMENT EMAILS
// ============================================================================

export type MovimientoInventarioEmailData = {
  colaborador: {
    nombre: string
    apellido: string
    email: string
    cargo: string
  }
  repuesto: {
    nombre: string
    descripcion?: string | null
    codigoInterno?: string | null
    fotoUrl?: string | null
    unidad: string
  }
  movimiento: {
    tipo: 'entrada' | 'salida' | 'ajuste'
    cantidad: number
    motivo?: string | null
    referencia?: string | null
    fecha: Date
  }
}

function getTipoMovimientoTexto(tipo: 'entrada' | 'salida' | 'ajuste'): { 
  accion: string
  emoji: string
  color: string
  bgColor: string
  borderColor: string
} {
  switch (tipo) {
    case 'entrada':
      return { 
        accion: 'asignado', 
        emoji: '📥', 
        color: '#166534',
        bgColor: '#f0fdf4',
        borderColor: '#86efac'
      }
    case 'salida':
      return { 
        accion: 'devuelto/retirado', 
        emoji: '📤', 
        color: '#991b1b',
        bgColor: '#fef2f2',
        borderColor: '#fca5a5'
      }
    case 'ajuste':
      return { 
        accion: 'ajustado', 
        emoji: '🔄', 
        color: '#1e40af',
        bgColor: '#eff6ff',
        borderColor: '#93c5fd'
      }
  }
}

/**
 * Generate HTML email for inventory movement notification
 */
function generateMovimientoInventarioHtml(data: MovimientoInventarioEmailData): string {
  const tipoInfo = getTipoMovimientoTexto(data.movimiento.tipo)
  const formattedDate = data.movimiento.fecha.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 24px; margin: 0;">${tipoInfo.emoji} Movimiento de Inventario</h1>
      <p style="color: #64748b; margin-top: 8px;">Se ha registrado un movimiento de inventario</p>
    </div>
    
    <!-- Alert Box -->
    <div style="background-color: ${tipoInfo.bgColor}; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid ${tipoInfo.borderColor};">
      <p style="color: ${tipoInfo.color}; font-size: 18px; font-weight: 600; margin: 0; text-align: center;">
        Se te ha ${tipoInfo.accion} un objeto del inventario
      </p>
    </div>
    
    <!-- Item Info -->
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">📦 Detalles del Objeto</h2>
      
      ${data.repuesto.fotoUrl ? `
      <div style="text-align: center; margin-bottom: 16px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${data.repuesto.fotoUrl}" 
             alt="${data.repuesto.nombre}" 
             style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #e2e8f0;" />
      </div>
      ` : ''}
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 120px;">Nombre:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.repuesto.nombre}</td>
        </tr>
        ${data.repuesto.codigoInterno ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Código:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.repuesto.codigoInterno}</td>
        </tr>
        ` : ''}
        ${data.repuesto.descripcion ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Descripción:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.repuesto.descripcion}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Cantidad:</td>
          <td style="padding: 8px 0; color: ${tipoInfo.color}; font-weight: 600; font-size: 18px;">
            ${Math.abs(data.movimiento.cantidad)} ${data.repuesto.unidad}(s)
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Movement Details -->
    <div style="background-color: #fefce8; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #fde047;">
      <h3 style="color: #854d0e; font-size: 16px; margin: 0 0 12px 0;">📋 Detalles del Movimiento</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 120px;">Tipo:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-transform: capitalize;">${data.movimiento.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Fecha:</td>
          <td style="padding: 8px 0; color: #0f172a;">${formattedDate}</td>
        </tr>
        ${data.movimiento.motivo ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Motivo:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.movimiento.motivo}</td>
        </tr>
        ` : ''}
        ${data.movimiento.referencia ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Referencia:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.movimiento.referencia}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <!-- User Info -->
    <div style="background-color: #ecfeff; border-radius: 8px; padding: 20px; border: 1px solid #a5f3fc;">
      <h3 style="color: #0891b2; font-size: 16px; margin: 0 0 12px 0;">👤 Asignado a</h3>
      <p style="color: #0f172a; margin: 0;">
        <strong>${data.colaborador.nombre} ${data.colaborador.apellido}</strong><br>
        <span style="color: #64748b;">${data.colaborador.cargo}</span><br>
        <span style="color: #64748b;">${data.colaborador.email}</span>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        Este es un correo automático enviado por ${emailConfig.companyName}.<br>
        Por favor, guarda este correo como comprobante del movimiento.
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Send inventory movement notification to collaborator
 */
export async function sendMovimientoInventarioEmail(
  data: MovimientoInventarioEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'Email no configurado' }
  }

  const tipoInfo = getTipoMovimientoTexto(data.movimiento.tipo)

  try {
    const { error } = await getResendClient().emails.send({
      from: emailConfig.from,
      to: data.colaborador.email,
      subject: `${tipoInfo.emoji} Movimiento de Inventario - ${data.repuesto.nombre}`,
      html: generateMovimientoInventarioHtml(data),
    })

    if (error) {
      console.error('Error sending inventory movement email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending email:', err)
    return { success: false, error: 'Error al enviar el correo' }
  }
}
