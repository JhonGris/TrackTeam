import Link from "next/link"
import { Monitor, Laptop, Wrench, AlertTriangle, Users, Plus, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { 
  EquipmentHealthChart, 
  ServiceTypesChart, 
  ServicesTrendChart,
  EquipmentTypeChart,
  UpcomingMaintenanceChart 
} from "@/components/dashboard/charts"

// ============================================================================
// SERVER COMPONENT - Dashboard (Next.js 16)
// ============================================================================

async function getStats() {
  const [
    totalEquipos,
    equiposBuenos,
    equiposRegulares,
    equiposMalos,
    totalColaboradores,
    totalServicios,
    serviciosRecientes,
    desktops,
    portatiles
  ] = await Promise.all([
    prisma.equipo.count(),
    prisma.equipo.count({ where: { estadoSalud: 'Bueno' } }),
    prisma.equipo.count({ where: { estadoSalud: 'Regular' } }),
    prisma.equipo.count({ where: { estadoSalud: 'Malo' } }),
    prisma.colaborador.count(),
    prisma.servicioTecnico.count(),
    prisma.servicioTecnico.count({
      where: {
        fechaServicio: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 días
        }
      }
    }),
    prisma.equipo.count({ where: { tipo: 'Desktop' } }),
    prisma.equipo.count({ where: { tipo: 'Portátil' } }),
  ])

  return {
    totalEquipos,
    equiposBuenos,
    equiposRegulares,
    equiposMalos,
    totalColaboradores,
    totalServicios,
    serviciosRecientes,
    desktops,
    portatiles
  }
}

async function getServiceTypeCounts() {
  const [preventivo, correctivo, limpieza, software] = await Promise.all([
    prisma.servicioTecnico.count({ where: { tipo: 'Preventivo' } }),
    prisma.servicioTecnico.count({ where: { tipo: 'Correctivo' } }),
    prisma.servicioTecnico.count({ where: { tipo: 'Limpieza' } }),
    prisma.servicioTecnico.count({ where: { tipo: 'Actualización de Software' } }),
  ])
  return { preventivo, correctivo, limpieza, software }
}

async function getServicesTrend() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const servicios = await prisma.servicioTecnico.findMany({
    where: {
      fechaServicio: { gte: sixMonthsAgo }
    },
    select: { fechaServicio: true }
  })

  // Group by month
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthCounts: Record<string, number> = {}
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`
    monthCounts[key] = 0
  }

  // Count services
  servicios.forEach(s => {
    const date = new Date(s.fechaServicio)
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`
    if (key in monthCounts) {
      monthCounts[key]++
    }
  })

  return Object.entries(monthCounts).map(([mes, servicios]) => ({ mes, servicios }))
}

async function getUpcomingMaintenance() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const fourWeeksLater = new Date(today)
  fourWeeksLater.setDate(fourWeeksLater.getDate() + 28)

  const mantenimientos = await prisma.mantenimientoProgramado.findMany({
    where: {
      fechaProgramada: { gte: today, lte: fourWeeksLater },
      estado: 'Pendiente'
    },
    select: { fechaProgramada: true }
  })

  // Group by week
  const weeks = ['Esta semana', 'Próxima', 'En 2 sem.', 'En 3 sem.']
  const weekCounts = [0, 0, 0, 0]

  mantenimientos.forEach(m => {
    const date = new Date(m.fechaProgramada)
    const daysUntil = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const weekIndex = Math.min(Math.floor(daysUntil / 7), 3)
    weekCounts[weekIndex]++
  })

  return weeks.map((semana, index) => ({ semana, cantidad: weekCounts[index] }))
}

async function getRecentEquipos() {
  return prisma.equipo.findMany({
    take: 5,
    orderBy: { fechaAdquisicion: 'desc' },
    include: {
      colaborador: {
        select: { nombre: true, apellido: true }
      }
    }
  })
}

