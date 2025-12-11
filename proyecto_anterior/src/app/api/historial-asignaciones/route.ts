import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener historial de asignaciones de un equipo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipoId = searchParams.get('equipoId')
    const equipoSerial = searchParams.get('equipoSerial')

    let where: any = {}

    if (equipoId) {
      where.equipoId = equipoId
    } else if (equipoSerial) {
      where.equipoSerial = equipoSerial
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar equipoId o equipoSerial' },
        { status: 400 }
      )
    }

    const historial = await prisma.historialAsignacion.findMany({
      where,
      orderBy: {
        fechaInicio: 'desc'
      }
    })

    return NextResponse.json(historial)
  } catch (error) {
    console.error('Error al obtener historial:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Crear nueva entrada en el historial
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      equipoId,
      equipoSerial,
      usuarioId,
      usuarioNombre,
      departamento,
      ciudad,
      motivo,
      observaciones,
      creadoPor
    } = data

    // Validaciones
    if (!equipoId || !equipoSerial || !usuarioNombre || !motivo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Si hay una asignación actual para este equipo, cerrarla
    const asignacionActual = await prisma.historialAsignacion.findFirst({
      where: {
        equipoId,
        fechaFin: null
      }
    })

    if (asignacionActual) {
      await prisma.historialAsignacion.update({
        where: { id: asignacionActual.id },
        data: {
          fechaFin: new Date()
        }
      })
    }

    // Crear nueva asignación
    const nuevaAsignacion = await prisma.historialAsignacion.create({
      data: {
        equipoId,
        equipoSerial,
        usuarioId,
        usuarioNombre,
        departamento,
        ciudad,
        motivo,
        observaciones,
        creadoPor
      }
    })

    return NextResponse.json(nuevaAsignacion, { status: 201 })
  } catch (error) {
    console.error('Error al crear historial:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH: Cerrar asignación actual (marcar fecha fin)
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { equipoId, motivo, observaciones } = data

    if (!equipoId) {
      return NextResponse.json(
        { error: 'equipoId es requerido' },
        { status: 400 }
      )
    }

    // Buscar asignación actual
    const asignacionActual = await prisma.historialAsignacion.findFirst({
      where: {
        equipoId,
        fechaFin: null
      }
    })

    if (!asignacionActual) {
      return NextResponse.json(
        { error: 'No hay asignación actual para este equipo' },
        { status: 404 }
      )
    }

    // Actualizar con fecha fin
    const asignacionCerrada = await prisma.historialAsignacion.update({
      where: { id: asignacionActual.id },
      data: {
        fechaFin: new Date(),
        observaciones: observaciones || asignacionActual.observaciones
      }
    })

    return NextResponse.json(asignacionCerrada)
  } catch (error) {
    console.error('Error al cerrar asignación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
