import { Briefcase, Monitor, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ColaboradorDetalleDialog } from './colaborador-detalle-dialog'
import type { Colaborador } from './colaboradores-list'

// ============================================================================
// SERVER COMPONENT - Colaborador Card (Minimal - click to expand)
// ============================================================================

interface ColaboradorCardProps {
  colaborador: Colaborador
}

/**
 * Minimal colaborador card component
 * Shows name, cargo, avatar, and quick summary badges
 * Click opens detail dialog with all information
 */
export function ColaboradorCard({ colaborador }: ColaboradorCardProps) {
  const nombreCompleto = `${colaborador.nombre} ${colaborador.apellido}`
  const initials = `${colaborador.nombre.charAt(0)}${colaborador.apellido.charAt(0)}`.toUpperCase()
  const equiposCount = colaborador._count?.equipos ?? 0
  const inventarioCount = (colaborador.movimientosRepuestos ?? []).length

  return (
    <ColaboradorDetalleDialog colaborador={colaborador}>
      <Card className="hover:shadow-md transition-shadow hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {colaborador.fotoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={colaborador.fotoUrl} alt={nombreCompleto} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                {initials}
              </div>
            )}

            {/* Name & Cargo */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{nombreCompleto}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{colaborador.cargo}</span>
              </div>
            </div>

            {/* Summary badges */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              {equiposCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                  <Monitor className="h-2.5 w-2.5" />
                  {equiposCount}
                </Badge>
              )}
              {inventarioCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                  <Package className="h-2.5 w-2.5" />
                  {inventarioCount}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ColaboradorDetalleDialog>
  )
}
