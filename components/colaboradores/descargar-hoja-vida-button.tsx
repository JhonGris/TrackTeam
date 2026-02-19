'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'

interface DescargarHojaVidaButtonProps {
  colaboradorId: string
  colaboradorNombre: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DescargarHojaVidaButton({
  colaboradorId,
  colaboradorNombre,
  variant = 'outline',
  size = 'sm',
}: DescargarHojaVidaButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/colaboradores/${colaboradorId}/pdf`)

      if (!response.ok) {
        throw new Error('Error al generar el PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `hoja-vida-${colaboradorNombre.replace(/\s+/g, '-')}.pdf`
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
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      {isLoading ? 'Generando...' : 'Hoja de Vida'}
    </Button>
  )
}
