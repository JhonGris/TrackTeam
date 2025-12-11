'use client'

import { ExportButton } from '@/components/shared/export-button'
import {
  exportToExcel,
  exportToCSV,
  formatRepuestosForExport,
  type RepuestoExportData,
} from '@/lib/export'

type ExportarRepuestosButtonProps = {
  repuestos: RepuestoExportData[]
}

export function ExportarRepuestosButton({ repuestos }: ExportarRepuestosButtonProps) {
  const handleExportExcel = () => {
    const data = formatRepuestosForExport(repuestos)
    const fecha = new Date().toISOString().split('T')[0]
    exportToExcel(data, `inventario_repuestos_${fecha}`, 'Inventario')
  }

  const handleExportCSV = () => {
    const data = formatRepuestosForExport(repuestos)
    const fecha = new Date().toISOString().split('T')[0]
    exportToCSV(data, `inventario_repuestos_${fecha}`)
  }

  return (
    <ExportButton
      onExportExcel={handleExportExcel}
      onExportCSV={handleExportCSV}
      disabled={repuestos.length === 0}
    />
  )
}
