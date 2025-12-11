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
import { Camera } from 'lucide-react'
import { FileUploader } from '@/components/shared/file-uploader'
import type { ArchivoServicio } from '@/types/servicios'

interface ServicioArchivosDialogProps {
  servicioId: string
  servicioDescripcion: string
  archivos: ArchivoServicio[]
}

/**
 * Dialog for managing service photos/attachments
 * Allows uploading photos of the technical service (before/after, issues found, etc.)
 */
export function ServicioArchivosDialog({ 
  servicioId, 
  servicioDescripcion,
  archivos 
}: ServicioArchivosDialogProps) {
  const [open, setOpen] = useState(false)

  // Format archivos to ensure createdAt is a string
  const archivosFormateados = archivos.map(a => ({
    ...a,
    createdAt: typeof a.createdAt === 'string' 
      ? a.createdAt 
      : new Date(a.createdAt).toISOString(),
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Camera className="h-4 w-4" />
          Fotos {archivos.length > 0 && `(${archivos.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registro Fotográfico del Servicio</DialogTitle>
          <DialogDescription>
            {servicioDescripcion} - Fotos del antes/después, problemas encontrados, etc.
          </DialogDescription>
        </DialogHeader>
        <FileUploader
          tipoEntidad="servicio"
          entidadId={servicioId}
          archivos={archivosFormateados}
          maxFiles={20}
        />
      </DialogContent>
    </Dialog>
  )
}
