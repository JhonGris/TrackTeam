import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/servicios - Obtener todos los servicios
export async function GET() {
  try {
    const servicios = await prisma.servicioTecnico.findMany({
      include: {
        equipo: {
          include: {
            usuario: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Mapear los datos al formato esperado por el frontend
    const serviciosFormateados = servicios.map(servicio => ({
      id: servicio.id,
      equipoId: servicio.equipoId,
      equipoSerial: servicio.equipo.serial,
      equipoMarca: servicio.equipo.marca,
      equipoModelo: servicio.equipo.modelo,
      tipoMantenimiento: servicio.tipoMantenimiento,
      fechaServicio: servicio.fechaServicio.toISOString().split('T')[0],
      tecnicoResponsable: servicio.tecnicoResponsable,
      diagnostico: servicio.diagnostico || '',
      descripcionTrabajo: servicio.descripcionTrabajo || '',
      costoReparacion: servicio.costoReparacion || 0,
      fotografias: []
    }))
    
    return NextResponse.json(serviciosFormateados)
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/servicios - Crear un nuevo servicio
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Buscar el equipo por serial para obtener el ID
    const equipo = await prisma.equipo.findUnique({
      where: { serial: data.equipoSerial }
    })
    
    if (!equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }
    
    const servicio = await prisma.servicioTecnico.create({
      data: {
        equipoId: equipo.id,
        tipoMantenimiento: data.tipo,
        fechaServicio: new Date(data.fecha),
        tecnicoResponsable: data.tecnico,
        diagnostico: data.diagnostico,
        descripcionTrabajo: data.descripcion,
        costoReparacion: data.costo,
        // Guardar usuario y departamento en el momento del servicio
        usuarioAsignado: data.usuarioAsignado,
        departamentoEnMomento: data.departamentoEnMomento
      },
      include: {
        equipo: true
      }
    })
    
    // Formatear respuesta para el frontend
    const servicioFormateado = {
      id: servicio.id,
      equipoId: servicio.equipoId,
      equipoSerial: servicio.equipo.serial,
      equipoMarca: servicio.equipo.marca,
      equipoModelo: servicio.equipo.modelo,
      tipoMantenimiento: servicio.tipoMantenimiento,
      fechaServicio: servicio.fechaServicio.toISOString().split('T')[0],
      tecnicoResponsable: servicio.tecnicoResponsable,
      diagnostico: servicio.diagnostico || '',
      descripcionTrabajo: servicio.descripcionTrabajo || '',
      costoReparacion: servicio.costoReparacion || 0,
      fotografias: data.fotografias || [],
      usuarioAsignado: servicio.usuarioAsignado,
      departamentoEnMomento: servicio.departamentoEnMomento
    }
    
    return NextResponse.json(servicioFormateado, { status: 201 })
  } catch (error) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}