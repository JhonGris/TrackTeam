'use client'

import { useActionState, useEffect, useState } from 'react'
import { createServicio } from '@/app/servicios/actions'
import { analizarArchivos, type DiagnosticoIA, type Metricas } from '@/app/servicios/diagnostico-actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, FileText, CheckSquare, Cpu, ChevronLeft } from 'lucide-react'
import { DiagnosticoUpload } from './diagnostico-upload'
import { DiagnosticoResultados } from './diagnostico-resultados'

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

type PlantillaSelect = {
  id: string
  nombre: string
  tipo: string
  problemasTipicos: string
  solucionesTipicas: string
  tiempoEstimado: number
  checklist: string | null
}

type NuevoServicioDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipos: EquipoSelect[]
  plantillas?: PlantillaSelect[]
  defaultEquipoId?: string
}

export function NuevoServicioDialog({ 
  open, 
  onOpenChange, 
  equipos,
  plantillas = [],
  defaultEquipoId 
}: NuevoServicioDialogProps) {
  const [state, formAction, isPending] = useActionState(createServicio, null)
  
  // Estado para los campos pre-llenados por plantilla
  const [tipo, setTipo] = useState('Preventivo')
  const [problemas, setProblemas] = useState('')
  const [soluciones, setSoluciones] = useState('')
  const [tiempoEstimado, setTiempoEstimado] = useState('')
  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [checklistCompleted, setChecklistCompleted] = useState<Record<number, boolean>>({})
  
  // Estado para diagnóstico IA
  const [vistaActual, setVistaActual] = useState<'formulario' | 'diagnostico-upload' | 'diagnostico-resultado'>('formulario')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosticoIA, setDiagnosticoIA] = useState<DiagnosticoIA | null>(null)
  const [metricasIA, setMetricasIA] = useState<Metricas | null>(null)
  const [archivosAnalizados, setArchivosAnalizados] = useState<string[]>([])
  const [diagnosticoJSON, setDiagnosticoJSON] = useState('')

  // Manejar análisis de archivos
  async function handleAnalizar(formData: FormData) {
    setIsAnalyzing(true)
    try {
      const resultado = await analizarArchivos(formData)
      
      if (resultado.success && resultado.diagnostico && resultado.metricas) {
        setDiagnosticoIA(resultado.diagnostico)
        setMetricasIA(resultado.metricas)
        setArchivosAnalizados(resultado.archivosAnalizados || [])
        setVistaActual('diagnostico-resultado')
        
        // Guardar JSON del diagnóstico para el formulario
        setDiagnosticoJSON(JSON.stringify({
          diagnostico: resultado.diagnostico,
          metricas: resultado.metricas,
          archivosAnalizados: resultado.archivosAnalizados,
          timestamp: new Date().toISOString()
        }))
      } else {
        alert(resultado.error || 'Error al analizar archivos')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar los archivos')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Aplicar diagnóstico al formulario
  function handleAplicarDiagnostico() {
    if (!diagnosticoIA) return
    
    // Pre-llenar campos basado en el diagnóstico
    const problemasTexto = diagnosticoIA.problemas
      .map(p => `[${p.severidad}] ${p.componente}: ${p.problema}${p.detalle ? ` - ${p.detalle}` : ''}`)
      .join('\n')
    
    const solucionesTexto = diagnosticoIA.recomendaciones.join('\n')
    
    setProblemas(problemasTexto || 'Sin problemas detectados')
    setSoluciones(solucionesTexto)
    setTiempoEstimado(String(diagnosticoIA.tiempoEstimado.horas * 60))
    
    // Determinar tipo de servicio basado en urgencia
    if (diagnosticoIA.nivelUrgencia === 'Crítico') {
      setTipo('Correctivo')
    } else if (diagnosticoIA.nivelUrgencia === 'Medio') {
      setTipo('Preventivo')
    }
    
    setVistaActual('formulario')
  }

  // Aplicar plantilla
  function handlePlantillaChange(plantillaId: string) {
    if (plantillaId === 'none') {
      // Resetear campos
      setProblemas('')
      setSoluciones('')
      setTiempoEstimado('')
      setChecklistItems([])
      setChecklistCompleted({})
      return
    }

    const plantilla = plantillas.find(p => p.id === plantillaId)
    if (plantilla) {
      setTipo(plantilla.tipo)
      setProblemas(plantilla.problemasTipicos)
      setSoluciones(plantilla.solucionesTipicas)
      setTiempoEstimado(plantilla.tiempoEstimado.toString())
      
      // Parsear checklist
      if (plantilla.checklist) {
        try {
          const items = JSON.parse(plantilla.checklist)
          if (Array.isArray(items)) {
            setChecklistItems(items)
            setChecklistCompleted({})
          }
        } catch {
          setChecklistItems([])
        }
      } else {
        setChecklistItems([])
      }
    }
  }

  // Cerrar dialog al éxito
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
      // Resetear estado
      setProblemas('')
      setSoluciones('')
      setTiempoEstimado('')
      setChecklistItems([])
      setChecklistCompleted({})
      setDiagnosticoIA(null)
      setMetricasIA(null)
      setArchivosAnalizados([])
      setDiagnosticoJSON('')
      setVistaActual('formulario')
    }
  }, [state?.success, onOpenChange])

  // Resetear al cerrar
  useEffect(() => {
    if (!open) {
      setVistaActual('formulario')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vistaActual === 'diagnostico-upload' && (
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setVistaActual('formulario')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                Asistente de Diagnóstico IA
              </div>
            )}
            {vistaActual === 'diagnostico-resultado' && (
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setVistaActual('diagnostico-upload')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                Resultado del Diagnóstico
              </div>
            )}
            {vistaActual === 'formulario' && 'Nuevo Servicio Técnico'}
          </DialogTitle>
          <DialogDescription>
            {vistaActual === 'formulario' && 'Registra un nuevo servicio técnico o mantenimiento'}
            {vistaActual === 'diagnostico-upload' && 'Carga archivos de HWMonitor, CrystalDiskInfo, GPU-Z, etc. para generar un diagnóstico automático'}
            {vistaActual === 'diagnostico-resultado' && 'Revisa el diagnóstico y aplícalo al servicio'}
          </DialogDescription>
        </DialogHeader>

        {/* Vista: Carga de archivos para diagnóstico */}
        {vistaActual === 'diagnostico-upload' && (
          <DiagnosticoUpload 
            onAnalizar={handleAnalizar}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* Vista: Resultados del diagnóstico */}
        {vistaActual === 'diagnostico-resultado' && diagnosticoIA && metricasIA && (
          <DiagnosticoResultados
            diagnostico={diagnosticoIA}
            metricas={metricasIA}
            archivosAnalizados={archivosAnalizados}
            onAplicar={handleAplicarDiagnostico}
            onCerrar={() => setVistaActual('formulario')}
          />
        )}

        {/* Vista: Formulario principal */}
        {vistaActual === 'formulario' && (
        <form action={formAction} className="space-y-4">
          {state?.message && !state.success && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {state.message}
            </div>
          )}

          {/* Botón de Asistente IA */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Asistente de Diagnóstico IA</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Analiza archivos de diagnóstico y genera recomendaciones automáticas
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900"
                onClick={() => setVistaActual('diagnostico-upload')}
              >
                <Cpu className="h-4 w-4 mr-2" />
                Usar IA
              </Button>
            </div>
            {diagnosticoIA && (
              <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-800 dark:text-green-300 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                Diagnóstico aplicado: {diagnosticoIA.resumen.substring(0, 60)}...
              </div>
            )}
          </div>

          {/* Selector de Plantilla */}
          {plantillas.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <Label className="font-medium">Usar Plantilla (opcional)</Label>
              </div>
              <Select onValueChange={handlePlantillaChange} defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla para pre-llenar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin plantilla</SelectItem>
                  {plantillas.map((plantilla) => (
                    <SelectItem key={plantilla.id} value={plantilla.id}>
                      {plantilla.nombre} ({plantilla.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                La plantilla pre-llenará los campos, pero puedes modificarlos
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipo */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="equipoId">Equipo *</Label>
              <Select name="equipoId" defaultValue={defaultEquipoId} required>
                <SelectTrigger id="equipoId">
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipos.map((equipo) => (
                    <SelectItem key={equipo.id} value={equipo.id}>
                      {equipo.marca} {equipo.modelo} - {equipo.serial}
                      {equipo.colaborador && 
                        ` (${equipo.colaborador.nombre} ${equipo.colaborador.apellido})`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.equipoId && (
                <p className="text-sm text-destructive">{state.errors.equipoId}</p>
              )}
            </div>

            {/* Tipo de servicio */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Servicio *</Label>
              <Select name="tipo" value={tipo} onValueChange={setTipo} required>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventivo">Preventivo</SelectItem>
                  <SelectItem value="Correctivo">Correctivo</SelectItem>
                  <SelectItem value="Limpieza">Limpieza</SelectItem>
                  <SelectItem value="Actualización de Software">Actualización de Software</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.tipo && (
                <p className="text-sm text-destructive">{state.errors.tipo}</p>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fechaServicio">Fecha del Servicio *</Label>
              <Input
                id="fechaServicio"
                name="fechaServicio"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
              {state?.errors?.fechaServicio && (
                <p className="text-sm text-destructive">{state.errors.fechaServicio}</p>
              )}
            </div>

            {/* Tiempo invertido */}
            <div className="space-y-2">
              <Label htmlFor="tiempoInvertido">Tiempo Invertido (minutos) *</Label>
              <Input
                id="tiempoInvertido"
                name="tiempoInvertido"
                type="number"
                min="1"
                placeholder="30, 60, 120..."
                value={tiempoEstimado}
                onChange={(e) => setTiempoEstimado(e.target.value)}
                required
              />
              {state?.errors?.tiempoInvertido && (
                <p className="text-sm text-destructive">{state.errors.tiempoInvertido}</p>
              )}
            </div>

            {/* Estado resultante */}
            <div className="space-y-2">
              <Label htmlFor="estadoResultante">Estado Resultante *</Label>
              <Select name="estadoResultante" defaultValue="Bueno" required>
                <SelectTrigger id="estadoResultante">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bueno">Bueno</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Malo">Malo</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.estadoResultante && (
                <p className="text-sm text-destructive">{state.errors.estadoResultante}</p>
              )}
            </div>

            {/* Problemas */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="problemas">Problemas Encontrados *</Label>
              <Textarea
                id="problemas"
                name="problemas"
                placeholder="Describe los problemas encontrados en el equipo..."
                rows={3}
                value={problemas}
                onChange={(e) => setProblemas(e.target.value)}
                required
              />
              {state?.errors?.problemas && (
                <p className="text-sm text-destructive">{state.errors.problemas}</p>
              )}
            </div>

            {/* Soluciones */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="soluciones">Soluciones Aplicadas *</Label>
              <Textarea
                id="soluciones"
                name="soluciones"
                placeholder="Describe las soluciones aplicadas..."
                rows={3}
                value={soluciones}
                onChange={(e) => setSoluciones(e.target.value)}
                required
              />
              {state?.errors?.soluciones && (
                <p className="text-sm text-destructive">{state.errors.soluciones}</p>
              )}
            </div>

            {/* Checklist de la plantilla */}
            {checklistItems.length > 0 && (
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist de Tareas
                </Label>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Checkbox
                        id={`checklist-${index}`}
                        checked={checklistCompleted[index] || false}
                        onCheckedChange={(checked) => 
                          setChecklistCompleted(prev => ({
                            ...prev,
                            [index]: checked === true
                          }))
                        }
                      />
                      <Label 
                        htmlFor={`checklist-${index}`}
                        className={`cursor-pointer ${checklistCompleted[index] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    {Object.values(checklistCompleted).filter(Boolean).length} de {checklistItems.length} completadas
                  </p>
                </div>
              </div>
            )}

            {/* Checkbox enviar correo */}
            <div className="md:col-span-2 flex items-center space-x-3 rounded-lg border p-4 bg-muted/30">
              <Checkbox 
                id="enviarCorreo" 
                name="enviarCorreo" 
                defaultChecked 
              />
              <div className="flex-1 space-y-1">
                <Label 
                  htmlFor="enviarCorreo" 
                  className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Enviar reporte por correo al colaborador
                </Label>
                <p className="text-xs text-muted-foreground">
                  Se enviará un correo con el detalle del servicio al colaborador asignado al equipo
                </p>
              </div>
            </div>
          </div>

          {/* Campo oculto para diagnóstico IA */}
          {diagnosticoJSON && (
            <input type="hidden" name="diagnosticoIA" value={diagnosticoJSON} />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Servicio'}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
