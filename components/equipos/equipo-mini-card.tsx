import { Monitor, Laptop, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EquipoDetalleDialog } from './equipo-detalle-dialog'
import type { EquipoWithRelations } from '@/types/equipos'

// ============================================================================
// SERVER COMPONENT - Equipo Mini Card (click to expand)
// ============================================================================

interface EquipoMiniCardProps {
  equipo: EquipoWithRelations
}

function getStatusVariant(estado: string): 'default' | 'secondary' | 'destructive' {
  switch (estado) {
    case 'Bueno': return 'default'
    case 'Regular': return 'secondary'
    case 'Malo': return 'destructive'
    default: return 'secondary'
  }
}

/**
 * Minimal equipo card component
 * Shows brand/model, serial, assignee, and health badge
 * Click opens detail dialog with all information
 */
export function EquipoMiniCard({ equipo }: EquipoMiniCardProps) {
  const TipoIcon = equipo.tipo === 'Desktop' ? Monitor : Laptop

  return (
    <EquipoDetalleDialog equipo={equipo}>
      <Card className="hover:shadow-md transition-shadow hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <TipoIcon className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Name & serial */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{equipo.marca} {equipo.modelo}</p>
              <p className="text-xs text-muted-foreground font-mono">{equipo.serial}</p>
            </div>

            {/* Status & assignee */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant={getStatusVariant(equipo.estadoSalud)} className="text-[10px] px-1.5 py-0">
                {equipo.estadoSalud}
              </Badge>
              {equipo.colaborador ? (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <User className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[100px]">
                    {equipo.colaborador.nombre} {equipo.colaborador.apellido.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Sin asignar</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </EquipoDetalleDialog>
  )
}
