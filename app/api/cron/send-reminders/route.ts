import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendMaintenanceReminders, type ReminderType } from '@/lib/email'

// ============================================================================
// CRON JOB: Send Maintenance Reminders
// ============================================================================
// This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions)
// It will check for upcoming maintenance and send email reminders
//
// Reminder schedule:
// - 7 days before: notificacion7dias flag
// - 3 days before: notificacion3dias flag  
// - 1 day before: notificacion1dia flag
// - Same day: always send (no flag needed)
// ============================================================================

/**
 * Verify cron secret for security
 */
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // If no secret is configured, allow in development
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured. Set it in production!')
    return process.env.NODE_ENV === 'development'
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

/**
 * Calculate date ranges for different reminder types
 */
function getDateRanges() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Helper to get a specific date
  const getTargetDate = (daysFromNow: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + daysFromNow)
    return date
  }
  
  return {
    today: { start: today, end: tomorrow },
    in1Day: { start: getTargetDate(1), end: getTargetDate(2) },
    in3Days: { start: getTargetDate(3), end: getTargetDate(4) },
    in7Days: { start: getTargetDate(7), end: getTargetDate(8) },
  }
}

export async function GET(request: Request) {
  // Security: Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const results = {
    processed: 0,
    emailsSent: 0,
    errors: [] as string[],
    details: [] as { id: string; reminderType: string; colaborador: boolean; technician: boolean }[],
  }

  try {
    const dateRanges = getDateRanges()

    // ========================================================================
    // 1. Process TODAY's maintenance (always send reminder)
    // ========================================================================
    const todayMaintenance = await prisma.mantenimientoProgramado.findMany({
      where: {
        fechaProgramada: {
          gte: dateRanges.today.start,
          lt: dateRanges.today.end,
        },
        estado: 'Pendiente',
      },
      include: {
        equipo: {
          include: {
            colaborador: true,
          },
        },
      },
    })

    for (const maint of todayMaintenance) {
      if (maint.equipo.colaborador?.email) {
        results.processed++
        const result = await sendMaintenanceReminders(
          {
            colaborador: {
              nombre: maint.equipo.colaborador.nombre,
              apellido: maint.equipo.colaborador.apellido,
              email: maint.equipo.colaborador.email,
            },
            equipo: {
              serial: maint.equipo.serial,
              marca: maint.equipo.marca,
              modelo: maint.equipo.modelo,
              tipo: maint.equipo.tipo,
            },
            mantenimiento: {
              tipo: maint.tipo,
              descripcion: maint.descripcion,
              fechaProgramada: maint.fechaProgramada,
              horaEstimada: maint.horaEstimada,
            },
          },
          'hoy'
        )
        
        if (result.colaborador) results.emailsSent++
        if (result.technician) results.emailsSent++
        
        results.details.push({
          id: maint.id,
          reminderType: 'hoy',
          ...result,
        })
      }
    }

    // ========================================================================
    // 2. Process 1-day reminders
    // ========================================================================
    const oneDayMaintenance = await prisma.mantenimientoProgramado.findMany({
      where: {
        fechaProgramada: {
          gte: dateRanges.in1Day.start,
          lt: dateRanges.in1Day.end,
        },
        estado: 'Pendiente',
        notificacion1dia: false,
      },
      include: {
        equipo: {
          include: {
            colaborador: true,
          },
        },
      },
    })

    for (const maint of oneDayMaintenance) {
      if (maint.equipo.colaborador?.email) {
        results.processed++
        const result = await sendMaintenanceReminders(
          {
            colaborador: {
              nombre: maint.equipo.colaborador.nombre,
              apellido: maint.equipo.colaborador.apellido,
              email: maint.equipo.colaborador.email,
            },
            equipo: {
              serial: maint.equipo.serial,
              marca: maint.equipo.marca,
              modelo: maint.equipo.modelo,
              tipo: maint.equipo.tipo,
            },
            mantenimiento: {
              tipo: maint.tipo,
              descripcion: maint.descripcion,
              fechaProgramada: maint.fechaProgramada,
              horaEstimada: maint.horaEstimada,
            },
          },
          '1dia'
        )
        
        // Mark as notified
        await prisma.mantenimientoProgramado.update({
          where: { id: maint.id },
          data: { notificacion1dia: true },
        })
        
        if (result.colaborador) results.emailsSent++
        if (result.technician) results.emailsSent++
        
        results.details.push({
          id: maint.id,
          reminderType: '1dia',
          ...result,
        })
      }
    }

    // ========================================================================
    // 3. Process 3-day reminders
    // ========================================================================
    const threeDayMaintenance = await prisma.mantenimientoProgramado.findMany({
      where: {
        fechaProgramada: {
          gte: dateRanges.in3Days.start,
          lt: dateRanges.in3Days.end,
        },
        estado: 'Pendiente',
        notificacion3dias: false,
      },
      include: {
        equipo: {
          include: {
            colaborador: true,
          },
        },
      },
    })

    for (const maint of threeDayMaintenance) {
      if (maint.equipo.colaborador?.email) {
        results.processed++
        const result = await sendMaintenanceReminders(
          {
            colaborador: {
              nombre: maint.equipo.colaborador.nombre,
              apellido: maint.equipo.colaborador.apellido,
              email: maint.equipo.colaborador.email,
            },
            equipo: {
              serial: maint.equipo.serial,
              marca: maint.equipo.marca,
              modelo: maint.equipo.modelo,
              tipo: maint.equipo.tipo,
            },
            mantenimiento: {
              tipo: maint.tipo,
              descripcion: maint.descripcion,
              fechaProgramada: maint.fechaProgramada,
              horaEstimada: maint.horaEstimada,
            },
          },
          '3dias'
        )
        
        // Mark as notified
        await prisma.mantenimientoProgramado.update({
          where: { id: maint.id },
          data: { notificacion3dias: true },
        })
        
        if (result.colaborador) results.emailsSent++
        if (result.technician) results.emailsSent++
        
        results.details.push({
          id: maint.id,
          reminderType: '3dias',
          ...result,
        })
      }
    }

    // ========================================================================
    // 4. Process 7-day reminders
    // ========================================================================
    const sevenDayMaintenance = await prisma.mantenimientoProgramado.findMany({
      where: {
        fechaProgramada: {
          gte: dateRanges.in7Days.start,
          lt: dateRanges.in7Days.end,
        },
        estado: 'Pendiente',
        notificacion7dias: false,
      },
      include: {
        equipo: {
          include: {
            colaborador: true,
          },
        },
      },
    })

    for (const maint of sevenDayMaintenance) {
      if (maint.equipo.colaborador?.email) {
        results.processed++
        const result = await sendMaintenanceReminders(
          {
            colaborador: {
              nombre: maint.equipo.colaborador.nombre,
              apellido: maint.equipo.colaborador.apellido,
              email: maint.equipo.colaborador.email,
            },
            equipo: {
              serial: maint.equipo.serial,
              marca: maint.equipo.marca,
              modelo: maint.equipo.modelo,
              tipo: maint.equipo.tipo,
            },
            mantenimiento: {
              tipo: maint.tipo,
              descripcion: maint.descripcion,
              fechaProgramada: maint.fechaProgramada,
              horaEstimada: maint.horaEstimada,
            },
          },
          '7dias'
        )
        
        // Mark as notified
        await prisma.mantenimientoProgramado.update({
          where: { id: maint.id },
          data: { notificacion7dias: true },
        })
        
        if (result.colaborador) results.emailsSent++
        if (result.technician) results.emailsSent++
        
        results.details.push({
          id: maint.id,
          reminderType: '7dias',
          ...result,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} maintenance items, sent ${results.emailsSent} emails`,
      ...results,
    })
  } catch (error) {
    console.error('Error in send-reminders cron:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also allow POST for flexibility with cron services
export async function POST(request: Request) {
  return GET(request)
}
