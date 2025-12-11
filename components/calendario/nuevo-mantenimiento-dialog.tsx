'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMantenimientoProgramadoDirect } from '@/app/calendario/actions'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarButtons } from './calendar-buttons'
import { Check, CheckCircle2, ChevronsUpDown } from 'lucide-react'

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

type CreatedMantenimiento = {
  tipo: string
  descripcion: string
  fechaProgramada: string
  horaEstimada: string
  duracionEstimada: number | null
  esRecurrente: boolean
  frecuencia: string
  equipo: {
    serial: string
    marca: string
    modelo: string
  }
  colaborador: {
    nombre: string
    apellido: string
  } | null
}

interface NuevoMantenimientoDialogProps {
  equipos: EquipoSelect[]
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
}

const TIPOS_MANTENIMIENTO = [
  'Preventivo',
  'Correctivo',
  'Limpieza',
  'Actualización de Software'
] as const

const FRECUENCIAS = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'personalizado', label: 'Personalizado' },
] as const

export function NuevoMantenimientoDialog({
  equipos,
  open,
  onOpenChange,
  defaultDate,
}: NuevoMantenimientoDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdMantenimiento, setCreatedMantenimiento] = useState<CreatedMantenimiento | null>(null)
  const [equipoOpen, setEquipoOpen] = useState(false)

  // Form state
  const [equipoId, setEquipoId] = useState('')
  const [tipo, setTipo] = useState<string>('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaProgramada, setFechaProgramada] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  )
  const [horaEstimada, setHoraEstimada] = useState('')
  const [duracionEstimada, setDuracionEstimada] = useState('')
  const [esRecurrente, setEsRecurrente] = useState(false)
  const [frecuencia, setFrecuencia] = useState('')
  const [diasIntervalo, setDiasIntervalo] = useState('')
  const [fechaFinRecurrencia, setFechaFinRecurrencia] = useState('')
  const selectedEquipo = equipoId ? equipos.find((e) => e.id === equipoId) : null

  const resetForm = () => {
    setEquipoId('')
    setTipo('')
    setDescripcion('')
    setFechaProgramada(defaultDate || new Date().toISOString().split('T')[0])
    setHoraEstimada('')
    setDuracionEstimada('')
    setEsRecurrente(false)
    setFrecuencia('')
    setDiasIntervalo('')
    setFechaFinRecurrencia('')
    setError(null)
    setShowSuccess(false)
    setCreatedMantenimiento(null)
    setEquipoOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!equipoId) {
      setError('Selecciona un equipo para programar el mantenimiento')
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('equipoId', equipoId)
    formData.append('tipo', tipo)
    formData.append('descripcion', descripcion)
    formData.append('fechaProgramada', fechaProgramada)
    formData.append('horaEstimada', horaEstimada)
    formData.append('duracionEstimada', duracionEstimada)
    formData.append('esRecurrente', esRecurrente.toString())
    if (esRecurrente) {
      formData.append('frecuencia', frecuencia)
      if (frecuencia === 'personalizado') {
        formData.append('diasIntervalo', diasIntervalo)
      }
      formData.append('fechaFinRecurrencia', fechaFinRecurrencia)
    }

    const result = await createMantenimientoProgramadoDirect(formData)

    if (result.success) {
      // Find the selected equipo for calendar buttons
      const selectedEquipo = equipos.find(e => e.id === equipoId)
      if (selectedEquipo) {
        setCreatedMantenimiento({
          tipo,
          descripcion,
          fechaProgramada,
          horaEstimada,
          duracionEstimada: duracionEstimada ? parseInt(duracionEstimada) : null,
          esRecurrente,
          frecuencia,
          equipo: {
            serial: selectedEquipo.serial,
            marca: selectedEquipo.marca,
            modelo: selectedEquipo.modelo,
          },
          colaborador: selectedEquipo.colaborador,
        })
        setShowSuccess(true)
      } else {
        resetForm()
        onOpenChange(false)
      }
      router.refresh()
    } else {
      setError(result.error || 'Error al programar el mantenimiento')
    }

    setIsLoading(false)
  }

  // Success view after creating
  if (showSuccess && createdMantenimiento) {
    return (
      <Dialog open={open} onOpenChange={(value) => {
        if (!value) resetForm()
        onOpenChange(value)
      }} modal={false}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              ¡Mantenimiento Programado!
            </DialogTitle>
            <DialogDescription>
              El mantenimiento ha sido programado exitosamente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <p><strong>Equipo:</strong> {createdMantenimiento.equipo.marca} {createdMantenimiento.equipo.modelo}</p>
              <p><strong>Serial:</strong> {createdMantenimiento.equipo.serial}</p>
              <p><strong>Tipo:</strong> {createdMantenimiento.tipo}</p>
              <p><strong>Fecha:</strong> {new Date(createdMantenimiento.fechaProgramada).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              {createdMantenimiento.horaEstimada && (
                <p><strong>Hora:</strong> {createdMantenimiento.horaEstimada}</p>
              )}
              {createdMantenimiento.colaborador && (
                <p><strong>Colaborador:</strong> {createdMantenimiento.colaborador.nombre} {createdMantenimiento.colaborador.apellido}</p>
              )}
            </div>

            <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-800 mb-3">
                📅 Agrega este mantenimiento a tu calendario para recibir recordatorios:
              </p>
              <CalendarButtons mantenimiento={createdMantenimiento} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setShowSuccess(false)
                setCreatedMantenimiento(null)
                // Reset form but keep dialog open for another
                setEquipoId('')
                setTipo('')
                setDescripcion('')
                setHoraEstimada('')
                setDuracionEstimada('')
                setEsRecurrente(false)
                setFrecuencia('')
                setDiasIntervalo('')
                setFechaFinRecurrencia('')
              }}
            >
              Programar Otro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm()
      onOpenChange(value)
    }} modal={false}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programar Mantenimiento</DialogTitle>
          <DialogDescription>
            Programa un mantenimiento para un equipo. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Equipo */}
          <div className="space-y-2">
            <Label htmlFor="equipoId">Equipo *</Label>
            <Popover open={equipoOpen} onOpenChange={setEquipoOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="equipoId"
                  variant="outline"
                  role="combobox"
                  aria-expanded={equipoOpen}
                  className="w-full justify-between"
                  type="button"
                >
                  {selectedEquipo ? (
                    <span className="truncate text-left">
                      {selectedEquipo.marca} {selectedEquipo.modelo} - {selectedEquipo.serial}
                      {selectedEquipo.colaborador &&
                        ` (${selectedEquipo.colaborador.nombre} ${selectedEquipo.colaborador.apellido})`}
                    </span>
                  ) : (
                    'Seleccionar equipo'
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0">
                <Command loop>
                  <CommandInput placeholder="Buscar marca, modelo, serial o colaborador..." />
                  <CommandEmpty>No se encontró equipo.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {equipos.map((equipo) => {
                        const colaboradorNombre = equipo.colaborador
                          ? `${equipo.colaborador.nombre} ${equipo.colaborador.apellido}`
                          : 'Sin asignar'

                        return (
                          <CommandItem
                            key={equipo.id}
                            value={equipo.id}
                            keywords={[
                              equipo.marca,
                              equipo.modelo,
                              equipo.serial,
                              equipo.colaborador?.nombre ?? '',
                              equipo.colaborador?.apellido ?? '',
                            ]}
                            onSelect={() => {
                              setEquipoId(equipo.id)
                              setEquipoOpen(false)
                            }}
                          >
                            <div className="flex flex-col items-start text-left">
                              <span className="text-sm font-medium">
                                {equipo.marca} {equipo.modelo} - {equipo.serial}
                              </span>
                              <span className="text-xs text-muted-foreground">{colaboradorNombre}</span>
                            </div>
                            {equipoId === equipo.id && <Check className="ml-auto h-4 w-4" />}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Mantenimiento *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MANTENIMIENTO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fechaProgramada">Fecha Programada *</Label>
              <Input
                id="fechaProgramada"
                type="date"
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hora */}
            <div className="space-y-2">
              <Label htmlFor="horaEstimada">Hora Estimada</Label>
              <Input
                id="horaEstimada"
                type="time"
                value={horaEstimada}
                onChange={(e) => setHoraEstimada(e.target.value)}
              />
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duracionEstimada">Duración Estimada (min)</Label>
              <Input
                id="duracionEstimada"
                type="number"
                min="1"
                value={duracionEstimada}
                onChange={(e) => setDuracionEstimada(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles adicionales del mantenimiento..."
              rows={2}
            />
          </div>

          {/* Recurrencia */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="esRecurrente"
                checked={esRecurrente}
                onCheckedChange={(checked) => setEsRecurrente(checked as boolean)}
              />
              <Label htmlFor="esRecurrente" className="font-medium">
                Mantenimiento recurrente
              </Label>
            </div>

            {esRecurrente && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  {/* Frecuencia */}
                  <div className="space-y-2">
                    <Label htmlFor="frecuencia">Frecuencia *</Label>
                    <Select value={frecuencia} onValueChange={setFrecuencia}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {FRECUENCIAS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Días intervalo (solo para personalizado) */}
                  {frecuencia === 'personalizado' && (
                    <div className="space-y-2">
                      <Label htmlFor="diasIntervalo">Cada X días *</Label>
                      <Input
                        id="diasIntervalo"
                        type="number"
                        min="1"
                        value={diasIntervalo}
                        onChange={(e) => setDiasIntervalo(e.target.value)}
                        placeholder="30"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Fecha fin recurrencia */}
                <div className="space-y-2">
                  <Label htmlFor="fechaFinRecurrencia">Repetir hasta (opcional)</Label>
                  <Input
                    id="fechaFinRecurrencia"
                    type="date"
                    value={fechaFinRecurrencia}
                    onChange={(e) => setFechaFinRecurrencia(e.target.value)}
                    min={fechaProgramada}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !equipoId || !tipo}>
              {isLoading ? 'Programando...' : 'Programar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
