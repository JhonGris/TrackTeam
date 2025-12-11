'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// ============================================================================
// SCHEMAS - Validation Layer (Single Responsibility)
// ============================================================================

const ColaboradorSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre completo es requerido').trim(),
  cargo: z.string().min(1, 'El cargo es requerido').trim(),
  email: z.string().email('Email inválido').toLowerCase().trim(),
  ciudad: z.string().optional(),
})

/**
 * Separa el nombre completo en nombre y apellido
 * Si solo hay una palabra, se usa como nombre y apellido queda vacío
 * Si hay múltiples palabras, la primera es el nombre y el resto es apellido
 */
function separarNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
  const partes = nombreCompleto.trim().split(/\s+/)
  if (partes.length === 1) {
    return { nombre: partes[0], apellido: '' }
  }
  // Primera palabra es nombre, el resto es apellido
  const nombre = partes[0]
  const apellido = partes.slice(1).join(' ')
  return { nombre, apellido }
}

export type FormState = {
  errors?: {
    nombreCompleto?: string[]
    cargo?: string[]
    email?: string[]
    ciudad?: string[]
    _form?: string[]
  }
  message?: string
  success?: boolean
}

// ============================================================================
// SERVER ACTIONS - Business Logic Layer
// ============================================================================

/**
 * Get all colaboradores ordered by name
 */
export async function getColaboradores() {
  return prisma.colaborador.findMany({
    orderBy: [
      { apellido: 'asc' },
      { nombre: 'asc' }
    ]
  })
}

/**
 * Create a new colaborador
 * @param prevState - Previous form state (for useActionState)
 * @param formData - Form data from the client
 * @returns Form state with errors or success
 */
export async function createColaborador(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  // Validate form data
  const validatedFields = ColaboradorSchema.safeParse({
    nombreCompleto: formData.get('nombreCompleto'),
    cargo: formData.get('cargo'),
    email: formData.get('email'),
    ciudad: formData.get('ciudad') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Separar nombre completo en nombre y apellido
  const { nombre, apellido } = separarNombreCompleto(validatedFields.data.nombreCompleto)

  // Create colaborador
  try {
    await prisma.colaborador.create({
      data: {
        nombre,
        apellido,
        cargo: validatedFields.data.cargo,
        email: validatedFields.data.email,
        ciudad: validatedFields.data.ciudad,
      },
    })
  } catch (error) {
    // Handle unique constraint violation (duplicate email)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Este email ya está registrado',
        errors: {
          email: ['Este email ya está registrado'],
        },
      }
    }
    
    return {
      message: 'Ocurrió un error al crear el colaborador',
      errors: {
        _form: ['Ocurrió un error al crear el colaborador'],
      },
    }
  }

  // Revalidate and redirect
  revalidatePath('/colaboradores')
  redirect('/colaboradores')
}

/**
 * Update an existing colaborador
 * @param id - Colaborador ID
 * @param prevState - Previous form state
 * @param formData - Form data from the client
 * @returns Form state with errors or success
 */
export async function updateColaborador(
  id: string,
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  // Validate form data
  const validatedFields = ColaboradorSchema.safeParse({
    nombreCompleto: formData.get('nombreCompleto'),
    cargo: formData.get('cargo'),
    email: formData.get('email'),
    ciudad: formData.get('ciudad') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Separar nombre completo en nombre y apellido
  const { nombre, apellido } = separarNombreCompleto(validatedFields.data.nombreCompleto)

  // Update colaborador
  try {
    await prisma.colaborador.update({
      where: { id },
      data: {
        nombre,
        apellido,
        cargo: validatedFields.data.cargo,
        email: validatedFields.data.email,
        ciudad: validatedFields.data.ciudad,
      },
    })
  } catch (error) {
    // Handle not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return {
        message: 'Colaborador no encontrado',
        errors: {
          _form: ['Colaborador no encontrado'],
        },
      }
    }

    // Handle unique constraint violation (duplicate email)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Este email ya está registrado',
        errors: {
          email: ['Este email ya está registrado'],
        },
      }
    }

    return {
      message: 'Ocurrió un error al actualizar el colaborador',
      errors: {
        _form: ['Ocurrió un error al actualizar el colaborador'],
      },
    }
  }

  // Revalidate and redirect
  revalidatePath('/colaboradores')
  redirect('/colaboradores')
}

/**
 * Delete a colaborador
 * @param id - Colaborador ID
 * @returns Success or error state
 */
export async function deleteColaborador(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if colaborador has assigned equipos
    const colaborador = await prisma.colaborador.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipos: true },
        },
      },
    })

    if (!colaborador) {
      return { success: false, error: 'Colaborador no encontrado' }
    }

    if (colaborador._count.equipos > 0) {
      return {
        success: false,
        error: `No se puede eliminar. El colaborador tiene ${colaborador._count.equipos} equipo(s) asignado(s)`,
      }
    }

    // Delete colaborador
    await prisma.colaborador.delete({
      where: { id },
    })

    // Revalidate
    revalidatePath('/colaboradores')

    return { success: true }
  } catch (error) {
    console.error('Error deleting colaborador:', error)
    return { success: false, error: 'Ocurrió un error al eliminar el colaborador' }
  }
}

/**
 * Quick create a colaborador and return its ID (for inline creation from other forms)
 * Uses nombre/apellido directly (not nombreCompleto) for programmatic use
 * @param data - Colaborador data
 * @returns Created colaborador or error
 */
export async function createColaboradorQuick(data: {
  nombre: string
  apellido: string
  cargo: string
  email: string
  ciudad?: string
}): Promise<{ success: boolean; colaborador?: { id: string; nombre: string; apellido: string; cargo: string }; error?: string }> {
  // Schema for quick create (nombre/apellido separated)
  const QuickCreateSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').trim(),
    apellido: z.string().min(1, 'El apellido es requerido').trim(),
    cargo: z.string().min(1, 'El cargo es requerido').trim(),
    email: z.string().email('Email inválido').toLowerCase().trim(),
    ciudad: z.string().optional(),
  })
  
  // Validate data
  const validatedFields = QuickCreateSchema.safeParse(data)

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors
    const firstError = Object.values(errors).flat()[0]
    return {
      success: false,
      error: firstError || 'Datos inválidos',
    }
  }

  try {
    const colaborador = await prisma.colaborador.create({
      data: validatedFields.data,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cargo: true,
      },
    })

    // Revalidate colaboradores list
    revalidatePath('/colaboradores')
    revalidatePath('/equipos')

    return { success: true, colaborador }
  } catch (error) {
    // Handle unique constraint violation (duplicate email)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        success: false,
        error: 'Este email ya está registrado',
      }
    }

    return {
      success: false,
      error: 'Ocurrió un error al crear el colaborador',
    }
  }
}
