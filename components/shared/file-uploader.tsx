'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Loader2,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

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

type TipoEntidad = 'equipo' | 'servicio' | 'colaborador'

interface FileUploaderProps {
  tipoEntidad: TipoEntidad
  entidadId: string
  archivos: Archivo[]
  onUploadComplete?: () => void
  maxFiles?: number
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />
  }
  if (tipo === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />
  }
  return <FileText className="h-5 w-5 text-gray-500" />
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FileUploader({
  tipoEntidad,
  entidadId,
  archivos,
  onUploadComplete,
  maxFiles = 10,
}: FileUploaderProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>('')
  
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [archivoToDelete, setArchivoToDelete] = useState<Archivo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max files
    if (archivos.length + files.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Subiendo ${i + 1} de ${files.length}: ${file.name}`)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('tipoEntidad', tipoEntidad)
        formData.append('entidadId', entidadId)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Error al subir archivo')
        }
      }

      router.refresh()
      onUploadComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivos')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!archivoToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/upload?id=${archivoToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Error al eliminar')
      }

      router.refresh()
      onUploadComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar archivo')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
      setArchivoToDelete(null)
    }
  }

  const handlePreview = (archivo: Archivo) => {
    setPreviewUrl(archivo.ruta)
    setPreviewName(archivo.nombre)
    setPreviewOpen(true)
  }

  const handleDownload = (archivo: Archivo) => {
    const link = document.createElement('a')
    link.href = archivo.ruta
    link.download = archivo.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          disabled={isUploading || archivos.length >= maxFiles}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {archivos.length >= maxFiles
                ? `Máximo de ${maxFiles} archivos alcanzado`
                : 'Haz clic o arrastra archivos aquí'}
            </p>
            <p className="text-xs text-muted-foreground">
              Imágenes, PDF, Word, Excel (máx. 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File List */}
      {archivos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Archivos ({archivos.length}/{maxFiles})
          </Label>
          <div className="grid gap-2">
            {archivos.map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50"
              >
                {archivo.esImagen ? (
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={archivo.ruta}
                      alt={archivo.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {getFileIcon(archivo.tipo)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{archivo.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(archivo.tamanio)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {(archivo.esImagen || archivo.tipo === 'application/pdf') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(archivo)}
                      title="Vista previa"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(archivo)}
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setArchivoToDelete(archivo)
                      setDeleteOpen(true)
                    }}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Dialog (Images + PDFs) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewName.toLowerCase().endsWith('.pdf') || previewUrl.includes('.pdf') ? (
              <iframe
                src={previewUrl}
                title={previewName}
                className="w-full h-[75vh] rounded border"
              />
            ) : (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt={previewName}
                  className="max-h-[70vh] object-contain rounded"
                />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo {archivoToDelete?.nombre} será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
