'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { sendMovimientoInventarioEmail } from '@/lib/email'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

async function uploadFileToBlob(file: File, tipoEntidad: 'repuesto' | 'colaborador', entidadId: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tipoEntidad', tipoEntidad)
  formData.append('entidadId', entidadId)

  const response = await fetch(`${getBaseUrl()}/api/upload`, {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.error || 'Error al subir el archivo')
  }

  const url = result?.archivo?.ruta || result?.url
  if (!url) {
    throw new Error('No se recibió la URL del archivo')
  }

  return url as string
}

// ============================================================================
// CATEGORÍAS DE REPUESTOS
// ============================================================================

export async function getCategorias() {
  return prisma.categoriaRepuesto.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      _count: {
        select: { repuestos: true }
      }
    }
  })
}

export async function createCategoria(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string | null
  const color = formData.get('color') as string || '#6366f1'

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre de la categoría es requerido' }
  }

  try {
    const existing = await prisma.categoriaRepuesto.findUnique({
      where: { nombre: nombre.trim() }
    })

    if (existing) {
      return { error: 'Ya existe una categoría con ese nombre' }
    }

    await prisma.categoriaRepuesto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        color
      }
    })

    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error creating categoria:', error)
    return { error: 'Error al crear la categoría' }
  }
}

export async function updateCategoria(id: string, formData: FormData) {
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string | null
  const color = formData.get('color') as string

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre de la categoría es requerido' }
  }

  try {
    const existing = await prisma.categoriaRepuesto.findFirst({
      where: { 
        nombre: nombre.trim(),
        NOT: { id }
      }
    })

    if (existing) {
      return { error: 'Ya existe otra categoría con ese nombre' }
    }

    await prisma.categoriaRepuesto.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        color
      }
    })

    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error updating categoria:', error)
    return { error: 'Error al actualizar la categoría' }
  }
}

export async function deleteCategoria(id: string) {
  try {
    // Verificar si tiene repuestos asociados
    const categoria = await prisma.categoriaRepuesto.findUnique({
      where: { id },
      include: { _count: { select: { repuestos: true } } }
    })

    if (categoria && categoria._count.repuestos > 0) {
      return { error: `Esta categoría tiene ${categoria._count.repuestos} repuesto(s) asociado(s). Reasígnalos primero.` }
    }

    await prisma.categoriaRepuesto.delete({ where: { id } })

    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error deleting categoria:', error)
    return { error: 'Error al eliminar la categoría' }
  }
}

// ============================================================================
// REPUESTOS
// ============================================================================

