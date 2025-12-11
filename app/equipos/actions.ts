'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// ============================================================================
// SCHEMAS - Validation Layer (Single Responsibility)
// ============================================================================

const EquipoSchema = z.object({
  serial: z.string().min(1, 'El serial es requerido').trim(),
  marca: z.string().min(1, 'La marca es requerida').trim(),
  modelo: z.string().min(1, 'El modelo es requerido').trim(),
  tipo: z.enum(['Desktop', 'Portátil'], { 
    message: 'Tipo debe ser Desktop o Portátil'
  }),
  procesador: z.string().min(1, 'El procesador es requerido').trim(),
  ram: z.coerce.number().positive('RAM debe ser un número positivo').int('RAM debe ser un número entero'),
  almacenamiento: z.string().min(1, 'El almacenamiento es requerido').trim(),
  gpu: z.string().min(1, 'La GPU es requerida').trim(),
  estadoSalud: z.enum(['Bueno', 'Regular', 'Malo'], {
    message: 'Estado debe ser Bueno, Regular o Malo'
  }),
  estado: z.enum(['Activo', 'En Reparación', 'Descontinuado', 'En Garantía', 'En Almacén'], {
    message: 'Estado operativo inválido'
  }),
  fechaAdquisicion: z.string().refine((date) => {
    const acquisitionDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return acquisitionDate <= today
  }, 'La fecha de adquisición no puede ser futura'),
  colaboradorId: z.string().optional(),
  // Campos opcionales adicionales
  fechaGarantia: z.string().optional(),
  departamento: z.string().optional(),
  ubicacion: z.string().optional(),
  observaciones: z.string().optional(),
  pantallas: z.coerce.number().int().min(0).optional(),
  resolucionPantalla: z.string().optional(),
  tieneTeclado: z.enum(['on', 'off']).optional().transform(val => val === 'on'),
  tieneMouse: z.enum(['on', 'off']).optional().transform(val => val === 'on'),
  otrosPeriferico: z.string().optional(),
  // Campos del proyecto anterior - almacenamiento detallado
  almacenamientoTipo: z.string().optional(),
  almacenamientoGb: z.coerce.number().int().min(0).optional(),
  tarjetaVideo: z.string().optional(),
  // Campos JSON para detalles de componentes
  ramDetalle: z.string().optional(), // JSON string
  discosDetalle: z.string().optional(), // JSON string
  gpuDetalle: z.string().optional(), // JSON string
})

export type FormState = {
  errors?: {
    serial?: string[]
    marca?: string[]
    modelo?: string[]
    tipo?: string[]
    procesador?: string[]
    ram?: string[]
    almacenamiento?: string[]
    gpu?: string[]
    estadoSalud?: string[]
    fechaAdquisicion?: string[]
    colaboradorId?: string[]
    _form?: string[]
  }
  message?: string
  success?: boolean
}

// ============================================================================
// SERVER ACTIONS - Business Logic Layer
// ============================================================================

/**
 * Create a new equipo
 * @param prevState - Previous form state (for useActionState)
 * @param formData - Form data from the client
 * @returns Form state with errors or success
 */
