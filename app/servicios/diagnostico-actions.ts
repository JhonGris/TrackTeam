'use server'

import OpenAI from 'openai'

// Tipos para el diagnóstico
export interface MetricaTemperatura {
  componente: string
  valor: number
  unidad: string
  estado: 'normal' | 'advertencia' | 'critico'
}

export interface MetricaDisco {
  modelo: string
  salud: 'Good' | 'Caution' | 'Bad' | 'Warning' | 'Unknown'
  temperatura: number
  horasUso: number
  sectoresDanados: number
}

export interface MetricaGPU {
  nombre: string
  temperatura: number
  cargaGPU: number
  memoriaUsada: number
}

export interface MetricaRAM {
  erroresDetectados: number
  pasadas: number
  estado: 'OK' | 'FALLO' | 'Unknown'
}

export interface MetricaError {
  tipo: 'Error' | 'Crítico' | 'Advertencia'
  eventId: string
  descripcion: string
}

export interface Metricas {
  temperaturas: MetricaTemperatura[]
  discos: MetricaDisco[]
  gpu: MetricaGPU[]
  ram: MetricaRAM[]
  errores: MetricaError[]
}

export interface ProblemaDetectado {
  componente: string
  problema: string
  severidad: 'Crítico' | 'Advertencia' | 'Info'
  detalle?: string
}

export interface DiagnosticoIA {
  resumen: string
  nivelUrgencia: 'Crítico' | 'Medio' | 'Normal'
  problemas: ProblemaDetectado[]
  recomendaciones: string[]
  costoEstimado: {
    min: number
    max: number
    moneda: string
  }
  tiempoEstimado: {
    horas: number
    descripcion: string
  }
}

export interface ResultadoDiagnostico {
  success: boolean
  diagnostico?: DiagnosticoIA
  metricas?: Metricas
  archivosAnalizados?: string[]
  error?: string
}

// Detectar tipo de archivo por contenido
function detectarTipoArchivo(contenido: string, nombreArchivo: string): string {
  const lower = contenido.toLowerCase()
  const nombre = nombreArchivo.toLowerCase()
  
  if (nombre.includes('hwmonitor') || lower.includes('hardware monitor') || lower.includes('cpuid hwmonitor')) {
    return 'hwmonitor'
  }
  if (nombre.includes('crystaldisk') || lower.includes('crystaldiskinfo') || lower.includes('-- s.m.a.r.t.')) {
    return 'crystaldiskinfo'
  }
  if (nombre.includes('gpu-z') || lower.includes('gpu-z') || lower.includes('techpowerup')) {
    return 'gpuz'
  }
  if (nombre.includes('memtest') || lower.includes('memtest86') || lower.includes('passmark memtest')) {
    return 'memtest86'
  }
  if (nombre.includes('.evtx') || lower.includes('event viewer') || lower.includes('windows logs')) {
    return 'eventviewer'
  }
  
  // Detección por contenido
  if (lower.includes('temperature') && lower.includes('cpu') && (lower.includes('°c') || lower.includes('celsius'))) {
    return 'hwmonitor'
  }
  if (lower.includes('health status') && lower.includes('power on hours')) {
    return 'crystaldiskinfo'
  }
  
  return 'unknown'
}