export async function getRepuestos(options?: {
  search?: string
  categoriaId?: string
  stockBajo?: boolean
  activo?: boolean
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (options?.search) {
    where.OR = [
      { nombre: { contains: options.search } },
      { descripcion: { contains: options.search } },
      { codigoInterno: { contains: options.search } },
      { proveedor: { contains: options.search } },
      { asignadoA: { contains: options.search } }
    ]
  }

  if (options?.categoriaId) {
    where.categoriaId = options.categoriaId
  }

  if (options?.stockBajo) {
    // SQLite no soporta comparación directa de campos, usamos rawQuery más adelante
    // Por ahora, filtramos en memoria
  }

  if (options?.activo !== undefined) {
    where.activo = options.activo
  }

  let repuestos = await prisma.repuesto.findMany({
    where,
    include: { categoria: true },
    orderBy: [
      { nombre: 'asc' }
    ]
  })

  // Filtrar stock bajo en memoria (SQLite limitation)
  if (options?.stockBajo) {
    repuestos = repuestos.filter(r => r.cantidad <= r.cantidadMinima)
  }

  return repuestos
}

export async function getRepuesto(id: string) {
  return prisma.repuesto.findUnique({
    where: { id },
    include: {
      categoria: true,
      movimientos: {
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      usosEnServicios: {
        include: {
          servicioTecnico: {
            include: {
              equipo: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function createRepuesto(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string | null
  const categoriaId = formData.get('categoriaId') as string | null
  const cantidadMinima = parseInt(formData.get('cantidadMinima') as string) || 1
  const unidad = formData.get('unidad') as string || 'unidad'
  const ubicacion = formData.get('ubicacion') as string | null
  const proveedor = formData.get('proveedor') as string | null
  const asignadoA = formData.get('asignadoA') as string | null
  const codigoInterno = formData.get('codigoInterno') as string | null
  const foto = formData.get('foto') as File | null

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre del repuesto es requerido' }
  }

  try {
    // Verificar código interno único si se proporciona
    if (codigoInterno && codigoInterno.trim()) {
      const existing = await prisma.repuesto.findUnique({
        where: { codigoInterno: codigoInterno.trim() }
      })
      if (existing) {
        return { error: 'Ya existe un repuesto con ese código interno' }
      }
    }

    // Validar foto si se proporcionó
    let debeSubirFoto = false
    if (foto && foto.size > 0) {
      if (!foto.type.startsWith('image/')) {
        return { error: 'Solo se permiten archivos de imagen' }
      }
      if (foto.size > 10 * 1024 * 1024) {
        return { error: 'La imagen no debe superar 10MB' }
      }
      debeSubirFoto = true
    }

    // Obtener el siguiente número consecutivo
    const ultimoRepuesto = await prisma.repuesto.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true }
    })
    const siguienteNumero = (ultimoRepuesto?.numero ?? -1) + 1

    // Crear repuesto con cantidad 1 (ya está en bodega/disponible)
    let repuesto = await prisma.repuesto.create({
      data: {
        numero: siguienteNumero,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        categoriaId: categoriaId || null,
        cantidad: 1, // Inicia en 1: al crearse ya está en bodega (disponible)
        cantidadMinima,
        unidad,
        ubicacion: ubicacion?.trim() || null,
        proveedor: proveedor?.trim() || null,
        asignadoA: asignadoA?.trim() || null,
        codigoInterno: codigoInterno?.trim() || null,
        fotoUrl: null
      }
    })

    // Registrar movimiento automático de entrada (ingreso a bodega)
    await prisma.movimientoRepuesto.create({
      data: {
        repuestoId: repuesto.id,
        tipo: 'entrada',
        cantidad: 1,
        cantidadAnterior: 0,
        cantidadNueva: 1,
        motivo: 'Registro inicial en inventario',
        referencia: null,
        colaboradorId: null,
        notificacionEnviada: false,
        fotoUrl: null
      }
    })

    if (debeSubirFoto && foto) {
      try {
        const fotoUrl = await uploadFileToBlob(foto, 'repuesto', repuesto.id)
        repuesto = { ...repuesto, fotoUrl }
      } catch (uploadError) {
        console.error('Error uploading repuesto image:', uploadError)
        await prisma.repuesto.delete({ where: { id: repuesto.id } })
        return { error: 'Error al subir la imagen del repuesto' }
      }
    }

    revalidatePath('/inventario')
    return { success: true, repuesto }
  } catch (error) {
    console.error('Error creating repuesto:', error)
    return { error: 'Error al crear el repuesto' }
  }
}

export async function updateRepuesto(id: string, formData: FormData) {
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string | null
  const categoriaId = formData.get('categoriaId') as string | null
  const cantidadMinima = parseInt(formData.get('cantidadMinima') as string) || 1
  const unidad = formData.get('unidad') as string || 'unidad'
  const ubicacion = formData.get('ubicacion') as string | null
  const proveedor = formData.get('proveedor') as string | null
  const codigoInterno = formData.get('codigoInterno') as string | null
  const activo = formData.get('activo') === 'true'
  const foto = formData.get('foto') as File | null
  const eliminarFoto = formData.get('eliminarFoto') === 'true'

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre del objeto es requerido' }
  }

  try {
    // Verificar código interno único si se proporciona
    if (codigoInterno && codigoInterno.trim()) {
      const existing = await prisma.repuesto.findFirst({
        where: { 
          codigoInterno: codigoInterno.trim(),
          NOT: { id }
        }
      })
      if (existing) {
        return { error: 'Ya existe otro objeto con ese código interno' }
      }
    }

    // Handle photo upload or removal
    let fotoUrl: string | null | undefined = undefined // undefined = no change
    if (eliminarFoto) {
      fotoUrl = null
    } else if (foto && foto.size > 0) {
      if (!foto.type.startsWith('image/')) {
        return { error: 'Solo se permiten archivos de imagen' }
      }
      if (foto.size > 10 * 1024 * 1024) {
        return { error: 'La imagen no debe superar 10MB' }
      }
      try {
        fotoUrl = await uploadFileToBlob(foto, 'repuesto', id)
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError)
        return { error: 'Error al subir la imagen' }
      }
    }

    await prisma.repuesto.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        categoriaId: categoriaId || null,
        cantidadMinima,
        unidad,
        ubicacion: ubicacion?.trim() || null,
        proveedor: proveedor?.trim() || null,
        codigoInterno: codigoInterno?.trim() || null,
        activo,
        ...(fotoUrl !== undefined ? { fotoUrl } : {}),
      }
    })

    revalidatePath('/inventario')
    revalidatePath('/colaboradores')
    return { success: true }
  } catch (error) {
    console.error('Error updating repuesto:', error)
    return { error: 'Error al actualizar el objeto' }
  }
}

export async function deleteRepuesto(id: string) {
  try {
    // Verificar si tiene usos en servicios
    const repuesto = await prisma.repuesto.findUnique({
      where: { id },
      include: { _count: { select: { usosEnServicios: true } } }
    })

    if (repuesto && repuesto._count.usosEnServicios > 0) {
      // En lugar de eliminar, desactivar
      await prisma.repuesto.update({
        where: { id },
        data: { activo: false }
      })
      revalidatePath('/inventario')
      return { success: true, message: 'El repuesto fue desactivado porque tiene registros de uso' }
    }

    await prisma.repuesto.delete({ where: { id } })

    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error deleting repuesto:', error)
    return { error: 'Error al eliminar el repuesto' }
  }
}

// ============================================================================
// MOVIMIENTOS DE INVENTARIO
// ============================================================================

export async function registrarMovimiento(formData: FormData) {
  const repuestoId = formData.get('repuestoId') as string
  const tipo = formData.get('tipo') as 'entrada' | 'salida' | 'ajuste'
  const cantidad = parseInt(formData.get('cantidad') as string)
  const motivo = formData.get('motivo') as string | null
  const referencia = formData.get('referencia') as string | null
  const colaboradorId = formData.get('colaboradorId') as string | null
  const enviarCorreo = formData.get('enviarCorreo') === 'true'
  const foto = formData.get('foto') as File | null

  // Para ajustes, permitir cantidad 0. Para entrada/salida, debe ser mayor a 0
  if (!repuestoId || !tipo || isNaN(cantidad)) {
    return { error: 'Datos incompletos o inválidos' }
  }
  
  if (tipo !== 'ajuste' && cantidad <= 0) {
    return { error: 'La cantidad debe ser mayor a 0' }
  }
  
  if (tipo === 'ajuste' && cantidad < 0) {
    return { error: 'La cantidad no puede ser negativa' }
  }

  try {
    const repuesto = await prisma.repuesto.findUnique({
      where: { id: repuestoId }
    })

    if (!repuesto) {
      return { error: 'Objeto no encontrado' }
    }

    // Validate movement alternation: no consecutive same-type movements
    // Al crearse, cada objeto ya tiene un movimiento de entrada automático,
    // por lo que siempre habrá al menos un movimiento.
    const lastMov = await prisma.movimientoRepuesto.findFirst({
      where: { repuestoId },
      orderBy: { createdAt: 'desc' },
      select: { tipo: true }
    })

    if (lastMov) {
      if (tipo === 'salida' && lastMov.tipo === 'salida') {
        return { error: 'Este objeto ya tiene una salida registrada. Debe registrar una entrada (devolución) antes de una nueva salida.' }
      }
      if (tipo === 'entrada' && lastMov.tipo === 'entrada') {
        return { error: 'Este objeto ya está en bodega. Solo puede registrar una salida.' }
      }
    } else {
      // Caso excepcional: no debería ocurrir ya que al crear se genera movimiento de entrada.
      // Si por alguna razón no hay movimientos, solo permitir entrada.
      if (tipo === 'salida') {
        return { error: 'Este objeto no tiene movimientos previos. Primero debe registrar una entrada.' }
      }
    }

    // Procesar foto del movimiento si existe
    let fotoUrl: string | null = null
    if (foto && foto.size > 0) {
      if (!foto.type.startsWith('image/')) {
        return { error: 'Solo se permiten archivos de imagen' }
      }
      if (foto.size > 10 * 1024 * 1024) {
        return { error: 'La imagen no debe superar 10MB' }
      }

      try {
        fotoUrl = await uploadFileToBlob(foto, 'repuesto', repuestoId)
      } catch (uploadError) {
        console.error('Error uploading movimiento image:', uploadError)
        return { error: 'Error al subir la imagen del movimiento' }
      }
    }

    // Obtener colaborador si se especificó
    let colaborador = null
    if (colaboradorId) {
      colaborador = await prisma.colaborador.findUnique({
        where: { id: colaboradorId }
      })
    }

    let nuevaCantidad: number
    let cantidadMovimiento: number

    // Para inventario por unidad única: entrada = disponible (1), salida = asignado (0)
    switch (tipo) {
      case 'entrada':
        nuevaCantidad = 1 // El objeto está disponible
        cantidadMovimiento = 1
        break
      case 'salida':
        nuevaCantidad = 0 // El objeto fue asignado/usado
        cantidadMovimiento = -1
        break
      default:
        return { error: 'Tipo de movimiento inválido' }
    }

    // Determine asignadoA based on movement type
    const asignadoAUpdate = tipo === 'salida' && colaborador
      ? `${colaborador.nombre} ${colaborador.apellido}`
      : tipo === 'entrada'
        ? null
        : undefined

    // Actualizar stock y registrar movimiento en transacción
    const [, movimiento] = await prisma.$transaction([
      prisma.repuesto.update({
        where: { id: repuestoId },
        data: {
          cantidad: nuevaCantidad,
          ...(asignadoAUpdate !== undefined && { asignadoA: asignadoAUpdate }),
        }
      }),
      prisma.movimientoRepuesto.create({
        data: {
          repuestoId,
          tipo,
          cantidad: cantidadMovimiento,
          cantidadAnterior: repuesto.cantidad,
          cantidadNueva: nuevaCantidad,
          motivo: motivo?.trim() || null,
          referencia: referencia?.trim() || null,
          colaboradorId: colaboradorId || null,
          notificacionEnviada: false,
          fotoUrl
        }
      })
    ])

    // Enviar correo si se solicitó y hay colaborador
    let emailEnviado = false
    if (enviarCorreo && colaborador) {
      try {
        const emailResult = await sendMovimientoInventarioEmail({
          colaborador: {
            nombre: colaborador.nombre,
            apellido: colaborador.apellido,
            email: colaborador.email,
            cargo: colaborador.cargo
          },
          repuesto: {
            nombre: repuesto.nombre,
            descripcion: repuesto.descripcion,
            codigoInterno: repuesto.codigoInterno,
            fotoUrl: repuesto.fotoUrl,
            unidad: repuesto.unidad
          },
          movimiento: {
            tipo,
            cantidad: cantidadMovimiento,
            motivo: motivo?.trim() || null,
            referencia: referencia?.trim() || null,
            fecha: new Date()
          }
        })

        if (emailResult.success) {
          emailEnviado = true
          // Actualizar el movimiento para marcar que se envió notificación
          await prisma.movimientoRepuesto.update({
            where: { id: movimiento.id },
            data: { notificacionEnviada: true }
          })
        }
      } catch (emailError) {
        console.error('Error enviando email de movimiento:', emailError)
        // No fallar la operación si el email falla
      }
    }

    revalidatePath('/inventario')
    return { 
      success: true, 
      emailEnviado,
      colaboradorAsignado: !!colaborador
    }
  } catch (error) {
    console.error('Error registrando movimiento:', error)
    return { error: 'Error al registrar el movimiento' }
  }
}

export async function getMovimientosRepuesto(repuestoId: string, limit = 50) {
  return prisma.movimientoRepuesto.findMany({
    where: { repuestoId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      colaborador: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
    },
  })
}

export async function deleteMovimiento(id: string) {
  try {
    // Obtener el movimiento con sus datos
    const movimiento = await prisma.movimientoRepuesto.findUnique({
      where: { id },
      include: { repuesto: true }
    })

    if (!movimiento) {
      return { error: 'Movimiento no encontrado' }
    }

    // Calcular la reversión del stock
    // Si fue entrada (+), hay que restar
    // Si fue salida (-), hay que sumar
    // El movimiento.cantidad ya tiene el signo correcto
    const nuevaCantidad = movimiento.repuesto.cantidad - movimiento.cantidad

    if (nuevaCantidad < 0) {
      return { error: 'No se puede eliminar: el stock resultante sería negativo' }
    }

    // Revertir el stock y eliminar el movimiento en transacción
    await prisma.$transaction([
      prisma.repuesto.update({
        where: { id: movimiento.repuestoId },
        data: { cantidad: nuevaCantidad }
      }),
      prisma.movimientoRepuesto.delete({
        where: { id }
      })
    ])

    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    console.error('Error eliminando movimiento:', error)
    return { error: 'Error al eliminar el movimiento' }
  }
}

// ============================================================================
// HELPERS PARA UI DE MOVIMIENTOS
// ============================================================================

export async function getUltimoMovimiento(repuestoId: string) {
  return prisma.movimientoRepuesto.findFirst({
    where: { repuestoId },
    orderBy: { createdAt: 'desc' },
    select: { tipo: true, colaboradorId: true }
  })
}

export async function getAsignadoActual(repuestoId: string): Promise<{ colaboradorId: string } | null> {
  const lastMov = await prisma.movimientoRepuesto.findFirst({
    where: { repuestoId },
    orderBy: { createdAt: 'desc' },
    include: {
      colaborador: { select: { id: true, nombre: true, apellido: true } }
    }
  })

  if (lastMov?.tipo === 'salida' && lastMov.colaboradorId) {
    return { colaboradorId: lastMov.colaboradorId }
  }

  return null
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

export async function getInventarioStats() {
  const [
    totalRepuestos,
    repuestosActivos,
    totalCategorias,
    movimientosRecientes,
    repuestosData
  ] = await Promise.all([
    prisma.repuesto.count(),
    prisma.repuesto.count({ where: { activo: true } }),
    prisma.categoriaRepuesto.count(),
    prisma.movimientoRepuesto.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.repuesto.findMany({
      where: { activo: true },
      select: {
        cantidad: true,
        cantidadMinima: true
      }
    })
  ])

  // Calcular stock bajo
  const repuestosStockBajo = repuestosData.filter(r => r.cantidad <= r.cantidadMinima).length

  return {
    totalRepuestos,
    repuestosActivos,
    repuestosStockBajo,
    totalCategorias,
    movimientosRecientes
  }
}

// ============================================================================
// USO EN SERVICIOS
// ============================================================================

export async function registrarUsoEnServicio(
  servicioTecnicoId: string,
  repuestoId: string,
  cantidad: number,
  notas?: string
) {
  try {
    const repuesto = await prisma.repuesto.findUnique({
      where: { id: repuestoId }
    })

    if (!repuesto) {
      return { error: 'Repuesto no encontrado' }
    }

    if (repuesto.cantidad < cantidad) {
      return { error: 'Stock insuficiente' }
    }

    const nuevaCantidad = repuesto.cantidad - cantidad

    await prisma.$transaction([
      // Registrar uso
      prisma.usoRepuesto.create({
        data: {
          repuestoId,
          servicioTecnicoId,
          cantidad,
          notas: notas?.trim() || null
        }
      }),
      // Actualizar stock
      prisma.repuesto.update({
        where: { id: repuestoId },
        data: { cantidad: nuevaCantidad }
      }),
      // Registrar movimiento
      prisma.movimientoRepuesto.create({
        data: {
          repuestoId,
          tipo: 'salida',
          cantidad: -cantidad,
          cantidadAnterior: repuesto.cantidad,
          cantidadNueva: nuevaCantidad,
          motivo: `Usado en servicio técnico`,
          referencia: servicioTecnicoId
        }
      })
    ])

    revalidatePath('/inventario')
    revalidatePath('/servicios')
    return { success: true }
  } catch (error) {
    console.error('Error registrando uso:', error)
    return { error: 'Error al registrar el uso del repuesto' }
  }
}

/**
 * One-time fix: sync asignadoA for items that are assigned (cantidad=0)
 * but have asignadoA=null (assigned before the field was auto-managed).
 */
export async function syncAsignadoA() {
  try {
    // Find all repuestos with cantidad=0 but no asignadoA
    const broken = await prisma.repuesto.findMany({
      where: { cantidad: 0, asignadoA: null, activo: true },
    })

    let fixed = 0
    for (const rep of broken) {
      // Find last salida movement with a colaborador
      const lastSalida = await prisma.movimientoRepuesto.findFirst({
        where: { repuestoId: rep.id, tipo: 'salida', colaboradorId: { not: null } },
        orderBy: { createdAt: 'desc' },
        include: { colaborador: true },
      })

      if (lastSalida?.colaborador) {
        await prisma.repuesto.update({
          where: { id: rep.id },
          data: {
            asignadoA: `${lastSalida.colaborador.nombre} ${lastSalida.colaborador.apellido}`,
          },
        })
        fixed++
      }
    }

    revalidatePath('/inventario')
    return { success: true, fixed, total: broken.length }
  } catch (error) {
    console.error('Error syncing asignadoA:', error)
    return { error: 'Error al sincronizar asignaciones' }
  }
}

// ============================================================================
// MIGRACIÓN: Asegurar entrada inicial para items existentes
// ============================================================================

/**
 * Items creados antes de la lógica de entrada automática necesitan un movimiento
 * de entrada para poder registrar salidas. Esta función:
 * 1. Busca repuestos sin ningún movimiento
 * 2. Les crea un movimiento de "entrada" automático y pone cantidad en 1
 * 3. Busca repuestos con cantidad=0 cuyo último movimiento NO es salida
 *    (estaban en bodega pero con cantidad incorrecta) y los corrige
 */
export async function migrarEntradaInicial() {
  try {
    const todosRepuestos = await prisma.repuesto.findMany({
      where: { activo: true },
      include: {
        movimientos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { tipo: true }
        }
      }
    })

    let fixed = 0
    for (const rep of todosRepuestos) {
      const hasMovimientos = rep.movimientos.length > 0

      if (!hasMovimientos) {
        // Sin movimientos: crear entrada inicial y poner cantidad en 1
        await prisma.$transaction([
          prisma.movimientoRepuesto.create({
            data: {
              repuestoId: rep.id,
              tipo: 'entrada',
              cantidad: 1,
              cantidadAnterior: 0,
              cantidadNueva: 1,
              motivo: 'Registro inicial en inventario (migración)',
              referencia: null,
              colaboradorId: null,
              notificacionEnviada: false,
              fotoUrl: null
            }
          }),
          prisma.repuesto.update({
            where: { id: rep.id },
            data: { cantidad: 1 }
          })
        ])
        fixed++
      } else if (rep.cantidad === 0 && rep.movimientos[0].tipo !== 'salida' && !rep.asignadoA) {
        // Tiene movimientos pero cantidad=0 sin estar asignado: corregir a 1
        await prisma.repuesto.update({
          where: { id: rep.id },
          data: { cantidad: 1 }
        })
        fixed++
      }
    }

    revalidatePath('/inventario')
    return { success: true, fixed, total: todosRepuestos.length }
  } catch (error) {
    console.error('Error en migración de entrada inicial:', error)
    return { error: 'Error en la migración' }
  }
}
