import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: 'asc' }
    });
    
    // Transformar datos para que coincidan con la interfaz frontend
    const usuariosTransformados = usuarios.map(user => ({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      departamento: user.departamento,
      ciudad: user.ciudad,
      telefono: '', // Campo no existe en Prisma, agregar valor por defecto
      equiposAsignados: 0, // Calcular después
      fechaCreacion: user.createdAt.toISOString().split('T')[0],
      estado: 'activo'
    }));

    return NextResponse.json(usuariosTransformados);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, departamento, ciudad, telefono } = body;

    console.log('=== POST USUARIO ===');
    console.log('Body recibido:', body);
    console.log('Departamento:', departamento);
    console.log('Ciudad:', ciudad);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        departamento,
        ciudad
      }
    });

    console.log('Usuario creado en BD:', nuevoUsuario);

    const usuarioTransformado = {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      departamento: nuevoUsuario.departamento,
      ciudad: nuevoUsuario.ciudad,
      telefono: telefono || '',
      equiposAsignados: 0,
      fechaCreacion: nuevoUsuario.createdAt.toISOString().split('T')[0],
      estado: 'activo'
    };

    console.log('Usuario transformado a retornar:', usuarioTransformado);
    console.log('=== FIN POST USUARIO ===');

    return NextResponse.json(usuarioTransformado);
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}