'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { completarMantenimiento } from '@/app/calendario/actions'

type MantenimientoConEquipo = {
  id: string
  tipo: string
  equipo: {
    id: string
    serial: string
    marca: string
    modelo: string
  }
}

interface CompletarMantenimientoDialogProps {
  mantenimiento: MantenimientoConEquipo
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

const ESTADOS_RESULTANTES = ['Bueno', 'Regular', 'Malo'] as const

export function CompletarMantenimientoDialog({
  mantenimiento,
  open,
  onOpenChange,
  onComplete,
}: CompletarMantenimientoDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [problemas, setProblemas] = useState('')
  const [soluciones, setSoluciones] = useState('')
  const [tiempoInvertido, setTiempoInvertido] = useState('60')
  const [estadoResultante, setEstadoResultante] = useState<'Bueno' | 'Regular' | 'Malo'>('Bueno')

  const resetForm = () => {
    setProblemas('')
    setSoluciones('')
    setTiempoInvertido('60')
    setEstadoResultante('Bueno')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!problemas.trim() || !soluciones.trim()) {
      setError('Debe completar los problemas encontrados y las soluciones aplicadas')
      setIsLoading(false)
      return
    }

    const result = await completarMantenimiento(mantenimiento.id, {
      problemas,
      soluciones,
      tiempoInvertido: parseInt(tiempoInvertido),
      estadoResultante,
    })

    if (result.success) {
      resetForm()
      router.refresh()
      onComplete()
    } else {
      setError(result.error || 'Error al completar el mantenimiento')
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm()
      onOpenChange(value)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Completar Mantenimiento</DialogTitle>
          <DialogDescription>
            Registra el resultado del mantenimiento de {mantenimiento.equipo.marca} {mantenimiento.equipo.modelo}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Problemas */}
          <div className="space-y-2">
            <Label htmlFor="problemas">Problemas Encontrados *</Label>
            <Textarea
              id="problemas"
              value={problemas}
              onChange={(e) => setProblemas(e.target.value)}
              placeholder="Describe los problemas encontrados durante el mantenimiento..."
              rows={3}
              required
            />
          </div>

          {/* Soluciones */}
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
            {/* Tiempo */}
            <div className="space-y-2">
              <Label htmlFor="tiempoInvertido">Tiempo Invertido (min) *</Label>
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
                onValueChange={(v) => setEstadoResultante(v as 'Bueno' | 'Regular' | 'Malo')}
              >
                <SelectTrigger>
                  <SelectValue />
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
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Completar Mantenimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
