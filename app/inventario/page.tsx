import { Suspense } from 'react'
import { Package, Tags } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInventarioStats, getRepuestos, getCategorias, syncAsignadoA } from './actions'
import { getColaboradores } from '@/app/colaboradores/actions'
import { RepuestosTable } from '@/components/inventario/repuestos-table'
import { CategoriasSection } from '@/components/inventario/categorias-section'
import { NuevoRepuestoButton } from '@/components/inventario/nuevo-repuesto-button'
import { NuevaCategoriaButton } from '@/components/inventario/nueva-categoria-button'
import { ExportarRepuestosButton } from '@/components/inventario/exportar-repuestos-button'
import { InventarioFilters } from '@/components/inventario/inventario-filters'

// ============================================================================
// SERVER COMPONENT - Página de Inventario (Next.js 16)
// ============================================================================

type SearchParams = Promise<{ 
  search?: string
  categoria?: string
  stockBajo?: string
  tab?: string
}>

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const currentTab = params.tab || 'repuestos'

  // One-time fix: sync asignadoA for items assigned before field was auto-managed
  await syncAsignadoA()
  
  const [stats, repuestos, categorias, colaboradores] = await Promise.all([
    getInventarioStats(),
    getRepuestos({
      search: params.search,
      categoriaId: params.categoria,
      stockBajo: params.stockBajo === 'true',
      activo: true
    }),
    getCategorias(),
    getColaboradores()
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario de Objetos/Dispositivos</h1>
          <p className="text-muted-foreground">
            Gestiona el inventario de objetos y dispositivos
          </p>
        </div>
        <div className="flex gap-2">
          <ExportarRepuestosButton repuestos={repuestos} />
          <NuevaCategoriaButton />
          <NuevoRepuestoButton categorias={categorias} />
        </div>
      </div>

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
          </div>
          <InventarioFilters categorias={categorias} />
          <Suspense fallback={<div className="py-8 text-center">Cargando...</div>}>
            <RepuestosTable repuestos={repuestos} categorias={categorias} colaboradores={colaboradores} />
          </Suspense>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <CategoriasSection categorias={categorias} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
