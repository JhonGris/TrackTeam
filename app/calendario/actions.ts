'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// ============================================================================
// SCHEMAS - Validation Layer
// ============================================================================

const MantenimientoProgramadoSchema = z.object({
  equipoId: z.string().min(1, 'Debe seleccionar un equipo'),
  tipo: z.enum(['Preventivo', 'Correctivo', 'Limpieza', 'Actualización de Software'], {
    message: 'Tipo de mantenimiento inválido',
  }),
  descripcion: z.string().optional(),
  fechaProgramada: z.string().refine((date) => {
    const programDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return programDate >= today
  }, 'La fecha programada no puede ser pasada'),
  horaEstimada: z.string().optional(),
  duracionEstimada: z.coerce.number().min(1).optional(),
  esRecurrente: z.coerce.boolean().default(false),
  frecuencia: z.enum(['mensual', 'trimestral', 'semestral', 'anual', 'personalizado']).optional(),
  diasIntervalo: z.coerce.number().min(1).optional(),
  fechaFinRecurrencia: z.string().optional(),
})

export type MantenimientoFormState = {
  errors?: {
    equipoId?: string[]
    tipo?: string[]
    descripcion?: string[]
    fechaProgramada?: string[]
    horaEstimada?: string[]
    duracionEstimada?: string[]
    esRecurrente?: string[]
    frecuencia?: string[]
    diasIntervalo?: string[]
    fechaFinRecurrencia?: string[]
    _form?: string[]
  }
  message?: string
  success?: boolean
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Create a new mantenimiento programado
 */
export async function createMantenimientoProgramado(
  prevState: MantenimientoFormState | null,
  formData: FormData
): Promise<MantenimientoFormState> {
  const validatedFields = MantenimientoProgramadoSchema.safeParse({
    equipoId: formData.get('equipoId'),
    tipo: formData.get('tipo'),
    descripcion: formData.get('descripcion'),
    fechaProgramada: formData.get('fechaProgramada'),
    horaEstimada: formData.get('horaEstimada'),
    duracionEstimada: formData.get('duracionEstimada'),
    esRecurrente: formData.get('esRecurrente') === 'true',
    frecuencia: formData.get('frecuencia') || undefined,
    diasIntervalo: formData.get('diasIntervalo') || undefined,
    fechaFinRecurrencia: formData.get('fechaFinRecurrencia') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const { fechaProgramada, fechaFinRecurrencia, ...rest } = validatedFields.data
    
    await prisma.mantenimientoProgramado.create({
      data: {
        ...rest,
        fechaProgramada: new Date(fechaProgramada),
        fechaFinRecurrencia: fechaFinRecurrencia ? new Date(fechaFinRecurrencia) : null,
      },
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return {
        message: 'El equipo seleccionado no existe',
        errors: {
          equipoId: ['El equipo seleccionado no existe'],
        },
      }
    }

    return {
      message: 'Ocurrió un error al crear el mantenimiento programado',
      errors: {
        _form: ['Ocurrió un error al crear el mantenimiento programado'],
      },
    }
  }

  revalidatePath('/calendario')
  revalidatePath('/')
  return { success: true }
}

/**
 * Direct create - simplified version for dialogs
 */
export async function createMantenimientoProgramadoDirect(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const validatedFields = MantenimientoProgramadoSchema.safeParse({
    equipoId: formData.get('equipoId'),
    tipo: formData.get('tipo'),
    descripcion: formData.get('descripcion'),
    fechaProgramada: formData.get('fechaProgramada'),
    horaEstimada: formData.get('horaEstimada'),
    duracionEstimada: formData.get('duracionEstimada'),
    esRecurrente: formData.get('esRecurrente') === 'true',
    frecuencia: formData.get('frecuencia') || undefined,
    diasIntervalo: formData.get('diasIntervalo') || undefined,
    fechaFinRecurrencia: formData.get('fechaFinRecurrencia') || undefined,
  })

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0]
    return {
      success: false,
      error: firstError || 'Datos inválidos',
    }
  }

  try {
    const { fechaProgramada, fechaFinRecurrencia, ...rest } = validatedFields.data
    
    await prisma.mantenimientoProgramado.create({
      data: {
        ...rest,
        fechaProgramada: new Date(fechaProgramada),
        fechaFinRecurrencia: fechaFinRecurrencia ? new Date(fechaFinRecurrencia) : null,
      },
    })
  } catch (error) {
    return {
      success: false,
      error: 'Ocurrió un error al crear el mantenimiento programado',
    }
  }

  revalidatePath('/calendario')
  revalidatePath('/')
  return { success: true }
}

/**
 * Update mantenimiento programado
 */
export async function updateMantenimientoProgramado(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const validatedFields = MantenimientoProgramadoSchema.safeParse({
    equipoId: formData.get('equipoId'),
    tipo: formData.get('tipo'),
    descripcion: formData.get('descripcion'),
    fechaProgramada: formData.get('fechaProgramada'),
    horaEstimada: formData.get('horaEstimada'),
    duracionEstimada: formData.get('duracionEstimada'),
    esRecurrente: formData.get('esRecurrente') === 'true',
    frecuencia: formData.get('frecuencia') || undefined,
    diasIntervalo: formData.get('diasIntervalo') || undefined,
    fechaFinRecurrencia: formData.get('fechaFinRecurrencia') || undefined,
  })

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0]
    return {
      success: false,
      error: firstError || 'Datos inválidos',
    }
  }

  try {
    const { fechaProgramada, fechaFinRecurrencia, ...rest } = validatedFields.data
    
    await prisma.mantenimientoProgramado.update({
      where: { id },
      data: {
        ...rest,
        fechaProgramada: new Date(fechaProgramada),
        fechaFinRecurrencia: fechaFinRecurrencia ? new Date(fechaFinRecurrencia) : null,
      },
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return { success: false, error: 'Mantenimiento no encontrado' }
    }

    return {
      success: false,
      error: 'Ocurrió un error al actualizar el mantenimiento',
    }
  }

  revalidatePath('/calendario')
  revalidatePath('/')
  return { success: true }
}

