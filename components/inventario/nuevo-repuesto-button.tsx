'use client'

import { useState, useRef } from 'react'
import { Plus, Package, Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { compressImage } from '@/lib/compress-image'
import { createRepuesto } from '@/app/inventario/actions'
import type { CategoriaRepuesto } from '@/types/repuestos'

type Props = {
  categorias: CategoriaRepuesto[]
}

export function NuevoRepuestoButton({ categorias }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen')
        return
      }
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen no debe superar 10MB')
        return
      }
      const compressed = await compressImage(file)
      setFotoFile(compressed)
      setFotoPreview(URL.createObjectURL(compressed))
      setError(null)
    }
  }

  function removeFoto() {
    setFotoFile(null)
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview)
      setFotoPreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // Agregar el archivo de foto al formData
    if (fotoFile) {
      formData.set('foto', fotoFile)
    }

    const result = await createRepuesto(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    removeFoto()
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      removeFoto()
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Objeto/Dispositivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nuevo Objeto/Dispositivo
          </DialogTitle>
          <DialogDescription>
            Agrega un nuevo objeto o dispositivo al inventario
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Fotografía del repuesto */}
            <div className="border-b pb-4">
              <Label className="mb-3 block">Fotografía del Repuesto</Label>
              <div className="flex items-start gap-4">
                {fotoPreview ? (
                  <div className="relative">
                    <Image
                      src={fotoPreview}
                      alt="Vista previa"
                      width={120}
                      height={120}
                      unoptimized
                      className="w-[120px] h-[120px] object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeFoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-[120px] h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Click para agregar
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  {!fotoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Foto
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos: JPG, PNG, GIF, WebP. Máximo 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Disco SSD 500GB"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Descripción detallada del repuesto"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="codigoInterno">Código Interno</Label>
                <Input
                  id="codigoInterno"
                  name="codigoInterno"
                  placeholder="Ej: REP-001"
                />
              </div>

              <div>
                <Label htmlFor="categoriaId">Categoría</Label>
                <Select name="categoriaId">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.nombre}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información adicional */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Información Adicional</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    name="ubicacion"
                    placeholder="Ej: Estante A-1"
                  />
                </div>

                <div>
                  <Label htmlFor="asignadoA">Asignado a</Label>
                  <Input
                    id="asignadoA"
                    name="asignadoA"
                    placeholder="Persona o área asignada"
                  />
                </div>
              </div>
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
              {loading ? 'Guardando...' : 'Guardar Repuesto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