// Parsear HWMonitor
function parsearHWMonitor(contenido: string): MetricaTemperatura[] {
  const temperaturas: MetricaTemperatura[] = []
  const lineas = contenido.split('\n')
  
  // Patrones comunes de HWMonitor
  const patronTemp = /(.+?)\s+(\d+)\s*°?C/gi
  const patronTemp2 = /Temperature\s*#?\d*\s*:\s*(\d+)/gi
  
  for (const linea of lineas) {
    // Buscar temperaturas
    let match
    
    // Patrón: "CPU Package  45 °C"
    if ((match = /(.+?)\s+(\d+)\s*°C/i.exec(linea))) {
      const componente = match[1].trim()
      const valor = parseInt(match[2])
      
      if (valor > 0 && valor < 150) {
        temperaturas.push({
          componente,
          valor,
          unidad: '°C',
          estado: valor > 90 ? 'critico' : valor > 75 ? 'advertencia' : 'normal'
        })
      }
    }
    
    // Patrón: "Temperature: 45"
    if ((match = /(\w+)\s*Temperature\s*:?\s*(\d+)/i.exec(linea))) {
      const componente = match[1]
      const valor = parseInt(match[2])
      
      if (valor > 0 && valor < 150) {
        temperaturas.push({
          componente,
          valor,
          unidad: '°C',
          estado: valor > 90 ? 'critico' : valor > 75 ? 'advertencia' : 'normal'
        })
      }
    }
  }
  
  return temperaturas
}

// Parsear CrystalDiskInfo
function parsearCrystalDiskInfo(contenido: string): MetricaDisco[] {
  const discos: MetricaDisco[] = []
  const secciones = contenido.split(/(?=Model\s*:|------------)/)
  
  for (const seccion of secciones) {
    const disco: Partial<MetricaDisco> = {
      modelo: 'Desconocido',
      salud: 'Unknown',
      temperatura: 0,
      horasUso: 0,
      sectoresDanados: 0
    }
    
    // Modelo
    const modelMatch = /Model\s*:\s*(.+)/i.exec(seccion)
    if (modelMatch) disco.modelo = modelMatch[1].trim()
    
    // Estado de salud
    const saludMatch = /Health Status\s*:\s*(\w+)/i.exec(seccion)
    if (saludMatch) {
      const salud = saludMatch[1].toLowerCase()
      if (salud.includes('good')) disco.salud = 'Good'
      else if (salud.includes('caution')) disco.salud = 'Caution'
      else if (salud.includes('bad')) disco.salud = 'Bad'
      else if (salud.includes('warning')) disco.salud = 'Warning'
    }
    
    // Temperatura
    const tempMatch = /Temperature\s*:\s*(\d+)/i.exec(seccion)
    if (tempMatch) disco.temperatura = parseInt(tempMatch[1])
    
    // Horas de uso
    const horasMatch = /Power On Hours\s*:\s*([\d,]+)/i.exec(seccion)
    if (horasMatch) disco.horasUso = parseInt(horasMatch[1].replace(/,/g, ''))
    
    // Sectores dañados
    const sectoresMatch = /Reallocated Sectors?\s*(?:Count)?\s*:\s*(\d+)/i.exec(seccion)
    if (sectoresMatch) disco.sectoresDanados = parseInt(sectoresMatch[1])
    
    if (disco.modelo !== 'Desconocido' || disco.salud !== 'Unknown') {
      discos.push(disco as MetricaDisco)
    }
  }
  
  return discos
}

// Parsear GPU-Z
function parsearGPUZ(contenido: string): MetricaGPU[] {
  const gpus: MetricaGPU[] = []
  
  const gpu: Partial<MetricaGPU> = {
    nombre: 'GPU',
    temperatura: 0,
    cargaGPU: 0,
    memoriaUsada: 0
  }
  
  // Nombre de GPU
  const nombreMatch = /Name\s*:\s*(.+)/i.exec(contenido)
  if (nombreMatch) gpu.nombre = nombreMatch[1].trim()
  
  // Temperatura
  const tempMatch = /GPU Temperature\s*:\s*(\d+)/i.exec(contenido)
  if (tempMatch) gpu.temperatura = parseInt(tempMatch[1])
  
  // Carga
  const cargaMatch = /GPU Load\s*:\s*(\d+)/i.exec(contenido)
  if (cargaMatch) gpu.cargaGPU = parseInt(cargaMatch[1])
  
  // Memoria
  const memMatch = /Memory Used\s*:\s*(\d+)/i.exec(contenido)
  if (memMatch) gpu.memoriaUsada = parseInt(memMatch[1])
  
  if (gpu.nombre) {
    gpus.push(gpu as MetricaGPU)
  }
  
  return gpus
}

