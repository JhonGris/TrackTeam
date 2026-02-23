import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import { EquiposStats } from '@/components/equipos/equipos-stats'
import { EquiposFilters } from '@/components/equipos/equipos-filters'
import { EquiposList } from '@/components/equipos/equipos-list'
import { NuevoEquipoButton } from '@/components/equipos/nuevo-equipo-button'
import { ExportarEquiposButton } from '@/components/equipos/exportar-equipos-button'
import { EquiposListSkeleton } from '@/components/equipos/equipos-list-skeleton'
import type { EquipoWithRelations } from '@/types/equipos'

// ============================================================================
// SERVER COMPONENT - Equipos Page (Streaming Architecture)
// ============================================================================

/**
 * Fetch equipos with filters
 * Server-side data fetching - no client-side state needed
 */
async function getEquipos(search?: string, tipo?: string, estado?: string, estadoOp?: string, sort?: string) {
  const equipos = await prisma.equipo.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { serial: { contains: search } },
                { marca: { contains: search } },
                { modelo: { contains: search } },
                { colaborador: { nombre: { contains: search } } },
                { colaborador: { apellido: { contains: search } } },
              ],
            }
          : {},
        tipo && tipo !== 'all' ? { tipo } : {},
        estado && estado !== 'all' ? { estadoSalud: estado } : {},
        estadoOp && estadoOp !== 'all' ? { estado: estadoOp } : {},
      ],
    },
    include: {
      colaborador: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          cargo: true,
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
      },
      _count: {
        select: { servicios: true },
      },
    },
    orderBy:
      sort === 'serial'
        ? { serial: 'asc' }
        : sort === 'marca'
        ? { marca: 'asc' }
        : sort === 'tipo'
        ? { tipo: 'asc' }
        : sort === 'estado'
        ? { estadoSalud: 'asc' }
        : { createdAt: 'desc' },
  })

  // Type assertion - Prisma returns string types from SQLite, but we know they match our enums
  return equipos as unknown as EquipoWithRelations[]
}

/**
 * Calculate stats from equipos
 * Pure function - testable, no side effects
 */
function calculateStats(equipos: Awaited<ReturnType<typeof getEquipos>>) {
  return {
    totalEquipos: equipos.length,
    asignados: equipos.filter((e) => e.colaboradorId !== null).length,
    sinAsignar: equipos.filter((e) => e.colaboradorId === null).length,
    desktops: equipos.filter((e) => e.tipo === 'Desktop').length,
    portatiles: equipos.filter((e) => e.tipo === 'Portátil').length,
    estadoBueno: equipos.filter((e) => e.estadoSalud === 'Bueno').length,
    estadoRegular: equipos.filter((e) => e.estadoSalud === 'Regular').length,
    estadoMalo: equipos.filter((e) => e.estadoSalud === 'Malo').length,
  }
}

/**
 * Async component that fetches data and renders content.
 * Wrapped in Suspense by the parent — enables streaming.
 */
async function EquiposContent({
  search,
  tipo,
  estado,
  estadoOp,
  sort,
  view,
}: {
  search?: string
  tipo?: string
  estado?: string
  estadoOp?: string
  sort?: string
  view: 'grid' | 'list'
}) {
  const equipos = await getEquipos(search, tipo, estado, estadoOp, sort)
  const stats = calculateStats(equipos)

  return (
    <>
      {/* Stats */}
      <EquiposStats stats={stats} />

      {/* Export button (needs data) */}
      <div className="flex justify-end -mt-2">
        <ExportarEquiposButton equipos={equipos} />
      </div>

      {/* List */}
      <EquiposList equipos={equipos} view={view} />
    </>
  )
}

/**
 * Equipos page component
 * Server Component - shell renders immediately, data streams via Suspense
 * Follows Next.js 16 async searchParams pattern
 */
export default async function EquiposPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : undefined
  const tipo = typeof params.tipo === 'string' ? params.tipo : undefined
  const estado = typeof params.estado === 'string' ? params.estado : undefined
  const estadoOp = typeof params.estadoOp === 'string' ? params.estadoOp : undefined
  const sort = typeof params.sort === 'string' ? params.sort : undefined
  const view = params.view === 'list' ? 'list' : 'grid'

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header - renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipos</h1>
          <p className="text-muted-foreground">
            Gestiona el inventario de equipos de cómputo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NuevoEquipoButton />
        </div>
      </div>

      {/* Filters - renders immediately */}
      <EquiposFilters />

      {/* Data-dependent content - streams in via Suspense */}
      <Suspense key={`${search}-${tipo}-${estado}-${estadoOp}-${sort}-${view}`} fallback={<EquiposListSkeleton />}>
        <EquiposContent search={search} tipo={tipo} estado={estado} estadoOp={estadoOp} sort={sort} view={view} />
      </Suspense>
    </div>
  )
}
