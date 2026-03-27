import { Suspense } from 'react'
import { Package, Tags } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInventarioStats, getRepuestos, getCategorias, syncAsignadoA, migrarEntradaInicial } from './actions'
import { getColaboradores } from '@/app/colaboradores/actions'
import { RepuestosTable } from '@/components/inventario/repuestos-table'
import { CategoriasSection } from '@/components/inventario/categorias-section'
import { NuevaCategoriaButton } from '@/components/inventario/nueva-categoria-button'
import { ExportarRepuestosButton } from '@/components/inventario/exportar-repuestos-button'
import { InventarioFilters } from '@/components/inventario/inventario-filters'
import { NuevoRepuestoButton } from '@/components/inventario/nuevo-repuesto-button'

// ============================================================================
// SERVER COMPONENT - Página de Inventario (Streaming Architecture)
// ============================================================================

type SearchParams = Promise<{ 
  search?: string
  categoria?: string
  stockBajo?: string
  tab?: string
}>

/**
 * Async component that fetches data and renders content.
 * Wrapped in Suspense by the parent — enables streaming.
 */
async function InventarioContent({
  search,
  categoriaId,
  stockBajo,
  currentTab,
}: {
  search?: string
  categoriaId?: string
  stockBajo: boolean
  currentTab: string
}) {
  // One-time fix: sync asignadoA for items assigned before field was auto-managed
  await syncAsignadoA()

  // Migrar items existentes: asegurar que cada objeto tenga su movimiento de entrada inicial
  await migrarEntradaInicial()

  const [stats, repuestos, categorias, colaboradores] = await Promise.all([
    getInventarioStats(),
    getRepuestos({ search, categoriaId, stockBajo, activo: true }),
    getCategorias(),
    getColaboradores()
  ])

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-none p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalRepuestos}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{stats.totalCategorias}</p>
          <p className="text-sm text-secondary/70">Categorías</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.repuestosActivos}</p>
          <p className="text-sm text-primary/70">Activos</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue={currentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="repuestos">
            <Package className="h-4 w-4 mr-2" />
            Repuestos
          </TabsTrigger>
          <TabsTrigger value="categorias">
            <Tags className="h-4 w-4 mr-2" />
            Categorías
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repuestos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Lista de Objetos/Dispositivos</h2>
              <p className="text-sm text-muted-foreground">
                {repuestos.length} objeto(s) encontrado(s)
              </p>
            </div>
            <div className="flex gap-2">
              <ExportarRepuestosButton repuestos={repuestos} />
            </div>
          </div>
          <InventarioFilters categorias={categorias} />
          <RepuestosTable repuestos={repuestos} categorias={categorias} colaboradores={colaboradores} />
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <CategoriasSection categorias={categorias} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const currentTab = params.tab || 'repuestos'
  const categorias = await getCategorias()

  return (
    <div className="space-y-6">
      {/* Header - renders immediately */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario de Objetos/Dispositivos</h1>
          <p className="text-muted-foreground">
            Gestiona el inventario de objetos y dispositivos
          </p>
        </div>
        <div className="flex gap-2">
          <NuevoRepuestoButton categorias={categorias} />
          <NuevaCategoriaButton />
        </div>
      </div>

      {/* Data-dependent content - streams in via Suspense */}
      <Suspense
        key={`${params.search}-${params.categoria}-${params.stockBajo}-${currentTab}`}
        fallback={
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border rounded-none p-4 text-center">
                  <div className="h-8 w-16 mx-auto animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 mx-auto mt-2 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="py-8 text-center text-muted-foreground">Cargando inventario...</div>
          </div>
        }
      >
        <InventarioContent
          search={params.search}
          categoriaId={params.categoria}
          stockBajo={params.stockBajo === 'true'}
          currentTab={currentTab}
        />
      </Suspense>
    </div>
  )
}
