import { NextRequest, NextResponse } from 'next/server';

// Este endpoint procesará los archivos de diagnóstico y generará un análisis con IA
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivos = formData.getAll('archivos') as File[];
    const sintomas = formData.get('sintomas') as string;
    const equipoId = formData.get('equipoId') as string;

    console.log('=== DIAGNÓSTICO IA ===');
    console.log('Archivos recibidos:', archivos.length);
    console.log('Síntomas:', sintomas);
    console.log('Equipo ID:', equipoId);

    // Procesar cada archivo
    const datosArchivos = await Promise.all(
      archivos.map(async (archivo) => {
        const contenido = await archivo.text();
        return {
          nombre: archivo.name,
          tipo: archivo.type,
          tamano: archivo.size,
          contenido: contenido.substring(0, 50000) // Limitar a 50KB por archivo
        };
      })
    );

    // Analizar el tipo de archivo y extraer métricas
    const metricas = await analizarArchivos(datosArchivos);

    // Generar diagnóstico con IA (por ahora simulado, luego conectaremos con API)
    const diagnostico = await generarDiagnosticoIA(metricas, sintomas);

    return NextResponse.json({
      success: true,
      diagnostico,
      metricas,
      archivosAnalizados: datosArchivos.length
    });

  } catch (error) {
    console.error('Error en diagnóstico IA:', error);
    return NextResponse.json(
      { error: 'Error procesando el diagnóstico' },
      { status: 500 }
    );
  }
}

// Función para analizar archivos y extraer métricas
async function analizarArchivos(archivos: any[]) {
  const metricas: any = {
    temperaturas: [],
    discos: [],
    gpu: [],
    ram: [],
    errores: []
  };

  for (const archivo of archivos) {
    const contenido = archivo.contenido.toLowerCase();
    const nombre = archivo.nombre.toLowerCase();

    // Detectar tipo de archivo y extraer datos
    if (nombre.includes('hwmonitor') || contenido.includes('temperature') || contenido.includes('voltage')) {
      // HWMonitor
      metricas.temperaturas.push(...extraerTemperaturas(archivo.contenido));
    }

    if (nombre.includes('crystaldisk') || contenido.includes('health status') || contenido.includes('smart')) {
      // CrystalDiskInfo
      metricas.discos.push(...extraerDatosDisco(archivo.contenido));
    }

    if (nombre.includes('gpu-z') || contenido.includes('gpu clock') || contenido.includes('graphics card')) {
      // GPU-Z
      metricas.gpu.push(...extraerDatosGPU(archivo.contenido));
    }

    if (nombre.includes('memtest') || contenido.includes('memory test') || contenido.includes('ram test')) {
      // MemTest86
      metricas.ram.push(...extraerDatosRAM(archivo.contenido));
    }

    if (nombre.includes('event') || nombre.includes('.evtx') || contenido.includes('event id')) {
      // Event Viewer
      metricas.errores.push(...extraerErroresEventos(archivo.contenido));
    }
  }

  return metricas;
}

// Extraer temperaturas de HWMonitor
function extraerTemperaturas(contenido: string): any[] {
  const temperaturas = [];
  const lineas = contenido.split('\n');

  for (const linea of lineas) {
    // Buscar patrones como "CPU: 75°C" o "Temperature: 85"
    const matchCelsius = linea.match(/(\w+.*?):\s*(\d+)\s*°?C/i);
    const matchTemp = linea.match(/temperature.*?(\d+)/i);
    
    if (matchCelsius) {
      temperaturas.push({
        componente: matchCelsius[1].trim(),
        valor: parseInt(matchCelsius[2]),
        unidad: '°C'
      });
    } else if (matchTemp) {
      temperaturas.push({
        componente: 'Sensor',
        valor: parseInt(matchTemp[1]),
        unidad: '°C'
      });
    }
  }

  return temperaturas;
}

// Extraer datos de CrystalDiskInfo
function extraerDatosDisco(contenido: string): any[] {
  const discos = [];
  const lineas = contenido.split('\n');

  let discoActual: any = null;

  for (const linea of lineas) {
    // Detectar inicio de nuevo disco
    if (linea.match(/model.*?:/i) || linea.match(/disk \d+/i)) {
      if (discoActual) discos.push(discoActual);
      discoActual = {
        modelo: '',
        salud: 'Desconocido',
        temperatura: 0,
        horasUso: 0,
        sectoresDanados: 0
      };
    }

    if (!discoActual) continue;

    // Extraer información
    if (linea.match(/health status/i)) {
      const match = linea.match(/:\s*(\w+)/);
      if (match) discoActual.salud = match[1];
    }

    if (linea.match(/temperature/i)) {
      const match = linea.match(/(\d+)\s*°?C/);
      if (match) discoActual.temperatura = parseInt(match[1]);
    }

    if (linea.match(/power on hours/i) || linea.match(/power.*time/i)) {
      const match = linea.match(/(\d+)/);
      if (match) discoActual.horasUso = parseInt(match[1]);
    }

    if (linea.match(/reallocated.*sector/i) || linea.match(/bad.*block/i)) {
      const match = linea.match(/(\d+)/);
      if (match) discoActual.sectoresDanados = parseInt(match[1]);
    }
  }

  if (discoActual) discos.push(discoActual);

  return discos;
}

