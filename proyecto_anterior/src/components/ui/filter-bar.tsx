'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  children?: ReactNode
}

export function FilterBar({ 
  searchPlaceholder = "Buscar...", 
  searchValue = "",
  onSearchChange,
  children 
}: FilterBarProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {children && (
            <div className="flex items-center gap-3 flex-wrap">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}