'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'

type ExportButtonProps = {
  onExportExcel: () => Promise<void> | void
  onExportCSV: () => Promise<void> | void
  disabled?: boolean
  label?: string
}

export function ExportButton({ 
  onExportExcel, 
  onExportCSV, 
  disabled = false,
  label = 'Exportar'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (exportFn: () => Promise<void> | void) => {
    setIsExporting(true)
    try {
      await exportFn()
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Error al exportar los datos')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exportando...' : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport(onExportExcel)}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Exportar a Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(onExportCSV)}>
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Exportar a CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