// Extraer datos de GPU-Z
function extraerDatosGPU(contenido: string): any[] {
  const gpus = [];
  const lineas = contenido.split('\n');

  const gpu: any = {
    nombre: '',
    temperatura: 0,
    cargaGPU: 0,
    memoriaUsada: 0,
    velocidadReloj: 0
  };

  for (const linea of lineas) {
    if (linea.match(/gpu.*temperature/i)) {
      const match = linea.match(/(\d+)\s*°?C/);
      if (match) gpu.temperatura = parseInt(match[1]);
    }

    if (linea.match(/gpu.*load/i) || linea.match(/usage/i)) {
      const match = linea.match(/(\d+)\s*%/);
      if (match) gpu.cargaGPU = parseInt(match[1]);
    }

    if (linea.match(/memory.*used/i)) {
      const match = linea.match(/(\d+)/);
      if (match) gpu.memoriaUsada = parseInt(match[1]);
    }
  }

  if (gpu.temperatura > 0) gpus.push(gpu);

  return gpus;
}

// Extraer datos de MemTest86
function extraerDatosRAM(contenido: string): any[] {
  const tests = [];
  const lineas = contenido.split('\n');

  const test: any = {
    erroresDetectados: 0,
    pasadas: 0,
    estado: 'OK'
  };

  for (const linea of lineas) {
    if (linea.match(/error/i) && linea.match(/(\d+)/)) {
      const match = linea.match(/(\d+)/);
      if (match) test.erroresDetectados += parseInt(match[1]);
    }

    if (linea.match(/pass/i) && linea.match(/(\d+)/)) {
      const match = linea.match(/(\d+)/);
      if (match) test.pasadas = parseInt(match[1]);
    }
  }

  if (test.erroresDetectados > 0) test.estado = 'FALLO';

  tests.push(test);
  return tests;
}

// Extraer errores del Event Viewer
function extraerErroresEventos(contenido: string): any[] {
  const errores = [];
  const lineas = contenido.split('\n');

  for (const linea of lineas) {
    if (linea.match(/error/i) || linea.match(/critical/i) || linea.match(/warning/i)) {
      const match = linea.match(/event id.*?(\d+)/i);
      if (match) {
        errores.push({
          tipo: linea.match(/error/i) ? 'Error' : linea.match(/critical/i) ? 'Crítico' : 'Advertencia',
          eventId: match[1],
          descripcion: linea.substring(0, 200)
        });
      }
    }
  }

  return errores;
}

