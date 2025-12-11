import * as XLSX from 'xlsx';
import type { Equipo, Usuario, Servicio } from '@/contexts/InventarioContext';

export class GeneradorExcel {
  
  // Generar Excel de inventario completo
  generarInventarioCompleto(equipos: Equipo[]) {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen General
    const resumen = [
      ['INVENTARIO DE EQUIPOS - RESUMEN GENERAL'],
      [''],
      ['Fecha de generación:', new Date().toLocaleString('es-ES')],
      [''],
      ['ESTADÍSTICAS'],
      ['Total de equipos:', equipos.length],
      ['Equipos activos:', equipos.filter(e => e.estado === 'Activo').length],
      ['Equipos inactivos:', equipos.filter(e => e.estado === 'Inactivo').length],
      [''],
      ['DISTRIBUCIÓN POR TIPO'],
      ['Laptops:', equipos.filter(e => e.tipo === 'Laptop').length],
      ['Desktops:', equipos.filter(e => e.tipo === 'Desktop').length],
      ['Tablets:', equipos.filter(e => e.tipo === 'Tablet').length],
      ['All in One:', equipos.filter(e => e.tipo === 'All in One').length],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    
    // Estilo para el título
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    // Hoja 2: Detalle de Equipos
    const datosEquipos = equipos.map(equipo => ({
      'Serial': equipo.serial,
      'Marca': equipo.marca,
      'Modelo': equipo.modelo,
      'Tipo': equipo.tipo,
      'Procesador': equipo.procesador,
      'RAM (GB)': equipo.ram,
      'Almacenamiento (GB)': equipo.almacenamientoGb,
      'Usuario Asignado': equipo.usuario || 'Sin asignar',
      'Estado': equipo.estado
    }));

    const wsEquipos = XLSX.utils.json_to_sheet(datosEquipos);
    
    // Ajustar anchos de columna
    wsEquipos['!cols'] = [
      { wch: 15 }, // Serial
      { wch: 12 }, // Marca
      { wch: 20 }, // Modelo
      { wch: 12 }, // Tipo
      { wch: 25 }, // Procesador
      { wch: 10 }, // RAM
      { wch: 15 }, // Almacenamiento
      { wch: 25 }, // Usuario
      { wch: 10 }, // Estado
      { wch: 15 }, // Fecha Compra
      { wch: 15 }  // SO
    ];

    XLSX.utils.book_append_sheet(workbook, wsEquipos, 'Detalle Equipos');

    // Hoja 3: RAM Detallada (si existe)
    const equiposConRAM = equipos.filter(e => e.ramDetalle && e.ramDetalle.length > 0);
    if (equiposConRAM.length > 0) {
      const datosRAM: any[] = [];
      equiposConRAM.forEach(equipo => {
        equipo.ramDetalle?.forEach((ram: any) => {
          datosRAM.push({
            'Serial Equipo': equipo.serial,
            'Modelo Equipo': equipo.modelo,
            'Capacidad': ram.capacidad,
            'Tipo': ram.tipo,
            'Velocidad': ram.velocidad,
            'Slot': ram.slot
          });
        });
      });

      const wsRAM = XLSX.utils.json_to_sheet(datosRAM);
      wsRAM['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 8 }
      ];
      XLSX.utils.book_append_sheet(workbook, wsRAM, 'Memoria RAM');
    }

    // Hoja 4: Discos Detallados
    const equiposConDiscos = equipos.filter(e => e.discosDetalle && e.discosDetalle.length > 0);
    if (equiposConDiscos.length > 0) {
      const datosDiscos: any[] = [];
      equiposConDiscos.forEach(equipo => {
        equipo.discosDetalle?.forEach((disco: any) => {
          datosDiscos.push({
            'Serial Equipo': equipo.serial,
            'Modelo Equipo': equipo.modelo,
            'Tipo': disco.tipo,
            'Capacidad': disco.capacidad,
            'Interfaz': disco.interfaz
          });
        });
      });

      const wsDiscos = XLSX.utils.json_to_sheet(datosDiscos);
      wsDiscos['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 }
      ];
      XLSX.utils.book_append_sheet(workbook, wsDiscos, 'Discos');
    }

    // Descargar archivo
    XLSX.writeFile(workbook, `inventario-completo-${Date.now()}.xlsx`);
  }

  // Generar Excel de equipos por departamento
  generarEquiposPorDepartamento(equipos: Equipo[], usuarios: Usuario[]) {
    const workbook = XLSX.utils.book_new();

    // Agrupar por departamento
    const departamentos: { [key: string]: any[] } = {};
    
    equipos.forEach(equipo => {
      if (equipo.usuario && equipo.usuario !== 'Sin asignar') {
        const usuario = usuarios.find(u => u.nombre === equipo.usuario);
        const depto = usuario?.departamento || 'Sin Departamento';
        
        if (!departamentos[depto]) {
          departamentos[depto] = [];
        }
        
        departamentos[depto].push({
          'Serial': equipo.serial,
          'Marca': equipo.marca,
          'Modelo': equipo.modelo,
          'Tipo': equipo.tipo,
          'Usuario': equipo.usuario,
          'Ciudad': usuario?.ciudad || 'N/A',
          'Estado': equipo.estado
        });
      }
    });

    // Hoja de resumen
    const resumenData = [
      ['EQUIPOS POR DEPARTAMENTO'],
      [''],
      ['Fecha:', new Date().toLocaleString('es-ES')],
      [''],
      ['RESUMEN POR DEPARTAMENTO'],
      ['Departamento', 'Cantidad de Equipos']
    ];

    Object.entries(departamentos)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([depto, equipos]) => {
        resumenData.push([depto, equipos.length.toString()]);
      });

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    // Crear una hoja por cada departamento
    Object.entries(departamentos)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([depto, equipos]) => {
        const ws = XLSX.utils.json_to_sheet(equipos);
        ws['!cols'] = [
          { wch: 15 }, // Serial
          { wch: 12 }, // Marca
          { wch: 20 }, // Modelo
          { wch: 12 }, // Tipo
          { wch: 25 }, // Usuario
          { wch: 15 }, // Ciudad
          { wch: 10 }  // Estado
        ];
        
        // Sanitizar nombre de hoja (max 31 caracteres, sin caracteres especiales)
        const nombreHoja = depto.substring(0, 31).replace(/[:\\/?*\[\]]/g, '');
        XLSX.utils.book_append_sheet(workbook, ws, nombreHoja);
      });

