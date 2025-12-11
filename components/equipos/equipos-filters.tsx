'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Rows, PanelsTopLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// ============================================================================
// CLIENT COMPONENT - Filters (Single Responsibility - Filter UI)
// ============================================================================

/**
 * Equipos filters component
 * Client Component - manages URL state for search and filters
 * Follows Single Responsibility - only handles filter UI
 */
export function EquiposFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }

  const handleSearch = (value: string) => {
    router.push(pathname + '?' + createQueryString('search', value))
  }

  const handleTipoFilter = (value: string) => {
    router.push(pathname + '?' + createQueryString('tipo', value))
  }

  const handleEstadoFilter = (value: string) => {
    router.push(pathname + '?' + createQueryString('estado', value))
  }

  const handleEstadoOperativoFilter = (value: string) => {
    router.push(pathname + '?' + createQueryString('estadoOp', value))
  }

  const handleSort = (value: string) => {
    router.push(pathname + '?' + createQueryString('sort', value))
  }

  const handleView = (value: 'grid' | 'list') => {
    router.push(pathname + '?' + createQueryString('view', value))
  }

  const currentTipo = searchParams?.get('tipo') || 'all'
  const currentEstado = searchParams?.get('estado') || 'all'
  const currentEstadoOp = searchParams?.get('estadoOp') || 'all'
  const currentSort = searchParams?.get('sort') || 'recientes'
  const currentView = (searchParams?.get('view') as 'grid' | 'list') || 'grid'

  const tipoLabels: Record<string, string> = {
    all: 'Todos',
    Desktop: 'Desktop',
    Portátil: 'Portátil',
  }

  const estadoLabels: Record<string, string> = {
    all: 'Todos',
    Bueno: 'Bueno',
    Regular: 'Regular',
    Malo: 'Malo',
  }

  const estadoOpLabels: Record<string, string> = {
    all: 'Todos',
    Activo: 'Activo',
    'En Reparación': 'En Reparación',
    'En Almacén': 'En Almacén',
    Descontinuado: 'Descontinuado',
  }

  const sortLabels: Record<string, string> = {
    recientes: 'Más recientes',
    serial: 'Serial',
    marca: 'Marca',
    tipo: 'Tipo',
    estado: 'Estado',
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por serial, marca, modelo o colaborador..."
          className="pl-9"
          defaultValue={searchParams?.get('search') || ''}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Tipo Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Tipo: {tipoLabels[currentTipo]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleTipoFilter('all')}>
            Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleTipoFilter('Desktop')}>
            Desktop
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleTipoFilter('Portátil')}>
            Portátil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Estado Salud Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Salud: {estadoLabels[currentEstado]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleEstadoFilter('all')}>
            Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoFilter('Bueno')}>
            🟢 Bueno
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoFilter('Regular')}>
            🟡 Regular
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoFilter('Malo')}>
            🔴 Malo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Estado Operativo Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Estado: {estadoOpLabels[currentEstadoOp]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleEstadoOperativoFilter('all')}>
            Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoOperativoFilter('Activo')}>
            ✅ Activo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoOperativoFilter('En Almacén')}>
            📦 En Almacén
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoOperativoFilter('En Reparación')}>
            🔧 En Reparación
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEstadoOperativoFilter('Descontinuado')}>
            ⛔ Descontinuado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Ordenar: {sortLabels[currentSort]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleSort('recientes')}>
            Más recientes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('serial')}>
            Serial
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('marca')}>
            Marca
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('tipo')}>
            Tipo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('estado')}>
            Estado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vista */}
      <div className="flex rounded-none border bg-card/60">
        <Button
          type="button"
          variant={currentView === 'grid' ? 'default' : 'ghost'}
          className="rounded-none"
          onClick={() => handleView('grid')}
          aria-pressed={currentView === 'grid'}
        >
          <PanelsTopLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={currentView === 'list' ? 'default' : 'ghost'}
          className="rounded-none"
          onClick={() => handleView('list')}
          aria-pressed={currentView === 'list'}
        >
          <Rows className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
