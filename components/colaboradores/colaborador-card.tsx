import { Mail, Briefcase, MapPin, Laptop } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ColaboradorCardActions } from './colaborador-card-actions'

// ============================================================================
// SERVER COMPONENT - Colaborador Card (Single Responsibility - Display)
// ============================================================================

interface ColaboradorCardProps {
  colaborador: {
    id: string
    nombre: string
    apellido: string
    cargo: string
    email: string
    ciudad: string | null
    _count: {
      equipos: number
    }
    equipos?: Array<{
      id: string
      serial: string
      marca: string
      modelo: string
      tipo: string
    }>
  }
}

/**
 * Colaborador card component
 * Server Component - pure presentation
 * Delegates actions to Client Component (ColaboradorCardActions)
 * Follows Single Responsibility - only displays data
 */
export function ColaboradorCard({ colaborador }: ColaboradorCardProps) {
  const equiposCount = colaborador._count?.equipos ?? 0
  const nombreCompleto = `${colaborador.nombre} ${colaborador.apellido}`
  const primerEquipo = colaborador.equipos?.[0]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {nombreCompleto}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{colaborador.cargo}</span>
            </div>
          </div>
          {equiposCount > 0 && (
            <Badge variant="default" className="ml-2">
              <Laptop className="h-3 w-3 mr-1" />
              {equiposCount > 1 ? `${equiposCount} equipos` : '1 equipo'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{colaborador.email}</span>
          </div>

          {colaborador.ciudad && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{colaborador.ciudad}</span>
            </div>
          )}

          {primerEquipo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Laptop className="h-3.5 w-3.5" />
              <span className="truncate">
                {primerEquipo.marca} - {primerEquipo.serial}
                {equiposCount > 1 && ` (+${equiposCount - 1} más)`}
              </span>
            </div>
          )}
        </div>

        {/* Client Component for interactive actions */}
        <ColaboradorCardActions colaborador={colaborador} />
      </CardContent>
    </Card>
  )
}