export async function createEquipo(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  // Validate form data
  const validatedFields = EquipoSchema.safeParse({
    serial: formData.get('serial'),
    marca: formData.get('marca'),
    modelo: formData.get('modelo'),
    tipo: formData.get('tipo'),
    procesador: formData.get('procesador'),
    ram: formData.get('ram'),
    almacenamiento: formData.get('almacenamiento'),
    gpu: formData.get('gpu'),
    estadoSalud: formData.get('estadoSalud'),
    estado: formData.get('estado') || 'Activo',
    fechaAdquisicion: formData.get('fechaAdquisicion'),
    colaboradorId: formData.get('colaboradorId') || undefined,
    // Campos opcionales
    fechaGarantia: formData.get('fechaGarantia') || undefined,
    departamento: formData.get('departamento') || undefined,
    ubicacion: formData.get('ubicacion') || undefined,
    observaciones: formData.get('observaciones') || undefined,
    pantallas: formData.get('pantallas') || undefined,
    resolucionPantalla: formData.get('resolucionPantalla') || undefined,
    tieneTeclado: formData.get('tieneTeclado') || undefined,
    tieneMouse: formData.get('tieneMouse') || undefined,
    otrosPeriferico: formData.get('otrosPeriferico') || undefined,
    // Campos detallados
    almacenamientoTipo: formData.get('almacenamientoTipo') || undefined,
    almacenamientoGb: formData.get('almacenamientoGb') || undefined,
    ramDetalle: formData.get('ramDetalle') || undefined,
    discosDetalle: formData.get('discosDetalle') || undefined,
    gpuDetalle: formData.get('gpuDetalle') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Create equipo
  try {
    const { 
      fechaAdquisicion, 
      fechaGarantia, 
      colaboradorId, 
      ramDetalle,
      discosDetalle,
      gpuDetalle,
      ...rest 
    } = validatedFields.data
    
    await prisma.equipo.create({
      data: {
        ...rest,
        fechaAdquisicion: new Date(fechaAdquisicion),
        fechaGarantia: fechaGarantia ? new Date(fechaGarantia) : null,
        colaboradorId: colaboradorId || null,
        // Guardar los campos JSON de detalles
        ramDetalle: ramDetalle || null,
        discosDetalle: discosDetalle || null,
        gpuDetalle: gpuDetalle || null,
      },
    })
  } catch (error) {
    // Handle unique constraint violation (duplicate serial)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Este serial ya está registrado',
        errors: {
          serial: ['Este serial ya está registrado'],
        },
      }
    }

    // Handle foreign key constraint (colaborador doesn't exist)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return {
        message: 'El colaborador seleccionado no existe',
        errors: {
          colaboradorId: ['El colaborador seleccionado no existe'],
        },
      }
    }
    
    console.error('Error creating equipo:', error)
    return {
      message: 'Ocurrió un error al crear el equipo',
      errors: {
        _form: ['Ocurrió un error al crear el equipo'],
      },
    }
  }

  // Revalidate dependent views so new equipment shows up elsewhere (e.g. calendario)
  revalidatePath('/equipos')
  revalidatePath('/calendario')
  redirect('/equipos')
}

/**
 * Update an existing equipo
 * @param id - Equipo ID
 * @param prevState - Previous form state
 * @param formData - Form data from the client
 * @returns Form state with errors or success
 */
