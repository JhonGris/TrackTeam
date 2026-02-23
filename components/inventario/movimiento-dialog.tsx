'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUp, ArrowDown, ArrowLeftRight, User, Mail, Camera, X, ImageIcon } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { compressImage } from '@/lib/compress-image'
import { registrarMovimiento, getUltimoMovimiento } from '@/app/inventario/actions'
import type { RepuestoConCategoria } from '@/types/repuestos'
import type { Colaborador } from '@/types/models'

type TipoMovimiento = 'entrada' | 'salida'

type Props = {
  repuesto: RepuestoConCategoria
  colaboradores: Colaborador[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MovimientoDialog({ repuesto, colaboradores, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tipo, setTipo] = useState<TipoMovimiento>('entrada')
  const [colaboradorId, setColaboradorId] = useState<string>('')
  const [enviarCorreo, setEnviarCorreo] = useState(true)
  
  // Movement type validation
  const [lastMovType, setLastMovType] = useState<string | null>(null)
  const [lastMovLoaded, setLastMovLoaded] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      setLastMovLoaded(false)
      getUltimoMovimiento(repuesto.id).then(result => {
        const t = result?.tipo || null
        setLastMovType(t)
        setLastMovLoaded(true)
        // Auto-select valid type
        if (t === 'salida') setTipo('entrada')
        else if (t === 'entrada') setTipo('salida')
        else setTipo('entrada') // No movements: must enter first
      })
    }
  }, [open, repuesto.id])

  const isMovTypeDisabled = (t: TipoMovimiento): boolean => {
    if (!lastMovLoaded) return false
    if (lastMovType === null && t === 'salida') return true // No movements: only entrada
    if (lastMovType === t) return true // Can't repeat same type
    return false
  }
  
  // Estado para foto
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Solo entrada y salida - cada objeto es una unidad única
  const tiposMovimiento = [
    { value: 'entrada' as const, label: 'Entrada', icon: ArrowDown, color: 'text-green-500' },
    { value: 'salida' as const, label: 'Salida', icon: ArrowUp, color: 'text-red-500' },
  ]

  const colaboradorSeleccionado = colaboradores.find(c => c.id === colaboradorId)

  // Handlers para foto
  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const compressed = await compressImage(file)
      setFotoFile(compressed)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(compressed)
    }
  }

  function removeFoto() {
    setFotoFile(null)
    setFotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('repuestoId', repuesto.id)
    formData.set('tipo', tipo)
    formData.set('cantidad', '1') // Siempre 1 - cada objeto es una unidad única
    if (colaboradorId) {
      formData.set('colaboradorId', colaboradorId)
    }
    formData.set('enviarCorreo', enviarCorreo ? 'true' : 'false')
    
    // Agregar foto si existe
    if (fotoFile) {
      formData.set('foto', fotoFile)
    }
    
    const result = await registrarMovimiento(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onOpenChange(false)
    resetForm()
  }

  function resetForm() {
    setTipo('entrada')
    setColaboradorId('')
    setEnviarCorreo(true)
    setFotoPreview(null)
    setFotoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(null)
    setLastMovLoaded(false)
    setLastMovType(null)
  }

  function handleOpenChange(isOpen: boolean) {
    onOpenChange(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Registrar Movimiento
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{repuesto.nombre}</span>
            <br />
            Stock actual: <strong>{repuesto.cantidad} {repuesto.unidad}s</strong>
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tipo de movimiento */}
            <div>
              <Label>Tipo de Movimiento</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {tiposMovimiento.map((t) => {
                  const Icon = t.icon
                  return (
                    <Button
                      key={t.value}
                      type="button"
                      variant={tipo === t.value ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={() => setTipo(t.value)}
                      disabled={isMovTypeDisabled(t.value)}
                    >
                      <Icon className={`h-5 w-5 ${tipo === t.value ? '' : t.color}`} />
                      <span className="text-xs">{t.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Asignar a Colaborador */}
            <div className="border-t pt-4">
              <Label htmlFor="colaboradorId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Asignar a Colaborador (opcional)
              </Label>
              <Select value={colaboradorId || 'none'} onValueChange={(val) => setColaboradorId(val === 'none' ? '' : val)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {colaboradores.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <span className="flex items-center gap-2">
                        {col.nombre} {col.apellido}
                        <span className="text-muted-foreground text-xs">
                          ({col.cargo})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Si se asigna, quedará registrado quién recibe o devuelve el objeto
              </p>
            </div>

            {/* Enviar correo */}
            {colaboradorId && colaboradorSeleccionado && (
              <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                <Checkbox
                  id="enviarCorreo"
                  checked={enviarCorreo}
                  onCheckedChange={(checked) => setEnviarCorreo(checked === true)}
                />
                <div className="flex-1">
                  <Label htmlFor="enviarCorreo" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    Notificar por correo
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se enviará un correo a <strong>{colaboradorSeleccionado.email}</strong> informando del {tipo === 'entrada' ? 'ingreso' : tipo === 'salida' ? 'retiro' : 'ajuste'} del objeto
                  </p>
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                name="motivo"
                rows={2}
                placeholder="Razón del movimiento..."
              />
            </div>

            {/* Referencia */}
            <div>
              <Label htmlFor="referencia">Referencia (opcional)</Label>
              <Input
                id="referencia"
                name="referencia"
                placeholder="Ej: Factura #123, Orden de compra..."
              />
            </div>

            {/* Captura de Foto */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4" />
                Foto del Estado (opcional)
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Captura una foto para documentar el estado del objeto al momento del movimiento
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                className="hidden"
              />
              
              {fotoPreview ? (
                <div className="relative w-full">
                  <div className="relative aspect-video w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={fotoPreview}
                      alt="Vista previa"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeFoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-24 flex flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tomar foto o seleccionar imagen
                  </span>
                </Button>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
