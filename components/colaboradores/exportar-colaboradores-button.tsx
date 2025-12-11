'use client'

import { ExportButton } from '@/components/shared/export-button'
import {
  exportToExcel,
  exportToCSV,
  formatColaboradoresForExport,
  type ColaboradorExportData,
} from '@/lib/export'

type ExportarColaboradoresButtonProps = {
  colaboradores: ColaboradorExportData[]
}

export function ExportarColaboradoresButton({ colaboradores }: ExportarColaboradoresButtonProps) {
  const handleExportExcel = () => {
    const data = formatColaboradoresForExport(colaboradores)
    const fecha = new Date().toISOString().split('T')[0]
    exportToExcel(data, `colaboradores_${fecha}`, 'Colaboradores')
  }

  const handleExportCSV = () => {
    const data = formatColaboradoresForExport(colaboradores)
    const fecha = new Date().toISOString().split('T')[0]
    exportToCSV(data, `colaboradores_${fecha}`)
  }

  return (
    <ExportButton
      onExportExcel={handleExportExcel}
      onExportCSV={handleExportCSV}
      disabled={colaboradores.length === 0}
    />
  )
}
