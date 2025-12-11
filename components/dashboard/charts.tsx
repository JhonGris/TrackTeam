'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ============================================================================
// DASHBOARD CHARTS - Client Components for Recharts
// ============================================================================

// Colors
const COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
}

const STATUS_COLORS = [COLORS.green, COLORS.yellow, COLORS.red]
const SERVICE_COLORS = [COLORS.blue, COLORS.red, COLORS.green, COLORS.purple]

// ============================================================================
// EQUIPMENT HEALTH PIE CHART
// ============================================================================

type HealthChartData = {
  name: string
  value: number
  color: string
}

interface EquipmentHealthChartProps {
  data: {
    bueno: number
    regular: number
    malo: number
  }
}

export function EquipmentHealthChart({ data }: EquipmentHealthChartProps) {
  const chartData: HealthChartData[] = [
    { name: 'Bueno', value: data.bueno, color: COLORS.green },
    { name: 'Regular', value: data.regular, color: COLORS.yellow },
    { name: 'Malo', value: data.malo, color: COLORS.red },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Equipos</CardTitle>
          <CardDescription>Distribución por estado de salud</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No hay datos disponibles
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Equipos</CardTitle>
        <CardDescription>Distribución por estado de salud</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} equipos`, '']}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SERVICE TYPES BAR CHART
// ============================================================================

type ServiceTypeData = {
  name: string
  cantidad: number
  color: string
}

interface ServiceTypesChartProps {
  data: {
    preventivo: number
    correctivo: number
    limpieza: number
    software: number
  }
}

export function ServiceTypesChart({ data }: ServiceTypesChartProps) {
  const chartData: ServiceTypeData[] = [
    { name: 'Preventivo', cantidad: data.preventivo, color: COLORS.blue },
    { name: 'Correctivo', cantidad: data.correctivo, color: COLORS.red },
    { name: 'Limpieza', cantidad: data.limpieza, color: COLORS.green },
    { name: 'Software', cantidad: data.software, color: COLORS.purple },
  ]

  const total = Object.values(data).reduce((a, b) => a + b, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Servicio</CardTitle>
          <CardDescription>Distribución por tipo de mantenimiento</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No hay servicios registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Servicio</CardTitle>
        <CardDescription>Distribución por tipo de mantenimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip 
              formatter={(value: number) => [`${value} servicios`, '']}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SERVICES TREND LINE CHART
// ============================================================================

type MonthlyServiceData = {
  mes: string
  servicios: number
}

interface ServicesTrendChartProps {
  data: MonthlyServiceData[]
}

export function ServicesTrendChart({ data }: ServicesTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Servicios</CardTitle>
          <CardDescription>Servicios realizados por mes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No hay datos de tendencia
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Servicios</CardTitle>
        <CardDescription>Servicios realizados por mes (últimos 6 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorServicios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value: number) => [`${value} servicios`, '']}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Area
              type="monotone"
              dataKey="servicios"
              stroke={COLORS.blue}
              strokeWidth={2}
              fill="url(#colorServicios)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// EQUIPMENT TYPE PIE CHART
// ============================================================================

interface EquipmentTypeChartProps {
  data: {
    desktop: number
    portatil: number
  }
}

export function EquipmentTypeChart({ data }: EquipmentTypeChartProps) {
  const chartData = [
    { name: 'Desktop', value: data.desktop, color: COLORS.blue },
    { name: 'Portátil', value: data.portatil, color: COLORS.cyan },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Equipo</CardTitle>
          <CardDescription>Desktop vs Portátiles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No hay equipos registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Equipo</CardTitle>
        <CardDescription>Desktop vs Portátiles</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} equipos`, '']}
              contentStyle={{ borderRadius: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// UPCOMING MAINTENANCE CHART
// ============================================================================

type UpcomingMaintenanceData = {
  semana: string
  cantidad: number
}

interface UpcomingMaintenanceChartProps {
  data: UpcomingMaintenanceData[]
}

export function UpcomingMaintenanceChart({ data }: UpcomingMaintenanceChartProps) {
  if (data.length === 0 || data.every(d => d.cantidad === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Mantenimientos</CardTitle>
          <CardDescription>Mantenimientos programados</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No hay mantenimientos programados
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Mantenimientos</CardTitle>
        <CardDescription>Mantenimientos programados por semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="semana" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value: number) => [`${value} mantenimientos`, '']}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Bar dataKey="cantidad" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
