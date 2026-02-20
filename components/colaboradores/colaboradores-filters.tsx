'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, Calendar, SortAsc, PanelsTopLeft, Rows, Loader2 } from 'lucide-react'

// ============================================================================
// CLIENT COMPONENT - URL State Management (Single Responsibility)
// ============================================================================

/**
 * Filters component for colaboradores list
 * Client Component for interactivity with URL state
 * Follows Interface Segregation - only handles filtering UI
 */
export function ColaboradoresFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const searchQuery = searchParams?.get('search') || ''
  const sortBy = searchParams?.get('sort') || 'alphabetical'
  const view = (searchParams?.get('view') as 'grid' | 'list') || 'grid'

  // Local state for instant typing feedback
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Sync local state when URL changes externally
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Debounce search: update URL 400ms after typing stops
  useEffect(() => {
    if (localSearch === searchQuery) return
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (localSearch) {
        params.set('search', localSearch)
      } else {
        params.delete('search')
      }
      startTransition(() => {
        router.push(pathname + (params.toString() ? `?${params.toString()}` : ''))
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, searchQuery, searchParams, pathname, router])

  // Helper to create query string (DRY principle)
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Update URL with new sort option
  const handleSortChange = (value: string) => {
    const queryString = createQueryString('sort', value)
    router.push(pathname + (queryString ? `?${queryString}` : ''))
  }

  // Get sort label for display
  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest':
        return 'Más recientes'
      case 'oldest':
        return 'Más antiguos'
      default:
        return 'Alfabético'
    }
  }

  const handleView = (value: 'grid' | 'list') => {
    const queryString = createQueryString('view', value)
    router.push(pathname + (queryString ? `?${queryString}` : ''))
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative max-w-md">
        <Input
          placeholder="Buscar por nombre, apellido o email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Ordenar: {getSortLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSortChange('alphabetical')}>
            <SortAsc className="mr-2 h-4 w-4" />
            Alfabético (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('newest')}>
            <Calendar className="mr-2 h-4 w-4" />
            Más recientes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
            <Calendar className="mr-2 h-4 w-4" />
            Más antiguos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex rounded-none border bg-card/60">
        <Button
          type="button"
          variant={view === 'grid' ? 'default' : 'ghost'}
          className="rounded-none"
          onClick={() => handleView('grid')}
          aria-pressed={view === 'grid'}
        >
          <PanelsTopLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={view === 'list' ? 'default' : 'ghost'}
          className="rounded-none"
          onClick={() => handleView('list')}
          aria-pressed={view === 'list'}
        >
          <Rows className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
