import { Suspense } from 'react'
import { Users, Package, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import { ColaboradoresFilters } from '@/components/colaboradores/colaboradores-filters'
import { ColaboradoresList } from '@/components/colaboradores/colaboradores-list'
import { ColaboradoresStats } from '@/components/colaboradores/colaboradores-stats'
import { NuevoColaboradorButton } from '@/components/colaboradores/nuevo-colaborador-button'
import { ExportarColaboradoresButton } from '@/components/colaboradores/exportar-colaboradores-button'
import { ColaboradoresListSkeleton } from '@/components/colaboradores/colaboradores-list-skeleton'

// ============================================================================
// SERVER COMPONENT - Data Fetching Layer (Liskov Substitution Principle)
// ============================================================================

type SearchParams = Promise<{
  search?: string
  sort?: string
  view?: string
}>

interface ColaboradoresPageProps {
  searchParams: SearchParams
}

/**
 * Fetch colaboradores from database with filters
 * Separated function for testability and reusability (Single Responsibility)
 */
async function getColaboradores(search?: string, sort?: string) {
  const sortBy = sort || 'alphabetical'

  // Determine orderBy based on sort parameter
  let orderBy: any
  switch (sortBy) {
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
    case 'alphabetical':
    default:
      orderBy = [{ nombre: 'asc' }, { apellido: 'asc' }]
      break
  }

  return await prisma.colaborador.findMany({
    where: search
      ? {
          OR: [
            { nombre: { contains: search } },
            { apellido: { contains: search } },
            { email: { contains: search } },
            { cedula: { contains: search } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: { equipos: true, archivos: true, historial: true },
      },
      equipos: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
          estadoSalud: true,
          estado: true,
        },
      },
      movimientosRepuestos: {
        where: { tipo: 'salida' },
        select: {
          id: true,
          cantidad: true,
          createdAt: true,
          repuesto: {
            select: {
              id: true,
              nombre: true,
              fotoUrl: true,
              codigoInterno: true,
              categoria: {
                select: { nombre: true },
              },
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

/**
 * Calculate stats from colaboradores data
 * Pure function for easier testing (Open/Closed Principle)
 */
function calculateStats(colaboradores: Awaited<ReturnType<typeof getColaboradores>>) {
  const totalColaboradores = colaboradores.length
  const conEquipos = colaboradores.filter((c) => c._count.equipos > 0).length
  const sinEquipos = totalColaboradores - conEquipos
  const totalEquipos = colaboradores.reduce((sum, c) => sum + c._count.equipos, 0)

  return {
    totalColaboradores,
    conEquipos,
    sinEquipos,
    totalEquipos,
  }
}

/**
 * Main Page Component - Server Component by default
 * Orchestrates data fetching and rendering (Dependency Inversion)
 */
export default async function ColaboradoresPage({ searchParams }: ColaboradoresPageProps) {
  const { search, sort, view } = await searchParams

  // Fetch data on the server
  const colaboradores = await getColaboradores(search, sort)
  const stats = calculateStats(colaboradores)

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">
              Gestión de Colaboradores
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra los colaboradores y sus equipos asignados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportarColaboradoresButton colaboradores={colaboradores} />
            <NuevoColaboradorButton />
          </div>
        </div>

        {/* Stats Cards - Server Component */}
        <ColaboradoresStats stats={stats} />

        {/* Filters - Client Component for interactivity */}
        <ColaboradoresFilters />

        {/* Colaboradores List - Server Component with Suspense */}
        <Suspense key={`${search}-${sort}-${view}`} fallback={<ColaboradoresListSkeleton />}>
          <ColaboradoresList colaboradores={colaboradores} view={view === 'list' ? 'list' : 'grid'} />
        </Suspense>
      </div>
    </div>
  )
}
