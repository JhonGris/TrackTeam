'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wrench, 
  Clock, 
  Calendar, 
  Monitor, 
  User,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { formatTiempoInvertido, getTipoServicioColor } from '@/types/servicios'
import type { ArchivoServicio } from '@/types/servicios'
import { ServicioCardActions } from './servicio-card-actions'
import { DiagnosticoVisualizador } from './diagnostico-visualizador'

type EquipoSelect = {
  id: string
  serial: string
  marca: string
  modelo: string
  colaborador: {
    nombre: string
    apellido: string
  } | null
}

type ServicioWithEquipo = {
  id: string
  equipoId: string
  tipo: string
  fechaServicio: Date
  problemas: string
  soluciones: string
  tiempoInvertido: number
  estadoResultante: string
  diagnosticoIA?: string | null
  archivos?: ArchivoServicio[]
  equipo: {
    id: string
    serial: string
    marca: string
    modelo: string
    tipo: string
    colaborador: {
      id: string
      nombre: string
      apellido: string
    } | null
  }
}

type ServicioCardProps = {
  servicio: ServicioWithEquipo
  equipos: EquipoSelect[]
}

export function ServicioCard({ servicio, equipos }: ServicioCardProps) {
  const [expanded, setExpanded] = useState(false)

  const estadoConfig = {
    'Bueno': { 
      color: 'bg-primary/10 text-primary border-primary/30',
      icon: CheckCircle2,
      label: 'Bueno'
    },
    'Regular': { 
      color: 'bg-accent/10 text-accent border-accent/30',
      icon: AlertCircle,
      label: 'Regular'
    },
    'Malo': { 
      color: 'bg-destructive/10 text-destructive border-destructive/30',
      icon: XCircle,
      label: 'Malo'
    },
  }[servicio.estadoResultante] || { 
    color: 'bg-muted text-muted-foreground', 
    icon: AlertCircle,
    label: servicio.estadoResultante 
  }

  const EstadoIcon = estadoConfig.icon

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {/* Header con tipo y acciones */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-none">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
          <Badge className={getTipoServicioColor(servicio.tipo as 'Preventivo' | 'Correctivo' | 'Limpieza' | 'Actualización de Software')}>
            {servicio.tipo}
          </Badge>
        </div>
        <ServicioCardActions servicio={servicio} equipos={equipos} />
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Fila 1: Equipo + Usuario */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Monitor className="h-4 w-4 text-secondary flex-shrink-0" />
            <span className="font-semibold truncate">
              {servicio.equipo.marca} {servicio.equipo.modelo}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ({servicio.equipo.serial})
            </span>
          </div>
          {servicio.equipo.colaborador && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[120px]">
                {servicio.equipo.colaborador.nombre} {servicio.equipo.colaborador.apellido.charAt(0)}.
              </span>
            </div>
          )}
        </div>

        {/* Fila 2: Fecha + Tiempo + Estado */}
        <div className="flex items-center justify-between gap-2 py-2 px-3 bg-muted/50 rounded-none">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDate(servicio.fechaServicio)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTiempoInvertido(servicio.tiempoInvertido)}</span>
            </span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-none text-xs font-medium ${estadoConfig.color}`}>
            <EstadoIcon className="h-3.5 w-3.5" />
            {estadoConfig.label}
          </div>
        </div>

        {/* Fila 3: Preview de problemas */}
        <div className="text-sm">
          <p className="text-muted-foreground line-clamp-2">
            <span className="font-medium text-foreground">Problema: </span>
            {servicio.problemas}
          </p>
        </div>

        {/* Contenido expandido */}
        {expanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Problemas */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" />
                Problemas Encontrados
              </h4>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-none whitespace-pre-wrap">
                {servicio.problemas}
              </p>
            </div>
            
            {/* Soluciones */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Soluciones Aplicadas
              </h4>
              <p className="text-sm text-foreground bg-primary/5 p-3 rounded-none whitespace-pre-wrap">
                {servicio.soluciones}
              </p>
            </div>
            
            {/* Diagnóstico IA */}
            {servicio.diagnosticoIA && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5" />
                  Diagnóstico IA
                </h4>
                <DiagnosticoVisualizador diagnosticoJSON={servicio.diagnosticoIA} />
              </div>
            )}
          </div>
        )}

        {/* Botón expandir */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Ocultar detalles
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Ver detalles
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