async function getRecentServicios() {
  return prisma.servicioTecnico.findMany({
    take: 5,
    orderBy: { fechaServicio: 'desc' },
    include: {
      equipo: {
        select: { marca: true, modelo: true, serial: true }
      }
    }
  })
}

export default async function DashboardPage() {
  const [stats, equiposRecientes, serviciosRecientes, serviceTypes, servicesTrend, upcomingMaintenance] = await Promise.all([
    getStats(),
    getRecentEquipos(),
    getRecentServicios(),
    getServiceTypeCounts(),
    getServicesTrend(),
    getUpcomingMaintenance(),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del inventario y servicios técnicos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-none p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalEquipos}</p>
          <p className="text-sm text-muted-foreground">Total Equipos</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.equiposBuenos}</p>
          <p className="text-sm text-primary/70">Estado Bueno</p>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{stats.totalColaboradores}</p>
          <p className="text-sm text-secondary/70">Colaboradores</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-accent">{stats.serviciosRecientes}</p>
          <p className="text-sm text-accent/70">Servicios (30 días)</p>
        </div>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Estado General del Inventario</CardTitle>
          <CardDescription>
            Distribución por estado de salud de los equipos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Bueno: {stats.equiposBuenos}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Regular: {stats.equiposRegulares}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm">Malo: {stats.equiposMalos}</span>
            </div>
          </div>
          {stats.totalEquipos > 0 && (
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
              <div 
                className="bg-green-500" 
                style={{ width: `${(stats.equiposBuenos / stats.totalEquipos) * 100}%` }}
              />
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(stats.equiposRegulares / stats.totalEquipos) * 100}%` }}
              />
              <div 
                className="bg-red-500" 
                style={{ width: `${(stats.equiposMalos / stats.totalEquipos) * 100}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EquipmentHealthChart 
          data={{
            bueno: stats.equiposBuenos,
            regular: stats.equiposRegulares,
            malo: stats.equiposMalos
          }} 
        />
        <ServiceTypesChart data={serviceTypes} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ServicesTrendChart data={servicesTrend} />
        </div>
        <EquipmentTypeChart 
          data={{
            desktop: stats.desktops,
            portatil: stats.portatiles
          }} 
        />
      </div>

      <UpcomingMaintenanceChart data={upcomingMaintenance} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Equipos Recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Equipos Recientes</CardTitle>
              <CardDescription>
                Últimos equipos agregados al sistema
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/equipos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {equiposRecientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Monitor className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay equipos registrados
                </p>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href="/equipos">Agregar primer equipo</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {equiposRecientes.map((equipo) => (
                  <div
                    key={equipo.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {equipo.marca} {equipo.modelo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Serial: {equipo.serial}
                        {equipo.colaborador && ` • ${equipo.colaborador.nombre} ${equipo.colaborador.apellido}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        equipo.estadoSalud === 'Bueno'
                          ? 'default'
                          : equipo.estadoSalud === 'Regular'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {equipo.estadoSalud}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servicios Recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Servicios Recientes</CardTitle>
              <CardDescription>
                Últimos servicios técnicos realizados
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/servicios">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {serviciosRecientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay servicios registrados
                </p>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href="/servicios">Registrar servicio</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {serviciosRecientes.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{servicio.tipo}</p>
                      <p className="text-xs text-muted-foreground">
                        {servicio.equipo.marca} {servicio.equipo.modelo} •{' '}
                        {new Date(servicio.fechaServicio).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        servicio.estadoResultante === 'Bueno'
                          ? 'default'
                          : servicio.estadoResultante === 'Regular'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {servicio.estadoResultante}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/equipos">
                <Monitor className="h-5 w-5" />
                <span className="text-sm">Gestionar Equipos</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/servicios">
                <Wrench className="h-5 w-5" />
                <span className="text-sm">Ver Servicios</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/colaboradores">
                <Users className="h-5 w-5" />
                <span className="text-sm">Colaboradores</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/calendario">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Calendario</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/equipos?estado=Malo">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Equipos Críticos</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
