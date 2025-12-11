import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, email, departamento, ciudad, telefono } = body;
    const { id } = params;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombre,
        email,
        departamento,
        ciudad
      }
    });

    const usuarioTransformado = {
      id: usuarioActualizado.id,
      nombre: usuarioActualizado.nombre,
      email: usuarioActualizado.email,
      departamento: usuarioActualizado.departamento,
      ciudad: usuarioActualizado.ciudad,
      telefono: telefono || '',
      equiposAsignados: 0, // Calcular después
      fechaCreacion: usuarioActualizado.createdAt.toISOString().split('T')[0],
      estado: 'activo'
    };

    return NextResponse.json(usuarioTransformado);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar si el usuario tiene equipos asignados
    const equiposAsignados = await prisma.equipo.count({
      where: { usuarioId: id }
    });

    if (equiposAsignados > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el usuario porque tiene equipos asignados' },
        { status: 400 }
      );
    }

    await prisma.usuario.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}