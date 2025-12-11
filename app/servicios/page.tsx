import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import { NuevoServicioButton } from '@/components/servicios/nuevo-servicio-button'
import { ExportarServiciosButton } from '@/components/servicios/exportar-servicios-button'
import { ServiciosList } from '@/components/servicios/servicios-list'
import { ServiciosFilters } from '@/components/servicios/servicios-filters'
import { Wrench } from 'lucide-react'

type SearchParams = Promise<{
  search?: string
  tipo?: string
  sort?: string
  view?: string
}>

async function getServicios(filters: { search?: string; tipo?: string; sort?: string }) {
  const { search, tipo, sort } = filters
  
  // Build where clause
  const where: Record<string, unknown> = {}
  
  if (tipo && tipo !== 'all') {
    where.tipo = tipo
  }
  
  if (search) {
    where.OR = [
      { problemas: { contains: search } },
      { soluciones: { contains: search } },
      { equipo: { serial: { contains: search } } },
      { equipo: { marca: { contains: search } } },
      { equipo: { modelo: { contains: search } } },
      { equipo: { colaborador: { nombre: { contains: search } } } },
      { equipo: { colaborador: { apellido: { contains: search } } } },
    ]
  }
  
  // Build orderBy
  let orderBy: Record<string, string> | Record<string, Record<string, string>> = { fechaServicio: 'desc' }
  if (sort === 'oldest') {
    orderBy = { fechaServicio: 'asc' }
  } else if (sort === 'equipo') {
    orderBy = { equipo: { marca: 'asc' } }
  }
  
  return prisma.servicioTecnico.findMany({
    where,
    include: {
      equipo: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
          colaborador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      },
      archivos: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          tamanio: true,
          ruta: true,
          esImagen: true,
          descripcion: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy,
  })
}

async function getEquiposForSelect() {
  return prisma.equipo.findMany({
    select: {
      id: true,
      serial: true,
      marca: true,
      modelo: true,
      colaborador: {
        select: {
          nombre: true,
          apellido: true,
        },
      },
    },
    orderBy: [{ marca: 'asc' }, { modelo: 'asc' }],
  })
}

async function getPlantillasActivas() {
  return prisma.plantillaMantenimiento.findMany({
    where: { activa: true },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      problemasTipicos: true,
      solucionesTipicas: true,
      tiempoEstimado: true,
      checklist: true,
    },
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
  })
}

async function getStats() {
  const [total, preventivos, correctivos, limpieza, actualizaciones] = await Promise.all([
    prisma.servicioTecnico.count(),
    prisma.servicioTecnico.count({ where: { tipo: 'Preventivo' } }),
    prisma.servicioTecnico.count({ where: { tipo: 'Correctivo' } }),
    prisma.servicioTecnico.count({ where: { tipo: 'Limpieza' } }),
    prisma.servicioTecnico.count({ where: { tipo: 'Actualización de Software' } }),
  ])
  return { total, preventivos, correctivos, limpieza, actualizaciones }
}

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const view = params.view === 'list' ? 'list' : 'grid'
  
  const [servicios, equipos, plantillas, stats] = await Promise.all([
    getServicios({ search: params.search, tipo: params.tipo, sort: params.sort }),
    getEquiposForSelect(),
    getPlantillasActivas(),
    getStats(),
  ])

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Servicios Técnicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de mantenimientos y servicios técnicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportarServiciosButton servicios={servicios} />
          <NuevoServicioButton equipos={equipos} plantillas={plantillas} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card border rounded-none p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.preventivos}</p>
          <p className="text-sm text-primary/70">Preventivos</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-accent">{stats.correctivos}</p>
          <p className="text-sm text-accent/70">Correctivos</p>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{stats.limpieza}</p>
          <p className="text-sm text-secondary/70">Limpieza</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.actualizaciones}</p>
          <p className="text-sm text-primary/70">Actualizaciones</p>
        </div>
      </div>

      {/* Filters */}
      <ServiciosFilters />

      {/* Lista de servicios */}
      <Suspense fallback={<div className="text-center py-8">Cargando servicios...</div>} key={view}>
        {servicios.length === 0 ? (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay servicios registrados</h3>
            <p className="text-muted-foreground mt-1">
              Registra el primer servicio técnico haciendo clic en &quot;Nuevo Servicio&quot;
            </p>
          </div>
        ) : (
          <ServiciosList servicios={servicios} equipos={equipos} view={view} />
        )}
      </Suspense>
    </div>
  )
}
