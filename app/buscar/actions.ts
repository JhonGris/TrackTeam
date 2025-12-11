'use server'

import prisma from '@/lib/prisma'

export type SearchResult = {
  id: string
  tipo: 'equipo' | 'colaborador' | 'servicio' | 'repuesto'
  titulo: string
  subtitulo: string
  url: string
  icono: 'monitor' | 'user' | 'wrench' | 'package'
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export type SearchResults = {
  equipos: SearchResult[]
  colaboradores: SearchResult[]
  servicios: SearchResult[]
  repuestos: SearchResult[]
  total: number
}

export async function buscarGlobal(query: string): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return { equipos: [], colaboradores: [], servicios: [], repuestos: [], total: 0 }
  }

  const searchTerm = query.trim().toLowerCase()
  const limit = 5 // Límite por categoría

  // Buscar en paralelo en todas las entidades
  const [equipos, colaboradores, servicios, repuestos] = await Promise.all([
    // Equipos
    prisma.equipo.findMany({
      where: {
        OR: [
          { serial: { contains: searchTerm } },
          { marca: { contains: searchTerm } },
          { modelo: { contains: searchTerm } },
          { procesador: { contains: searchTerm } },
          { colaborador: { nombre: { contains: searchTerm } } },
          { colaborador: { apellido: { contains: searchTerm } } },
        ]
      },
      include: { colaborador: true },
      take: limit,
      orderBy: { updatedAt: 'desc' }
    }),

    // Colaboradores
    prisma.colaborador.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm } },
          { apellido: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { cargo: { contains: searchTerm } },
        ]
      },
      take: limit,
      orderBy: { updatedAt: 'desc' }
    }),

    // Servicios Técnicos
    prisma.servicioTecnico.findMany({
      where: {
        OR: [
          { problemas: { contains: searchTerm } },
          { soluciones: { contains: searchTerm } },
          { tipo: { contains: searchTerm } },
          { equipo: { serial: { contains: searchTerm } } },
          { equipo: { marca: { contains: searchTerm } } },
          { equipo: { modelo: { contains: searchTerm } } },
        ]
      },
      include: { equipo: true },
      take: limit,
      orderBy: { fechaServicio: 'desc' }
    }),

    // Repuestos/Inventario
    prisma.repuesto.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm } },
          { descripcion: { contains: searchTerm } },
          { codigoInterno: { contains: searchTerm } },
          { ubicacion: { contains: searchTerm } },
          { categoria: { nombre: { contains: searchTerm } } },
        ]
      },
      include: { categoria: true },
      take: limit,
      orderBy: { updatedAt: 'desc' }
    }),
  ])

  // Formatear resultados
  const equiposResults: SearchResult[] = equipos.map(e => ({
    id: e.id,
    tipo: 'equipo',
    titulo: `${e.marca} ${e.modelo}`,
    subtitulo: e.colaborador 
      ? `${e.colaborador.nombre} ${e.colaborador.apellido} • ${e.serial}`
      : `Sin asignar • ${e.serial}`,
    url: `/equipos?search=${encodeURIComponent(e.serial)}`,
    icono: 'monitor',
    badge: e.estadoSalud,
    badgeVariant: e.estadoSalud === 'Bueno' ? 'default' : e.estadoSalud === 'Regular' ? 'secondary' : 'destructive'
  }))

  const colaboradoresResults: SearchResult[] = colaboradores.map(c => ({
    id: c.id,
    tipo: 'colaborador',
    titulo: `${c.nombre} ${c.apellido}`,
    subtitulo: `${c.cargo} • ${c.email}`,
    url: `/colaboradores?search=${encodeURIComponent(`${c.nombre} ${c.apellido}`)}`,
    icono: 'user',
  }))

  const serviciosResults: SearchResult[] = servicios.map(s => ({
    id: s.id,
    tipo: 'servicio',
    titulo: `${s.tipo} - ${s.equipo.marca} ${s.equipo.modelo}`,
    subtitulo: s.problemas?.substring(0, 60) + (s.problemas && s.problemas.length > 60 ? '...' : '') || 'Sin descripción',
    url: `/servicios?search=${encodeURIComponent(s.equipo.serial)}`,
    icono: 'wrench',
    badge: s.tipo,
    badgeVariant: s.tipo === 'Preventivo' ? 'default' : s.tipo === 'Correctivo' ? 'destructive' : 'secondary'
  }))

  const repuestosResults: SearchResult[] = repuestos.map(r => ({
    id: r.id,
    tipo: 'repuesto',
    titulo: r.nombre,
    subtitulo: `${r.categoria?.nombre || 'Sin categoría'} • Stock: ${r.cantidad}`,
    url: `/inventario?search=${encodeURIComponent(r.nombre)}`,
    icono: 'package',
    badge: r.cantidad > 0 ? 'Disponible' : 'Sin stock',
    badgeVariant: r.cantidad > 0 ? 'default' : 'destructive'
  }))

  return {
    equipos: equiposResults,
    colaboradores: colaboradoresResults,
    servicios: serviciosResults,
    repuestos: repuestosResults,
    total: equiposResults.length + colaboradoresResults.length + serviciosResults.length + repuestosResults.length
  }
}
