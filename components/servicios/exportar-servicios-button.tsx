'use client'

import { ExportButton } from '@/components/shared/export-button'
import {
  exportToExcel,
  exportToCSV,
  formatServiciosForExport,
  type ServicioExportData,
} from '@/lib/export'

type ExportarServiciosButtonProps = {
  servicios: ServicioExportData[]
}

export function ExportarServiciosButton({ servicios }: ExportarServiciosButtonProps) {
  const handleExportExcel = () => {
    const data = formatServiciosForExport(servicios)
    const fecha = new Date().toISOString().split('T')[0]
    exportToExcel(data, `servicios_tecnicos_${fecha}`, 'Servicios')
  }

  const handleExportCSV = () => {
    const data = formatServiciosForExport(servicios)
    const fecha = new Date().toISOString().split('T')[0]
    exportToCSV(data, `servicios_tecnicos_${fecha}`)
  }

  return (
    <ExportButton
      onExportExcel={handleExportExcel}
      onExportCSV={handleExportCSV}
      disabled={servicios.length === 0}
    />
  )
}
