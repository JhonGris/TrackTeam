'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Filter, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { CategoriaRepuesto } from '@/types/repuestos'
import { useCallback, useTransition, useState, useEffect } from 'react'

type Props = {
  categorias: CategoriaRepuesto[]
}

export function InventarioFilters({ categorias }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const search = searchParams.get('search') || ''
  const categoria = searchParams.get('categoria') || ''
  const stockBajo = searchParams.get('stockBajo') === 'true'

  // Local state for instant typing feedback
  const [localSearch, setLocalSearch] = useState(search)

  // Sync local state when URL changes externally
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  // Debounce search: update URL 400ms after typing stops
  useEffect(() => {
    if (localSearch === search) return
    const timer = setTimeout(() => {
      updateFilters({ search: localSearch || null })
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, search])

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '') {
            params.delete(key)
          } else {
            params.set(key, value)
          }
        })

        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = search || categoria || stockBajo

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Búsqueda */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search" className="text-xs text-muted-foreground">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nombre, código, proveedor..."
              className="pl-9"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {isPending && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Categoría */}
        <div className="w-[200px]">
          <Label className="text-xs text-muted-foreground">Categoría</Label>
          <Select
            value={categoria}
            onValueChange={(value) =>
              updateFilters({ categoria: value === 'all' ? null : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.nombre}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Bajo */}
        <div className="flex items-center gap-2 h-10">
          <Checkbox
            id="stockBajo"
            checked={stockBajo}
            onCheckedChange={(checked) =>
              updateFilters({ stockBajo: checked ? 'true' : null })
            }
          />
          <Label htmlFor="stockBajo" className="text-sm cursor-pointer">
            Solo stock bajo
          </Label>
        </div>

        {/* Limpiar filtros */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground">Filtrando...</div>
      )}
    </div>
  )
}
