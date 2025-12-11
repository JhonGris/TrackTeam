import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, MapPin, Laptop, User } from 'lucide-react'
import type { Colaborador } from './colaboradores-list'

type Props = {
  colaborador: Colaborador
}

export function ColaboradorListRow({ colaborador }: Props) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="font-semibold text-foreground">{colaborador.nombre} {colaborador.apellido}</span>
            <Badge variant="outline">{colaborador.cargo}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {colaborador.email}
            </span>
            {colaborador.ciudad && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {colaborador.ciudad}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Laptop className="h-3.5 w-3.5" />
            {colaborador._count.equipos > 0 ? (
              <span>{colaborador._count.equipos} equipo(s) asignado(s)</span>
            ) : (
              <span>Sin equipos asignados</span>
            )}
          </div>
        </div>

        {colaborador.equipos.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground max-w-lg">
            {colaborador.equipos.slice(0, 3).map((eq) => (
              <Badge key={eq.id} variant="outline" className="font-mono">
                {eq.serial} • {eq.marca} {eq.modelo}
              </Badge>
            ))}
            {colaborador.equipos.length > 3 && (
              <Badge variant="secondary">+{colaborador.equipos.length - 3} más</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}