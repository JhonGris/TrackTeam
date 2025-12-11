'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendServicioReporte, isEmailServiceConfigured, type ServicioReporteEmailData } from '@/lib/email'

// ============================================================================
// SCHEMAS - Validation Layer
// ============================================================================

const ServicioSchema = z.object({
  equipoId: z.string().min(1, 'Debe seleccionar un equipo'),
  tipo: z.enum(['Preventivo', 'Correctivo', 'Limpieza', 'Actualización de Software'], {
    message: 'Tipo de servicio inválido',
  }),
  fechaServicio: z.string().refine((date) => {
    const serviceDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return serviceDate <= today
  }, 'La fecha del servicio no puede ser futura'),
  problemas: z.string().min(1, 'Debe describir los problemas encontrados').trim(),
  soluciones: z.string().min(1, 'Debe describir las soluciones aplicadas').trim(),
  tiempoInvertido: z.coerce
    .number()
    .min(1, 'Debe ingresar el tiempo invertido (mínimo 1 minuto)')
    .int('El tiempo debe ser un número entero'),
  estadoResultante: z.enum(['Bueno', 'Regular', 'Malo'], {
    message: 'Estado resultante inválido',
  }),
})

export type ServicioFormState = {
  errors?: {
    equipoId?: string[]
    tipo?: string[]
    fechaServicio?: string[]
    problemas?: string[]
    soluciones?: string[]
    tiempoInvertido?: string[]
    estadoResultante?: string[]
    _form?: string[]
  }
  message?: string
  success?: boolean
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Create a new servicio técnico
 */
export async function createServicio(
  prevState: ServicioFormState | null,
  formData: FormData
): Promise<ServicioFormState> {
  const validatedFields = ServicioSchema.safeParse({
    equipoId: formData.get('equipoId'),
    tipo: formData.get('tipo'),
    fechaServicio: formData.get('fechaServicio'),
    problemas: formData.get('problemas'),
    soluciones: formData.get('soluciones'),
    tiempoInvertido: formData.get('tiempoInvertido'),
    estadoResultante: formData.get('estadoResultante'),
  })

  // Check if user wants to send email report
  const enviarCorreo = formData.get('enviarCorreo') === 'on'
  
  // Get diagnóstico IA if provided
  const diagnosticoIA = formData.get('diagnosticoIA') as string | null

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  let servicioId: string | null = null

  try {
    const { fechaServicio, ...rest } = validatedFields.data
    
    // Crear servicio con diagnóstico IA si existe
    const servicio = await prisma.servicioTecnico.create({
      data: {
        ...rest,
        fechaServicio: new Date(fechaServicio),
        diagnosticoIA: diagnosticoIA || null,
      },
    })
    servicioId = servicio.id

    // Actualizar estado de salud del equipo
    await prisma.equipo.update({
      where: { id: rest.equipoId },
      data: { estadoSalud: rest.estadoResultante },
    })

    // Send email report if requested
    if (enviarCorreo && servicioId) {
      // Fire and forget - don't block on email sending
      enviarReporteServicio(servicioId).catch((err) => {
        console.error('Error sending service report email:', err)
      })
    }
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
      message: 'Ocurrió un error al crear el servicio',
      errors: {
        _form: ['Ocurrió un error al crear el servicio'],
      },
    }
  }

  revalidatePath('/servicios')
  revalidatePath('/equipos')
  redirect('/servicios')
}

/**
 * Update an existing servicio técnico
 */