// Parsear MemTest86
function parsearMemTest86(contenido: string): MetricaRAM[] {
  const ram: MetricaRAM[] = []
  
  const resultado: MetricaRAM = {
    erroresDetectados: 0,
    pasadas: 0,
    estado: 'Unknown'
  }
  
  // Errores
  const erroresMatch = /Errors?\s*(?:Found|Detected)?\s*:\s*(\d+)/i.exec(contenido)
  if (erroresMatch) resultado.erroresDetectados = parseInt(erroresMatch[1])
  
  // Pasadas
  const pasadasMatch = /Pass(?:es)?\s*(?:Complete[d]?)?\s*:\s*(\d+)/i.exec(contenido)
  if (pasadasMatch) resultado.pasadas = parseInt(pasadasMatch[1])
  
  // Estado
  if (contenido.toLowerCase().includes('pass') && resultado.erroresDetectados === 0) {
    resultado.estado = 'OK'
  } else if (resultado.erroresDetectados > 0) {
    resultado.estado = 'FALLO'
  }
  
  ram.push(resultado)
  return ram
}

// Generar diagnóstico basado en métricas (motor de reglas)
function generarDiagnosticoReglas(metricas: Metricas): DiagnosticoIA {
  const problemas: ProblemaDetectado[] = []
  const recomendaciones: string[] = []
  let nivelUrgencia: 'Crítico' | 'Medio' | 'Normal' = 'Normal'
  let costoMin = 0
  let costoMax = 0
  let tiempoHoras = 1
  
  // Analizar temperaturas
  for (const temp of metricas.temperaturas) {
    if (temp.estado === 'critico') {
      problemas.push({
        componente: temp.componente,
        problema: `Temperatura crítica: ${temp.valor}°C`,
        severidad: 'Crítico',
        detalle: 'Temperatura excesiva que puede causar daños permanentes'
      })
      recomendaciones.push(`Urgente: Revisar sistema de refrigeración de ${temp.componente}`)
      recomendaciones.push('Aplicar pasta térmica nueva si es CPU/GPU')
      nivelUrgencia = 'Crítico'
      costoMin += 20000
      costoMax += 50000
      tiempoHoras += 1
    } else if (temp.estado === 'advertencia') {
      problemas.push({
        componente: temp.componente,
        problema: `Temperatura elevada: ${temp.valor}°C`,
        severidad: 'Advertencia',
        detalle: 'Temperatura por encima de lo normal'
      })
      recomendaciones.push(`Limpiar ventiladores y disipadores de ${temp.componente}`)
      if (nivelUrgencia === 'Normal') nivelUrgencia = 'Medio'
      costoMin += 10000
      costoMax += 30000
    }
  }
  
  // Analizar discos
  for (const disco of metricas.discos) {
    if (disco.salud === 'Bad') {
      problemas.push({
        componente: `Disco: ${disco.modelo}`,
        problema: 'Estado de salud MALO - Fallo inminente',
        severidad: 'Crítico',
        detalle: `Horas de uso: ${disco.horasUso.toLocaleString()}, Sectores dañados: ${disco.sectoresDanados}`
      })
      recomendaciones.push('¡URGENTE! Respaldar datos inmediatamente')
      recomendaciones.push('Reemplazar disco duro lo antes posible')
      nivelUrgencia = 'Crítico'
      costoMin += 150000
      costoMax += 350000
      tiempoHoras += 3
    } else if (disco.salud === 'Caution' || disco.salud === 'Warning') {
      problemas.push({
        componente: `Disco: ${disco.modelo}`,
        problema: 'Estado de salud degradado',
        severidad: 'Advertencia',
        detalle: `Horas de uso: ${disco.horasUso.toLocaleString()}, Sectores dañados: ${disco.sectoresDanados}`
      })
      recomendaciones.push('Programar respaldo de datos preventivo')
      recomendaciones.push('Monitorear estado del disco periódicamente')
      if (nivelUrgencia === 'Normal') nivelUrgencia = 'Medio'
      costoMin += 50000
      costoMax += 150000
      tiempoHoras += 1
    }
    
    if (disco.temperatura > 55) {
      problemas.push({
        componente: `Disco: ${disco.modelo}`,
        problema: `Temperatura elevada: ${disco.temperatura}°C`,
        severidad: 'Advertencia'
      })
      recomendaciones.push('Mejorar ventilación del gabinete')
    }
  }
  
  // Analizar GPU
  for (const gpu of metricas.gpu) {
    if (gpu.temperatura > 90) {
      problemas.push({
        componente: `GPU: ${gpu.nombre}`,
        problema: `Temperatura crítica: ${gpu.temperatura}°C`,
        severidad: 'Crítico'
      })
      recomendaciones.push('Limpiar ventiladores de la tarjeta gráfica')
      recomendaciones.push('Verificar pasta térmica de la GPU')
      nivelUrgencia = 'Crítico'
      costoMin += 30000
      costoMax += 80000
      tiempoHoras += 2
    } else if (gpu.temperatura > 80) {
      problemas.push({
        componente: `GPU: ${gpu.nombre}`,
        problema: `Temperatura elevada: ${gpu.temperatura}°C`,
        severidad: 'Advertencia'
      })
      if (nivelUrgencia === 'Normal') nivelUrgencia = 'Medio'
    }
  }
  
  // Analizar RAM
  for (const memoria of metricas.ram) {
    if (memoria.estado === 'FALLO' || memoria.erroresDetectados > 0) {
      problemas.push({
        componente: 'Memoria RAM',
        problema: `Errores detectados: ${memoria.erroresDetectados}`,
        severidad: 'Crítico',
        detalle: `Pasadas completadas: ${memoria.pasadas}`
      })
      recomendaciones.push('Reemplazar módulo(s) de RAM defectuoso(s)')
      recomendaciones.push('Probar módulos individualmente para identificar el dañado')
      nivelUrgencia = 'Crítico'
      costoMin += 80000
      costoMax += 200000
      tiempoHoras += 2
    }
  }
  
  // Si no hay problemas
  if (problemas.length === 0) {
    recomendaciones.push('El equipo se encuentra en buen estado')
    recomendaciones.push('Se recomienda mantenimiento preventivo cada 6 meses')
  }
  
  // Generar resumen
  let resumen = ''
  if (nivelUrgencia === 'Crítico') {
    resumen = `Se detectaron ${problemas.filter(p => p.severidad === 'Crítico').length} problemas críticos que requieren atención inmediata.`
  } else if (nivelUrgencia === 'Medio') {
    resumen = `Se detectaron ${problemas.length} problemas que requieren atención próxima.`
  } else {
    resumen = problemas.length > 0 
      ? `Se detectaron ${problemas.length} observaciones menores.`
      : 'El equipo se encuentra en buen estado general.'
  }
  
  return {
    resumen,
    nivelUrgencia,
    problemas,
    recomendaciones: [...new Set(recomendaciones)], // Eliminar duplicados
    costoEstimado: {
      min: costoMin || 15000,
      max: costoMax || 30000,
      moneda: 'COP'
    },
    tiempoEstimado: {
      horas: tiempoHoras,
      descripcion: tiempoHoras <= 1 ? 'Menos de 1 hora' : `Aproximadamente ${tiempoHoras} horas`
    }
  }
}

