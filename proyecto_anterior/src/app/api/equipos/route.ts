import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obtener todos los equipos
export async function GET() {
  try {
    const equipos = await prisma.equipo.findMany({
      include: {
        usuario: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para que coincidan con la interfaz frontend
    const equiposTransformados = equipos.map((equipo: any) => ({
      id: equipo.id,
      serial: equipo.serial,
      marca: equipo.marca,
      modelo: equipo.modelo,
      tipo: equipo.tipo,
      procesador: equipo.procesador || '',
      ram: equipo.ram || 0,
      ramDetalle: equipo.ramDetalle ? JSON.parse(equipo.ramDetalle) : null,
      almacenamientoTipo: equipo.almacenamientoTipo || 'SSD',
      almacenamientoGb: equipo.almacenamientoGb || 256,
      discosDetalle: equipo.discosDetalle ? JSON.parse(equipo.discosDetalle) : null,
      tarjetaVideo: equipo.tarjetaVideo || '',
      gpuDetalle: equipo.gpuDetalle ? JSON.parse(equipo.gpuDetalle) : null,
      pantallas: equipo.pantallas || 1,
      resolucionPantalla: equipo.resolucionPantalla || '',
      tieneTeclado: equipo.tieneTeclado || false,
      tieneMouse: equipo.tieneMouse || false,
      otrosPeriferico: equipo.otrosPeriferico || '',
      usuario: equipo.usuario?.nombre || 'Sin asignar',
      departamento: equipo.usuario?.departamento || 'Sin departamento',
      ubicacion: equipo.ubicacion || 'Sin ubicación',
      estado: equipo.estado || 'Activo',
      fechaAdquisicion: equipo.fechaAdquisicion || '',
      fechaGarantia: equipo.fechaGarantia || '',
      observaciones: equipo.observaciones || ''
    }));

    return NextResponse.json(equiposTransformados);
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear nuevo equipo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      serial, 
      marca, 
      modelo, 
      tipo,
      procesador,
      ram,
      ramDetalle,
      almacenamientoTipo,
      almacenamientoGb,
      discosDetalle,
      tarjetaVideo,
      gpuDetalle,
      pantallas,
      resolucionPantalla,
      tieneTeclado,
      tieneMouse,
      otrosPeriferico,
      ubicacion,
      observaciones,
      usuario,
      fechaAdquisicion
    } = body;

    console.log('=== POST EQUIPO ===');
    console.log('Usuario recibido:', usuario);
    console.log('RAM Detalle:', ramDetalle);
    console.log('Discos Detalle:', discosDetalle);
    console.log('GPU Detalle:', gpuDetalle);

    // Buscar el usuario si se proporciona un nombre
    let usuarioId = null;
    let departamento = 'Sin departamento';
    if (usuario && usuario !== 'Sin asignar') {
      // Buscar con nombre exacto primero
      let usuarioEncontrado = await prisma.usuario.findFirst({
        where: { nombre: usuario }
      });
      
      // Si no se encuentra, buscar ignorando mayúsculas/minúsculas
      if (!usuarioEncontrado) {
        const todosUsuarios = await prisma.usuario.findMany();
        const usuarioFlex = todosUsuarios.find(u => 
          u.nombre.toLowerCase().trim() === usuario.toLowerCase().trim()
        );
        if (usuarioFlex) {
          usuarioEncontrado = await prisma.usuario.findUnique({
            where: { id: usuarioFlex.id }
          });
        }
      }
      
      console.log('Usuario encontrado en BD:', usuarioEncontrado);
      usuarioId = usuarioEncontrado?.id || null;
      departamento = usuarioEncontrado?.departamento || 'Sin departamento';
      console.log('usuarioId asignado:', usuarioId);
      console.log('departamento asignado:', departamento);
    }

    const nuevoEquipo = await prisma.equipo.create({
      data: {
        serial,
        marca,
        modelo,
        tipo,
        procesador,
        ram: parseInt(ram) || 0,
        ramDetalle: ramDetalle ? JSON.stringify(ramDetalle) : null,
        almacenamientoTipo,
        almacenamientoGb: parseInt(almacenamientoGb) || 256,
        discosDetalle: discosDetalle ? JSON.stringify(discosDetalle) : null,
        tarjetaVideo,
        gpuDetalle: gpuDetalle ? JSON.stringify(gpuDetalle) : null,
        pantallas: parseInt(pantallas) || 1,
        resolucionPantalla,
        tieneTeclado: tieneTeclado || false,
        tieneMouse: tieneMouse || false,
        otrosPeriferico,
        ubicacion: ubicacion || 'Oficina Principal',
        departamento: departamento,
        observaciones,
        estado: 'Activo',
        fechaAdquisicion: fechaAdquisicion ? new Date(fechaAdquisicion) : null,
        usuarioId: usuarioId
      },
      include: {
        usuario: true
      }
    });

    const nuevoEquipoAny = nuevoEquipo as any;

    const equipoTransformado = {
      id: nuevoEquipoAny.id,
      serial: nuevoEquipoAny.serial,
      marca: nuevoEquipoAny.marca,
      modelo: nuevoEquipoAny.modelo,
      tipo: nuevoEquipoAny.tipo,
      procesador: nuevoEquipoAny.procesador || '',
      ram: nuevoEquipoAny.ram || 0,
      ramDetalle: nuevoEquipoAny.ramDetalle ? JSON.parse(nuevoEquipoAny.ramDetalle) : null,
      almacenamientoTipo: nuevoEquipoAny.almacenamientoTipo || 'SSD',
      almacenamientoGb: nuevoEquipoAny.almacenamientoGb || 256,
      discosDetalle: nuevoEquipoAny.discosDetalle ? JSON.parse(nuevoEquipoAny.discosDetalle) : null,
      tarjetaVideo: nuevoEquipoAny.tarjetaVideo || '',
      gpuDetalle: nuevoEquipoAny.gpuDetalle ? JSON.parse(nuevoEquipoAny.gpuDetalle) : null,
      pantallas: nuevoEquipoAny.pantallas || 1,
      resolucionPantalla: nuevoEquipoAny.resolucionPantalla || '',
      tieneTeclado: nuevoEquipoAny.tieneTeclado || false,
      tieneMouse: nuevoEquipoAny.tieneMouse || false,
      otrosPeriferico: nuevoEquipoAny.otrosPeriferico || '',
      usuario: nuevoEquipoAny.usuario?.nombre || 'Sin asignar',
      departamento: nuevoEquipoAny.usuario?.departamento || 'Sin departamento',
      ubicacion: nuevoEquipoAny.ubicacion || 'Sin ubicación',
      estado: nuevoEquipoAny.estado || 'Activo',
      fechaAdquisicion: nuevoEquipoAny.fechaAdquisicion || '',
      fechaGarantia: nuevoEquipoAny.fechaGarantia || '',
      observaciones: nuevoEquipoAny.observaciones || ''
    };

    console.log('Equipo creado transformado:', equipoTransformado);
    console.log('=== FIN POST EQUIPO ===');

    return NextResponse.json(equipoTransformado);
  } catch (error) {
    console.error('Error creando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      serial, 
      marca, 
      modelo, 
      tipo,
      procesador,
      ram,
      ramDetalle,
      almacenamientoTipo,
      almacenamientoGb,
      discosDetalle,
      tarjetaVideo,
      gpuDetalle,
      pantallas,
      resolucionPantalla,
      tieneTeclado,
      tieneMouse,
      otrosPeriferico,
      ubicacion,
      observaciones,
      usuario,
      estado,
      fechaAdquisicion
    } = body;

    console.log('=== PUT EQUIPO ===');
    console.log('ID recibido:', id, 'Tipo:', typeof id);
    console.log('Usuario recibido:', usuario);
    console.log('RAM Detalle recibido:', ramDetalle);
    console.log('Discos Detalle recibido:', discosDetalle);
    console.log('GPU Detalle recibido:', gpuDetalle);

    if (!id) {
      console.log('ERROR: ID no proporcionado');
      return NextResponse.json({ error: 'ID del equipo requerido' }, { status: 400 });
    }

    // Obtener el equipo actual para comparar usuario
    const equipoActual = await prisma.equipo.findUnique({
      where: { id },
      select: { usuarioId: true, serial: true }
    });

    // Buscar el usuario si se proporciona un nombre
    let usuarioId = null;
    let departamento = 'Sin departamento';
    let ciudad = null;
    let cambioDeUsuario = false;
    
    if (usuario && usuario !== 'Sin asignar') {
      // Debug: Mostrar todos los usuarios para comparar
      const todosLosUsuarios = await prisma.usuario.findMany({
        select: { id: true, nombre: true, departamento: true }
      });
      console.log('Todos los usuarios en BD:', todosLosUsuarios);
      console.log('Buscando usuario con nombre:', usuario);
      
      // Buscar con nombre exacto primero
      let usuarioEncontrado = await prisma.usuario.findFirst({
        where: { nombre: usuario }
      });
      
      // Si no se encuentra, buscar ignorando mayúsculas/minúsculas
      if (!usuarioEncontrado) {
        console.log('No encontrado con búsqueda exacta, intentando búsqueda flexible...');
        const usuarioFlex = todosLosUsuarios.find(u => 
          u.nombre.toLowerCase().trim() === usuario.toLowerCase().trim()
        );
        if (usuarioFlex) {
          usuarioEncontrado = await prisma.usuario.findUnique({
            where: { id: usuarioFlex.id }
          });
        }
      }
      
      console.log('Usuario encontrado en BD:', usuarioEncontrado);
      usuarioId = usuarioEncontrado?.id || null;
      departamento = usuarioEncontrado?.departamento || 'Sin departamento';
      ciudad = usuarioEncontrado?.ciudad || null;
      console.log('usuarioId que se guardará:', usuarioId);
      console.log('departamento que se guardará:', departamento);
      console.log('ciudad que se guardará:', ciudad);
      
      // Verificar si hubo cambio de usuario
      if (equipoActual && equipoActual.usuarioId !== usuarioId) {
        cambioDeUsuario = true;
        console.log('CAMBIO DE USUARIO DETECTADO:', equipoActual.usuarioId, '->', usuarioId);
      }
    } else if (equipoActual && equipoActual.usuarioId !== null) {
      // Si se quitó el usuario
      cambioDeUsuario = true;
      console.log('USUARIO REMOVIDO DEL EQUIPO');
    }

    const equipoActualizado = await prisma.equipo.update({
      where: { id: id },
      data: {
        serial,
        marca,
        modelo,
        tipo,
        procesador,
        ram: parseInt(ram) || 0,
        ramDetalle: ramDetalle ? JSON.stringify(ramDetalle) : null,
        almacenamientoTipo,
        almacenamientoGb: parseInt(almacenamientoGb) || 256,
        discosDetalle: discosDetalle ? JSON.stringify(discosDetalle) : null,
        tarjetaVideo,
        gpuDetalle: gpuDetalle ? JSON.stringify(gpuDetalle) : null,
        pantallas: parseInt(pantallas) || 1,
        resolucionPantalla,
        tieneTeclado: tieneTeclado || false,
        tieneMouse: tieneMouse || false,
        otrosPeriferico,
        ubicacion: ubicacion || 'Oficina Principal',
        departamento: departamento,
        fechaAdquisicion: fechaAdquisicion || null,
        observaciones,
        estado: estado || 'Activo',
        usuarioId: usuarioId
      },
      include: {
        usuario: true
      }
    }) as any;

    // Si hubo cambio de usuario, registrar en el historial
    if (cambioDeUsuario) {
      try {
        // Cerrar asignación anterior si existe
        await prisma.historialAsignacion.updateMany({
          where: {
            equipoId: id,
            fechaFin: null
          },
          data: {
            fechaFin: new Date()
          }
        });

        // Crear nueva asignación solo si hay usuario
        if (usuarioId) {
          await prisma.historialAsignacion.create({
            data: {
              equipoId: id,
              equipoSerial: serial,
              usuarioId: usuarioId,
              usuarioNombre: usuario,
              departamento: departamento,
              ciudad: ciudad,
              motivo: 'Reasignación',
              observaciones: `Equipo reasignado a ${usuario}`,
              creadoPor: 'Sistema' // Aquí podrías usar el usuario autenticado si lo implementas
            }
          });
          console.log('Historial de asignación creado para:', usuario);
        } else {
          console.log('Usuario removido, asignación anterior cerrada sin crear nueva');
        }
      } catch (historialError) {
        console.error('Error al actualizar historial, pero equipo fue actualizado:', historialError);
        // No fallar la actualización del equipo si falla el historial
      }
    }

    console.log('Equipo actualizado en BD - usuarioId guardado:', equipoActualizado.usuarioId);
    console.log('Equipo actualizado en BD - usuario relacionado:', equipoActualizado.usuario);

    const equipoTransformado = {
      id: equipoActualizado.id,
      serial: equipoActualizado.serial,
      marca: equipoActualizado.marca,
      modelo: equipoActualizado.modelo,
      tipo: equipoActualizado.tipo,
      procesador: equipoActualizado.procesador || '',
      ram: equipoActualizado.ram || 0,
      ramDetalle: equipoActualizado.ramDetalle ? JSON.parse(equipoActualizado.ramDetalle) : null,
      almacenamientoTipo: equipoActualizado.almacenamientoTipo || 'SSD',
      almacenamientoGb: equipoActualizado.almacenamientoGb || 256,
      discosDetalle: equipoActualizado.discosDetalle ? JSON.parse(equipoActualizado.discosDetalle) : null,
      tarjetaVideo: equipoActualizado.tarjetaVideo || '',
      gpuDetalle: equipoActualizado.gpuDetalle ? JSON.parse(equipoActualizado.gpuDetalle) : null,
      pantallas: equipoActualizado.pantallas || 1,
      resolucionPantalla: equipoActualizado.resolucionPantalla || '',
      tieneTeclado: equipoActualizado.tieneTeclado || false,
      tieneMouse: equipoActualizado.tieneMouse || false,
      otrosPeriferico: equipoActualizado.otrosPeriferico || '',
      usuario: equipoActualizado.usuario?.nombre || 'Sin asignar',
      departamento: equipoActualizado.usuario?.departamento || 'Sin departamento',
      ubicacion: equipoActualizado.ubicacion || 'Sin ubicación',
      estado: equipoActualizado.estado || 'Activo',
      fechaAdquisicion: equipoActualizado.fechaAdquisicion || '',
      fechaGarantia: equipoActualizado.fechaGarantia || '',
      observaciones: equipoActualizado.observaciones || ''
    };

    console.log('Equipo transformado antes de enviar:', equipoTransformado);
    console.log('=== FIN PUT EQUIPO ===');

    return NextResponse.json(equipoTransformado);
  } catch (error) {
    console.error('=== ERROR EN PUT EQUIPO ===');
    console.error('Error actualizando equipo:', error);
    console.error('Tipo de error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}