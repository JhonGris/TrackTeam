// ============================================================================
// PDF REPORT GENERATION - Equipment Life Sheet (Hoja de Vida)
// ============================================================================

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts (using default for now)
// You can register custom fonts here if needed

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #1e40af',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  date: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    backgroundColor: '#eff6ff',
    padding: 6,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    width: '65%',
    color: '#1f2937',
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusBueno: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusRegular: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  statusMalo: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #f1f5f9',
    padding: 6,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #f1f5f9',
    padding: 6,
    fontSize: 9,
    backgroundColor: '#fafafa',
  },
  col1: { width: '15%' },
  col2: { width: '20%' },
  col3: { width: '25%' },
  col4: { width: '25%' },
  col5: { width: '15%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  observations: {
    backgroundColor: '#fefce8',
    padding: 10,
    borderRadius: 4,
    marginTop: 5,
    fontSize: 9,
    color: '#713f12',
  },
  noData: {
    color: '#9ca3af',
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
})

// ============================================================================
// TYPES
// ============================================================================

export type EquipoReportData = {
  id: string
  serial: string
  marca: string
  modelo: string
  tipo: string
  procesador: string
  ram: number
  almacenamiento: string
  gpu: string
  estadoSalud: string
  estado: string
  fechaAdquisicion: Date | string
  fechaGarantia?: Date | string | null
  departamento?: string | null
  ubicacion?: string | null
  observaciones?: string | null
  pantallas?: number
  resolucionPantalla?: string | null
  tieneTeclado?: boolean
  tieneMouse?: boolean
  otrosPeriferico?: string | null
  colaborador?: {
    nombre: string
    apellido: string
    cargo: string
    email: string
  } | null
  servicios: Array<{
    id: string
    tipo: string
    fechaServicio: Date | string
    problemas: string
    soluciones: string
    tiempoInvertido: number
    estadoResultante: string
  }>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatTiempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
}

function getStatusStyle(estado: string) {
  switch (estado) {
    case 'Bueno':
      return styles.statusBueno
    case 'Regular':
      return styles.statusRegular
    case 'Malo':
      return styles.statusMalo
    default:
      return {}
  }
}

// ============================================================================
// PDF DOCUMENT COMPONENT
// ============================================================================

export function EquipoHojaDeVidaPDF({ equipo }: { equipo: EquipoReportData }) {
  const generatedDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hoja de Vida del Equipo</Text>
          <Text style={styles.subtitle}>
            {equipo.marca} {equipo.modelo} | S/N: {equipo.serial}
          </Text>
          <Text style={styles.date}>Generado: {generatedDate}</Text>
        </View>

        {/* Two Column Layout - Equipment Info & Assignment */}
        <View style={styles.twoColumn}>
          {/* Equipment Info */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Información del Equipo</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Serial:</Text>
                <Text style={styles.value}>{equipo.serial}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tipo:</Text>
                <Text style={styles.value}>{equipo.tipo}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Marca/Modelo:</Text>
                <Text style={styles.value}>{equipo.marca} {equipo.modelo}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={[styles.statusBadge, getStatusStyle(equipo.estadoSalud)]}>
                  {equipo.estadoSalud}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Estado Operativo:</Text>
                <Text style={styles.value}>{equipo.estado}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Adquisición:</Text>
                <Text style={styles.value}>{formatDate(equipo.fechaAdquisicion)}</Text>
              </View>
              {equipo.fechaGarantia && (
                <View style={styles.row}>
                  <Text style={styles.label}>Garantía hasta:</Text>
                  <Text style={styles.value}>{formatDate(equipo.fechaGarantia)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Assignment Info */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Asignación</Text>
              {equipo.colaborador ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>Colaborador:</Text>
                    <Text style={styles.value}>
                      {equipo.colaborador.nombre} {equipo.colaborador.apellido}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Cargo:</Text>
                    <Text style={styles.value}>{equipo.colaborador.cargo}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{equipo.colaborador.email}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.noData}>Sin asignar</Text>
              )}
              {equipo.ubicacion && (
                <View style={styles.row}>
                  <Text style={styles.label}>Ubicación:</Text>
                  <Text style={styles.value}>{equipo.ubicacion}</Text>
                </View>
              )}
              {equipo.departamento && (
                <View style={styles.row}>
                  <Text style={styles.label}>Departamento:</Text>
                  <Text style={styles.value}>{equipo.departamento}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Technical Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💻 Especificaciones Técnicas</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Procesador:</Text>
                <Text style={styles.value}>{equipo.procesador}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Memoria RAM:</Text>
                <Text style={styles.value}>{equipo.ram} GB</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Almacenamiento:</Text>
                <Text style={styles.value}>{equipo.almacenamiento}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tarjeta Gráfica:</Text>
                <Text style={styles.value}>{equipo.gpu}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Peripherals */}
        {(equipo.pantallas || equipo.tieneTeclado || equipo.tieneMouse || equipo.otrosPeriferico) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖥️ Periféricos</Text>
            <View style={styles.twoColumn}>
              {equipo.pantallas && equipo.pantallas > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Pantallas:</Text>
                  <Text style={styles.value}>
                    {equipo.pantallas} {equipo.resolucionPantalla && `(${equipo.resolucionPantalla})`}
                  </Text>
                </View>
              )}
              {equipo.tieneTeclado && (
                <View style={styles.row}>
                  <Text style={styles.label}>Teclado:</Text>
                  <Text style={styles.value}>Incluido</Text>
                </View>
              )}
              {equipo.tieneMouse && (
                <View style={styles.row}>
                  <Text style={styles.label}>Mouse:</Text>
                  <Text style={styles.value}>Incluido</Text>
                </View>
              )}
            </View>
            {equipo.otrosPeriferico && (
              <View style={styles.row}>
                <Text style={styles.label}>Otros:</Text>
                <Text style={styles.value}>{equipo.otrosPeriferico}</Text>
              </View>
            )}
          </View>
        )}

        {/* Observations */}
        {equipo.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Observaciones</Text>
            <Text style={styles.observations}>{equipo.observaciones}</Text>
          </View>
        )}

        {/* Service History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Historial de Servicios ({equipo.servicios.length})</Text>
          {equipo.servicios.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Fecha</Text>
                <Text style={styles.col2}>Tipo</Text>
                <Text style={styles.col3}>Problema</Text>
                <Text style={styles.col3}>Solución</Text>
                <Text style={styles.col5}>Estado</Text>
              </View>
              {equipo.servicios.slice(0, 15).map((servicio, index) => (
                <View
                  key={servicio.id}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={styles.col1}>{formatShortDate(servicio.fechaServicio)}</Text>
                  <Text style={styles.col2}>{servicio.tipo}</Text>
                  <Text style={styles.col3}>
                    {servicio.problemas.length > 40
                      ? servicio.problemas.substring(0, 40) + '...'
                      : servicio.problemas}
                  </Text>
                  <Text style={styles.col3}>
                    {servicio.soluciones.length > 40
                      ? servicio.soluciones.substring(0, 40) + '...'
                      : servicio.soluciones}
                  </Text>
                  <Text style={styles.col5}>{servicio.estadoResultante}</Text>
                </View>
              ))}
              {equipo.servicios.length > 15 && (
                <Text style={styles.noData}>
                  ... y {equipo.servicios.length - 15} servicios más
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noData}>No hay servicios registrados</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          TrackTeam - Sistema de Gestión de Equipos | Documento generado automáticamente
        </Text>
      </Page>
    </Document>
  )
}
