'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, LayoutGrid, Rows, Search } from 'lucide-react'

// ============================================================================
// CLIENT COMPONENT - URL State Management for Servicios Filters
// ============================================================================

export function ServiciosFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchQuery = searchParams?.get('search') || ''
  const tipoFilter = searchParams?.get('tipo') || 'all'
  const sortBy = searchParams?.get('sort') || 'recent'
  const view = searchParams?.get('view') || 'grid'

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (value && value !== 'all') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearchChange = (value: string) => {
    const queryString = createQueryString('search', value)
    router.push(pathname + (queryString ? `?${queryString}` : ''))
  }

  const handleTipoChange = (value: string) => {
    const queryString = createQueryString('tipo', value)
    router.push(pathname + (queryString ? `?${queryString}` : ''))
  }

  const handleSortChange = (value: string) => {
    const queryString = createQueryString('sort', value)
    router.push(pathname + (queryString ? `?${queryString}` : ''))
  }

  const getTipoLabel = () => {
    switch (tipoFilter) {
      case 'Preventivo': return 'Preventivo'
      case 'Correctivo': return 'Correctivo'
      case 'Limpieza': return 'Limpieza'
      case 'Actualización de Software': return 'Actualización'
      default: return 'Todos los tipos'
    }
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return 'Más recientes'
      case 'oldest': return 'Más antiguos'
      case 'equipo': return 'Por equipo'
      default: return 'Más recientes'
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por equipo, colaborador, problema..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => {
              const queryString = createQueryString('view', 'grid')
              router.push(pathname + (queryString ? `?${queryString}` : ''))
            }}
            aria-label="Ver en cuadrícula"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => {
              const queryString = createQueryString('view', 'list')
              router.push(pathname + (queryString ? `?${queryString}` : ''))
            }}
            aria-label="Ver en lista"
          >
            <Rows className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-between">
              {getTipoLabel()}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleTipoChange('all')}>
              Todos los tipos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTipoChange('Preventivo')}>
              Preventivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTipoChange('Correctivo')}>
              Correctivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTipoChange('Limpieza')}>
              Limpieza
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTipoChange('Actualización de Software')}>
              Actualización de Software
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[150px] justify-between">
              {getSortLabel()}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange('recent')}>
              Más recientes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
              Más antiguos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('equipo')}>
              Por equipo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
