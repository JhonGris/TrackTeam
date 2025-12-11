import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Laptop, User, Hash } from 'lucide-react'
import { EquipoCardActions } from './equipo-card-actions'
import type { EquipoWithRelations } from '@/types/equipos'

type Props = {
  equipo: EquipoWithRelations
}

function getSaludVariant(estado: string): 'default' | 'secondary' | 'destructive' {
  if (estado === 'Bueno') return 'default'
  if (estado === 'Regular') return 'secondary'
  if (estado === 'Malo') return 'destructive'
  return 'secondary'
}

export function EquipoListRow({ equipo }: Props) {
  const TipoIcon = equipo.tipo === 'Desktop' ? Monitor : Laptop

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-start gap-3">
          <div className="p-2 bg-muted/50">
            <TipoIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{equipo.marca} {equipo.modelo}</span>
              <Badge variant={getSaludVariant(equipo.estadoSalud)}>{equipo.estadoSalud}</Badge>
              <Badge variant="outline">{equipo.estado}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />
                {equipo.serial}
              </span>
              <span>• {equipo.tipo}</span>
              {equipo.colaborador ? (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {equipo.colaborador.nombre} {equipo.colaborador.apellido}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Sin asignar
                </span>
              )}
            </div>
          </div>
        </div>

        <EquipoCardActions equipo={equipo} />
      </CardContent>
    </Card>
  )
}