// Generar diagnóstico con IA
async function generarDiagnosticoIA(metricas: any, sintomas: string) {
  // Analizar métricas y generar diagnóstico
  const problemas = [];
  const recomendaciones = [];
  let nivelUrgencia = 'Normal';

  // Analizar temperaturas
  if (metricas.temperaturas.length > 0) {
    const tempsCPU = metricas.temperaturas.filter((t: any) => 
      t.componente.toLowerCase().includes('cpu') || t.componente.toLowerCase().includes('processor')
    );
    const tempsGPU = metricas.temperaturas.filter((t: any) => 
      t.componente.toLowerCase().includes('gpu') || t.componente.toLowerCase().includes('video')
    );

    for (const temp of tempsCPU) {
      if (temp.valor > 85) {
        problemas.push({
          componente: 'CPU',
          problema: `Temperatura crítica: ${temp.valor}°C`,
          severidad: 'Crítico',
          detalle: 'La CPU está operando a temperaturas peligrosas que pueden causar daño permanente'
        });
        recomendaciones.push('URGENTE: Apagar equipo y limpiar sistema de enfriamiento CPU');
        recomendaciones.push('Reemplazar pasta térmica del procesador');
        nivelUrgencia = 'Crítico';
      } else if (temp.valor > 70) {
        problemas.push({
          componente: 'CPU',
          problema: `Temperatura elevada: ${temp.valor}°C`,
          severidad: 'Advertencia',
          detalle: 'La CPU está más caliente de lo normal, puede afectar el rendimiento'
        });
        recomendaciones.push('Limpiar ventiladores y disipadores');
        if (nivelUrgencia === 'Normal') nivelUrgencia = 'Medio';
      }
    }

    for (const temp of tempsGPU) {
      if (temp.valor > 90) {
        problemas.push({
          componente: 'GPU',
          problema: `Temperatura crítica GPU: ${temp.valor}°C`,
          severidad: 'Crítico',
          detalle: 'La tarjeta gráfica está en riesgo de daño por sobrecalentamiento'
        });
        recomendaciones.push('URGENTE: Limpiar tarjeta gráfica y verificar ventiladores');
        nivelUrgencia = 'Crítico';
      } else if (temp.valor > 80) {
        problemas.push({
          componente: 'GPU',
          problema: `Temperatura elevada GPU: ${temp.valor}°C`,
          severidad: 'Advertencia'
        });
        recomendaciones.push('Limpiar ventiladores de la tarjeta gráfica');
      }
    }
  }

  // Analizar discos
  for (const disco of metricas.discos) {
    if (disco.salud === 'Caution' || disco.salud === 'Bad' || disco.salud === 'Warning') {
      problemas.push({
        componente: 'Disco Duro',
        problema: `Estado de salud: ${disco.salud}`,
        severidad: 'Crítico',
        detalle: `El disco muestra signos de fallo. Sectores dañados: ${disco.sectoresDanados}`
      });
      recomendaciones.push('URGENTE: Respaldar datos inmediatamente');
      recomendaciones.push('Planear reemplazo de disco duro');
      nivelUrgencia = 'Crítico';
    }

    if (disco.horasUso > 40000) {
      problemas.push({
        componente: 'Disco Duro',
        problema: `Horas de uso elevadas: ${disco.horasUso}h`,
        severidad: 'Advertencia',
        detalle: 'El disco ha superado su vida útil esperada'
      });
      recomendaciones.push('Considerar reemplazo preventivo del disco');
    }
  }

  // Analizar RAM
  for (const test of metricas.ram) {
    if (test.erroresDetectados > 0) {
      problemas.push({
        componente: 'RAM',
        problema: `Errores de memoria detectados: ${test.erroresDetectados}`,
        severidad: 'Crítico',
        detalle: 'La memoria RAM tiene fallas que pueden causar inestabilidad del sistema'
      });
      recomendaciones.push('Identificar y reemplazar módulo(s) de RAM defectuoso(s)');
      nivelUrgencia = 'Crítico';
    }
  }

  // Calcular costo y tiempo estimado
  const costoEstimado = calcularCostoEstimado(problemas, recomendaciones);
  const tiempoEstimado = calcularTiempoEstimado(problemas, recomendaciones);

  return {
    resumen: `Se detectaron ${problemas.length} problema(s) en el análisis`,
    nivelUrgencia,
    problemas,
    recomendaciones,
    costoEstimado,
    tiempoEstimado,
    sintomas: sintomas || 'No especificados',
    timestamp: new Date().toISOString()
  };
}

function calcularCostoEstimado(problemas: any[], recomendaciones: any[]) {
  let costoMin = 0;
  let costoMax = 0;

  // Estimar costos basados en problemas detectados
  for (const problema of problemas) {
    if (problema.componente === 'CPU' && problema.severidad === 'Crítico') {
      costoMin += 20; costoMax += 40; // Limpieza + pasta térmica
    }
    if (problema.componente === 'GPU' && problema.severidad === 'Crítico') {
      costoMin += 25; costoMax += 50; // Limpieza GPU
    }
    if (problema.componente === 'Disco Duro' && problema.severidad === 'Crítico') {
      costoMin += 50; costoMax += 150; // Reemplazo de disco
    }
    if (problema.componente === 'RAM' && problema.severidad === 'Crítico') {
      costoMin += 30; costoMax += 100; // Reemplazo RAM
    }
  }

  if (costoMin === 0) {
    costoMin = 20; costoMax = 40; // Mantenimiento básico
  }

  return { min: costoMin, max: costoMax, moneda: 'USD' };
}

function calcularTiempoEstimado(problemas: any[], recomendaciones: any[]) {
  let horas = 1; // Mínimo 1 hora

  for (const problema of problemas) {
    if (problema.severidad === 'Crítico') horas += 1;
  }

  if (recomendaciones.some((r: string) => r.includes('reemplazo') || r.includes('Reemplazar'))) {
    horas += 1;
  }

  return { horas, descripcion: `${horas}-${horas + 1} horas` };
}
