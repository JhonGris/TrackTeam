import { Suspense } from 'react'
import { Calendar } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NuevoMantenimientoButton } from '@/components/calendario/nuevo-mantenimiento-button'
import { MantenimientosCalendario } from '@/components/calendario/mantenimientos-calendario'
import { ProximosMantenimientos } from '@/components/calendario/proximos-mantenimientos'

// ============================================================================
// SERVER COMPONENT - Calendario Page (Next.js 16)
// ============================================================================

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const in7Days = new Date()
  in7Days.setDate(in7Days.getDate() + 7)

  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)

  const [
    totalProgramados,
    pendientes,
    proximos7Dias,
    vencidos,
    completadosMes
  ] = await Promise.all([
    prisma.mantenimientoProgramado.count(),
    prisma.mantenimientoProgramado.count({
      where: { estado: 'Pendiente' }
    }),
    prisma.mantenimientoProgramado.count({
      where: {
        fechaProgramada: { gte: today, lte: in7Days },
        estado: 'Pendiente'
      }
    }),
    prisma.mantenimientoProgramado.count({
      where: {
        fechaProgramada: { lt: today },
        estado: 'Pendiente'
      }
    }),
    prisma.mantenimientoProgramado.count({
      where: {
        estado: 'Completado',
        fechaCompletado: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      }
    })
  ])

  return {
    totalProgramados,
    pendientes,
    proximos7Dias,
    vencidos,
    completadosMes
  }
}

async function getMantenimientos() {
  // Get current month range
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return prisma.mantenimientoProgramado.findMany({
    where: {
      fechaProgramada: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    include: {
      equipo: {
        select: {
          id: true,
          serial: true,
          marca: true,
          modelo: true,
          tipo: true,
          colaborador: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        }
      }
    },
    orderBy: { fechaProgramada: 'asc' }
  })
}

async function getEquipos() {
  return prisma.equipo.findMany({
    select: {
      id: true,
      serial: true,
      marca: true,
      modelo: true,
      colaborador: {
        select: {
          nombre: true,
          apellido: true
        }
      }
    },
    orderBy: [{ marca: 'asc' }, { modelo: 'asc' }]
  })
}

export default async function CalendarioPage() {
  const [stats, mantenimientos, equipos] = await Promise.all([
    getStats(),
    getMantenimientos(),
    getEquipos()
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendario de Mantenimientos</h1>
            <p className="text-muted-foreground">
              Programa y gestiona los mantenimientos de tus equipos
            </p>
          </div>
        </div>
        <NuevoMantenimientoButton equipos={equipos} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-none p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalProgramados}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{stats.pendientes}</p>
          <p className="text-sm text-secondary/70">Pendientes</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-accent">{stats.proximos7Dias}</p>
          <p className="text-sm text-accent/70">Próximos 7 días</p>
        </div>
        <div className={`rounded-none p-4 text-center ${stats.vencidos > 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-card border'}`}>
          <p className={`text-2xl font-bold ${stats.vencidos > 0 ? 'text-destructive' : ''}`}>{stats.vencidos}</p>
          <p className={`text-sm ${stats.vencidos > 0 ? 'text-destructive/70' : 'text-muted-foreground'}`}>Vencidos</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.completadosMes}</p>
          <p className="text-sm text-primary/70">Completados</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vista de Calendario</CardTitle>
            <CardDescription>
              Mantenimientos programados para este mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
              <MantenimientosCalendario 
                mantenimientos={mantenimientos} 
                equipos={equipos}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Mantenimientos</CardTitle>
            <CardDescription>
              Mantenimientos de los próximos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />
              ))}
            </div>}>
              <ProximosMantenimientos />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
