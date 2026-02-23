'use client'

import { useState } from 'react'
import { Mail, Briefcase, MapPin, Laptop, CreditCard, Home, Monitor, Package, CheckSquare, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ColaboradorCardActions } from './colaborador-card-actions'
import type { Colaborador } from './colaboradores-list'

// ============================================================================
// CLIENT COMPONENT - Colaborador Detail Dialog
// ============================================================================

const healthColor: Record<string, string> = {
  'Bueno': 'bg-green-100 text-green-800 border-green-200',
  'Regular': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Malo': 'bg-red-100 text-red-800 border-red-200',
}

const DOTACION_LABELS: Record<string, string> = {
  basePortatil: 'Base Portátil',
  audifonos: 'Audífonos',
  apoyaPies: 'Apoya Pies',
  escritorio: 'Escritorio',
  sillaErgonomica: 'Silla Ergonómica',
  camara: 'Cámara',
  microfono: 'Micrófono',
}

interface ColaboradorDetalleDialogProps {
  colaborador: Colaborador
  children: React.ReactNode
}

export function ColaboradorDetalleDialog({ colaborador, children }: ColaboradorDetalleDialogProps) {
  const [open, setOpen] = useState(false)

  const nombreCompleto = `${colaborador.nombre} ${colaborador.apellido}`
  const initials = `${colaborador.nombre.charAt(0)}${colaborador.apellido.charAt(0)}`.toUpperCase()

  // Agrupar items de inventario por repuesto
  const inventarioMap = new Map<string, { nombre: string; cantidad: number; categoria: string | null; fotoUrl: string | null }>()
  for (const mov of colaborador.movimientosRepuestos ?? []) {
    const key = mov.repuesto.id
    const existing = inventarioMap.get(key)
    if (existing) {
      existing.cantidad += Math.abs(mov.cantidad)
    } else {
      inventarioMap.set(key, {
        nombre: mov.repuesto.nombre,
        cantidad: Math.abs(mov.cantidad),
        categoria: mov.repuesto.categoria?.nombre ?? null,
        fotoUrl: mov.repuesto.fotoUrl,
      })
    }
  }
  const inventarioItems = Array.from(inventarioMap.values())

  const dotacion = colaborador.dotacionJson
    ? JSON.parse(colaborador.dotacionJson)
    : {}
  const entregados = Object.entries(DOTACION_LABELS).filter(
    ([key]) => dotacion[key] === true
  )

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {colaborador.fotoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={colaborador.fotoUrl} alt={nombreCompleto} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary flex-shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl">{nombreCompleto}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{colaborador.cargo}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Datos personales */}
            <div className="space-y-2 text-sm">
              {colaborador.cedula && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>C.C. {colaborador.cedula}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{colaborador.email}</span>
              </div>
              {colaborador.direccion && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{colaborador.direccion}</span>
                </div>
              )}
              {colaborador.ciudad && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{colaborador.ciudad}</span>
                </div>
              )}
            </div>

            {/* Equipos Asignados */}
            {colaborador.equipos.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Monitor className="h-3.5 w-3.5" />
                    Equipos ({colaborador._count?.equipos ?? colaborador.equipos.length})
                  </div>
                  <div className="space-y-1.5">
                    {colaborador.equipos.map((equipo) => (
                      <div key={equipo.id} className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Laptop className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                          <span className="truncate font-medium">{equipo.marca} {equipo.modelo}</span>
                          <span className="text-xs text-muted-foreground font-mono">{equipo.serial}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {equipo.tipo}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${healthColor[equipo.estadoSalud] || ''}`}
                          >
                            {equipo.estadoSalud}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Inventario Asignado */}
            {inventarioItems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Package className="h-3.5 w-3.5" />
                    Inventario ({inventarioItems.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {inventarioItems.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs gap-1">
                        {item.nombre}
                        {item.cantidad > 1 && <span className="font-semibold">×{item.cantidad}</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Dotación Entregada */}
            {entregados.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <CheckSquare className="h-3.5 w-3.5" />
                    Dotación ({entregados.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entregados.map(([key, label]) => (
                      <Badge key={key} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ✓ {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Observaciones */}
            {colaborador.observaciones && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>{colaborador.observaciones}</span>
              </div>
            )}

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

            {/* Actions */}
            <ColaboradorCardActions colaborador={colaborador} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
