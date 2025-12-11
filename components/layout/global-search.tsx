'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Monitor, User, Wrench, Package, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { buscarGlobal, type SearchResults, type SearchResult } from '@/app/buscar/actions'

const iconMap = {
  monitor: Monitor,
  user: User,
  wrench: Wrench,
  package: Package,
}

const categoryLabels = {
  equipos: 'Equipos',
  colaboradores: 'Colaboradores',
  servicios: 'Servicios',
  repuestos: 'Inventario',
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const searchResults = await buscarGlobal(query)
        setResults(searchResults)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Error en búsqueda:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Keyboard shortcut to open search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
    }
  }, [open])

  // Get all results as flat array for keyboard navigation
  const getAllResults = useCallback((): SearchResult[] => {
    if (!results) return []
    return [
      ...results.equipos,
      ...results.colaboradores,
      ...results.servicios,
      ...results.repuestos,
    ]
  }, [results])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allResults = getAllResults()
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (allResults[selectedIndex]) {
          handleSelect(allResults[selectedIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    setOpen(false)
  }

  const renderResults = () => {
    if (!results) return null
    if (results.total === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No se encontraron resultados para "{query}"</p>
          <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
        </div>
      )
    }

    let globalIndex = 0
    const categories = ['equipos', 'colaboradores', 'servicios', 'repuestos'] as const

    return (
      <div className="max-h-[60vh] overflow-y-auto">
        {categories.map(category => {
          const items = results[category]
          if (items.length === 0) return null

          return (
            <div key={category} className="py-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {categoryLabels[category]} ({items.length})
              </div>
              {items.map((item) => {
                const currentIndex = globalIndex++
                const Icon = iconMap[item.icono]
                const isSelected = currentIndex === selectedIndex

                return (
                  <button
                    key={`${item.tipo}-${item.id}`}
                    className={cn(
                      'w-full px-3 py-2 flex items-start gap-3 text-left transition-colors',
                      isSelected 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div className={cn(
                      'mt-0.5 p-1.5 rounded-md',
                      item.tipo === 'equipo' && 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
                      item.tipo === 'colaborador' && 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
                      item.tipo === 'servicio' && 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
                      item.tipo === 'repuesto' && 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.titulo}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badgeVariant || 'secondary'} 
                            className="text-xs shrink-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.subtitulo}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Búsqueda Global</DialogTitle>
          </DialogHeader>
          
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar equipos, colaboradores, servicios, inventario..."
              className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {query && !loading && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          {query.length >= 2 ? (
            renderResults()
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Escribe al menos 2 caracteres para buscar</p>
              <p className="text-sm mt-2">
                Busca en equipos, colaboradores, servicios e inventario
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="rounded border bg-muted px-1.5 py-0.5">↑↓</kbd>
              <span>Navegar</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">↵</kbd>
              <span>Seleccionar</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Esc</kbd>
              <span>Cerrar</span>
            </div>
            {results && results.total > 0 && (
              <span>{results.total} resultado{results.total !== 1 ? 's' : ''}</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
