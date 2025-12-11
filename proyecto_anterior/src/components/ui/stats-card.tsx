'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  valueColor?: string
}

export function StatCard({ title, value, subtitle, icon, valueColor }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700 tracking-wide">{title}</CardTitle>
        {icon && (
          <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold mb-2 ${valueColor || 'text-gray-900'}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-600 font-medium">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
}

export function StatsGrid({ children, columns = 2 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }
  
  return (
    <div className={`grid ${gridCols[columns]} gap-8 mb-10`}>
      {children}
    </div>
  )
}