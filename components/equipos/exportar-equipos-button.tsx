'use client'

import { ExportButton } from '@/components/shared/export-button'
import {
  exportToExcel,
  exportToCSV,
  formatEquiposForExport,
  type EquipoExportData,
} from '@/lib/export'

type ExportarEquiposButtonProps = {
  equipos: EquipoExportData[]
}

export function ExportarEquiposButton({ equipos }: ExportarEquiposButtonProps) {
  const handleExportExcel = () => {
    const data = formatEquiposForExport(equipos)
    const fecha = new Date().toISOString().split('T')[0]
    exportToExcel(data, `equipos_${fecha}`, 'Equipos')
  }

  const handleExportCSV = () => {
    const data = formatEquiposForExport(equipos)
    const fecha = new Date().toISOString().split('T')[0]
    exportToCSV(data, `equipos_${fecha}`)
  }

  return (
    <ExportButton
      onExportExcel={handleExportExcel}
      onExportCSV={handleExportCSV}
      disabled={equipos.length === 0}
    />
  )
}
