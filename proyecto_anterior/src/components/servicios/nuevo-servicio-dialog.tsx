'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useInventario } from '@/contexts/InventarioContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ModalSelect,
  ModalSelectContent,
  ModalSelectItem,
  ModalSelectTrigger,
  ModalSelectValue,
} from '@/components/ui/modal-select'
import { Plus, X, Wrench, User, Camera, Trash2, Brain } from 'lucide-react'
import { DiagnosticoUpload } from '@/components/diagnostico/diagnostico-upload'
import { DiagnosticoResultados } from '@/components/diagnostico/diagnostico-resultados'

interface NuevoServicioDialogProps {
  children?: React.ReactNode
}

export function NuevoServicioDialog({ children }: NuevoServicioDialogProps) {
  const { agregarServicio, equipos } = useInventario()
  const [open, setOpen] = useState(false)

  // Estados del formulario
  const [equipoId, setEquipoId] = useState('')
  const [tipo, setTipo] = useState<'Correctivo' | 'Preventivo' | 'Instalación/Upgrade'>('Correctivo')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [tecnico, setTecnico] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [costo, setCosto] = useState('')
  const [fotografias, setFotografias] = useState<string[]>([])

  // Estados para diagnóstico con IA
  const [mostrarDiagnosticoIA, setMostrarDiagnosticoIA] = useState(false)
  const [resultadoDiagnostico, setResultadoDiagnostico] = useState<any>(null)

  // Validación
  const [errores, setErrores] = useState<Record<string, string>>({})

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!equipoId.trim()) {
      nuevosErrores.equipoId = 'Debe seleccionar un equipo'
    }

    if (!tecnico.trim()) {
      nuevosErrores.tecnico = 'El técnico es requerido'
    }

    if (!diagnostico.trim()) {
      nuevosErrores.diagnostico = 'El diagnóstico es requerido'
    }

    if (!descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es requerida'
    }

    if (costo && isNaN(Number(costo))) {
      nuevosErrores.costo = 'El costo debe ser un número válido'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const limpiarFormulario = () => {
    setEquipoId('')
    setTipo('Correctivo')
    setFecha(new Date().toISOString().split('T')[0])
    setTecnico('')
    setDiagnostico('')
    setDescripcion('')
    setCosto('')
    setFotografias([])
    setErrores({})
    setMostrarDiagnosticoIA(false)
    setResultadoDiagnostico(null)
  }

  // Función para manejar la carga de fotografías
  const handleFotografiaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Verificar límite de fotografías
    if (fotografias.length >= 10) {
      alert('Máximo 10 fotografías permitidas')
      event.target.value = ''
      return
    }

    // Convertir archivos a URLs base64
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && fotografias.length < 10) {
        // Verificar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`La imagen ${file.name} es muy grande. Máximo 5MB por imagen.`)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setFotografias(prev => {
              if (prev.length < 10) {
                return [...prev, e.target!.result as string]
              }
              return prev
            })
          }
        }
        reader.readAsDataURL(file)
      }
    })

    // Limpiar el input
    event.target.value = ''
  }

  // Función para eliminar una fotografía
  const eliminarFotografia = (index: number) => {
    setFotografias(prev => prev.filter((_, i) => i !== index))
  }

  // Función para manejar el resultado del análisis de IA
  const manejarAnalisisCompleto = (resultado: any) => {
    console.log('Análisis completado:', resultado)
    setResultadoDiagnostico(resultado)
  }

  // Función para aplicar el diagnóstico al formulario
  const aplicarDiagnosticoAFormulario = () => {
    if (!resultadoDiagnostico) return

    const { diagnostico } = resultadoDiagnostico

    // Rellenar campos del formulario
    setDiagnostico(diagnostico.resumen)
    
    // Construir descripción del trabajo basada en recomendaciones
    const descripcionGenerada = diagnostico.recomendaciones.join('. ') + '.'
    setDescripcion(descripcionGenerada)

    // Aplicar costo estimado (promedio)
    const costoPromedio = (diagnostico.costoEstimado.min + diagnostico.costoEstimado.max) / 2
    setCosto(costoPromedio.toFixed(2))

    // Cambiar a tipo correctivo si hay problemas críticos
    if (diagnostico.nivelUrgencia === 'Crítico') {
      setTipo('Correctivo')
    }

    // Cerrar el panel de diagnóstico
    setMostrarDiagnosticoIA(false)

    alert('Diagnóstico aplicado al formulario exitosamente')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    const equipoSeleccionado = equipos.find(eq => eq.id === equipoId)
    if (!equipoSeleccionado) return

    const nuevoServicio = {
      equipoId: equipoSeleccionado.id,
      equipoSerial: equipoSeleccionado.serial,
      equipoMarca: equipoSeleccionado.marca,
      equipoModelo: equipoSeleccionado.modelo,
      tipoMantenimiento: tipo,
      fechaServicio: fecha,
      tecnicoResponsable: tecnico.trim(),
      diagnostico: diagnostico.trim(),
      descripcionTrabajo: descripcion.trim(),
      costoReparacion: costo ? Number(costo) : 0,
      fotografias: fotografias.length > 0 ? fotografias : undefined,
      // Capturar usuario y departamento asignado en el momento del servicio
      usuarioAsignado: equipoSeleccionado.usuario || null,
      departamentoEnMomento: equipoSeleccionado.departamento || null
    }

    agregarServicio(nuevoServicio)
    limpiarFormulario()
    setOpen(false)
  }

  // Efecto para bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (typeof window === 'undefined') {
    return (
      <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4" />
        Nuevo Servicio
      </Button>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo Servicio
      </Button>

      {open && typeof window !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="modal-close-button"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Servicio</h2>
              <p className="text-gray-600 mt-1">
                Complete la información del servicio técnico a registrar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Servicio */}
              <div className="modal-form-section">
                <h3>
                  <User className="h-4 w-4" />
                  Seleccionar Equipo
                </h3>
                <div className="space-y-4">
                  {/* Equipo */}
                  <div className="modal-form-grid">
                    <div>
                      <Label htmlFor="equipo">Equipo *</Label>
                      <ModalSelect value={equipoId} onValueChange={setEquipoId}>
                        <ModalSelectTrigger className={`min-w-[400px] ${errores.equipoId ? 'border-red-500' : ''}`}>
                          <ModalSelectValue placeholder="Seleccionar equipo" />
                        </ModalSelectTrigger>
                        <ModalSelectContent className="min-w-[400px]">
                          {equipos.map((equipo) => (
                            <ModalSelectItem key={equipo.id} value={equipo.id}>
                              {equipo.usuario || 'Sin asignar'} - {equipo.serial} - {equipo.marca} {equipo.modelo}
                            </ModalSelectItem>
                          ))}
                        </ModalSelectContent>
                      </ModalSelect>
                      {errores.equipoId && <span className="text-sm text-red-500">{errores.equipoId}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del Servicio - Solo mostrar si hay equipo seleccionado */}
              {equipoId && (
                <div className="modal-form-section">
                  <h3>
                    <Wrench className="h-4 w-4" />
                    Detalles del Servicio
                  </h3>
                  <div className="space-y-4">
                    {/* Tipo */}
                    <div className="modal-form-grid">
                    <div>
                      <Label htmlFor="tipo">Tipo de Servicio *</Label>
                      <ModalSelect value={tipo} onValueChange={(value) => setTipo(value as any)}>
                        <ModalSelectTrigger>
                          <ModalSelectValue />
                        </ModalSelectTrigger>
                        <ModalSelectContent>
                          <ModalSelectItem value="Correctivo">Correctivo</ModalSelectItem>
                          <ModalSelectItem value="Preventivo">Preventivo</ModalSelectItem>
                          <ModalSelectItem value="Instalación/Upgrade">Instalación/Upgrade</ModalSelectItem>
                        </ModalSelectContent>
                      </ModalSelect>
                    </div>
                  </div>

                  {/* Fecha y Técnico */}
                  <div className="modal-form-grid">
                    <div>
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="tecnico">Técnico Asignado *</Label>
                      <Input
                        id="tecnico"
                        value={tecnico}
                        onChange={(e) => setTecnico(e.target.value)}
                        placeholder="Nombre del técnico"
                        className={errores.tecnico ? 'border-red-500' : ''}
                        required
                      />
                      {errores.tecnico && <span className="text-sm text-red-500">{errores.tecnico}</span>}
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="diagnostico">Diagnóstico *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrarDiagnosticoIA(!mostrarDiagnosticoIA)}
                        className="flex items-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        {mostrarDiagnosticoIA ? 'Cerrar' : 'Asistente IA'}
                      </Button>
                    </div>

                    {/* Panel de Diagnóstico con IA */}
                    {mostrarDiagnosticoIA && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Asistente de Diagnóstico con IA
                        </h4>
                        <p className="text-sm text-blue-700 mb-4">
                          Sube archivos de diagnóstico (HWMonitor, CrystalDiskInfo, GPU-Z, MemTest86, Event Viewer) 
                          y obtén un análisis automático con recomendaciones.
                        </p>
                        
                        {!resultadoDiagnostico ? (
                          <DiagnosticoUpload 
                            onAnalisisCompleto={manejarAnalisisCompleto}
                            equipoId={equipoId}
                            sintomas={diagnostico}
                          />
                        ) : (
                          <DiagnosticoResultados 
                            resultado={resultadoDiagnostico}
                            onAplicarAServicio={aplicarDiagnosticoAFormulario}
                          />
                        )}
                      </div>
                    )}

                    <Input
                      id="diagnostico"
                      value={diagnostico}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiagnostico(e.target.value)}
                      placeholder="Descripción del problema o diagnóstico inicial"
                      className={errores.diagnostico ? 'border-red-500' : ''}
                      required
                    />
                    {errores.diagnostico && <span className="text-sm text-red-500">{errores.diagnostico}</span>}
                  </div>

                  {/* Descripción del trabajo */}
                  <div>
                    <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
                    <Input
                      id="descripcion"
                      value={descripcion}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
                      placeholder="Detalle del trabajo realizado o por realizar"
                      className={errores.descripcion ? 'border-red-500' : ''}
                      required
                    />
                    {errores.descripcion && <span className="text-sm text-red-500">{errores.descripcion}</span>}
                  </div>

                  {/* Tiempo de Mantenimiento */}
                  <div>
                    <Label htmlFor="costo">Tiempo de Mantenimiento</Label>
                    <Input
                      id="costo"
                      type="time"
                      value={costo}
                      onChange={(e) => setCosto(e.target.value)}
                      placeholder="00:00"
                      className={errores.costo ? 'border-red-500' : ''}
                    />
                    {errores.costo && <span className="text-sm text-red-500">{errores.costo}</span>}
                    <p className="text-xs text-gray-500">Formato: horas y minutos</p>
                  </div>

                  {/* Fotografías */}
                  <div>
                    <Label htmlFor="fotografias">Fotografías del Servicio</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          id="fotografias"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFotografiaUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('fotografias')?.click()}
                          className="flex items-center gap-2"
                          disabled={fotografias.length >= 10}
                        >
                          <Camera className="h-4 w-4" />
                          Agregar Fotografías {fotografias.length > 0 && `(${fotografias.length}/10)`}
                        </Button>
                        <p className="text-xs text-gray-500">
                          Máximo 10 fotografías, 5MB cada una (JPG, PNG, GIF)
                        </p>
                      </div>

                      {/* Vista previa de fotografías */}
                      {fotografias.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {fotografias.map((foto, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={foto}
                                alt={`Fotografía ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => eliminarFotografia(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {fotografias.length === 0 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                          <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            No se han agregado fotografías del servicio
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Las fotografías ayudan a documentar el trabajo realizado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )}

              <div className="modal-form-actions">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!equipoId}>
                  Registrar Servicio
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