export async function updateEquipo(
  id: string,
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  // Debug: Log form data
  console.log('=== UPDATE EQUIPO DEBUG ===')
  console.log('ID:', id)
  console.log('FormData entries:')
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`)
  }
  
  // Validate form data
  const validatedFields = EquipoSchema.safeParse({
    serial: formData.get('serial'),
    marca: formData.get('marca'),
    modelo: formData.get('modelo'),
    tipo: formData.get('tipo'),
    procesador: formData.get('procesador'),
    ram: formData.get('ram'),
    almacenamiento: formData.get('almacenamiento'),
    gpu: formData.get('gpu'),
    estadoSalud: formData.get('estadoSalud'),
    estado: formData.get('estado'),
    fechaAdquisicion: formData.get('fechaAdquisicion'),
    colaboradorId: formData.get('colaboradorId') === 'sin-asignar' ? undefined : formData.get('colaboradorId') || undefined,
    // Campos opcionales
    fechaGarantia: formData.get('fechaGarantia') || undefined,
    departamento: formData.get('departamento') || undefined,
    ubicacion: formData.get('ubicacion') || undefined,
    observaciones: formData.get('observaciones') || undefined,
    pantallas: formData.get('pantallas') || undefined,
    resolucionPantalla: formData.get('resolucionPantalla') || undefined,
    tieneTeclado: formData.get('tieneTeclado') || undefined,
    tieneMouse: formData.get('tieneMouse') || undefined,
    otrosPeriferico: formData.get('otrosPeriferico') || undefined,
    almacenamientoTipo: formData.get('almacenamientoTipo') || undefined,
    almacenamientoGb: formData.get('almacenamientoGb') || undefined,
    tarjetaVideo: formData.get('tarjetaVideo') || undefined,
    // Campos detallados JSON
    ramDetalle: formData.get('ramDetalle') || undefined,
    discosDetalle: formData.get('discosDetalle') || undefined,
    gpuDetalle: formData.get('gpuDetalle') || undefined,
  })

  if (!validatedFields.success) {
    console.log('Validation failed:', validatedFields.error.flatten())
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  console.log('Validation passed, updating equipo...')

  // Update equipo
  try {
    const { 
      fechaAdquisicion, 
      fechaGarantia, 
      colaboradorId, 
      ramDetalle,
      discosDetalle,
      gpuDetalle,
      ...rest 
    } = validatedFields.data
    
    await prisma.equipo.update({
      where: { id },
      data: {
        ...rest,
        fechaAdquisicion: new Date(fechaAdquisicion),
        fechaGarantia: fechaGarantia ? new Date(fechaGarantia) : null,
        colaboradorId: colaboradorId || null,
        // Actualizar campos JSON de detalles
        ramDetalle: ramDetalle || null,
        discosDetalle: discosDetalle || null,
        gpuDetalle: gpuDetalle || null,
      },
    })
  } catch (error) {
    // Handle not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return {
        message: 'Equipo no encontrado',
        errors: {
          _form: ['Equipo no encontrado'],
        },
      }
    }

    // Handle unique constraint violation (duplicate serial)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Este serial ya está registrado',
        errors: {
          serial: ['Este serial ya está registrado'],
        },
      }
    }

    // Handle foreign key constraint (colaborador doesn't exist)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return {
        message: 'El colaborador seleccionado no existe',
        errors: {
          colaboradorId: ['El colaborador seleccionado no existe'],
        },
      }
    }

    return {
      message: 'Ocurrió un error al actualizar el equipo',
      errors: {
        _form: ['Ocurrió un error al actualizar el equipo'],
      },
    }
  }

  // Revalidate dependent views - don't redirect, let the component handle closing
  revalidatePath('/equipos')
  revalidatePath('/calendario')
  
  return {
    success: true,
    message: 'Equipo actualizado exitosamente',
  }
}

/**
 * Delete an equipo
 * @param id - Equipo ID
 * @returns Success or error state
 */
export async function deleteEquipo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar que el equipo existe
    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        _count: {
          select: { servicios: true },
        },
      },
    })

    if (!equipo) {
      return { success: false, error: 'Equipo no encontrado' }
    }

    // Eliminar equipo (los servicios se eliminan automáticamente por CASCADE)
    await prisma.equipo.delete({
      where: { id },
    })

    revalidatePath('/equipos')
    revalidatePath('/calendario')
    
    // Informar cuántos servicios fueron eliminados también
    if (equipo._count.servicios > 0) {
      return { 
        success: true, 
        error: `Equipo eliminado junto con ${equipo._count.servicios} servicio(s) técnico(s)` 
      }
    }
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Ocurrió un error al eliminar el equipo',
    }
  }
}

/**
 * Assign equipo to colaborador
 * @param equipoId - Equipo ID
 * @param colaboradorId - Colaborador ID (null to unassign)
 * @returns Success or error state
 */
export async function assignEquipoToColaborador(
  equipoId: string,
  colaboradorId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.equipo.update({
      where: { id: equipoId },
      data: { colaboradorId },
    })

    revalidatePath('/equipos')
    revalidatePath('/calendario')
    return { success: true }
  } catch (error) {
    // Handle not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return { success: false, error: 'Equipo no encontrado' }
    }

    // Handle foreign key constraint
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return { success: false, error: 'Colaborador no encontrado' }
    }

    return {
      success: false,
      error: 'Ocurrió un error al asignar el equipo',
    }
  }
}
