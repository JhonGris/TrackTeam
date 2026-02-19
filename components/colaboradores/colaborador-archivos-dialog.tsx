'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface ColaboradorArchivosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaboradorId: string
  colaboradorNombre: string
  archivos: Archivo[]
}

export function ColaboradorArchivosDialog({
  open,
  onOpenChange,
  colaboradorId,
  colaboradorNombre,
  archivos,
}: ColaboradorArchivosDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Documentos del Colaborador</DialogTitle>
          <DialogDescription>
            {colaboradorNombre} — Administra los documentos adjuntos
          </DialogDescription>
        </DialogHeader>
        <FileUploader
          tipoEntidad="colaborador"
          entidadId={colaboradorId}
          archivos={archivos}
          maxFiles={15}
        />
      </DialogContent>
    </Dialog>
  )
}
