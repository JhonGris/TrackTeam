'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface LoadingIndicatorProps {
  isLoading?: boolean
}

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null
  
  return (
    <div className="loading-indicator">
      <div className="loading-spinner"></div>
      <span>Cargando...</span>
    </div>
  )
}

// Hook personalizado para detectar cambios de ruta
export function useNavigation() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [previousPath, setPreviousPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== previousPath) {
      setIsNavigating(true)
      setPreviousPath(pathname)
      
      // Simular carga breve para mejor UX
      const timer = setTimeout(() => {
        setIsNavigating(false)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname, previousPath])

  return { isNavigating, currentPath: pathname }
}