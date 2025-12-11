/**
 * Script de migración de datos del proyecto anterior al proyecto actual
 * Migra: Colaboradores y Equipos con todos sus campos
 * 
 * Ejecutar: npm run migrate:data
 */

import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'

const newDb = new PrismaClient()

// Utilidades básicas de conversión
const toDate = (value: unknown) => (value ? new Date(value as string) : null)
const toBool = (value: unknown) => value === true || value === 1 || value === '1'
const toInt = (value: unknown) => (value === null || value === undefined ? null : Number(value))

async function main() {
  console.log('🚀 Iniciando migración de datos desde prisma/dev.db (SQLite) hacia Postgres...\n')

  const sourceDbPath = path.join(__dirname, '../prisma/dev.db')
  if (!fs.existsSync(sourceDbPath)) {
    throw new Error(`No se encontró la base de datos local en: ${sourceDbPath}`)
  }

  const Database = require('better-sqlite3')
  const oldDb = new Database(sourceDbPath, { readonly: true })

  try {
    // 1) Colaboradores (base para FKs)
    const colaboradores = oldDb.prepare('SELECT * FROM colaboradores').all()
    console.log(`📋 Colaboradores encontrados: ${colaboradores.length}`)
    await newDb.colaborador.createMany({
      data: colaboradores.map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        cargo: c.cargo,
        email: c.email,
        ciudad: c.ciudad,
        createdAt: toDate(c.createdAt) ?? undefined,
        updatedAt: toDate(c.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 2) Categorías de repuestos
    const categorias = oldDb.prepare('SELECT * FROM categorias_repuestos').all()
    console.log(`📦 Categorías de repuestos: ${categorias.length}`)
    await newDb.categoriaRepuesto.createMany({
      data: categorias.map((cat: any) => ({
        id: cat.id,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        color: cat.color ?? '#6366f1',
        createdAt: toDate(cat.createdAt) ?? undefined,
        updatedAt: toDate(cat.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 3) Repuestos (dependen de categorías)
    const repuestos = oldDb.prepare('SELECT * FROM repuestos').all()
    console.log(`🔧 Repuestos: ${repuestos.length}`)
    await newDb.repuesto.createMany({
      data: repuestos.map((r: any) => ({
        id: r.id,
        numero: toInt(r.numero) ?? 0,
        nombre: r.nombre,
        descripcion: r.descripcion,
        fotoUrl: r.fotoUrl,
        categoriaId: r.categoriaId,
        cantidad: toInt(r.cantidad) ?? 0,
        cantidadMinima: toInt(r.cantidadMinima) ?? 1,
        unidad: r.unidad ?? 'unidad',
        ubicacion: r.ubicacion,
        proveedor: r.proveedor,
        asignadoA: r.asignadoA,
        codigoInterno: r.codigoInterno,
        activo: toBool(r.activo),
        createdAt: toDate(r.createdAt) ?? undefined,
        updatedAt: toDate(r.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 4) Equipos (dependen de colaboradores)
    const equipos = oldDb.prepare('SELECT * FROM equipos').all()
    console.log(`💻 Equipos: ${equipos.length}`)
    await newDb.equipo.createMany({
      data: equipos.map((e: any) => ({
        id: e.id,
        serial: e.serial,
        marca: e.marca,
        modelo: e.modelo,
        tipo: e.tipo,
        procesador: e.procesador,
        ram: toInt(e.ram) ?? 0,
        almacenamiento: e.almacenamiento,
        gpu: e.gpu,
        ramDetalle: e.ramDetalle,
        discosDetalle: e.discosDetalle,
        gpuDetalle: e.gpuDetalle,
        almacenamientoTipo: e.almacenamientoTipo,
        almacenamientoGb: toInt(e.almacenamientoGb) ?? undefined,
        tarjetaVideo: e.tarjetaVideo,
        pantallas: toInt(e.pantallas) ?? 0,
        resolucionPantalla: e.resolucionPantalla,
        tieneTeclado: toBool(e.tieneTeclado),
        tieneMouse: toBool(e.tieneMouse),
        otrosPeriferico: e.otrosPeriferico,
        estadoSalud: e.estadoSalud ?? 'Bueno',
        estado: e.estado ?? 'Activo',
        fechaAdquisicion: toDate(e.fechaAdquisicion) ?? new Date(),
        fechaGarantia: toDate(e.fechaGarantia) ?? undefined,
        colaboradorId: e.colaboradorId,
        departamento: e.departamento,
        ubicacion: e.ubicacion,
        observaciones: e.observaciones,
        createdAt: toDate(e.createdAt) ?? undefined,
        updatedAt: toDate(e.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 5) Servicios técnicos (dependen de equipos)
    const servicios = oldDb.prepare('SELECT * FROM servicios_tecnicos').all()
    console.log(`🛠️ Servicios técnicos: ${servicios.length}`)
    await newDb.servicioTecnico.createMany({
      data: servicios.map((s: any) => ({
        id: s.id,
        tipo: s.tipo,
        fechaServicio: toDate(s.fechaServicio) ?? new Date(),
        problemas: s.problemas,
        soluciones: s.soluciones,
        tiempoInvertido: toInt(s.tiempoInvertido) ?? 0,
        estadoResultante: s.estadoResultante,
        diagnosticoIA: s.diagnosticoIA,
        equipoId: s.equipoId,
        createdAt: toDate(s.createdAt) ?? undefined,
        updatedAt: toDate(s.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 6) Archivos (dependen de equipo/servicio)
    const archivos = oldDb.prepare('SELECT * FROM archivos').all()
    console.log(`📂 Archivos: ${archivos.length}`)
    await newDb.archivo.createMany({
      data: archivos.map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        nombreAlmacenado: a.nombreAlmacenado,
        tipo: a.tipo,
        tamanio: toInt(a.tamanio) ?? 0,
        ruta: a.ruta,
        tipoEntidad: a.tipoEntidad,
        equipoId: a.equipoId,
        servicioTecnicoId: a.servicioTecnicoId,
        descripcion: a.descripcion,
        esImagen: toBool(a.esImagen),
        createdAt: toDate(a.createdAt) ?? undefined,
        updatedAt: toDate(a.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 7) Mantenimientos programados (dependen de equipos y opcionalmente servicio)
    const mantenimientos = oldDb.prepare('SELECT * FROM mantenimientos_programados').all()
    console.log(`🗓️ Mantenimientos programados: ${mantenimientos.length}`)
    await newDb.mantenimientoProgramado.createMany({
      data: mantenimientos.map((m: any) => ({
        id: m.id,
        tipo: m.tipo,
        descripcion: m.descripcion,
        fechaProgramada: toDate(m.fechaProgramada) ?? new Date(),
        horaEstimada: m.horaEstimada,
        duracionEstimada: toInt(m.duracionEstimada) ?? undefined,
        esRecurrente: toBool(m.esRecurrente),
        frecuencia: m.frecuencia,
        diasIntervalo: toInt(m.diasIntervalo) ?? undefined,
        fechaFinRecurrencia: toDate(m.fechaFinRecurrencia) ?? undefined,
        estado: m.estado ?? 'Pendiente',
        fechaCompletado: toDate(m.fechaCompletado) ?? undefined,
        equipoId: m.equipoId,
        servicioTecnicoId: m.servicioTecnicoId,
        notificacion7dias: toBool(m.notificacion7dias),
        notificacion3dias: toBool(m.notificacion3dias),
        notificacion1dia: toBool(m.notificacion1dia),
        createdAt: toDate(m.createdAt) ?? undefined,
        updatedAt: toDate(m.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 8) Plantillas de mantenimiento (independientes)
    const plantillas = oldDb.prepare('SELECT * FROM plantillas_mantenimiento').all()
    console.log(`📝 Plantillas de mantenimiento: ${plantillas.length}`)
    await newDb.plantillaMantenimiento.createMany({
      data: plantillas.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        tipo: p.tipo,
        problemasTipicos: p.problemasTipicos,
        solucionesTipicas: p.solucionesTipicas,
        tiempoEstimado: toInt(p.tiempoEstimado) ?? 0,
        checklist: p.checklist,
        activa: toBool(p.activa),
        createdAt: toDate(p.createdAt) ?? undefined,
        updatedAt: toDate(p.updatedAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 9) Movimientos de repuestos (depende de repuestos y colaboradores)
    const movimientos = oldDb.prepare('SELECT * FROM movimientos_repuestos').all()
    console.log(`📈 Movimientos de repuestos: ${movimientos.length}`)
    await newDb.movimientoRepuesto.createMany({
      data: movimientos.map((mv: any) => ({
        id: mv.id,
        repuestoId: mv.repuestoId,
        tipo: mv.tipo,
        cantidad: toInt(mv.cantidad) ?? 0,
        cantidadAnterior: toInt(mv.cantidadAnterior) ?? 0,
        cantidadNueva: toInt(mv.cantidadNueva) ?? 0,
        motivo: mv.motivo,
        referencia: mv.referencia,
        colaboradorId: mv.colaboradorId,
        notificacionEnviada: toBool(mv.notificacionEnviada),
        fotoUrl: mv.fotoUrl,
        createdAt: toDate(mv.createdAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    // 10) Uso de repuestos en servicios (depende de repuestos y servicios)
    const usos = oldDb.prepare('SELECT * FROM usos_repuestos').all()
    console.log(`🔗 Usos de repuestos en servicios: ${usos.length}`)
    await newDb.usoRepuesto.createMany({
      data: usos.map((u: any) => ({
        id: u.id,
        repuestoId: u.repuestoId,
        servicioTecnicoId: u.servicioTecnicoId,
        cantidad: toInt(u.cantidad) ?? 0,
        notas: u.notas,
        createdAt: toDate(u.createdAt) ?? undefined,
      })),
      skipDuplicates: true,
    })

    oldDb.close()

    // Resumen rápido
    const [totalColaboradores, totalEquipos, totalServicios] = await Promise.all([
      newDb.colaborador.count(),
      newDb.equipo.count(),
      newDb.servicioTecnico.count(),
    ])

    console.log('\n📊 Resumen de la migración:')
    console.log(`   • Colaboradores: ${totalColaboradores}`)
    console.log(`   • Equipos: ${totalEquipos}`)
    console.log(`   • Servicios técnicos: ${totalServicios}`)
    console.log('\n✨ ¡Migración completada exitosamente!')
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  } finally {
    await newDb.$disconnect()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
