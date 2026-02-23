'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendMovimientoInventarioEmail } from '@/lib/email'

// ============================================================================
// SCHEMAS - Validation Layer (Single Responsibility)
// ============================================================================

const ColaboradorSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre completo es requerido').trim(),
  cargo: z.string().min(1, 'El cargo es requerido').trim(),
  email: z.string().email('Email inválido').toLowerCase().trim(),
  cedula: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  observaciones: z.string().optional(),
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
    cedula?: string[]
    direccion?: string[]
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
    cedula: formData.get('cedula') || undefined,
    direccion: formData.get('direccion') || undefined,
    ciudad: formData.get('ciudad') || undefined,
    observaciones: formData.get('observaciones') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Separar nombre completo en nombre y apellido
  const { nombre, apellido } = separarNombreCompleto(validatedFields.data.nombreCompleto)

  // Build dotacion JSON from checkbox fields
  const dotacion = {
    basePortatil: formData.get('dotacion_basePortatil') === 'on',
    audifonos: formData.get('dotacion_audifonos') === 'on',
    apoyaPies: formData.get('dotacion_apoyaPies') === 'on',
    escritorio: formData.get('dotacion_escritorio') === 'on',
    sillaErgonomica: formData.get('dotacion_sillaErgonomica') === 'on',
    camara: formData.get('dotacion_camara') === 'on',
    microfono: formData.get('dotacion_microfono') === 'on',
  }

  // Check unique cedula if provided
  if (validatedFields.data.cedula) {
    const existingCedula = await prisma.colaborador.findUnique({
      where: { cedula: validatedFields.data.cedula },
    })
    if (existingCedula) {
      return {
        message: 'Esta cédula ya está registrada',
        errors: { cedula: ['Esta cédula ya está registrada'] },
      }
    }
  }

  // Create colaborador
  try {
    const colaborador = await prisma.colaborador.create({
      data: {
        nombre,
        apellido,
        cargo: validatedFields.data.cargo,
        email: validatedFields.data.email,
        cedula: validatedFields.data.cedula || null,
        direccion: validatedFields.data.direccion || null,
        ciudad: validatedFields.data.ciudad,
        dotacionJson: JSON.stringify(dotacion),
        observaciones: validatedFields.data.observaciones || null,
      },
    })

    // Registrar en historial
    await prisma.colaboradorHistorial.create({
      data: {
        colaboradorId: colaborador.id,
        tipo: 'dato_actualizado',
        descripcion: `Colaborador creado: ${nombre} ${apellido}`,
      },
    })
  } catch (error) {
    // Handle unique constraint violation (duplicate email or cedula)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Este email o cédula ya está registrado',
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

  // Revalidate the page data (no redirect — let the dialog close via state)
  revalidatePath('/colaboradores')
  return { success: true, message: 'Colaborador creado correctamente' }
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
    cedula: formData.get('cedula') || undefined,
    direccion: formData.get('direccion') || undefined,
    ciudad: formData.get('ciudad') || undefined,
    observaciones: formData.get('observaciones') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Separar nombre completo en nombre y apellido
  const { nombre, apellido } = separarNombreCompleto(validatedFields.data.nombreCompleto)

  // Build dotacion JSON from checkbox fields
  const dotacion = {
    basePortatil: formData.get('dotacion_basePortatil') === 'on',
    audifonos: formData.get('dotacion_audifonos') === 'on',
    apoyaPies: formData.get('dotacion_apoyaPies') === 'on',
    escritorio: formData.get('dotacion_escritorio') === 'on',
    sillaErgonomica: formData.get('dotacion_sillaErgonomica') === 'on',
    camara: formData.get('dotacion_camara') === 'on',
    microfono: formData.get('dotacion_microfono') === 'on',
  }

  // Check unique cedula if provided (excluding current record)
  if (validatedFields.data.cedula) {
    const existingCedula = await prisma.colaborador.findFirst({
      where: { cedula: validatedFields.data.cedula, NOT: { id } },
    })
    if (existingCedula) {
      return {
        message: 'Esta cédula ya está registrada',
        errors: { cedula: ['Esta cédula ya está registrada'] },
      }
    }
  }

  // Update colaborador
  try {
    await prisma.colaborador.update({
      where: { id },
      data: {
        nombre,
        apellido,
        cargo: validatedFields.data.cargo,
        email: validatedFields.data.email,
        cedula: validatedFields.data.cedula || null,
        direccion: validatedFields.data.direccion || null,
        ciudad: validatedFields.data.ciudad,
        dotacionJson: JSON.stringify(dotacion),
        observaciones: validatedFields.data.observaciones || null,
      },
    })

    // Registrar en historial
    await prisma.colaboradorHistorial.create({
      data: {
        colaboradorId: id,
        tipo: 'dato_actualizado',
        descripcion: `Datos actualizados del colaborador`,
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

    // Handle unique constraint violation (duplicate email or cedula)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Este email o cédula ya está registrado',
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

  // Revalidate the page data (no redirect — let the dialog close via state)
  revalidatePath('/colaboradores')
  return { success: true, message: 'Colaborador actualizado correctamente' }
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

// ============================================================================
// HISTORIAL - Consulta y registro de eventos
// ============================================================================

/**
 * Get historial for a colaborador
 */
export async function getColaboradorHistorial(colaboradorId: string) {
  return prisma.colaboradorHistorial.findMany({
    where: { colaboradorId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

/**
 * Get full colaborador details with historial, archivos, and equipos
 */
export async function getColaboradorDetalle(id: string) {
  return prisma.colaborador.findUnique({
    where: { id },
    include: {
      equipos: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
          estadoSalud: true,
          estado: true,
        },
      },
      archivos: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          tamanio: true,
          ruta: true,
          esImagen: true,
          descripcion: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      historial: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      movimientosRepuestos: {
        include: {
          repuesto: {
            select: { nombre: true, codigoInterno: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
}

/**
 * Register a historial event for a colaborador
 */
export async function registrarHistorialColaborador(data: {
  colaboradorId: string
  tipo: string
  descripcion: string
  itemId?: string
  itemTipo?: string
  responsable?: string
  detalleJson?: string
}) {
  try {
    await prisma.colaboradorHistorial.create({
      data: {
        colaboradorId: data.colaboradorId,
        tipo: data.tipo,
        descripcion: data.descripcion,
        itemId: data.itemId || null,
        itemTipo: data.itemTipo || null,
        responsable: data.responsable || null,
        detalleJson: data.detalleJson || null,
      },
    })
    revalidatePath('/colaboradores')
    return { success: true }
  } catch (error) {
    console.error('Error registrando historial:', error)
    return { error: 'Error al registrar el historial' }
  }
}

// ============================================================================
// INVENTARIO - Asignación de objetos a colaboradores
// ============================================================================

/**
 * Get available inventory items (not currently assigned to anyone)
 * An item is available when cantidad > 0 (entrada registrada, no salida pendiente)
 */
export async function getRepuestosDisponibles() {
  return prisma.repuesto.findMany({
    where: {
      activo: true,
      cantidad: { gt: 0 },
    },
    include: {
      categoria: {
        select: { nombre: true, color: true },
      },
    },
    orderBy: { nombre: 'asc' },
  })
}

/**
 * Get inventory items currently assigned to a specific collaborator
 */
export async function getRepuestosAsignados(colaboradorId: string) {
  const movimientos = await prisma.movimientoRepuesto.findMany({
    where: {
      colaboradorId,
      tipo: 'salida',
    },
    include: {
      repuesto: {
        include: {
          categoria: {
            select: { nombre: true, color: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Deduplicate: only keep repuestos whose current stock is 0 (still assigned)
  const seen = new Set<string>()
  const asignados = []
  for (const mov of movimientos) {
    if (!seen.has(mov.repuestoId) && mov.repuesto.cantidad === 0) {
      seen.add(mov.repuestoId)
      asignados.push({
        movimientoId: mov.id,
        repuestoId: mov.repuesto.id,
        nombre: mov.repuesto.nombre,
        descripcion: mov.repuesto.descripcion,
        codigoInterno: mov.repuesto.codigoInterno,
        fotoUrl: mov.repuesto.fotoUrl,
        categoria: mov.repuesto.categoria,
        fechaAsignacion: mov.createdAt,
        notificacionEnviada: mov.notificacionEnviada,
      })
    }
  }

  return asignados
}

/**
 * Assign an inventory item to a collaborator
 */
export async function asignarRepuestoAColaborador(
  colaboradorId: string,
  repuestoId: string,
  motivo?: string
) {
  try {
    const [colaborador, repuesto] = await Promise.all([
      prisma.colaborador.findUnique({ where: { id: colaboradorId } }),
      prisma.repuesto.findUnique({ where: { id: repuestoId } }),
    ])

    if (!colaborador) return { error: 'Colaborador no encontrado' }
    if (!repuesto) return { error: 'Objeto de inventario no encontrado' }
    if (!repuesto.activo) return { error: 'Este objeto está desactivado' }
    if (repuesto.cantidad === 0) return { error: 'Este objeto ya está asignado a otro colaborador' }

    await prisma.$transaction([
      prisma.repuesto.update({
        where: { id: repuestoId },
        data: { cantidad: 0, asignadoA: `${colaborador.nombre} ${colaborador.apellido}` },
      }),
      prisma.movimientoRepuesto.create({
        data: {
          repuestoId,
          tipo: 'salida',
          cantidad: -1,
          cantidadAnterior: repuesto.cantidad,
          cantidadNueva: 0,
          motivo: motivo?.trim() || `Asignado a ${colaborador.nombre} ${colaborador.apellido}`,
          colaboradorId,
          notificacionEnviada: false,
        },
      }),
      prisma.colaboradorHistorial.create({
        data: {
          colaboradorId,
          tipo: 'inventario_asignado',
          descripcion: `Objeto asignado: ${repuesto.nombre}${repuesto.codigoInterno ? ` (${repuesto.codigoInterno})` : ''}`,
          itemId: repuestoId,
          itemTipo: 'repuesto',
        },
      }),
    ])

    revalidatePath('/colaboradores')
    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error asignando repuesto:', error)
    return { error: 'Error al asignar el objeto' }
  }
}

/**
 * Unassign an inventory item from a collaborator
 */
export async function desasignarRepuestoDeColaborador(
  colaboradorId: string,
  repuestoId: string
) {
  try {
    const [colaborador, repuesto] = await Promise.all([
      prisma.colaborador.findUnique({ where: { id: colaboradorId } }),
      prisma.repuesto.findUnique({ where: { id: repuestoId } }),
    ])

    if (!colaborador) return { error: 'Colaborador no encontrado' }
    if (!repuesto) return { error: 'Objeto de inventario no encontrado' }

    await prisma.$transaction([
      prisma.repuesto.update({
        where: { id: repuestoId },
        data: { cantidad: 1, asignadoA: null },
      }),
      prisma.movimientoRepuesto.create({
        data: {
          repuestoId,
          tipo: 'entrada',
          cantidad: 1,
          cantidadAnterior: 0,
          cantidadNueva: 1,
          motivo: `Devuelto por ${colaborador.nombre} ${colaborador.apellido}`,
          colaboradorId,
          notificacionEnviada: false,
        },
      }),
      prisma.colaboradorHistorial.create({
        data: {
          colaboradorId,
          tipo: 'inventario_removido',
          descripcion: `Objeto devuelto: ${repuesto.nombre}${repuesto.codigoInterno ? ` (${repuesto.codigoInterno})` : ''}`,
          itemId: repuestoId,
          itemTipo: 'repuesto',
        },
      }),
    ])

    revalidatePath('/colaboradores')
    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error desasignando repuesto:', error)
    return { error: 'Error al desasignar el objeto' }
  }
}

/**
 * Send notification email for an inventory assignment
 */
export async function enviarNotificacionAsignacion(
  colaboradorId: string,
  repuestoId: string,
  movimientoId?: string
) {
  try {
    const [colaborador, repuesto] = await Promise.all([
      prisma.colaborador.findUnique({ where: { id: colaboradorId } }),
      prisma.repuesto.findUnique({ where: { id: repuestoId } }),
    ])

    if (!colaborador) return { error: 'Colaborador no encontrado' }
    if (!repuesto) return { error: 'Objeto de inventario no encontrado' }

    const emailResult = await sendMovimientoInventarioEmail({
      colaborador: {
        nombre: colaborador.nombre,
        apellido: colaborador.apellido,
        email: colaborador.email,
        cargo: colaborador.cargo,
      },
      repuesto: {
        nombre: repuesto.nombre,
        descripcion: repuesto.descripcion,
        codigoInterno: repuesto.codigoInterno,
        fotoUrl: repuesto.fotoUrl,
        unidad: repuesto.unidad,
      },
      movimiento: {
        tipo: 'salida',
        cantidad: -1,
        motivo: `Asignado a ${colaborador.nombre} ${colaborador.apellido}`,
        referencia: null,
        fecha: new Date(),
      },
    })

    if (emailResult.success) {
      if (movimientoId) {
        await prisma.movimientoRepuesto.update({
          where: { id: movimientoId },
          data: { notificacionEnviada: true },
        })
      }
      revalidatePath('/colaboradores')
      return { success: true }
    }

    return { error: 'Error al enviar el correo' }
  } catch (error) {
    console.error('Error enviando notificación:', error)
    return { error: 'Error al enviar la notificación' }
  }
}
