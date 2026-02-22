import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import prisma from '@/lib/prisma'

// ============================================================================
// PDF GENERATION API - Colaborador Life Sheet (Hoja de Vida)
// ============================================================================

const DOTACION_LABELS: Record<string, string> = {
  basePortatil: 'Base Portátil',
  audifonos: 'Audífonos',
  apoyaPies: 'Apoya Pies',
  escritorio: 'Escritorio',
  sillaErgonomica: 'Silla Ergonómica',
  camara: 'Cámara',
  microfono: 'Micrófono',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch collaborator with all related data
    const colaborador = await prisma.colaborador.findUnique({
      where: { id },
      include: {
        equipos: {
          select: {
            id: true,
            serial: true,
            marca: true,
            modelo: true,
            tipo: true,
            procesador: true,
            ram: true,
            almacenamiento: true,
            gpu: true,
            estadoSalud: true,
            estado: true,
            fechaAdquisicion: true,
            pantallas: true,
            resolucionPantalla: true,
            tieneTeclado: true,
            tieneMouse: true,
            otrosPeriferico: true,
            observaciones: true,
          },
          orderBy: { marca: 'asc' },
        },
        movimientosRepuestos: {
          where: { tipo: 'salida' },
          select: {
            id: true,
            cantidad: true,
            createdAt: true,
            repuesto: {
              select: {
                nombre: true,
                codigoInterno: true,
                categoria: { select: { nombre: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        archivos: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            tamanio: true,
            descripcion: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        historial: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            tipo: true,
            descripcion: true,
            createdAt: true,
          },
        },
      },
    })

    if (!colaborador) {
      return NextResponse.json(
        { error: 'Colaborador no encontrado' },
        { status: 404 }
      )
    }

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Helpers
    const formatDate = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const formatDateShort = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    }

    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - 25) {
        doc.addPage()
        yPos = 20
      }
    }

    const drawSectionTitle = (title: string) => {
      checkPageBreak(20)
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 14, yPos)
      yPos += 2
      doc.setDrawColor(30, 64, 175)
      doc.setLineWidth(0.5)
      doc.line(14, yPos, pageWidth - 14, yPos)
      yPos += 6
    }

    const addField = (label: string, value: string, x: number = 14) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      doc.text(label, x, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(value, x + doc.getTextWidth(label) + 2, yPos)
    }

    // ========== HEADER ==========
    doc.setFillColor(30, 64, 175)
    doc.rect(0, 0, pageWidth, 38, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('HOJA DE VIDA DEL COLABORADOR', pageWidth / 2, 18, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const nombreCompleto = `${colaborador.nombre} ${colaborador.apellido}`
    doc.text(nombreCompleto, pageWidth / 2, 30, { align: 'center' })

    yPos = 48

    // ========== INFORMACIÓN PERSONAL ==========
    drawSectionTitle('Información Personal')

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const personalFields: [string, string][] = [
      ['Nombre:', `${colaborador.nombre} ${colaborador.apellido}`],
      ['Cargo:', colaborador.cargo],
      ['Email:', colaborador.email],
    ]
    if (colaborador.cedula) personalFields.push(['Cédula:', colaborador.cedula])
    if (colaborador.direccion) personalFields.push(['Dirección:', colaborador.direccion])
    if (colaborador.ciudad) personalFields.push(['Ciudad:', colaborador.ciudad])

    // Render in 2-column layout
    for (let i = 0; i < personalFields.length; i += 2) {
      const [label1, val1] = personalFields[i]
      addField(label1, val1, 14)
      if (i + 1 < personalFields.length) {
        const [label2, val2] = personalFields[i + 1]
        addField(label2, val2, 110)
      }
      yPos += 6
    }

    yPos += 4

    // ========== DOTACIÓN ==========
    const dotacion = colaborador.dotacionJson
      ? JSON.parse(colaborador.dotacionJson)
      : {}
    const dotacionEntries = Object.entries(DOTACION_LABELS)
    const hasAnyDotacion = dotacionEntries.some(([key]) => dotacion[key] === true)

    if (hasAnyDotacion) {
      drawSectionTitle('Dotación Entregada')

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      let col = 0
      for (const [key, label] of dotacionEntries) {
        const entregado = dotacion[key] === true
        const x = 14 + col * 55

        if (entregado) {
          // Green check
          doc.setTextColor(22, 163, 74)
          doc.setFont('helvetica', 'bold')
          doc.text('✓', x, yPos)
        } else {
          // Red X
          doc.setTextColor(220, 38, 38)
          doc.setFont('helvetica', 'normal')
          doc.text('✗', x, yPos)
        }

        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
        doc.text(label, x + 5, yPos)

        col++
        if (col >= 3) {
          col = 0
          yPos += 6
        }
      }
      if (col !== 0) yPos += 6
      yPos += 4
    }

    // ========== OBSERVACIONES ==========
    if (colaborador.observaciones) {
      drawSectionTitle('Observaciones')

      doc.setFillColor(254, 252, 232)
      doc.roundedRect(14, yPos - 4, pageWidth - 28, 16, 2, 2, 'F')

      doc.setTextColor(113, 63, 18)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const splitObs = doc.splitTextToSize(colaborador.observaciones, pageWidth - 36)
      doc.text(splitObs, 18, yPos)
      yPos += splitObs.length * 5 + 10
    }

    // ========== EQUIPOS ASIGNADOS ==========
    drawSectionTitle(`Equipos Asignados (${colaborador.equipos.length})`)

    if (colaborador.equipos.length > 0) {
      for (const equipo of colaborador.equipos) {
        checkPageBreak(45)

        // Equipment sub-header
        doc.setFillColor(241, 245, 249) // slate-100
        doc.roundedRect(14, yPos - 4, pageWidth - 28, 8, 1.5, 1.5, 'F')
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 64, 175)
        doc.text(`${equipo.marca} ${equipo.modelo} — ${equipo.serial}`, 18, yPos)

        // Health badge
        const healthColors: Record<string, [number, number, number]> = {
          'Bueno': [22, 163, 74],
          'Regular': [202, 138, 4],
          'Malo': [220, 38, 38],
        }
        const hc = healthColors[equipo.estadoSalud] || [100, 100, 100]
        doc.setTextColor(hc[0], hc[1], hc[2])
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text(equipo.estadoSalud, pageWidth - 18, yPos, { align: 'right' })

        yPos += 8
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')

        const eqDetails = [
          [`Tipo: ${equipo.tipo}`, `Procesador: ${equipo.procesador}`],
          [`RAM: ${equipo.ram} GB`, `Almacenamiento: ${equipo.almacenamiento}`],
          [`GPU: ${equipo.gpu || 'N/A'}`, `Estado: ${equipo.estado}`],
          [`Fecha Adquisición: ${formatDate(equipo.fechaAdquisicion)}`, ''],
        ]

        for (const [left, right] of eqDetails) {
          doc.text(left, 18, yPos)
          if (right) doc.text(right, 110, yPos)
          yPos += 5
        }

        // Peripherals
        const peripherals: string[] = []
        if (equipo.pantallas) peripherals.push(`Pantallas: ${equipo.pantallas}`)
        if (equipo.resolucionPantalla) peripherals.push(`Resolución: ${equipo.resolucionPantalla}`)
        if (equipo.tieneTeclado) peripherals.push('Teclado: Sí')
        if (equipo.tieneMouse) peripherals.push('Mouse: Sí')
        if (equipo.otrosPeriferico) peripherals.push(`Otros: ${equipo.otrosPeriferico}`)

        if (peripherals.length > 0) {
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(100, 100, 100)
          doc.text(`Periféricos: ${peripherals.join(' | ')}`, 18, yPos)
          yPos += 5
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
        }

        if (equipo.observaciones) {
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(113, 63, 18)
          const obsText = doc.splitTextToSize(`Obs: ${equipo.observaciones}`, pageWidth - 36)
          doc.text(obsText, 18, yPos)
          yPos += obsText.length * 4 + 2
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
        }

        yPos += 4
      }
    } else {
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('No tiene equipos asignados', 14, yPos)
      yPos += 8
    }

    // ========== INVENTARIO ASIGNADO ==========
    // Aggregate inventory items
    const inventarioMap = new Map<string, { nombre: string; cantidad: number; categoria: string; codigo: string | null }>()
    for (const mov of colaborador.movimientosRepuestos) {
      const key = mov.repuesto.nombre
      const existing = inventarioMap.get(key)
      if (existing) {
        existing.cantidad += Math.abs(mov.cantidad)
      } else {
        inventarioMap.set(key, {
          nombre: mov.repuesto.nombre,
          cantidad: Math.abs(mov.cantidad),
          categoria: mov.repuesto.categoria?.nombre || 'Sin categoría',
          codigo: mov.repuesto.codigoInterno,
        })
      }
    }
    const inventarioItems = Array.from(inventarioMap.values())

    if (inventarioItems.length > 0) {
      drawSectionTitle(`Inventario Asignado (${inventarioItems.length} items)`)

      checkPageBreak(20 + inventarioItems.length * 8)

      const tableBody = inventarioItems.map(item => [
        item.nombre,
        item.codigo || '-',
        item.categoria,
        item.cantidad.toString(),
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Artículo', 'Código', 'Categoría', 'Cantidad']],
        body: tableBody,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 35 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
        },
        margin: { left: 14, right: 14 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // ========== DOCUMENTOS ADJUNTOS ==========
    if (colaborador.archivos.length > 0) {
      drawSectionTitle(`Documentos Adjuntos (${colaborador.archivos.length})`)

      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      }

      const fileTypeLabels: Record<string, string> = {
        'application/pdf': 'PDF',
        'image/jpeg': 'Imagen JPEG',
        'image/png': 'Imagen PNG',
        'image/webp': 'Imagen WebP',
        'application/msword': 'Word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
        'application/vnd.ms-excel': 'Excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      }

      checkPageBreak(20 + colaborador.archivos.length * 8)

      const archivosBody = colaborador.archivos.map(a => [
        a.nombre.length > 45 ? a.nombre.substring(0, 42) + '...' : a.nombre,
        fileTypeLabels[a.tipo] || a.tipo.split('/').pop()?.toUpperCase() || a.tipo,
        formatFileSize(a.tamanio),
        a.descripcion
          ? (a.descripcion.length > 40 ? a.descripcion.substring(0, 37) + '...' : a.descripcion)
          : '—',
        formatDateShort(a.createdAt),
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Documento', 'Tipo', 'Tamaño', 'Descripción', 'Fecha']],
        body: archivosBody,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 25 },
          2: { cellWidth: 22 },
          3: { cellWidth: 50 },
          4: { cellWidth: 28 },
        },
        margin: { left: 14, right: 14 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // ========== HISTORIAL ==========
    if (colaborador.historial.length > 0) {
      drawSectionTitle(`Historial de Eventos (${colaborador.historial.length})`)

      checkPageBreak(20 + colaborador.historial.length * 8)

      const tipoLabels: Record<string, string> = {
        equipo_asignado: 'Equipo asignado',
        equipo_removido: 'Equipo removido',
        inventario_asignado: 'Inventario asignado',
        inventario_removido: 'Inventario removido',
        documento_agregado: 'Documento agregado',
        dato_actualizado: 'Dato actualizado',
      }

      const histBody = colaborador.historial.map(h => [
        formatDateShort(h.createdAt),
        tipoLabels[h.tipo] || h.tipo,
        h.descripcion.length > 70
          ? h.descripcion.substring(0, 70) + '...'
          : h.descripcion,
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Tipo', 'Descripción']],
        body: histBody,
        theme: 'striped',
        headStyles: {
          fillColor: [100, 116, 139],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 40 },
          2: { cellWidth: 110 },
        },
        margin: { left: 14, right: 14 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // ========== FOOTER ==========
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const ph = doc.internal.pageSize.getHeight()

      doc.setDrawColor(200, 200, 200)
      doc.line(14, ph - 18, pageWidth - 14, ph - 18)

      doc.setTextColor(150, 150, 150)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')

      const generatedDate = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      doc.text(
        `Generado por TrackTeam — ${generatedDate}`,
        14,
        ph - 10
      )
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - 14,
        ph - 10,
        { align: 'right' }
      )
    }

    // Generate PDF
    const pdfOutput = doc.output('arraybuffer')
    const uint8Array = new Uint8Array(pdfOutput)

    const safeName = nombreCompleto.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '')
    const filename = `hoja-vida-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8Array.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating colaborador PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
