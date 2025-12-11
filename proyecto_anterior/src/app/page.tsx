'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { useInventario } from '@/contexts/InventarioContext'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Users, TrendingUp, Monitor, Calendar, Wrench } from 'lucide-react'

export default function Dashboard() {
  const { equipos, usuarios, servicios } = useInventario()

  // Calcular estadísticas reales
  const stats = {
    totalEquipos: equipos.length,
    equiposActivos: equipos.filter(e => e.estado === 'Activo').length,
    equiposEnReparacion: equipos.filter(e => e.estado === 'En Reparación').length,
    equiposDescontinuados: equipos.filter(e => e.estado === 'Descontinuado').length,
    totalUsuarios: usuarios.filter(u => u.estado === 'activo').length,
    ultimosServicios: servicios.filter(s => {
      const fechaServicio = new Date(s.fechaServicio)
      const mesActual = new Date()
      return fechaServicio.getMonth() === mesActual.getMonth() && 
             fechaServicio.getFullYear() === mesActual.getFullYear()
    }).length
  }

  // Equipos recientes (últimos 5)
  const equiposRecientes = equipos
    .sort((a, b) => new Date(b.fechaAdquisicion || 0).getTime() - new Date(a.fechaAdquisicion || 0).getTime())
    .slice(0, 3)

  // Actividad reciente (últimos servicios y equipos)
  const actividadReciente = [
    ...servicios.slice(0, 2).map(s => ({
      tipo: 'servicio',
      icono: 'wrench',
      titulo: `Servicio ${s.tipoMantenimiento}`,
      detalle: `${s.equipoSerial || 'Equipo'} • ${new Date(s.fechaServicio).toLocaleDateString()}`,
      color: s.tipoMantenimiento === 'Preventivo' ? 'green' : 'orange'
    })),
    ...equipos.slice(0, 1).map(e => ({
      tipo: 'equipo',
      icono: 'monitor',
      titulo: 'Equipo registrado',
      detalle: `${e.serial} • ${e.usuario || 'Sin asignar'}`,
      color: 'blue'
    }))
  ].slice(0, 3)

  const alertas = [
    equipos.filter(e => e.estado === 'En Reparación').length > 0 && {
      mensaje: `${equipos.filter(e => e.estado === 'En Reparación').length} equipos en reparación`,
      tipo: 'warning'
    },
    usuarios.filter(u => u.estado === 'activo' && !equipos.some(e => e.usuario === u.nombre)).length > 0 && {
      mensaje: `${usuarios.filter(u => u.estado === 'activo' && !equipos.some(e => e.usuario === u.nombre)).length} usuarios sin equipos asignados`,
      tipo: 'info'
    }
  ].filter(Boolean)

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        <div className="page-header-section">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Resumen general del inventario y servicios técnicos</p>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="alert-container">
            {alertas.map((alerta, index) => alerta && (
              <div key={index} className="alert-item alert-warning">
                <div className="alert-icon bg-amber-500">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="alert-content">{alerta.mensaje}</div>
              </div>
            ))}
          </div>
        )}

        {/* Estadísticas principales */}
        <div className="stats-grid">
          <div className="stat-card" style={{'--accent-color': '#3b82f6', '--icon-bg': '#dbeafe', '--icon-color': '#3b82f6'} as React.CSSProperties}>
            <div className="stat-card-icon">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="stat-card-title">Total Equipos</div>
            <div className="stat-card-value">{stats.totalEquipos}</div>
            <div className="stat-card-subtitle">{stats.equiposActivos} activos</div>
          </div>

          <div className="stat-card" style={{'--accent-color': '#f59e0b', '--icon-bg': '#fef3c7', '--icon-color': '#f59e0b'} as React.CSSProperties}>
            <div className="stat-card-icon">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="stat-card-title">En Reparación</div>
            <div className="stat-card-value">{stats.equiposEnReparacion}</div>
            <div className="stat-card-subtitle">Requieren atención</div>
          </div>

          <div className="stat-card" style={{'--accent-color': '#10b981', '--icon-bg': '#d1fae5', '--icon-color': '#10b981'} as React.CSSProperties}>
            <div className="stat-card-icon">
              <Users className="h-5 w-5" />
            </div>
            <div className="stat-card-title">Usuarios Activos</div>
            <div className="stat-card-value">{stats.totalUsuarios}</div>
            <div className="stat-card-subtitle">En el sistema</div>
          </div>

          <div className="stat-card" style={{'--accent-color': '#8b5cf6', '--icon-bg': '#ede9fe', '--icon-color': '#8b5cf6'} as React.CSSProperties}>
            <div className="stat-card-icon">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="stat-card-title">Servicios Este Mes</div>
            <div className="stat-card-value">{stats.ultimosServicios}</div>
            <div className="stat-card-subtitle">Completados</div>
          </div>
        </div>

        {/* Contenido principal en 2 columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Columna Izquierda - Equipos Recientes */}
          <div className="improved-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Equipos Recientes
              </h3>
            </div>
            
            <div className="space-y-4">
              {equiposRecientes.map((equipo) => (
                <div key={equipo.id} className="improved-card">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="data-item mb-2">
                        <span className="data-label">Serial</span>
                        <span className="data-value">{equipo.serial}</span>
                      </div>
                      <div className="data-item mb-2">
                        <span className="data-label">Modelo</span>
                        <span className="data-value">{equipo.marca} {equipo.modelo}</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Usuario</span>
                        <span className="data-value">{equipo.usuario}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${
                      equipo.estado === 'Activo' ? 'status-success' : 'status-neutral'
                    }`}>
                      {equipo.estado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Resumen y Actividad */}
          <div className="space-y-6">
            {/* Resumen Rápido */}
            <div className="improved-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Resumen Rápido
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="data-item">
                  <span className="data-label">Equipos Activos</span>
                  <span className="data-value text-green-600 font-bold">{stats.equiposActivos}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">En Reparación</span>
                  <span className="data-value text-orange-600 font-bold">{stats.equiposEnReparacion}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Descontinuados</span>
                  <span className="data-value text-gray-500 font-bold">{stats.equiposDescontinuados}</span>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="improved-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  Actividad Reciente
                </h3>
              </div>
              
              <div className="space-y-4">
                {actividadReciente.length > 0 ? (
                  actividadReciente.map((actividad, index) => (
                    <div key={index} className={`alert-item ${
                      actividad.color === 'green' ? 'alert-success' : 
                      actividad.color === 'orange' ? 'alert-warning' : 'alert-info'
                    }`}>
                      <div className={`alert-icon ${
                        actividad.color === 'green' ? 'bg-green-500' : 
                        actividad.color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {actividad.icono === 'wrench' ? (
                          <Wrench className="h-4 w-4 text-white" />
                        ) : (
                          <Monitor className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="alert-content">
                        <p className="font-semibold">{actividad.titulo}</p>
                        <p className="text-xs text-gray-600">{actividad.detalle}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}