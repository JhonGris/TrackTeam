import { put, del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import prisma from '@/lib/prisma'

// ============================================================================
// FILE UPLOAD API - Handle file uploads for equipos and servicios
// ============================================================================

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .substring(0, 50)
  return `${baseName}-${timestamp}-${random}${ext}`
}

/**
 * POST /api/upload - Upload a file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const tipoEntidad = formData.get('tipoEntidad') as string
    const entidadId = formData.get('entidadId') as string
    const descripcion = formData.get('descripcion') as string | null

    // Validate required fields
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Archivo inválido o ausente' },
        { status: 400 }
      )
    }

    if (!tipoEntidad || !['equipo', 'servicio', 'repuesto', 'colaborador'].includes(tipoEntidad)) {
      return NextResponse.json(
        { error: 'Tipo de entidad inválido' },
        { status: 400 }
      )
    }

    if (!entidadId) {
      return NextResponse.json(
        { error: 'ID de entidad requerido' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo (10MB)' },
        { status: 400 }
      )
    }

    // Verify entity exists
    if (tipoEntidad === 'equipo') {
      const equipo = await prisma.equipo.findUnique({ where: { id: entidadId } })
      if (!equipo) {
        return NextResponse.json(
          { error: 'Equipo no encontrado' },
          { status: 404 }
        )
      }
    } else if (tipoEntidad === 'servicio') {
      const servicio = await prisma.servicioTecnico.findUnique({ where: { id: entidadId } })
      if (!servicio) {
        return NextResponse.json(
          { error: 'Servicio técnico no encontrado' },
          { status: 404 }
        )
      }
    } else if (tipoEntidad === 'repuesto') {
      const repuesto = await prisma.repuesto.findUnique({ where: { id: entidadId } })
      if (!repuesto) {
        return NextResponse.json(
          { error: 'Repuesto no encontrado' },
          { status: 404 }
        )
      }
    } else if (tipoEntidad === 'colaborador') {
      const colaborador = await prisma.colaborador.findUnique({ where: { id: entidadId } })
      if (!colaborador) {
        return NextResponse.json(
          { error: 'Colaborador no encontrado' },
          { status: 404 }
        )
      }
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Falta configuración de almacenamiento (BLOB_READ_WRITE_TOKEN)' },
        { status: 500 }
      )
    }

    // Generate unique filename and save to Vercel Blob
    const uniqueFilename = generateUniqueFilename(file.name)
    const subdir =
      tipoEntidad === 'equipo'
        ? 'equipos'
        : tipoEntidad === 'servicio'
        ? 'servicios'
        : tipoEntidad === 'repuesto'
        ? 'repuestos'
        : 'colaboradores'
    const objectPath = `${subdir}/${uniqueFilename}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await put(objectPath, buffer, {
      access: 'public',
      token: blobToken,
      contentType: file.type,
    })

    // For repuestos, update the fotoUrl directly instead of creating Archivo record
    if (tipoEntidad === 'repuesto') {
      const fotoUrl = url
      await prisma.repuesto.update({
        where: { id: entidadId },
        data: { fotoUrl }
      })
      
      return NextResponse.json({
        success: true,
        archivo: {
          nombre: file.name,
          tipo: file.type,
          tamanio: file.size,
          ruta: fotoUrl,
          esImagen: file.type.startsWith('image/'),
        },
      })
    }

    // For colaboradores, save to Archivo table with colaboradorId
    if (tipoEntidad === 'colaborador') {
      const archivo = await prisma.archivo.create({
        data: {
          nombre: file.name,
          nombreAlmacenado: uniqueFilename,
          tipo: file.type,
          tamanio: file.size,
          ruta: url,
          tipoEntidad,
          colaboradorId: entidadId,
          descripcion: descripcion || null,
          esImagen: file.type.startsWith('image/'),
        },
      })

      return NextResponse.json({
        success: true,
        archivo: {
          id: archivo.id,
          nombre: archivo.nombre,
          tipo: archivo.tipo,
          tamanio: archivo.tamanio,
          ruta: archivo.ruta,
          esImagen: archivo.esImagen,
        },
      })
    }

    // Save to database for equipo and servicio
    const archivo = await prisma.archivo.create({
      data: {
        nombre: file.name,
        nombreAlmacenado: uniqueFilename,
        tipo: file.type,
        tamanio: file.size,
        ruta: url,
        tipoEntidad,
        equipoId: tipoEntidad === 'equipo' ? entidadId : null,
        servicioTecnicoId: tipoEntidad === 'servicio' ? entidadId : null,
        descripcion: descripcion || null,
        esImagen: file.type.startsWith('image/'),
      },
    })

    return NextResponse.json({
      success: true,
      archivo: {
        id: archivo.id,
        nombre: archivo.nombre,
        tipo: archivo.tipo,
        tamanio: archivo.tamanio,
        ruta: archivo.ruta,
        esImagen: archivo.esImagen,
      },
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload - Delete a file
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const archivoId = searchParams.get('id')

    if (!archivoId) {
      return NextResponse.json(
        { error: 'ID de archivo requerido' },
        { status: 400 }
      )
    }

    // Find the archivo
    const archivo = await prisma.archivo.findUnique({
      where: { id: archivoId },
    })

    if (!archivo) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Falta configuración de almacenamiento (BLOB_READ_WRITE_TOKEN)' },
        { status: 500 }
      )
    }

    // Delete from Vercel Blob (idempotent)
    try {
      await del(archivo.ruta, { token: blobToken })
    } catch (e) {
      console.warn('Could not delete blob:', e)
    }

    // Delete from database
    await prisma.archivo.delete({
      where: { id: archivoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el archivo' },
      { status: 500 }
    )
  }
}