    XLSX.writeFile(workbook, `equipos-por-departamento-${Date.now()}.xlsx`);
  }

  // Generar Excel de servicios técnicos
  generarServiciosTecnicos(servicios: Servicio[]) {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const correctivos = servicios.filter(s => s.tipoMantenimiento === 'Correctivo').length;
    const preventivos = servicios.filter(s => s.tipoMantenimiento === 'Preventivo').length;
    const instalaciones = servicios.filter(s => s.tipoMantenimiento === 'Instalación/Upgrade').length;

    const resumen = [
      ['SERVICIOS TÉCNICOS - RESUMEN'],
      [''],
      ['Fecha de generación:', new Date().toLocaleString('es-ES')],
      [''],
      ['ESTADÍSTICAS GENERALES'],
      ['Total de servicios:', servicios.length],
      ['Servicios correctivos:', correctivos],
      ['Servicios preventivos:', preventivos],
      ['Instalaciones/Upgrades:', instalaciones],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    // Hoja 2: Detalle de Servicios
    const datosServicios = servicios.map(servicio => ({
      'Fecha': new Date(servicio.fechaServicio).toLocaleDateString('es-ES'),
      'Serial Equipo': servicio.equipoSerial || 'N/A',
      'Marca': servicio.equipoMarca || 'N/A',
      'Modelo': servicio.equipoModelo || 'N/A',
      'Tipo Mantenimiento': servicio.tipoMantenimiento,
      'Técnico': servicio.tecnicoResponsable,
      'Diagnóstico': servicio.diagnostico,
      'Trabajo Realizado': servicio.descripcionTrabajo,
      'Costo': servicio.costoReparacion || 0
    }));

    const wsServicios = XLSX.utils.json_to_sheet(datosServicios);
    wsServicios['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 15 }, // Serial
      { wch: 12 }, // Marca
      { wch: 20 }, // Modelo
      { wch: 20 }, // Tipo
      { wch: 20 }, // Técnico
      { wch: 40 }, // Diagnóstico
      { wch: 40 }, // Trabajo
      { wch: 10 }  // Costo
    ];

    XLSX.utils.book_append_sheet(workbook, wsServicios, 'Detalle Servicios');

    // Hoja 3: Servicios por Técnico
    const tecnicosMap: { [key: string]: Servicio[] } = {};
    servicios.forEach(servicio => {
      const tecnico = servicio.tecnicoResponsable;
      if (!tecnicosMap[tecnico]) {
        tecnicosMap[tecnico] = [];
      }
      tecnicosMap[tecnico].push(servicio);
    });

    const datosTecnicos = Object.entries(tecnicosMap).map(([tecnico, servicios]) => ({
      'Técnico': tecnico,
      'Total Servicios': servicios.length,
      'Correctivos': servicios.filter(s => s.tipoMantenimiento === 'Correctivo').length,
      'Preventivos': servicios.filter(s => s.tipoMantenimiento === 'Preventivo').length,
      'Instalaciones': servicios.filter(s => s.tipoMantenimiento === 'Instalación/Upgrade').length
    }));

    const wsTecnicos = XLSX.utils.json_to_sheet(datosTecnicos);
    wsTecnicos['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsTecnicos, 'Por Técnico');

    XLSX.writeFile(workbook, `servicios-tecnicos-${Date.now()}.xlsx`);
  }

  // Generar análisis de costos
  generarAnalisisCostos(servicios: Servicio[]) {
    const workbook = XLSX.utils.book_new();

    // Calcular totales
    const costoTotal = servicios.reduce((sum, s) => sum + (s.costoReparacion || 0), 0);
    const costoPromedio = servicios.length > 0 ? costoTotal / servicios.length : 0;

    // Resumen
    const resumen = [
      ['ANÁLISIS DE COSTOS DE SERVICIOS'],
      [''],
      ['Fecha:', new Date().toLocaleString('es-ES')],
      [''],
      ['TOTALES'],
      ['Costo total:', costoTotal.toFixed(2)],
      ['Costo promedio por servicio:', costoPromedio.toFixed(2)],
      ['Total de servicios:', servicios.length],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    // Detalle con costos
    const datosConCosto = servicios
      .filter(s => (s.costoReparacion || 0) > 0)
      .map(servicio => ({
        'Fecha': new Date(servicio.fechaServicio).toLocaleDateString('es-ES'),
        'Equipo': `${servicio.equipoMarca} ${servicio.equipoModelo}`,
        'Serial': servicio.equipoSerial,
        'Tipo': servicio.tipoMantenimiento,
        'Técnico': servicio.tecnicoResponsable,
        'Costo': servicio.costoReparacion,
        'Diagnóstico': servicio.diagnostico
      }));

    const wsDetalle = XLSX.utils.json_to_sheet(datosConCosto);
    wsDetalle['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 40 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle Costos');

    XLSX.writeFile(workbook, `analisis-costos-${Date.now()}.xlsx`);
  }
}

// Funciones helper para exportar
export const generarExcel = {
  inventarioCompleto: (equipos: Equipo[]) => {
    const generador = new GeneradorExcel();
    generador.generarInventarioCompleto(equipos);
  },
  
  equiposPorDepartamento: (equipos: Equipo[], usuarios: Usuario[]) => {
    const generador = new GeneradorExcel();
    generador.generarEquiposPorDepartamento(equipos, usuarios);
  },
  
  serviciosTecnicos: (servicios: Servicio[]) => {
    const generador = new GeneradorExcel();
    generador.generarServiciosTecnicos(servicios);
  },
  
  analisisCostos: (servicios: Servicio[]) => {
    const generador = new GeneradorExcel();
    generador.generarAnalisisCostos(servicios);
  }
};
