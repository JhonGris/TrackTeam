import { Mail, Briefcase, MapPin, Laptop, CreditCard, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ColaboradorCardActions } from './colaborador-card-actions'
import type { Colaborador } from './colaboradores-list'

// ============================================================================
// SERVER COMPONENT - Colaborador Card (Single Responsibility - Display)
// ============================================================================

interface ColaboradorCardProps {
  colaborador: Colaborador
}

/**
 * Colaborador card component
 * Server Component - pure presentation
 * Delegates actions to Client Component (ColaboradorCardActions)
 */
export function ColaboradorCard({ colaborador }: ColaboradorCardProps) {
  const equiposCount = colaborador._count?.equipos ?? 0
  const nombreCompleto = `${colaborador.nombre} ${colaborador.apellido}`
  const initials = `${colaborador.nombre.charAt(0)}${colaborador.apellido.charAt(0)}`.toUpperCase()
  const primerEquipo = colaborador.equipos?.[0]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar / Foto */}
          <div className="h-14 w-14 flex-shrink-0 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {colaborador.fotoUrl ? (
              <img src={colaborador.fotoUrl} alt={nombreCompleto} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-primary">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold leading-tight">
                  {nombreCompleto}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{colaborador.cargo}</span>
                </div>
              </div>
              {equiposCount > 0 && (
                <Badge variant="default" className="ml-2 flex-shrink-0">
                  <Laptop className="h-3 w-3 mr-1" />
                  {equiposCount > 1 ? `${equiposCount} equipos` : '1 equipo'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {/* Cédula */}
          {colaborador.cedula && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
              <span>C.C. {colaborador.cedula}</span>
            </div>
          )}

          {/* Email */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{colaborador.email}</span>
          </div>

          {/* Dirección */}
          {colaborador.direccion && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Home className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{colaborador.direccion}</span>
            </div>
          )}

          {/* Ciudad */}
          {colaborador.ciudad && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{colaborador.ciudad}</span>
            </div>
          )}

          {/* Primer equipo */}
          {primerEquipo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Laptop className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {primerEquipo.marca} - {primerEquipo.serial}
                {equiposCount > 1 && ` (+${equiposCount - 1} más)`}
              </span>
            </div>
          )}
        </div>

        {/* Badges de resumen */}
        <div className="flex flex-wrap gap-1.5">
          {colaborador._count.archivos > 0 && (
            <Badge variant="outline" className="text-xs">
              {colaborador._count.archivos} documento(s)
            </Badge>
          )}
          {colaborador._count.historial > 0 && (
            <Badge variant="outline" className="text-xs">
              {colaborador._count.historial} evento(s)
            </Badge>
          )}
        </div>

        {/* Client Component for interactive actions */}
        <ColaboradorCardActions colaborador={colaborador} />
      </CardContent>
    </Card>
  )
}
