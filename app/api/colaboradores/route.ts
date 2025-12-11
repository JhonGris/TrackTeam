import { NextResponse } from 'next/server'
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