export async function updateServicio(
  id: string,
  prevState: ServicioFormState | null,
  formData: FormData
): Promise<ServicioFormState> {
  const validatedFields = ServicioSchema.safeParse({
    equipoId: formData.get('equipoId'),
    tipo: formData.get('tipo'),
    fechaServicio: formData.get('fechaServicio'),
    problemas: formData.get('problemas'),
    soluciones: formData.get('soluciones'),
    tiempoInvertido: formData.get('tiempoInvertido'),
    estadoResultante: formData.get('estadoResultante'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const { fechaServicio, ...rest } = validatedFields.data
    
    await prisma.servicioTecnico.update({
      where: { id },
      data: {
        ...rest,
        fechaServicio: new Date(fechaServicio),
      },
    })

    // Actualizar estado de salud del equipo
    await prisma.equipo.update({
      where: { id: rest.equipoId },
      data: { estadoSalud: rest.estadoResultante },
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return {
        message: 'Servicio no encontrado',
        errors: {
          _form: ['Servicio no encontrado'],
        },
      }
    }

    return {
      message: 'Ocurrió un error al actualizar el servicio',
      errors: {
        _form: ['Ocurrió un error al actualizar el servicio'],
      },
    }
  }

  revalidatePath('/servicios')
  revalidatePath('/equipos')
  redirect('/servicios')
}

/**
 * Delete a servicio técnico
 */
export async function deleteServicio(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const servicio = await prisma.servicioTecnico.findUnique({
      where: { id },
    })

    if (!servicio) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    await prisma.servicioTecnico.delete({
      where: { id },
    })

    revalidatePath('/servicios')
    revalidatePath('/equipos')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Ocurrió un error al eliminar el servicio',
    }
  }
}

/**
 * Get servicios for a specific equipo
 */
export async function getServiciosByEquipo(equipoId: string) {
  return prisma.servicioTecnico.findMany({
    where: { equipoId },
    orderBy: { fechaServicio: 'desc' },
  })
}

/**
 * Direct update servicio - simplified version for dialogs
 */
export async function updateServicioDirect(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const validatedFields = ServicioSchema.safeParse({
    equipoId: formData.get('equipoId'),
    tipo: formData.get('tipo'),
    fechaServicio: formData.get('fechaServicio'),
    problemas: formData.get('problemas'),
    soluciones: formData.get('soluciones'),
    tiempoInvertido: formData.get('tiempoInvertido'),
    estadoResultante: formData.get('estadoResultante'),
  })

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0]
    return {
      success: false,
      error: firstError || 'Datos inválidos',
    }
  }

  try {
    const { fechaServicio, ...rest } = validatedFields.data
    
    await prisma.servicioTecnico.update({
      where: { id },
      data: {
        ...rest,
        fechaServicio: new Date(fechaServicio),
      },
    })

    // Actualizar estado de salud del equipo
    await prisma.equipo.update({
      where: { id: rest.equipoId },
      data: { estadoSalud: rest.estadoResultante },
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return { success: false, error: 'Servicio no encontrado' }
    }

    return {
      success: false,
      error: 'Ocurrió un error al actualizar el servicio',
    }
  }

  revalidatePath('/servicios')
  revalidatePath('/equipos')
  return { success: true }
}

/**
 * Send service report via email to collaborator
 */
export async function enviarReporteServicio(
  servicioId: string
): Promise<{ success: boolean; error?: string; noEmail?: boolean }> {
  // Check if email service is configured
  if (!isEmailServiceConfigured()) {
    return { 
      success: false, 
      error: 'El servicio de correo no está configurado. Configura RESEND_API_KEY en el archivo .env',
      noEmail: true 
    }
  }

  try {
    // Get service with equipment and collaborator data
    const servicio = await prisma.servicioTecnico.findUnique({
      where: { id: servicioId },
      include: {
        equipo: {
          include: {
            colaborador: true
          }
        }
      }
    })

    if (!servicio) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    if (!servicio.equipo) {
      return { success: false, error: 'No se encontró el equipo asociado al servicio' }
    }

    if (!servicio.equipo.colaborador) {
      return { success: false, error: 'El equipo no tiene un colaborador asignado' }
    }

    if (!servicio.equipo.colaborador.email) {
      return { success: false, error: 'El colaborador no tiene correo electrónico registrado' }
    }

    // Prepare email data
    const emailData: ServicioReporteEmailData = {
      colaborador: {
        nombre: servicio.equipo.colaborador.nombre,
        apellido: servicio.equipo.colaborador.apellido,
        email: servicio.equipo.colaborador.email,
      },
      equipo: {
        serial: servicio.equipo.serial,
        marca: servicio.equipo.marca,
        modelo: servicio.equipo.modelo,
        tipo: servicio.equipo.tipo,
      },
      servicio: {
        id: servicio.id,
        tipo: servicio.tipo,
        fechaServicio: servicio.fechaServicio,
        problemas: servicio.problemas,
        soluciones: servicio.soluciones,
        tiempoInvertido: servicio.tiempoInvertido,
        estadoResultante: servicio.estadoResultante,
      },
    }

    // Send email
    const result = await sendServicioReporte(emailData)

    if (!result.colaborador && !result.technician) {
      return { success: false, error: result.error || 'Error al enviar el correo' }
    }

    return { 
      success: true,
    }
  } catch (error) {
    console.error('Error sending service report:', error)
    return { success: false, error: 'Error al enviar el reporte' }
  }
}
