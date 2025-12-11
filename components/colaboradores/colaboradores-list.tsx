import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ColaboradorCard } from './colaborador-card'
import { ColaboradorListRow } from './colaborador-list-row'

// ============================================================================
// SERVER COMPONENT - Presentation Layer (Open/Closed Principle)
// ============================================================================

export interface Colaborador {
  id: string
  nombre: string
  apellido: string
  cargo: string
  email: string
  ciudad: string | null
  _count: {
    equipos: number
  }
  equipos: Array<{
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
  }>
}

interface ColaboradoresListProps {
  colaboradores: Colaborador[]
  view?: 'grid' | 'list'
}

/**
 * Colaboradores list component
 * Server Component for rendering (no interactivity needed)
 * Follows Single Responsibility - only displays list
 */
export function ColaboradoresList({ colaboradores, view = 'grid' }: ColaboradoresListProps) {
  if (colaboradores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay colaboradores registrados
          </h3>
          <p className="text-muted-foreground text-sm">
            Comienza creando tu primer colaborador
          </p>
        </CardContent>
      </Card>
    )
  }

  if (view === 'list') {
    return (
      <div className="space-y-3">
        {colaboradores.map((colaborador) => (
          <ColaboradorListRow key={colaborador.id} colaborador={colaborador} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {colaboradores.map((colaborador) => (
        <ColaboradorCard key={colaborador.id} colaborador={colaborador} />
      ))}
    </div>
  )
}
