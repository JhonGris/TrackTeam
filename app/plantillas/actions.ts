'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

// ============================================================================
// TIPOS
// ============================================================================

export type PlantillaMantenimiento = {
  id: string
  nombre: string
  descripcion: string | null
  tipo: string
  problemasTipicos: string
  solucionesTipicas: string
  tiempoEstimado: number
  checklist: string | null
  activa: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// QUERIES
// ============================================================================

export async function getPlantillas() {
  return prisma.plantillaMantenimiento.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }]
  })
}

export async function getPlantillasActivas() {
  return prisma.plantillaMantenimiento.findMany({
    where: { activa: true },
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }]
  })
}

export async function getPlantillaById(id: string) {
  return prisma.plantillaMantenimiento.findUnique({
    where: { id }
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

export async function createPlantilla(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string | null
  const tipo = formData.get('tipo') as string
  const problemasTipicos = formData.get('problemasTipicos') as string
  const solucionesTipicas = formData.get('solucionesTipicas') as string
  const tiempoEstimado = parseInt(formData.get('tiempoEstimado') as string) || 30
  const checklistRaw = formData.get('checklist') as string | null

  if (!nombre || !tipo || !problemasTipicos || !solucionesTipicas) {
    return { error: 'Faltan campos requeridos' }
  }

  // Parsear checklist (viene como texto separado por líneas)
  let checklist: string | null = null
  if (checklistRaw && checklistRaw.trim()) {
    const items = checklistRaw
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0)
    checklist = JSON.stringify(items)
  }

  try {
    await prisma.plantillaMantenimiento.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        tipo,
        problemasTipicos: problemasTipicos.trim(),
        solucionesTipicas: solucionesTipicas.trim(),
        tiempoEstimado,
        checklist,
        activa: true
      }
    })

    revalidatePath('/plantillas')
    revalidatePath('/servicios')
    return { success: true }
  } catch (error) {
    console.error('Error creando plantilla:', error)
    return { error: 'Error al crear la plantilla' }
  }
}

export async function updatePlantilla(id: string, formData: FormData) {
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string | null
  const tipo = formData.get('tipo') as string
  const problemasTipicos = formData.get('problemasTipicos') as string
  const solucionesTipicas = formData.get('solucionesTipicas') as string
  const tiempoEstimado = parseInt(formData.get('tiempoEstimado') as string) || 30
  const checklistRaw = formData.get('checklist') as string | null
  const activa = formData.get('activa') === 'true'

  if (!nombre || !tipo || !problemasTipicos || !solucionesTipicas) {
    return { error: 'Faltan campos requeridos' }
  }

  // Parsear checklist
  let checklist: string | null = null
  if (checklistRaw && checklistRaw.trim()) {
    const items = checklistRaw
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0)
    checklist = JSON.stringify(items)
  }

  try {
    await prisma.plantillaMantenimiento.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        tipo,
        problemasTipicos: problemasTipicos.trim(),
        solucionesTipicas: solucionesTipicas.trim(),
        tiempoEstimado,
        checklist,
        activa
      }
    })

    revalidatePath('/plantillas')
    revalidatePath('/servicios')
    return { success: true }
  } catch (error) {
    console.error('Error actualizando plantilla:', error)
    return { error: 'Error al actualizar la plantilla' }
  }
}

export async function deletePlantilla(id: string) {
  try {
    await prisma.plantillaMantenimiento.delete({
      where: { id }
    })

    revalidatePath('/plantillas')
    revalidatePath('/servicios')
    return { success: true }
  } catch (error) {
    console.error('Error eliminando plantilla:', error)
    return { error: 'Error al eliminar la plantilla' }
  }
}

export async function togglePlantillaActiva(id: string) {
  try {
    const plantilla = await prisma.plantillaMantenimiento.findUnique({
      where: { id }
    })

    if (!plantilla) {
      return { error: 'Plantilla no encontrada' }
    }

    await prisma.plantillaMantenimiento.update({
      where: { id },
      data: { activa: !plantilla.activa }
    })

    revalidatePath('/plantillas')
    revalidatePath('/servicios')
    return { success: true }
  } catch (error) {
    console.error('Error toggling plantilla:', error)
    return { error: 'Error al cambiar estado de la plantilla' }
  }
}
