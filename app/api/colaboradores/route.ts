import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cargo: true,
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
    })

    return NextResponse.json(colaboradores)
  } catch (error) {
    console.error('Error fetching colaboradores:', error)
    return NextResponse.json(
      { error: 'Error al cargar colaboradores' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, fotoUrl } = body

    if (!id || typeof fotoUrl !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere id y fotoUrl' },
        { status: 400 }
      )
    }

    const colaborador = await prisma.colaborador.update({
      where: { id },
      data: { fotoUrl },
    })

    // Registrar en historial
    await prisma.colaboradorHistorial.create({
      data: {
        colaboradorId: id,
        tipo: 'dato_actualizado',
        descripcion: 'Foto del colaborador actualizada',
      },
    })

    return NextResponse.json({ success: true, fotoUrl: colaborador.fotoUrl })
  } catch (error) {
    console.error('Error updating colaborador foto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la foto' },
      { status: 500 }
    )
  }
}
