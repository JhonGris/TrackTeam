'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Cpu, Thermometer, HardDrive, MemoryStick, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface DiagnosticoVisualizadorProps {
  diagnosticoJSON: string
}

export function DiagnosticoVisualizador({ diagnosticoJSON }: DiagnosticoVisualizadorProps) {
  const [expandido, setExpandido] = useState(false)
  
  let datos: {
    diagnostico?: {
      resumen: string
      nivelUrgencia: string
      problemas: Array<{ componente: string; problema: string; severidad: string; detalle?: string }>
      recomendaciones: string[]
      costoEstimado: { min: number; max: number; moneda: string }
      tiempoEstimado: { horas: number; descripcion: string }
    }
    metricas?: {
      temperaturas: Array<{ componente: string; valor: number; estado: string }>
      discos: Array<{ modelo: string; salud: string; temperatura: number; horasUso: number }>
      gpu: Array<{ nombre: string; temperatura: number }>
      ram: Array<{ estado: string; erroresDetectados: number }>
    }
    archivosAnalizados?: string[]
    timestamp?: string
  } | null = null
  
  try {
    datos = JSON.parse(diagnosticoJSON)
  } catch {
    return null
  }
  
  if (!datos || !datos.diagnostico) return null
  
  const { diagnostico, metricas, archivosAnalizados } = datos
  
  const urgenciaColores = {
    'Crítico': 'bg-red-100 text-red-800 border-red-300',
    'Medio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Normal': 'bg-green-100 text-green-800 border-green-300',
  }

  return (
    <div className="mt-3 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-between gap-2 h-auto py-2"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">Diagnóstico IA</span>
          <Badge className={`text-xs ${urgenciaColores[diagnostico.nivelUrgencia as keyof typeof urgenciaColores] || urgenciaColores.Normal}`}>
            {diagnostico.nivelUrgencia}
          </Badge>
        </div>
        {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {expandido && (
        <div className="mt-3 space-y-3 text-sm">
          {/* Resumen */}
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <p className="text-muted-foreground">{diagnostico.resumen}</p>
            </CardContent>
          </Card>
          
          {/* Archivos analizados */}
          {archivosAnalizados && archivosAnalizados.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Archivos:</span> {archivosAnalizados.join(', ')}
            </div>
          )}
          
          {/* Métricas */}
          {metricas && (
            <div className="grid grid-cols-2 gap-2">
              {/* Temperaturas */}
              {metricas.temperaturas && metricas.temperaturas.length > 0 && (
                <Card className="col-span-2">
                  <CardContent className="py-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                      <Thermometer className="h-3 w-3" /> Temperaturas
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {metricas.temperaturas.map((temp, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className={`text-xs ${
                            temp.estado === 'critico' ? 'border-red-300 bg-red-50 text-red-700' :
                            temp.estado === 'advertencia' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                            'border-green-300 bg-green-50 text-green-700'
                          }`}
                        >
                          {temp.componente}: {temp.valor}°C
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Discos */}
              {metricas.discos && metricas.discos.length > 0 && (
                <Card>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                      <HardDrive className="h-3 w-3" /> Discos
                    </div>
                    {metricas.discos.map((disco, i) => (
                      <div key={i} className="text-xs">
                        <span className={`font-medium ${
                          disco.salud === 'Bad' ? 'text-red-600' :
                          disco.salud === 'Caution' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {disco.salud}
                        </span>
                        <span className="text-muted-foreground"> - {disco.modelo?.substring(0, 20)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* RAM */}
              {metricas.ram && metricas.ram.length > 0 && metricas.ram[0].estado !== 'Unknown' && (
                <Card>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                      <MemoryStick className="h-3 w-3" /> RAM
                    </div>
                    {metricas.ram.map((mem, i) => (
                      <Badge 
                        key={i}
                        variant="outline"
                        className={`text-xs ${
                          mem.estado === 'FALLO' ? 'border-red-300 bg-red-50 text-red-700' :
                          'border-green-300 bg-green-50 text-green-700'
                        }`}
                      >
                        {mem.estado} ({mem.erroresDetectados} errores)
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Problemas */}
          {diagnostico.problemas && diagnostico.problemas.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Problemas Detectados
              </h5>
              <div className="space-y-1">
                {diagnostico.problemas.map((prob, i) => (
                  <div 
                    key={i}
                    className={`text-xs p-2 rounded ${
                      prob.severidad === 'Crítico' ? 'bg-red-50 text-red-700' :
                      prob.severidad === 'Advertencia' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <span className="font-medium">{prob.componente}:</span> {prob.problema}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recomendaciones */}
          {diagnostico.recomendaciones && diagnostico.recomendaciones.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Recomendaciones
              </h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {diagnostico.recomendaciones.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-primary">•</span> {rec}
                  </li>
                ))}
                {diagnostico.recomendaciones.length > 3 && (
                  <li className="text-xs text-muted-foreground/70">
                    +{diagnostico.recomendaciones.length - 3} más...
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Estimaciones */}
          <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div>
              <span className="font-medium">Costo Est.:</span>{' '}
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(diagnostico.costoEstimado.min)} - 
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(diagnostico.costoEstimado.max)}
            </div>
            <div>
              <span className="font-medium">Tiempo:</span> {diagnostico.tiempoEstimado.descripcion}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
