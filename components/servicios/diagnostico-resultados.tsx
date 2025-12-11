'use client'

import { AlertTriangle, CheckCircle, Info, Clock, DollarSign, Cpu, HardDrive, Thermometer, MemoryStick } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { DiagnosticoIA, Metricas } from '@/app/servicios/diagnostico-actions'

interface DiagnosticoResultadosProps {
  diagnostico: DiagnosticoIA
  metricas: Metricas
  archivosAnalizados: string[]
  onAplicar: () => void
  onCerrar: () => void
}

function SeveridadIcon({ severidad }: { severidad: string }) {
  switch (severidad) {
    case 'Crítico':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'Advertencia':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

function UrgenciaBadge({ nivel }: { nivel: string }) {
  const colores = {
    'Crítico': 'bg-red-100 text-red-800 border-red-200',
    'Medio': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Normal': 'bg-green-100 text-green-800 border-green-200',
  }
  
  return (
    <Badge className={`${colores[nivel as keyof typeof colores]} border`}>
      {nivel}
    </Badge>
  )
}

export function DiagnosticoResultados({
  diagnostico,
  metricas,
  archivosAnalizados,
  onAplicar,
  onCerrar,
}: DiagnosticoResultadosProps) {
  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <div className="space-y-4">
      {/* Resumen principal */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
        {diagnostico.nivelUrgencia === 'Crítico' ? (
          <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
        ) : diagnostico.nivelUrgencia === 'Medio' ? (
          <AlertTriangle className="h-6 w-6 text-yellow-500 mt-0.5" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">Diagnóstico</h4>
            <UrgenciaBadge nivel={diagnostico.nivelUrgencia} />
          </div>
          <p className="text-sm text-muted-foreground">{diagnostico.resumen}</p>
        </div>
      </div>

      {/* Archivos analizados */}
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">Archivos analizados:</span>{' '}
        {archivosAnalizados.join(', ')}
      </div>

      {/* Métricas detectadas */}
      {(metricas.temperaturas.length > 0 || metricas.discos.length > 0 || metricas.gpu.length > 0 || metricas.ram.length > 0) && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Métricas Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 space-y-3">
            {/* Temperaturas */}
            {metricas.temperaturas.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Temperaturas
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {metricas.temperaturas.map((temp, i) => (
                    <div 
                      key={i} 
                      className={`text-xs p-2 rounded ${
                        temp.estado === 'critico' 
                          ? 'bg-red-50 text-red-700' 
                          : temp.estado === 'advertencia' 
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-green-50 text-green-700'
                      }`}
                    >
                      <span className="font-medium">{temp.componente}:</span> {temp.valor}°C
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discos */}
            {metricas.discos.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> Discos
                </h5>
                <div className="space-y-2">
                  {metricas.discos.map((disco, i) => (
                    <div 
                      key={i} 
                      className={`text-xs p-2 rounded ${
                        disco.salud === 'Bad' 
                          ? 'bg-red-50 text-red-700' 
                          : disco.salud === 'Caution' || disco.salud === 'Warning'
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-green-50 text-green-700'
                      }`}
                    >
                      <div className="font-medium">{disco.modelo}</div>
                      <div className="flex gap-3 mt-1">
                        <span>Salud: {disco.salud}</span>
                        {disco.temperatura > 0 && <span>Temp: {disco.temperatura}°C</span>}
                        {disco.horasUso > 0 && <span>Horas: {disco.horasUso.toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAM */}
            {metricas.ram.length > 0 && metricas.ram[0].estado !== 'Unknown' && (
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <MemoryStick className="h-3 w-3" /> Memoria RAM
                </h5>
                {metricas.ram.map((mem, i) => (
                  <div 
                    key={i}
                    className={`text-xs p-2 rounded ${
                      mem.estado === 'FALLO' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    Estado: {mem.estado} | Errores: {mem.erroresDetectados} | Pasadas: {mem.pasadas}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Problemas detectados */}
      {diagnostico.problemas.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Problemas Detectados ({diagnostico.problemas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="space-y-2">
              {diagnostico.problemas.map((problema, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    problema.severidad === 'Crítico'
                      ? 'bg-red-50 border-red-200'
                      : problema.severidad === 'Advertencia'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <SeveridadIcon severidad={problema.severidad} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{problema.componente}</span>
                        <Badge variant="outline" className="text-xs">
                          {problema.severidad}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{problema.problema}</p>
                      {problema.detalle && (
                        <p className="text-xs text-muted-foreground mt-1">{problema.detalle}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <ul className="space-y-1.5">
            {diagnostico.recomendaciones.map((rec, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Estimaciones */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Costo Estimado</span>
            </div>
            <p className="text-sm font-semibold">
              {formatearPrecio(diagnostico.costoEstimado.min)} - {formatearPrecio(diagnostico.costoEstimado.max)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Tiempo Estimado</span>
            </div>
            <p className="text-sm font-semibold">{diagnostico.tiempoEstimado.descripcion}</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCerrar} className="flex-1">
          Cerrar
        </Button>
        <Button onClick={onAplicar} className="flex-1">
          Aplicar al Servicio
        </Button>
      </div>
    </div>
  )
}
