import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE: Eliminar un equipo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('=== DELETE EQUIPO ===');
    console.log('ID a eliminar:', id);

    // Verificar que el equipo existe
    const equipoExistente = await prisma.equipo.findUnique({
      where: { id }
    });

    if (!equipoExistente) {
      console.log('Equipo no encontrado');
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
    }

    // Eliminar el equipo
    await prisma.equipo.delete({
      where: { id }
    });

    console.log('Equipo eliminado exitosamente');
    console.log('=== FIN DELETE EQUIPO ===');

    return NextResponse.json({ success: true, message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('=== ERROR EN DELETE EQUIPO ===');
    console.error('Error eliminando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
