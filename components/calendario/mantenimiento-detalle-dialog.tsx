'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Monitor, Repeat, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  deleteMantenimientoProgramado, 
  cancelarMantenimiento 
} from '@/app/calendario/actions'
import { CompletarMantenimientoDialog } from './completar-mantenimiento-dialog'
import { CalendarButtons } from './calendar-buttons'

type MantenimientoConEquipo = {
  id: string
  tipo: string
  descripcion: string | null
  fechaProgramada: Date
  horaEstimada: string | null
  duracionEstimada: number | null
  esRecurrente: boolean
  frecuencia: string | null
  estado: string
  equipo: {
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
    colaborador: {
      id: string
      nombre: string
      apellido: string
    } | null
  }
}

type EquipoSelect = {
  id: string
  serial: string
  marca: string
  modelo: string
  colaborador: {
    nombre: string
    apellido: string
  } | null
}

interface MantenimientoDetalleDialogProps {
  mantenimiento: MantenimientoConEquipo
  equipos: EquipoSelect[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getTipoBadge(tipo: string) {
  const colors: Record<string, string> = {
    'Preventivo': 'bg-blue-100 text-blue-800 border-blue-300',
    'Correctivo': 'bg-red-100 text-red-800 border-red-300',
    'Limpieza': 'bg-green-100 text-green-800 border-green-300',
    'Actualización de Software': 'bg-purple-100 text-purple-800 border-purple-300',
  }
  return <Badge variant="outline" className={colors[tipo] || ''}>{tipo}</Badge>
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'Pendiente': return <Badge variant="outline" className="text-blue-600 border-blue-300">Pendiente</Badge>
    case 'Completado': return <Badge className="bg-green-500">Completado</Badge>
    case 'Cancelado': return <Badge variant="secondary">Cancelado</Badge>
    case 'Vencido': return <Badge variant="destructive">Vencido</Badge>
    default: return <Badge variant="outline">{estado}</Badge>
  }
}

function getFrecuenciaLabel(frecuencia: string | null): string {
  const labels: Record<string, string> = {
    'mensual': 'Mensual',
    'trimestral': 'Trimestral',
    'semestral': 'Semestral',
    'anual': 'Anual',
    'personalizado': 'Personalizado',
  }
  return frecuencia ? labels[frecuencia] || frecuencia : ''
}

export function MantenimientoDetalleDialog({
  mantenimiento,
  equipos,
  open,
  onOpenChange,
}: MantenimientoDetalleDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [completarOpen, setCompletarOpen] = useState(false)

  const fechaProgramada = new Date(mantenimiento.fechaProgramada)
  const isPast = fechaProgramada < new Date() && mantenimiento.estado === 'Pendiente'
  const canComplete = mantenimiento.estado === 'Pendiente'
  const canCancel = mantenimiento.estado === 'Pendiente'
  const canDelete = mantenimiento.estado !== 'Completado'

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteMantenimientoProgramado(mantenimiento.id)
    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      alert(result.error)
    }
    setIsLoading(false)
    setDeleteOpen(false)
  }

  const handleCancel = async () => {
    setIsLoading(true)
    const result = await cancelarMantenimiento(mantenimiento.id)
    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      alert(result.error)
    }
    setIsLoading(false)
    setCancelOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {getTipoBadge(mantenimiento.tipo)}
              {getEstadoBadge(mantenimiento.estado)}
              {isPast && <Badge variant="destructive">Vencido</Badge>}
            </div>
            <DialogTitle className="mt-2">
              {mantenimiento.equipo.marca} {mantenimiento.equipo.modelo}
            </DialogTitle>
            <DialogDescription>
              Serial: {mantenimiento.equipo.serial}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Equipo Info */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{mantenimiento.equipo.tipo}</p>
                {mantenimiento.equipo.colaborador && (
                  <p className="text-sm text-muted-foreground">
                    Asignado a: {mantenimiento.equipo.colaborador.nombre} {mantenimiento.equipo.colaborador.apellido}
                  </p>
                )}
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {fechaProgramada.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {mantenimiento.horaEstimada && (
                  <p className="text-sm text-muted-foreground">
                    Hora: {mantenimiento.horaEstimada}
                  </p>
                )}
              </div>
            </div>

            {/* Duración */}
            {mantenimiento.duracionEstimada && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <p>Duración estimada: {mantenimiento.duracionEstimada} minutos</p>
              </div>
            )}

            {/* Recurrencia */}
            {mantenimiento.esRecurrente && (
              <div className="flex items-center gap-3">
                <Repeat className="h-5 w-5 text-muted-foreground" />
                <p>Recurrente: {getFrecuenciaLabel(mantenimiento.frecuencia)}</p>
              </div>
            )}

            {/* Descripción */}
            {mantenimiento.descripcion && (
              <div className="p-3 rounded-lg border">
                <p className="text-sm font-medium mb-1">Descripción:</p>
                <p className="text-sm text-muted-foreground">{mantenimiento.descripcion}</p>
              </div>
            )}

            {/* Calendar Integration - Only show for pending */}
            {mantenimiento.estado === 'Pendiente' && (
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                <p className="text-sm text-blue-800 mb-2">📅 Agregar al calendario:</p>
                <CalendarButtons 
                  mantenimiento={{
                    tipo: mantenimiento.tipo,
                    descripcion: mantenimiento.descripcion,
                    fechaProgramada: mantenimiento.fechaProgramada.toISOString().split('T')[0],
                    horaEstimada: mantenimiento.horaEstimada,
                    duracionEstimada: mantenimiento.duracionEstimada,
                    esRecurrente: mantenimiento.esRecurrente,
                    frecuencia: mantenimiento.frecuencia,
                    equipo: mantenimiento.equipo,
                    colaborador: mantenimiento.equipo.colaborador,
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelOpen(true)}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                onClick={() => setCompletarOpen(true)}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Completar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mantenimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este mantenimiento programado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar mantenimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              El mantenimiento quedará marcado como cancelado y no se ejecutará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
              {isLoading ? 'Cancelando...' : 'Cancelar Mantenimiento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <CompletarMantenimientoDialog
        mantenimiento={mantenimiento}
        open={completarOpen}
        onOpenChange={setCompletarOpen}
        onComplete={() => {
          setCompletarOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
