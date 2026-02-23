'use client'

import { useState, useEffect, useTransition } from 'react'
import { Package, Plus, X, Mail, Loader2, MailCheck, ZoomIn } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  asignarRepuestoAColaborador,
  desasignarRepuestoDeColaborador,
  getRepuestosDisponibles,
  getRepuestosAsignados,
  enviarNotificacionAsignacion,
} from '@/app/colaboradores/actions'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

type RepuestoDisponible = {
  id: string
  nombre: string
  descripcion: string | null
  codigoInterno: string | null
  fotoUrl: string | null
  categoria: { nombre: string; color: string } | null
}

type RepuestoAsignado = {
  movimientoId: string
  repuestoId: string
  nombre: string
  descripcion: string | null
  codigoInterno: string | null
  fotoUrl: string | null
  categoria: { nombre: string; color: string } | null
  fechaAsignacion: Date
  notificacionEnviada: boolean
}

interface AsignarInventarioSectionProps {
  colaboradorId: string
  colaboradorNombre: string
}

// ============================================================================
// Component
// ============================================================================

export function AsignarInventarioSection({
  colaboradorId,
}: AsignarInventarioSectionProps) {
  const [disponibles, setDisponibles] = useState<RepuestoDisponible[]>([])
  const [asignados, setAsignados] = useState<RepuestoAsignado[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailSending, setEmailSending] = useState<string | null>(null) // repuestoId being emailed
  const [fotoPreview, setFotoPreview] = useState<{ url: string; alt: string } | null>(null)

  // Load data on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
  }, [colaboradorId])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [disp, asig] = await Promise.all([
        getRepuestosDisponibles(),
        getRepuestosAsignados(colaboradorId),
      ])
      setDisponibles(disp)
      setAsignados(asig)
    } catch {
      setError('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  function handleAssign(repuestoId: string) {
    setOpen(false)
    setError(null)
    startTransition(async () => {
      const result = await asignarRepuestoAColaborador(colaboradorId, repuestoId)
      if (result.error) {
        setError(result.error)
      } else {
        await loadData()
      }
    })
  }

  function handleUnassign(repuestoId: string) {
    setError(null)
    startTransition(async () => {
      const result = await desasignarRepuestoDeColaborador(colaboradorId, repuestoId)
      if (result.error) {
        setError(result.error)
      } else {
        await loadData()
      }
    })
  }

  async function handleSendEmail(repuestoId: string, movimientoId: string) {
    setEmailSending(repuestoId)
    setError(null)
    try {
      const result = await enviarNotificacionAsignacion(colaboradorId, repuestoId, movimientoId)
      if (result.error) {
        setError(result.error)
      } else {
        await loadData()
      }
    } catch {
      setError('Error al enviar la notificación')
    } finally {
      setEmailSending(null)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-1.5">
          <Package className="h-4 w-4" />
          Inventario Asignado ({asignados.length})
        </Label>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Assigned items list */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Cargando inventario...
        </div>
      ) : (
        <>
          {asignados.length > 0 && (
            <div className="space-y-2">
              {asignados.map((item) => (
                <div
                  key={item.repuestoId}
                  className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-sm bg-blue-50/50 dark:bg-blue-950/20"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {item.fotoUrl ? (
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => setFotoPreview({ url: item.fotoUrl!, alt: item.nombre })}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.fotoUrl}
                          alt={item.nombre}
                          className="w-9 h-9 object-cover rounded border group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="h-3 w-3 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-muted rounded border flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{item.nombre}</span>
                      {item.categoria && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                          style={{ borderColor: item.categoria.color, color: item.categoria.color }}
                        >
                          {item.categoria.nombre}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {item.codigoInterno && <span>{item.codigoInterno}</span>}
                      <span>Asignado: {formatDate(item.fechaAsignacion)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Email notification button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7",
                        item.notificacionEnviada
                          ? "text-green-600"
                          : "text-muted-foreground hover:text-blue-600"
                      )}
                      onClick={() => handleSendEmail(item.repuestoId, item.movimientoId)}
                      disabled={emailSending === item.repuestoId}
                      title={item.notificacionEnviada ? 'Correo ya enviado (reenviar)' : 'Enviar notificación por correo'}
                    >
                      {emailSending === item.repuestoId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : item.notificacionEnviada ? (
                        <MailCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleUnassign(item.repuestoId)}
                      disabled={isPending}
                      title="Remover asignación"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {asignados.length === 0 && (
            <p className="text-xs text-muted-foreground italic py-1">
              Sin objetos de inventario asignados
            </p>
          )}

          {/* Assign new item */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                disabled={isPending || disponibles.length === 0}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {disponibles.length === 0
                  ? 'No hay objetos disponibles'
                  : 'Asignar objeto del inventario...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar objeto..." />
                <CommandList>
                  <CommandEmpty>No se encontraron objetos.</CommandEmpty>
                  <CommandGroup heading="Objetos disponibles">
                    {disponibles.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.nombre} ${item.codigoInterno || ''} ${item.categoria?.nombre || ''}`}
                        onSelect={() => handleAssign(item.id)}
                        className="flex items-center gap-2"
                      >
                        {item.fotoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.fotoUrl}
                            alt={item.nombre}
                            className="w-6 h-6 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <Package className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.nombre}</span>
                          {item.codigoInterno && (
                            <span className="text-muted-foreground ml-1 text-xs">
                              ({item.codigoInterno})
                            </span>
                          )}
                          {item.categoria && (
                            <Badge
                              variant="outline"
                              className="ml-1.5 text-[10px] px-1 py-0"
                              style={{ borderColor: item.categoria.color, color: item.categoria.color }}
                            >
                              {item.categoria.nombre}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      )}

      {/* Photo preview lightbox */}
      <Dialog open={!!fotoPreview} onOpenChange={(open) => !open && setFotoPreview(null)}>
        <DialogContent className="sm:max-w-[500px] p-2">
          {fotoPreview && (
            <div className="flex items-center justify-center max-h-[60vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoPreview.url}
                alt={fotoPreview.alt}
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
