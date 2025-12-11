import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Equipo, Usuario, Servicio } from '@/contexts/InventarioContext';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export class GeneradorPDF {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // Agregar encabezado a cada página
  private agregarEncabezado(titulo: string) {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    
    // Título principal
    this.doc.setFontSize(20);
    this.doc.setTextColor(31, 41, 55); // gray-800
    this.doc.text(titulo, pageWidth / 2, 20, { align: 'center' });
    
    // Fecha de generación
    this.doc.setFontSize(10);
    this.doc.setTextColor(107, 114, 128); // gray-500
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    this.doc.text(`Generado: ${fecha}`, pageWidth / 2, 28, { align: 'center' });
    
    // Línea separadora
    this.doc.setDrawColor(229, 231, 235); // gray-200
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 32, pageWidth - 20, 32);
  }

  // Agregar pie de página
  private agregarPieDePagina() {
    const pageCount = this.doc.getNumberOfPages();
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      this.doc.text(
        'Sistema de Inventario - Servicio Técnico',
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }
  }

  // Generar reporte de inventario completo
  generarInventarioCompleto(equipos: Equipo[]) {
    this.agregarEncabezado('Inventario Completo de Equipos');

    // Estadísticas generales
    const yStart = 40;
    this.doc.setFontSize(12);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Resumen General', 20, yStart);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(75, 85, 99);
    this.doc.text(`Total de equipos: ${equipos.length}`, 20, yStart + 8);
    this.doc.text(`Equipos activos: ${equipos.filter(e => e.estado === 'Activo').length}`, 20, yStart + 14);
    this.doc.text(`Equipos inactivos: ${equipos.filter(e => e.estado === 'Inactivo').length}`, 20, yStart + 20);

    // Tabla de equipos
    const datosTabla = equipos.map(equipo => [
      equipo.serial || '',
      equipo.marca || '',
      equipo.modelo || '',
      equipo.tipo || '',
      equipo.usuario || 'Sin asignar',
      equipo.estado || ''
    ]);

    this.doc.autoTable({
      startY: yStart + 30,
      head: [['Serial', 'Marca', 'Modelo', 'Tipo', 'Usuario', 'Estado']],
      body: datosTabla,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [31, 41, 55]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 20, right: 20 }
    });

    this.agregarPieDePagina();
    this.doc.save(`inventario-completo-${Date.now()}.pdf`);
  }

  // Generar reporte de equipos por departamento
  generarEquiposPorDepartamento(equipos: Equipo[], usuarios: Usuario[]) {
    this.agregarEncabezado('Equipos por Departamento');

    // Agrupar equipos por departamento
    const equiposPorDepartamento: { [key: string]: Equipo[] } = {};
    
    equipos.forEach(equipo => {
      if (equipo.usuario && equipo.usuario !== 'Sin asignar') {
        const usuario = usuarios.find(u => u.nombre === equipo.usuario);
        const depto = usuario?.departamento || 'Sin departamento';
        
        if (!equiposPorDepartamento[depto]) {
          equiposPorDepartamento[depto] = [];
        }
        equiposPorDepartamento[depto].push(equipo);
      }
    });

    let yPos = 40;

    Object.entries(equiposPorDepartamento)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([departamento, equiposDepto], index) => {
        // Verificar si necesitamos nueva página
        if (yPos > 250) {
          this.doc.addPage();
          yPos = 20;
        }

        // Título del departamento
        this.doc.setFontSize(12);
        this.doc.setTextColor(37, 99, 235); // blue-600
        this.doc.text(`${departamento} (${equiposDepto.length} equipos)`, 20, yPos);
        
        // Tabla de equipos del departamento
        const datosTabla = equiposDepto.map(equipo => [
          equipo.serial || '',
          (equipo.marca || '') + ' ' + (equipo.modelo || ''),
          equipo.tipo || '',
          equipo.usuario || 'Sin asignar'
        ]);

        this.doc.autoTable({
          startY: yPos + 5,
          head: [['Serial', 'Equipo', 'Tipo', 'Usuario']],
          body: datosTabla,
          theme: 'plain',
          headStyles: {
            fillColor: [243, 244, 246],
            textColor: [31, 41, 55],
            fontStyle: 'bold',
            fontSize: 8
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [75, 85, 99]
          },
          margin: { left: 25, right: 20 }
        });

        yPos = (this.doc as any).lastAutoTable.finalY + 15;
      });

    this.agregarPieDePagina();
    this.doc.save(`equipos-por-departamento-${Date.now()}.pdf`);
  }

  // Generar reporte de servicios técnicos
  generarServiciosTecnicos(servicios: Servicio[]) {
    this.agregarEncabezado('Servicios Técnicos Registrados');

    // Estadísticas
    const yStart = 40;
    this.doc.setFontSize(12);
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Resumen de Servicios', 20, yStart);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(75, 85, 99);
    this.doc.text(`Total de servicios: ${servicios.length}`, 20, yStart + 8);
    
    const correctivos = servicios.filter(s => s.tipoMantenimiento === 'Correctivo').length;
    const preventivos = servicios.filter(s => s.tipoMantenimiento === 'Preventivo').length;
    
    this.doc.text(`Correctivos: ${correctivos}`, 20, yStart + 14);
    this.doc.text(`Preventivos: ${preventivos}`, 20, yStart + 20);

    // Tabla de servicios
    const datosTabla = servicios.map(servicio => [
      new Date(servicio.fechaServicio).toLocaleDateString('es-ES'),
      servicio.equipoSerial || 'N/A',
      servicio.tipoMantenimiento || '',
      servicio.tecnicoResponsable || '',
      (servicio.diagnostico || '').substring(0, 40) + ((servicio.diagnostico || '').length > 40 ? '...' : '')
    ]);

    this.doc.autoTable({
      startY: yStart + 30,
      head: [['Fecha', 'Serial Equipo', 'Tipo', 'Técnico', 'Diagnóstico']],
      body: datosTabla,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [31, 41, 55]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 20, right: 20 }
    });

    this.agregarPieDePagina();
    this.doc.save(`servicios-tecnicos-${Date.now()}.pdf`);
  }
}

// Función helper para generar PDFs
export const generarPDF = {
  inventarioCompleto: (equipos: Equipo[]) => {
    const generador = new GeneradorPDF();
    generador.generarInventarioCompleto(equipos);
  },
  
  equiposPorDepartamento: (equipos: Equipo[], usuarios: Usuario[]) => {
    const generador = new GeneradorPDF();
    generador.generarEquiposPorDepartamento(equipos, usuarios);
  },
  
  serviciosTecnicos: (servicios: Servicio[]) => {
    const generador = new GeneradorPDF();
    generador.generarServiciosTecnicos(servicios);
  }
};
