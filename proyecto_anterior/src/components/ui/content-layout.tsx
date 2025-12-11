'use client'

import { ReactNode } from 'react'

interface ContentLayoutProps {
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  spacing?: 'tight' | 'normal' | 'loose'
}

export function ContentLayout({ 
  children, 
  maxWidth = 'sm',
  spacing = 'loose' 
}: ContentLayoutProps) {
  const maxWidthClasses = {
    xs: 'max-w-3xl',
    sm: 'max-w-4xl',
    md: 'max-w-5xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  }
  
  const spacingClasses = {
    tight: 'space-y-4',
    normal: 'space-y-6',
    loose: 'space-y-8'
  }

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 sm:px-8 lg:px-10`}>
      <div className={spacingClasses[spacing]}>
        {children}
      </div>
    </div>
  )
}