import { Monitor, Laptop, User, Calendar, Cpu, HardDrive, MemoryStick, Video, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EquipoCardActions } from './equipo-card-actions'
import type { EquipoWithRelations } from '@/types/equipos'

// ============================================================================
// SERVER COMPONENT - Equipo Card (Single Responsibility - Display)
// ============================================================================

interface EquipoCardProps {
  equipo: EquipoWithRelations
}

/**
 * Get status badge variant based on health status
 */
function getStatusVariant(estado: string): 'default' | 'secondary' | 'destructive' {
  switch (estado) {
    case 'Bueno':
      return 'default'
    case 'Regular':
      return 'secondary'
    case 'Malo':
      return 'destructive'
    default:
      return 'secondary'
  }
}

/**
 * Equipo card component
 * Server Component - pure presentation
 * Delegates actions to Client Component (EquipoCardActions)
 */
export function EquipoCard({ equipo }: EquipoCardProps) {
  const TipoIcon = equipo.tipo === 'Desktop' ? Monitor : Laptop

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TipoIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">
                {equipo.marca} {equipo.modelo}
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">S/N: {equipo.serial}</p>
          </div>
          <Badge variant={getStatusVariant(equipo.estadoSalud)}>
            {equipo.estadoSalud}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Colaborador asignado */}
        {equipo.colaborador ? (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">
              {equipo.colaborador.nombre} {equipo.colaborador.apellido}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>Sin asignar</span>
          </div>
        )}

        {/* Especificaciones técnicas */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" />
            <span className="truncate">{equipo.procesador}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MemoryStick className="h-3.5 w-3.5" />
            <span>{equipo.ram} GB RAM</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" />
            <span>{equipo.almacenamiento}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="h-3.5 w-3.5" />
            <span className="truncate">{equipo.gpu}</span>
          </div>
        </div>

        {/* Fecha de adquisición y servicios */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(equipo.fechaAdquisicion).toLocaleDateString()}</span>
          </div>
          {equipo._count.servicios > 0 && (
            <div className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5" />
              <span>{equipo._count.servicios} servicios</span>
            </div>
          )}
        </div>

        {/* Client Component for interactive actions */}
        <EquipoCardActions equipo={equipo} />
      </CardContent>
    </Card>
  )
}
