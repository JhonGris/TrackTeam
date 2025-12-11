import { ExpandableEquipoCard } from './expandable-equipo-card'
import { EquipoListRow } from './equipo-list-row'
import { PackageOpen } from 'lucide-react'
import type { EquipoWithRelations } from '@/types/equipos'

// ============================================================================
// SERVER COMPONENT - Equipos List (Single Responsibility - Display)
// ============================================================================

interface EquiposListProps {
  equipos: EquipoWithRelations[]
  view?: 'grid' | 'list'
}

/**
 * Equipos list component
 * Server Component - renders list of equipment cards
 * Follows Single Responsibility - only displays list
 */
export function EquiposList({ equipos, view = 'grid' }: EquiposListProps) {
  if (equipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <PackageOpen className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay equipos</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primer equipo al inventario
        </p>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div className="space-y-3">
        {equipos.map((equipo) => (
          <EquipoListRow key={equipo.id} equipo={equipo} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {equipos.map((equipo) => (
        <ExpandableEquipoCard key={equipo.id} equipo={equipo} />
      ))}
    </div>
  )
}
