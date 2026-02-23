'use client'

import { useState } from 'react'
import {
  Monitor, Laptop, User, Calendar, Cpu, HardDrive, MemoryStick,
  Video, Wrench, StickyNote, Shield, Keyboard, Mouse, MonitorCheck
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EquipoCardActions } from './equipo-card-actions'
import type { EquipoWithRelations } from '@/types/equipos'
import { parseRamDetalle, parseDiscosDetalle, parseGpuDetalle } from '@/types/equipos'

// ============================================================================
// CLIENT COMPONENT - Equipo Detail Dialog
// ============================================================================

function getStatusVariant(estado: string): 'default' | 'secondary' | 'destructive' {
  switch (estado) {
    case 'Bueno': return 'default'
    case 'Regular': return 'secondary'
    case 'Malo': return 'destructive'
    default: return 'secondary'
  }
}

interface EquipoDetalleDialogProps {
  equipo: EquipoWithRelations
  children: React.ReactNode
}

export function EquipoDetalleDialog({ equipo, children }: EquipoDetalleDialogProps) {
  const [open, setOpen] = useState(false)
  const TipoIcon = equipo.tipo === 'Desktop' ? Monitor : Laptop

  const ramModules = parseRamDetalle(equipo.ramDetalle)
  const discos = parseDiscosDetalle(equipo.discosDetalle)
  const gpuInfo = parseGpuDetalle(equipo.gpuDetalle)

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TipoIcon className="h-5 w-5 text-muted-foreground" />
                  <DialogTitle className="text-xl">{equipo.marca} {equipo.modelo}</DialogTitle>
                </div>
                <p className="text-sm text-muted-foreground">S/N: {equipo.serial}</p>
              </div>
              <Badge variant={getStatusVariant(equipo.estadoSalud)}>
                {equipo.estadoSalud}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Colaborador asignado */}
            {equipo.colaborador ? (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">
                  {equipo.colaborador.nombre} {equipo.colaborador.apellido}
                </span>
                {equipo.colaborador.cargo && (
                  <span className="text-muted-foreground">• {equipo.colaborador.cargo}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>Sin asignar</span>
              </div>
            )}

            <Separator />

            {/* Especificaciones técnicas */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{equipo.procesador}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MemoryStick className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{equipo.ram} GB RAM</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{equipo.almacenamiento}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Video className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{equipo.gpu}</span>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Adquisición: {new Date(equipo.fechaAdquisicion).toLocaleDateString()}</span>
              </div>
              {equipo.fechaGarantia && (
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Garantía: {new Date(equipo.fechaGarantia).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {equipo._count.servicios > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                <span>{equipo._count.servicios} servicios técnicos registrados</span>
              </div>
            )}

            {/* Detalles de RAM */}
            {ramModules.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Módulos de RAM
                  </h4>
                  <div className="grid gap-2">
                    {ramModules.map((module, idx) => (
                      <div key={idx} className="text-sm bg-muted/50 p-2 rounded-md">
                        <div className="font-medium">{module.slot}</div>
                        <div className="text-muted-foreground">
                          {module.capacidad}GB {module.tipo} @ {module.velocidad}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Detalles de Discos */}
            {discos.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Almacenamiento
                  </h4>
                  <div className="grid gap-2">
                    {discos.map((disco, idx) => (
                      <div key={idx} className="text-sm bg-muted/50 p-2 rounded-md">
                        <div className="font-medium">{disco.tipo} - {disco.capacidad}GB</div>
                        <div className="text-muted-foreground">
                          {disco.interfaz} • Salud: {disco.salud}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Detalles de GPU */}
            {gpuInfo && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Tarjeta Gráfica
                  </h4>
                  <div className="text-sm bg-muted/50 p-2 rounded-md">
                    <div className="font-medium">{gpuInfo.modelo}</div>
                    <div className="text-muted-foreground">
                      {gpuInfo.memoria}GB VRAM • {gpuInfo.tipo}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Periféricos */}
            {(equipo.pantallas || equipo.resolucionPantalla || equipo.tieneTeclado || equipo.tieneMouse || equipo.otrosPeriferico) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MonitorCheck className="h-4 w-4" />
                    Periféricos
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    {equipo.pantallas && equipo.pantallas > 0 && (
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {equipo.pantallas} pantalla{equipo.pantallas > 1 ? 's' : ''}
                          {equipo.resolucionPantalla && ` (${equipo.resolucionPantalla})`}
                        </span>
                      </div>
                    )}
                    {equipo.tieneTeclado && (
                      <div className="flex items-center gap-2">
                        <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Teclado incluido</span>
                      </div>
                    )}
                    {equipo.tieneMouse && (
                      <div className="flex items-center gap-2">
                        <Mouse className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Mouse incluido</span>
                      </div>
                    )}
                    {equipo.otrosPeriferico && (
                      <div className="text-muted-foreground">
                        Otros: {equipo.otrosPeriferico}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Observaciones */}
            {equipo.observaciones && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Observaciones
                  </h4>
                  <div className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                    {equipo.observaciones}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <EquipoCardActions equipo={equipo} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
