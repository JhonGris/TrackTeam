'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateServicioDirect } from '@/app/servicios/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { TipoServicio, EstadoResultante } from '@/types/servicios'

// Tipo simplificado para el servicio (solo campos necesarios para edición)
type ServicioEditable = {
  id: string
  equipoId: string
  tipo: string
  fechaServicio: Date
  problemas: string
  soluciones: string
  tiempoInvertido: number
  estadoResultante: string
}

// Tipo simplificado para equipo (solo campos necesarios para select)
type EquipoSelect = {
  id: string
  serial: string
  marca: string
  modelo: string
}

interface EditarServicioDialogProps {
  servicio: ServicioEditable
  equipos: EquipoSelect[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TIPOS_SERVICIO: TipoServicio[] = [
  'Preventivo',
  'Correctivo',
  'Limpieza',
  'Actualización de Software'
]

const ESTADOS_RESULTANTES: EstadoResultante[] = ['Bueno', 'Regular', 'Malo']

export function EditarServicioDialog({
  servicio,
  equipos,
  open,
  onOpenChange,
}: EditarServicioDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [tipo, setTipo] = useState<TipoServicio>(servicio.tipo as TipoServicio)
  const [fechaServicio, setFechaServicio] = useState(
    new Date(servicio.fechaServicio).toISOString().split('T')[0]
  )
  const [equipoId, setEquipoId] = useState(servicio.equipoId)
  const [problemas, setProblemas] = useState(servicio.problemas)
  const [soluciones, setSoluciones] = useState(servicio.soluciones)
  const [tiempoInvertido, setTiempoInvertido] = useState(servicio.tiempoInvertido.toString())
  const [estadoResultante, setEstadoResultante] = useState<EstadoResultante>(
    servicio.estadoResultante as EstadoResultante
  )

  // Reset form when servicio changes
  useEffect(() => {
    setTipo(servicio.tipo as TipoServicio)
    setFechaServicio(new Date(servicio.fechaServicio).toISOString().split('T')[0])
    setEquipoId(servicio.equipoId)
    setProblemas(servicio.problemas)
    setSoluciones(servicio.soluciones)
    setTiempoInvertido(servicio.tiempoInvertido.toString())
    setEstadoResultante(servicio.estadoResultante as EstadoResultante)
  }, [servicio])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('tipo', tipo)
    formData.append('fechaServicio', fechaServicio)
    formData.append('equipoId', equipoId)
    formData.append('problemas', problemas)
    formData.append('soluciones', soluciones)
    formData.append('tiempoInvertido', tiempoInvertido)
    formData.append('estadoResultante', estadoResultante)

    const result = await updateServicioDirect(servicio.id, formData)

    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      setError(result.error || 'Error al actualizar el servicio')
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Servicio Técnico</DialogTitle>
          <DialogDescription>
            Modifica los datos del servicio técnico. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Servicio */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Servicio *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoServicio)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERVICIO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fechaServicio">Fecha del Servicio *</Label>
              <Input
                id="fechaServicio"
                type="date"
                value={fechaServicio}
                onChange={(e) => setFechaServicio(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Equipo */}
          <div className="space-y-2">
            <Label htmlFor="equipoId">Equipo *</Label>
            <Select value={equipoId} onValueChange={setEquipoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {equipos.map((equipo) => (
                  <SelectItem key={equipo.id} value={equipo.id}>
                    {equipo.marca} {equipo.modelo} - {equipo.serial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Problemas Encontrados */}
          <div className="space-y-2">
            <Label htmlFor="problemas">Problemas Encontrados *</Label>
            <Textarea
              id="problemas"
              value={problemas}
              onChange={(e) => setProblemas(e.target.value)}
              placeholder="Describe los problemas encontrados en el equipo..."
              rows={3}
              required
            />
          </div>

          {/* Soluciones Aplicadas */}
          <div className="space-y-2">
            <Label htmlFor="soluciones">Soluciones Aplicadas *</Label>
            <Textarea
              id="soluciones"
              value={soluciones}
              onChange={(e) => setSoluciones(e.target.value)}
              placeholder="Describe las soluciones aplicadas..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tiempo Invertido */}
            <div className="space-y-2">
              <Label htmlFor="tiempoInvertido">Tiempo Invertido (minutos) *</Label>
              <Input
                id="tiempoInvertido"
                type="number"
                min="1"
                value={tiempoInvertido}
                onChange={(e) => setTiempoInvertido(e.target.value)}
                required
              />
            </div>

            {/* Estado Resultante */}
            <div className="space-y-2">
              <Label htmlFor="estadoResultante">Estado Resultante *</Label>
              <Select
                value={estadoResultante}
                onValueChange={(v) => setEstadoResultante(v as EstadoResultante)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_RESULTANTES.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