// Generar diagnóstico con OpenAI (si está configurado)
async function generarDiagnosticoOpenAI(metricas: Metricas, sintomasReportados: string): Promise<DiagnosticoIA | null> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return null
  }
  
  try {
    const openai = new OpenAI({ apiKey })
    
    const prompt = `Eres un técnico experto en diagnóstico de computadores. Analiza las siguientes métricas de hardware y genera un diagnóstico profesional.

MÉTRICAS RECOPILADAS:
${JSON.stringify(metricas, null, 2)}

SÍNTOMAS REPORTADOS POR EL USUARIO:
${sintomasReportados || 'No se reportaron síntomas específicos'}

Genera un diagnóstico en formato JSON con la siguiente estructura:
{
  "resumen": "Resumen breve del estado general del equipo",
  "nivelUrgencia": "Crítico" | "Medio" | "Normal",
  "problemas": [
    {
      "componente": "nombre del componente",
      "problema": "descripción del problema",
      "severidad": "Crítico" | "Advertencia" | "Info",
      "detalle": "detalles adicionales"
    }
  ],
  "recomendaciones": ["lista de acciones recomendadas"],
  "costoEstimado": {
    "min": numero_en_pesos_colombianos,
    "max": numero_en_pesos_colombianos,
    "moneda": "COP"
  },
  "tiempoEstimado": {
    "horas": numero,
    "descripcion": "descripción del tiempo"
  }
}

Considera precios en pesos colombianos (COP). Responde SOLO con el JSON, sin texto adicional.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un técnico experto en diagnóstico de hardware de computadores. Responde siempre en español y con precios en pesos colombianos.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
    
    const contenido = response.choices[0]?.message?.content
    if (!contenido) return null
    
    // Limpiar el JSON si viene con markdown
    const jsonLimpio = contenido.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(jsonLimpio) as DiagnosticoIA
    
  } catch (error) {
    console.error('Error al generar diagnóstico con OpenAI:', error)
    return null
  }
}

// Server Action principal para analizar archivos
export async function analizarArchivos(formData: FormData): Promise<ResultadoDiagnostico> {
  try {
    const archivos = formData.getAll('archivos') as File[]
    const sintomasReportados = formData.get('sintomas') as string || ''
    
    if (!archivos || archivos.length === 0) {
      return {
        success: false,
        error: 'No se proporcionaron archivos para analizar'
      }
    }
    
    // Inicializar métricas vacías
    const metricas: Metricas = {
      temperaturas: [],
      discos: [],
      gpu: [],
      ram: [],
      errores: []
    }
    
    const archivosAnalizados: string[] = []
    
    // Procesar cada archivo
    for (const archivo of archivos) {
      if (!archivo || archivo.size === 0) continue
      
      try {
        const contenido = await archivo.text()
        const tipoArchivo = detectarTipoArchivo(contenido, archivo.name)
        
        archivosAnalizados.push(`${archivo.name} (${tipoArchivo})`)
        
        switch (tipoArchivo) {
          case 'hwmonitor':
            metricas.temperaturas.push(...parsearHWMonitor(contenido))
            break
          case 'crystaldiskinfo':
            metricas.discos.push(...parsearCrystalDiskInfo(contenido))
            break
          case 'gpuz':
            metricas.gpu.push(...parsearGPUZ(contenido))
            break
          case 'memtest86':
            metricas.ram.push(...parsearMemTest86(contenido))
            break
          // eventviewer - pendiente implementación completa
        }
      } catch (e) {
        console.error(`Error procesando archivo ${archivo.name}:`, e)
      }
    }
    
    // Intentar diagnóstico con OpenAI primero, luego motor de reglas
    let diagnostico = await generarDiagnosticoOpenAI(metricas, sintomasReportados)
    
    if (!diagnostico) {
      // Fallback a motor de reglas
      diagnostico = generarDiagnosticoReglas(metricas)
    }
    
    return {
      success: true,
      diagnostico,
      metricas,
      archivosAnalizados
    }
    
  } catch (error) {
    console.error('Error en analizarArchivos:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al analizar archivos'
    }
  }
}
