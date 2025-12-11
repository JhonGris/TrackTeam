'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Paperclip } from 'lucide-react'
import { FileUploader } from '@/components/shared/file-uploader'

type Archivo = {
  id: string
  nombre: string
  tipo: string
  tamanio: number
  ruta: string
  esImagen: boolean
  descripcion?: string | null
  createdAt: string
}

interface EquipoArchivosDialogProps {
  equipoId: string
  equipoNombre: string
  archivos: Archivo[]
}

export function EquipoArchivosDialog({ 
  equipoId, 
  equipoNombre,
  archivos 
}: EquipoArchivosDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Paperclip className="h-4 w-4" />
          Archivos {archivos.length > 0 && `(${archivos.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Archivos del Equipo</DialogTitle>
          <DialogDescription>
            {equipoNombre} - Administra los archivos adjuntos
          </DialogDescription>
        </DialogHeader>
        <FileUploader
          tipoEntidad="equipo"
          entidadId={equipoId}
          archivos={archivos}
          maxFiles={10}
        />
      </DialogContent>
    </Dialog>
  )
}
