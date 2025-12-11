'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'

interface DescargarPDFButtonProps {
  equipoId: string
  equipoNombre: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DescargarPDFButton({
  equipoId,
  equipoNombre,
  variant = 'outline',
  size = 'sm',
}: DescargarPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/equipos/${equipoId}/pdf`)
      
      if (!response.ok) {
        throw new Error('Error al generar el PDF')
      }

      // Get the blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `hoja-vida-${equipoNombre.replace(/\s+/g, '-')}.pdf`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar el PDF. Por favor intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isLoading ? 'Generando...' : 'Hoja de Vida'}
    </Button>
  )
}
