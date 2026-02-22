import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import prisma from '@/lib/prisma'

// ============================================================================
// PDF GENERATION API - Equipment Life Sheet (using jsPDF)
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch equipment with all related data
    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        colaborador: {
          select: {
            nombre: true,
            apellido: true,
            cargo: true,
            email: true,
          },
        },
        servicios: {
          orderBy: { fechaServicio: 'desc' },
          select: {
            id: true,
            tipo: true,
            fechaServicio: true,
            problemas: true,
            soluciones: true,
            tiempoInvertido: true,
            estadoResultante: true,
          },
        },
      },
    })

    if (!equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    // Create PDF document
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    // Helper functions
    const formatDate = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const formatTiempo = (minutos: number): string => {
      if (minutos < 60) return `${minutos} min`
      const horas = Math.floor(minutos / 60)
      const mins = minutos % 60
      return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
    }

    // ========== HEADER ==========
    doc.setFillColor(30, 64, 175) // Blue
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('HOJA DE VIDA DEL EQUIPO', pageWidth / 2, 18, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Serial: ${equipo.serial}`, pageWidth / 2, 28, { align: 'center' })
    
    yPos = 45

    // ========== EQUIPMENT INFO ==========
    doc.setTextColor(30, 64, 175)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Información del Equipo', 14, yPos)
    yPos += 8

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const equipoInfo = [
      ['Marca:', equipo.marca, 'Modelo:', equipo.modelo],
      ['Tipo:', equipo.tipo, 'Serial:', equipo.serial],
      ['Procesador:', equipo.procesador, 'RAM:', `${equipo.ram} GB`],
      ['Almacenamiento:', equipo.almacenamiento, 'GPU:', equipo.gpu || 'N/A'],
      ['Estado de Salud:', equipo.estadoSalud, 'Estado:', equipo.estado],
      ['Fecha Adquisición:', formatDate(equipo.fechaAdquisicion), 'Garantía:', equipo.fechaGarantia ? formatDate(equipo.fechaGarantia) : 'N/A'],
    ]

    equipoInfo.forEach(row => {
      doc.setFont('helvetica', 'bold')
      doc.text(row[0], 14, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(row[1], 50, yPos)
      
      doc.setFont('helvetica', 'bold')
      doc.text(row[2], 110, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(row[3], 145, yPos)
      
      yPos += 6
    })

    yPos += 5

    // ========== PERIPHERALS ==========
    if (equipo.pantallas || equipo.tieneTeclado || equipo.tieneMouse) {
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Periféricos', 14, yPos)
      yPos += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      const peripherals = []
      if (equipo.pantallas) peripherals.push(`Pantallas: ${equipo.pantallas}`)
      if (equipo.resolucionPantalla) peripherals.push(`Resolución: ${equipo.resolucionPantalla}`)
      if (equipo.tieneTeclado) peripherals.push('Teclado: Sí')
      if (equipo.tieneMouse) peripherals.push('Mouse: Sí')
      if (equipo.otrosPeriferico) peripherals.push(`Otros: ${equipo.otrosPeriferico}`)

      doc.text(peripherals.join(' | '), 14, yPos)
      yPos += 10
    }

    // ========== COLLABORATOR ==========
    if (equipo.colaborador) {
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Colaborador Asignado', 14, yPos)
      yPos += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`${equipo.colaborador.nombre} ${equipo.colaborador.apellido}`, 14, yPos)
      yPos += 5
      doc.text(`Cargo: ${equipo.colaborador.cargo}`, 14, yPos)
      yPos += 5
      doc.text(`Email: ${equipo.colaborador.email}`, 14, yPos)
      yPos += 10
    }

    // ========== LOCATION ==========
    if (equipo.departamento || equipo.ubicacion) {
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Ubicación', 14, yPos)
      yPos += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      if (equipo.departamento) {
        doc.text(`Departamento: ${equipo.departamento}`, 14, yPos)
        yPos += 5
      }
      if (equipo.ubicacion) {
        doc.text(`Ubicación: ${equipo.ubicacion}`, 14, yPos)
        yPos += 5
      }
      yPos += 5
    }

    // ========== OBSERVATIONS ==========
    if (equipo.observaciones) {
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Observaciones', 14, yPos)
      yPos += 6

      doc.setFillColor(254, 252, 232)
      doc.rect(14, yPos - 4, pageWidth - 28, 15, 'F')
      
      doc.setTextColor(113, 63, 18)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const splitText = doc.splitTextToSize(equipo.observaciones, pageWidth - 32)
      doc.text(splitText, 16, yPos)
      yPos += splitText.length * 5 + 10
    }

    // ========== SERVICE HISTORY ==========
    doc.setTextColor(30, 64, 175)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Historial de Servicios Técnicos', 14, yPos)
    yPos += 8

    if (equipo.servicios && equipo.servicios.length > 0) {
      const tableBody = equipo.servicios.map(s => [
        formatDate(s.fechaServicio).split(' de ').slice(0, 2).join('/'),
        s.tipo,
        s.problemas.substring(0, 40) + (s.problemas.length > 40 ? '...' : ''),
        s.soluciones.substring(0, 40) + (s.soluciones.length > 40 ? '...' : ''),
        formatTiempo(s.tiempoInvertido),
        s.estadoResultante,
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Tipo', 'Problemas', 'Soluciones', 'Tiempo', 'Estado']],
        body: tableBody,
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
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 },
          4: { cellWidth: 20 },
          5: { cellWidth: 22 },
        },
        margin: { left: 14, right: 14 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 10
    } else {
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('No hay servicios técnicos registrados', 14, yPos)
      yPos += 10
    }

    // ========== FOOTER ==========
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setDrawColor(200, 200, 200)
    doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20)
    
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
    
    doc.text(`Generado por TrackTeam - ${generatedDate}`, pageWidth / 2, pageHeight - 12, { align: 'center' })

    // Generate PDF buffer
    const pdfOutput = doc.output('arraybuffer')
    const uint8Array = new Uint8Array(pdfOutput)

    // Create filename
    const filename = `hoja-vida-${equipo.serial}-${new Date().toISOString().split('T')[0]}.pdf`

    // Return PDF
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8Array.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
