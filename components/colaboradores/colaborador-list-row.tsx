import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin, Laptop, CreditCard, Home } from 'lucide-react'
import type { Colaborador } from './colaboradores-list'

type Props = {
  colaborador: Colaborador
}

export function ColaboradorListRow({ colaborador }: Props) {
  const initials = `${colaborador.nombre[0] ?? ''}${colaborador.apellido[0] ?? ''}`.toUpperCase()

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex gap-3 p-4 sm:items-center">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {colaborador.fotoUrl ? (
            <img
              src={colaborador.fotoUrl}
              alt={`${colaborador.nombre} ${colaborador.apellido}`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {initials}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{colaborador.nombre} {colaborador.apellido}</span>
            <Badge variant="outline">{colaborador.cargo}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {colaborador.cedula && (
              <span className="inline-flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                C.C. {colaborador.cedula}
              </span>
            )}
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
            {colaborador.direccion && (
              <span className="inline-flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{colaborador.direccion}</span>
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

        {/* Equipment badges */}
        {colaborador.equipos.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-2 text-xs text-muted-foreground max-w-lg">
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