/**
 * Delete mantenimiento programado
 */
export async function deleteMantenimientoProgramado(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.mantenimientoProgramado.delete({
      where: { id },
    })

    revalidatePath('/calendario')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return { success: false, error: 'Mantenimiento no encontrado' }
    }
    return {
      success: false,
      error: 'Ocurrió un error al eliminar el mantenimiento',
    }
  }
}

/**
 * Mark mantenimiento as completed
 */
export async function completarMantenimiento(
  id: string,
  servicioData: {
    problemas: string
    soluciones: string
    tiempoInvertido: number
    estadoResultante: 'Bueno' | 'Regular' | 'Malo'
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the scheduled maintenance
    const mantenimiento = await prisma.mantenimientoProgramado.findUnique({
      where: { id },
    })

    if (!mantenimiento) {
      return { success: false, error: 'Mantenimiento no encontrado' }
    }

    // Create the service record
    const servicio = await prisma.servicioTecnico.create({
      data: {
        tipo: mantenimiento.tipo,
        fechaServicio: new Date(),
        problemas: servicioData.problemas,
        soluciones: servicioData.soluciones,
        tiempoInvertido: servicioData.tiempoInvertido,
        estadoResultante: servicioData.estadoResultante,
        equipoId: mantenimiento.equipoId,
      },
    })

    // Update the scheduled maintenance
    await prisma.mantenimientoProgramado.update({
      where: { id },
      data: {
        estado: 'Completado',
        fechaCompletado: new Date(),
        servicioTecnicoId: servicio.id,
      },
    })

    // Update equipment health status
    await prisma.equipo.update({
      where: { id: mantenimiento.equipoId },
      data: { estadoSalud: servicioData.estadoResultante },
    })

    // If recurrent, create next occurrence
    if (mantenimiento.esRecurrente && mantenimiento.frecuencia) {
      const nextDate = calcularProximaFecha(
        mantenimiento.fechaProgramada,
        mantenimiento.frecuencia,
        mantenimiento.diasIntervalo
      )

      // Only create if within the end date
      if (!mantenimiento.fechaFinRecurrencia || nextDate <= mantenimiento.fechaFinRecurrencia) {
        await prisma.mantenimientoProgramado.create({
          data: {
            tipo: mantenimiento.tipo,
            descripcion: mantenimiento.descripcion,
            fechaProgramada: nextDate,
            horaEstimada: mantenimiento.horaEstimada,
            duracionEstimada: mantenimiento.duracionEstimada,
            esRecurrente: true,
            frecuencia: mantenimiento.frecuencia,
            diasIntervalo: mantenimiento.diasIntervalo,
            fechaFinRecurrencia: mantenimiento.fechaFinRecurrencia,
            equipoId: mantenimiento.equipoId,
          },
        })
      }
    }

    revalidatePath('/calendario')
    revalidatePath('/servicios')
    revalidatePath('/equipos')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error completing maintenance:', error)
    return {
      success: false,
      error: 'Ocurrió un error al completar el mantenimiento',
    }
  }
}

/**
 * Cancel scheduled maintenance
 */
export async function cancelarMantenimiento(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.mantenimientoProgramado.update({
      where: { id },
      data: { estado: 'Cancelado' },
    })

    revalidatePath('/calendario')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Ocurrió un error al cancelar el mantenimiento',
    }
  }
}

/**
 * Get mantenimientos programados for calendar view
 */
export async function getMantenimientosProgramados(
  startDate?: Date,
  endDate?: Date
) {
  const where: Record<string, unknown> = {}
  
  if (startDate && endDate) {
    where.fechaProgramada = {
      gte: startDate,
      lte: endDate,
    }
  }

  return prisma.mantenimientoProgramado.findMany({
    where,
    include: {
      equipo: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
          colaborador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      },
    },
    orderBy: { fechaProgramada: 'asc' },
  })
}

/**
 * Get upcoming mantenimientos (next 30 days)
 */
export async function getProximosMantenimientos(limit: number = 10) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)

  return prisma.mantenimientoProgramado.findMany({
    where: {
      fechaProgramada: {
        gte: today,
        lte: in30Days,
      },
      estado: 'Pendiente',
    },
    include: {
      equipo: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
          colaborador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      },
    },
    orderBy: { fechaProgramada: 'asc' },
    take: limit,
  })
}

/**
 * Get overdue mantenimientos
 */
export async function getMantenimientosVencidos() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.mantenimientoProgramado.findMany({
    where: {
      fechaProgramada: { lt: today },
      estado: 'Pendiente',
    },
    include: {
      equipo: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
        },
      },
    },
    orderBy: { fechaProgramada: 'asc' },
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calcularProximaFecha(
  fechaActual: Date,
  frecuencia: string,
  diasIntervalo?: number | null
): Date {
  const nextDate = new Date(fechaActual)

  switch (frecuencia) {
    case 'mensual':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'trimestral':
      nextDate.setMonth(nextDate.getMonth() + 3)
      break
    case 'semestral':
      nextDate.setMonth(nextDate.getMonth() + 6)
      break
    case 'anual':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
    case 'personalizado':
      if (diasIntervalo) {
        nextDate.setDate(nextDate.getDate() + diasIntervalo)
      }
      break
  }

  return nextDate
}
