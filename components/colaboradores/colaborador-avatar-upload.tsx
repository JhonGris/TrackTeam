'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'

interface ColaboradorAvatarUploadProps {
  colaboradorId: string
  fotoUrl: string | null
  initials: string
  nombreCompleto: string
}

export function ColaboradorAvatarUpload({
  colaboradorId,
  fotoUrl,
  initials,
  nombreCompleto,
}: ColaboradorAvatarUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [currentFoto, setCurrentFoto] = useState(fotoUrl)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate image
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tipoEntidad', 'colaborador')
      formData.append('entidadId', colaboradorId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir foto')
      }

      // The upload API returns { archivo: { ruta } } for colaborador uploads
      const uploadedUrl = result.url || result.archivo?.ruta
      if (!uploadedUrl) {
        throw new Error('No se obtuvo la URL del archivo subido')
      }

      // Update fotoUrl in the colaborador record
      const updateResponse = await fetch('/api/colaboradores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: colaboradorId,
          fotoUrl: uploadedUrl,
        }),
      })

      if (updateResponse.ok) {
        setCurrentFoto(uploadedUrl)
        router.refresh()
      }
    } catch (err) {
      console.error('Error uploading photo:', err)
      alert('Error al subir la foto')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className="relative h-14 w-14 flex-shrink-0 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer group"
      onClick={() => !uploading && fileInputRef.current?.click()}
      title="Haz clic para cambiar la foto"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : currentFoto ? (
        <img src={currentFoto} alt={nombreCompleto} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-semibold text-primary">{initials}</span>
      )}

      {/* Hover overlay */}
      {!uploading && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          <Camera className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  )
}
