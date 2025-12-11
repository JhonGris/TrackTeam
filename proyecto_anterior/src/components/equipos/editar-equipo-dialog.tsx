'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
import { useInventario, type Equipo } from '@/contexts/InventarioContext'
import { Edit, Monitor, Settings, MapPin, X, Plus, History } from 'lucide-react'
import { HistorialAsignaciones } from './historial-asignaciones'

interface EditarEquipoDialogProps {
  equipo: Equipo
  onEquipoEditado?: (equipo: any) => void
  trigger?: React.ReactNode
}

export function EditarEquipoDialog({ equipo, onEquipoEditado, trigger }: EditarEquipoDialogProps) {
  const { actualizarEquipo, usuarios } = useInventario()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tabActiva, setTabActiva] = useState<'detalles' | 'historial'>('detalles')
  const [formData, setFormData] = useState({
    serial: equipo.serial,
    marca: equipo.marca,
    modelo: equipo.modelo,
    tipo: equipo.tipo,
    procesador: equipo.procesador || '',
    colaborador: equipo.usuario || 'sin-asignar',
    fechaAdquisicion: equipo.fechaAdquisicion || '',
    estado: equipo.estado || 'Activo',
    observaciones: equipo.observaciones || ''
  })

  // Estados para componentes dinámicos
  const [ramModules, setRamModules] = useState([
    { id: '1', marca: '', capacidadGb: '', velocidad: '', slot: '' }
  ])
  
  const [discosDuros, setDiscosDuros] = useState([
    { id: '1', marca: '', serial: '', tipo: '', capacidadGb: '' }
  ])
  
  const [gpu, setGpu] = useState({
    marca: '',
    modelo: '',
    serial: '',
    memoriaGb: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Funciones para manejar RAM
  const addRamModule = () => {
    const newId = (ramModules.length + 1).toString()
    setRamModules(prev => [...prev, { id: newId, marca: '', capacidadGb: '', velocidad: '', slot: '' }])
  }

  const removeRamModule = (id: string) => {
    if (ramModules.length > 1) {
      setRamModules(prev => prev.filter(ram => ram.id !== id))
    }
  }

  const updateRamModule = (id: string, field: string, value: string) => {
    setRamModules(prev => prev.map(ram => 
      ram.id === id ? { ...ram, [field]: value } : ram
    ))
  }

  // Funciones para manejar Discos Duros
  const addDiscoDuro = () => {
    const newId = (discosDuros.length + 1).toString()
    setDiscosDuros(prev => [...prev, { id: newId, marca: '', serial: '', tipo: '', capacidadGb: '' }])
  }

  const removeDiscoDuro = (id: string) => {
    if (discosDuros.length > 1) {
      setDiscosDuros(prev => prev.filter(disco => disco.id !== id))
    }
  }

  const updateDiscoDuro = (id: string, field: string, value: string) => {
    setDiscosDuros(prev => prev.map(disco => 
      disco.id === id ? { ...disco, [field]: value } : disco
    ))
  }

  // Función para manejar GPU
  const updateGpu = (field: string, value: string) => {
    setGpu(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log('=== CARGANDO DATOS DEL EQUIPO EN EDICIÓN ===')
    console.log('Equipo completo:', equipo)
    console.log('RAM:', equipo.ram)
    console.log('RAM Detalle:', equipo.ramDetalle)
    console.log('Almacenamiento:', equipo.almacenamientoGb, equipo.almacenamientoTipo)
    console.log('Discos Detalle:', equipo.discosDetalle)
    console.log('Tarjeta Video:', equipo.tarjetaVideo)
    console.log('GPU Detalle:', equipo.gpuDetalle)
    
    // Actualizar datos básicos del formulario
    setFormData({
      serial: equipo.serial,
      marca: equipo.marca,
      modelo: equipo.modelo,
      tipo: equipo.tipo,
      procesador: equipo.procesador || '',
      colaborador: equipo.usuario || 'sin-asignar',
      fechaAdquisicion: equipo.fechaAdquisicion || '',
      estado: equipo.estado || 'Activo',
      observaciones: equipo.observaciones || ''
    })

    // Cargar RAM desde datos detallados si existen, sino usar datos simples
    if (equipo.ramDetalle && Array.isArray(equipo.ramDetalle) && equipo.ramDetalle.length > 0) {
      console.log('Cargando RAM desde detalles JSON')
      setRamModules(equipo.ramDetalle.map((ram: any, index: number) => ({
        id: (index + 1).toString(),
        marca: ram.marca || '',
        capacidadGb: ram.capacidadGb?.toString() || '',
        velocidad: ram.velocidad || '',
        slot: ram.slot || `Slot ${index + 1}`
      })))
    } else if (equipo.ram && equipo.ram > 0) {
      console.log('Cargando RAM desde dato simple:', equipo.ram)
      setRamModules([{
        id: '1',
        marca: '',
        capacidadGb: equipo.ram.toString(),
        velocidad: '',
        slot: 'Slot 1'
      }])
    } else {
      console.log('No hay RAM para cargar')
      setRamModules([{ id: '1', marca: '', capacidadGb: '', velocidad: '', slot: '' }])
    }

    // Cargar discos desde datos detallados si existen, sino usar datos simples
    if (equipo.discosDetalle && Array.isArray(equipo.discosDetalle) && equipo.discosDetalle.length > 0) {
      console.log('Cargando discos desde detalles JSON')
      setDiscosDuros(equipo.discosDetalle.map((disco: any, index: number) => ({
        id: (index + 1).toString(),
        marca: disco.marca || '',
        serial: disco.serial || '',
        tipo: disco.tipo || '',
        capacidadGb: disco.capacidadGb?.toString() || ''
      })))
    } else if (equipo.almacenamientoGb && equipo.almacenamientoGb > 0) {
      console.log('Cargando almacenamiento desde dato simple:', equipo.almacenamientoGb, equipo.almacenamientoTipo)
      setDiscosDuros([{
        id: '1',
        marca: '',
        serial: '',
        tipo: equipo.almacenamientoTipo || 'SSD',
        capacidadGb: equipo.almacenamientoGb.toString()
      }])
    } else {
      console.log('No hay almacenamiento para cargar')
      setDiscosDuros([{ id: '1', marca: '', serial: '', tipo: '', capacidadGb: '' }])
    }

    // Cargar GPU desde datos detallados si existen, sino intentar parsear string
    if (equipo.gpuDetalle && typeof equipo.gpuDetalle === 'object') {
      console.log('Cargando GPU desde detalles JSON')
      setGpu({
        marca: equipo.gpuDetalle.marca || '',
        modelo: equipo.gpuDetalle.modelo || '',
        serial: equipo.gpuDetalle.serial || '',
        memoriaGb: equipo.gpuDetalle.memoriaGb?.toString() || '0'
      })
    } else if (equipo.tarjetaVideo && equipo.tarjetaVideo !== 'Integrada' && equipo.tarjetaVideo !== '') {
      console.log('Cargando GPU desde string:', equipo.tarjetaVideo)
      // Intentar parsear el string de tarjeta de video (ej: "NVIDIA GeForce RTX 3060 8GB")
      const videoMatch = equipo.tarjetaVideo.match(/^(.+?)\s+(.+?)(?:\s+(\d+)GB)?$/)
      if (videoMatch) {
        setGpu({
          marca: videoMatch[1] || '',
          modelo: videoMatch[2] || '',
          serial: '',
          memoriaGb: videoMatch[3] || '0'
        })
      } else {
        setGpu({
          marca: equipo.tarjetaVideo,
          modelo: '',
          serial: '',
          memoriaGb: '0'
        })
      }
    } else {
      console.log('No hay GPU para cargar o es integrada')
      setGpu({ marca: '', modelo: '', serial: '', memoriaGb: '' })
    }
    console.log('=== FIN CARGA DE DATOS ===')
  }, [equipo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos requeridos
    if (!formData.serial || !formData.marca || !formData.modelo || !formData.tipo) {
      alert('Por favor complete todos los campos obligatorios marcados con *')
      return
    }

    console.log('=== GUARDANDO EQUIPO ===')
    console.log('RAM Modules:', ramModules)
    console.log('Discos Duros:', discosDuros)
    console.log('GPU:', gpu)

    // Calcular RAM total sumando todos los módulos
    const ramTotal = ramModules
      .filter(ram => ram.capacidadGb && ram.capacidadGb !== '')
      .reduce((total, ram) => total + (parseInt(ram.capacidadGb) || 0), 0)
    
    console.log('RAM Total calculado:', ramTotal)
    console.log('RAM modules filtrados:', ramModules.filter(ram => ram.capacidadGb && ram.capacidadGb !== ''))

    // Preparar detalles de RAM para guardar
    const ramDetalle = ramModules
      .filter(ram => ram.capacidadGb && ram.capacidadGb !== '')
      .map(ram => ({
        marca: ram.marca || '',
        capacidadGb: parseInt(ram.capacidadGb) || 0,
        velocidad: ram.velocidad || '',
        slot: ram.slot || ''
      }))

    // Obtener el primer disco duro para almacenamiento principal
    const discoPrincipal = discosDuros.find(disco => disco.capacidadGb && disco.capacidadGb !== '')
    console.log('Disco principal encontrado:', discoPrincipal)
    
    const almacenamientoTipo = discoPrincipal?.tipo || 'SSD'
    const almacenamientoGb = discoPrincipal?.capacidadGb ? parseInt(discoPrincipal.capacidadGb) : 256

    // Preparar detalles de discos para guardar
    const discosDetalle = discosDuros
      .filter(disco => disco.capacidadGb && disco.capacidadGb !== '')
      .map(disco => ({
        marca: disco.marca || '',
        serial: disco.serial || '',
        tipo: disco.tipo || '',
        capacidadGb: parseInt(disco.capacidadGb) || 0
      }))

    console.log('Almacenamiento calculado:', almacenamientoGb, almacenamientoTipo)

    // Obtener tarjeta de video
    const tarjetaVideo = gpu.marca && gpu.modelo 
      ? `${gpu.marca} ${gpu.modelo}${gpu.memoriaGb && gpu.memoriaGb !== '0' ? ` ${gpu.memoriaGb}GB` : ''}`
      : 'Integrada'

    // Preparar detalles de GPU para guardar
    const gpuDetalle = gpu.marca && gpu.modelo ? {
      marca: gpu.marca || '',
      modelo: gpu.modelo || '',
      serial: gpu.serial || '',
      memoriaGb: parseInt(gpu.memoriaGb) || 0
    } : null

    console.log('Tarjeta Video calculada:', tarjetaVideo)

    const equipoActualizado = {
      serial: formData.serial,
      marca: formData.marca,
      modelo: formData.modelo,
      tipo: formData.tipo,
      estado: formData.estado,
      usuario: (formData.colaborador && formData.colaborador !== 'sin-asignar') ? formData.colaborador : 'Sin asignar',
      procesador: formData.procesador,
      ram: ramTotal,
      ramDetalle: ramDetalle.length > 0 ? ramDetalle : null,
      almacenamientoTipo: almacenamientoTipo,
      almacenamientoGb: almacenamientoGb,
      discosDetalle: discosDetalle.length > 0 ? discosDetalle : null,
      tarjetaVideo: tarjetaVideo,
      gpuDetalle: gpuDetalle,
      pantallas: 1,
      fechaAdquisicion: formData.fechaAdquisicion,
      observaciones: formData.observaciones
    }

    console.log('Datos a enviar:', equipoActualizado)

    await actualizarEquipo(equipo.id, equipoActualizado)

    if (onEquipoEditado) {
      onEquipoEditado(equipoActualizado)
    }

    setOpen(false)
  }

  if (!mounted) return null

  const modalContent = (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="modal-icon bg-blue-500">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="modal-title">Editar Equipo</h2>
              <p className="modal-description">Actualice la información del equipo</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTabActiva('detalles')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                tabActiva === 'detalles'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="h-4 w-4" />
              Detalles del Equipo
            </button>
            <button
              type="button"
              onClick={() => setTabActiva('historial')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                tabActiva === 'historial'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="h-4 w-4" />
              Historial de Asignaciones
            </button>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {tabActiva === 'detalles' ? (
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Información Básica */}
            <div className="modal-form-section">
              <h3>
                <Monitor className="h-4 w-4" />
                Información Básica
              </h3>
              <div className="space-y-4">
                <div className="modal-form-grid">
                  <div className="space-y-2">
                    <Label htmlFor="serial">Serial *</Label>
                    <Input
                      id="serial"
                      value={formData.serial}
                      onChange={(e) => handleInputChange('serial', e.target.value)}
                      placeholder="Ej: LT-2024-001"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <ModalSelect value={formData.tipo} onValueChange={(value: string) => handleInputChange('tipo', value)}>
                      <ModalSelectTrigger className="w-full">
                        <ModalSelectValue placeholder="Selecciona el tipo" />
                      </ModalSelectTrigger>
                      <ModalSelectContent>
                        <ModalSelectItem value="PC Escritorio">PC Escritorio</ModalSelectItem>
                        <ModalSelectItem value="Portátil">Portátil</ModalSelectItem>
                        <ModalSelectItem value="All-in-One">All-in-One</ModalSelectItem>
                        <ModalSelectItem value="Servidor">Servidor</ModalSelectItem>
                      </ModalSelectContent>
                    </ModalSelect>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <ModalSelect value={formData.marca} onValueChange={(value: string) => handleInputChange('marca', value)}>
                      <ModalSelectTrigger className="w-full">
                        <ModalSelectValue placeholder="Selecciona la marca" />
                      </ModalSelectTrigger>
                      <ModalSelectContent>
                        <ModalSelectItem value="Dell">Dell</ModalSelectItem>
                        <ModalSelectItem value="HP">HP</ModalSelectItem>
                        <ModalSelectItem value="Lenovo">Lenovo</ModalSelectItem>
                        <ModalSelectItem value="ASUS">ASUS</ModalSelectItem>
                        <ModalSelectItem value="Acer">Acer</ModalSelectItem>
                        <ModalSelectItem value="Apple">Apple</ModalSelectItem>
                        <ModalSelectItem value="Otra">Otra</ModalSelectItem>
                      </ModalSelectContent>
                    </ModalSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => handleInputChange('modelo', e.target.value)}
                      placeholder="Ej: Latitude 5520"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Especificaciones Técnicas */}
            <div className="modal-form-section">
              <h3>
                <Settings className="h-4 w-4" />
                Especificaciones Técnicas
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="procesador" className="font-bold">Procesador</Label>
                  <Input
                    id="procesador"
                    value={formData.procesador}
                    onChange={(e) => handleInputChange('procesador', e.target.value)}
                    placeholder="Ej: Intel i7-11850H"
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Módulos de RAM</Label>
                    <Button 
                      type="button" 
                      onClick={addRamModule} 
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar RAM
                    </Button>
                  </div>
                  
                  {ramModules.map((ram, index) => (
                    <div key={ram.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-700">Módulo {index + 1}</span>
                        {ramModules.length > 1 && (
                          <Button 
                            type="button"
                            onClick={() => removeRamModule(ram.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Marca</Label>
                          <Input
                            value={ram.marca}
                            onChange={(e) => updateRamModule(ram.id, 'marca', e.target.value)}
                            placeholder="Ej: Kingston"
                          />
                        </div>
                        <div>
                          <Label>Capacidad (GB)</Label>
                          <ModalSelect value={ram.capacidadGb} onValueChange={(value) => updateRamModule(ram.id, 'capacidadGb', value)}>
                            <ModalSelectTrigger>
                              <ModalSelectValue placeholder="Capacidad" />
                            </ModalSelectTrigger>
                            <ModalSelectContent>
                              <ModalSelectItem value="2">2 GB</ModalSelectItem>
                              <ModalSelectItem value="4">4 GB</ModalSelectItem>
                              <ModalSelectItem value="8">8 GB</ModalSelectItem>
                              <ModalSelectItem value="16">16 GB</ModalSelectItem>
                              <ModalSelectItem value="32">32 GB</ModalSelectItem>
                            </ModalSelectContent>
                          </ModalSelect>
                        </div>
                        <div>
                          <Label>Velocidad</Label>
                          <Input
                            value={ram.velocidad}
                            onChange={(e) => updateRamModule(ram.id, 'velocidad', e.target.value)}
                            placeholder="Ej: DDR4-3200"
                          />
                        </div>
                        <div>
                          <Label>Slot</Label>
                          <Input
                            value={ram.slot}
                            onChange={(e) => updateRamModule(ram.id, 'slot', e.target.value)}
                            placeholder="Ej: Slot 1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Discos Duros / Almacenamiento</Label>
                    <Button 
                      type="button" 
                      onClick={addDiscoDuro} 
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Disco
                    </Button>
                  </div>
                  
                  {discosDuros.map((disco, index) => (
                    <div key={disco.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-700">Disco {index + 1}</span>
                        {discosDuros.length > 1 && (
                          <Button 
                            type="button"
                            onClick={() => removeDiscoDuro(disco.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Marca *</Label>
                          <Input
                            value={disco.marca}
                            onChange={(e) => updateDiscoDuro(disco.id, 'marca', e.target.value)}
                            placeholder="Ej: Samsung"
                            required
                          />
                        </div>
                        <div>
                          <Label>Serial *</Label>
                          <Input
                            value={disco.serial}
                            onChange={(e) => updateDiscoDuro(disco.id, 'serial', e.target.value)}
                            placeholder="Ej: SSD001234"
                            required
                          />
                        </div>
                        <div>
                          <Label>Tipo</Label>
                          <ModalSelect value={disco.tipo} onValueChange={(value) => updateDiscoDuro(disco.id, 'tipo', value)}>
                            <ModalSelectTrigger>
                              <ModalSelectValue placeholder="Tipo de disco" />
                            </ModalSelectTrigger>
                            <ModalSelectContent>
                              <ModalSelectItem value="SSD">SSD</ModalSelectItem>
                              <ModalSelectItem value="HDD">HDD</ModalSelectItem>
                              <ModalSelectItem value="NVMe">NVMe</ModalSelectItem>
                              <ModalSelectItem value="Híbrido">Híbrido</ModalSelectItem>
                            </ModalSelectContent>
                          </ModalSelect>
                        </div>
                        <div>
                          <Label>Capacidad (GB) *</Label>
                          <ModalSelect value={disco.capacidadGb} onValueChange={(value) => updateDiscoDuro(disco.id, 'capacidadGb', value)}>
                            <ModalSelectTrigger>
                              <ModalSelectValue placeholder="Capacidad" />
                            </ModalSelectTrigger>
                            <ModalSelectContent>
                              <ModalSelectItem value="128">128 GB</ModalSelectItem>
                              <ModalSelectItem value="256">256 GB</ModalSelectItem>
                              <ModalSelectItem value="512">512 GB</ModalSelectItem>
                              <ModalSelectItem value="1000">1 TB</ModalSelectItem>
                              <ModalSelectItem value="2000">2 TB</ModalSelectItem>
                              <ModalSelectItem value="4000">4 TB</ModalSelectItem>
                            </ModalSelectContent>
                          </ModalSelect>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label className="font-bold">GPU / Tarjeta de Video (Opcional)</Label>
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Marca</Label>
                        <Input
                          value={gpu.marca}
                          onChange={(e) => updateGpu('marca', e.target.value)}
                          placeholder="Ej: NVIDIA"
                        />
                      </div>
                      <div>
                        <Label>Modelo</Label>
                        <Input
                          value={gpu.modelo}
                          onChange={(e) => updateGpu('modelo', e.target.value)}
                          placeholder="Ej: GeForce RTX 3060"
                        />
                      </div>
                      <div>
                        <Label>Serial</Label>
                        <Input
                          value={gpu.serial}
                          onChange={(e) => updateGpu('serial', e.target.value)}
                          placeholder="Ej: GTX3060001"
                        />
                      </div>
                      <div>
                        <Label>Memoria (GB)</Label>
                        <ModalSelect value={gpu.memoriaGb} onValueChange={(value) => updateGpu('memoriaGb', value)}>
                          <ModalSelectTrigger>
                            <ModalSelectValue placeholder="Memoria" />
                          </ModalSelectTrigger>
                          <ModalSelectContent>
                            <ModalSelectItem value="0">Integrada</ModalSelectItem>
                            <ModalSelectItem value="2">2 GB</ModalSelectItem>
                            <ModalSelectItem value="4">4 GB</ModalSelectItem>
                            <ModalSelectItem value="6">6 GB</ModalSelectItem>
                            <ModalSelectItem value="8">8 GB</ModalSelectItem>
                            <ModalSelectItem value="12">12 GB</ModalSelectItem>
                            <ModalSelectItem value="16">16 GB</ModalSelectItem>
                            <ModalSelectItem value="24">24 GB</ModalSelectItem>
                          </ModalSelectContent>
                        </ModalSelect>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Campo de Observaciones en Especificaciones Técnicas */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones y Estado del Equipo</Label>
                    <textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => handleInputChange('observaciones', e.target.value)}
                      placeholder="Ej: Equipo en excelente estado, incluye teclado y mouse inalámbricos, batería nueva..."
                      className="w-full min-h-[80px] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-input bg-background resize-vertical rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Asignación */}
            <div className="modal-form-section">
              <h3>
                <MapPin className="h-4 w-4" />
                Asignación
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="colaborador">Colaborador Asignado</Label>
                  <ModalSelect value={formData.colaborador} onValueChange={(value: string) => handleInputChange('colaborador', value)}>
                    <ModalSelectTrigger className="w-full min-w-[300px]">
                      <ModalSelectValue placeholder="Seleccionar colaborador" />
                    </ModalSelectTrigger>
                    <ModalSelectContent className="min-w-[300px]">
                      <ModalSelectItem value="sin-asignar">Sin asignar</ModalSelectItem>
                      {usuarios?.filter(usuario => usuario.estado === 'activo')
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                        .map((usuario) => (
                        <ModalSelectItem key={usuario.id} value={usuario.nombre}>
                          {usuario.nombre}
                        </ModalSelectItem>
                      ))}
                    </ModalSelectContent>
                  </ModalSelect>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="modal-form-section">
              <h3>Información Adicional</h3>
              <div className="space-y-4">
                <div className="modal-form-grid">
                  <div className="space-y-2">
                    <Label htmlFor="fechaAdquisicion">Fecha de Adquisición</Label>
                    <Input
                      id="fechaAdquisicion"
                      type="date"
                      value={formData.fechaAdquisicion}
                      onChange={(e) => handleInputChange('fechaAdquisicion', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <ModalSelect value={formData.estado} onValueChange={(value: string) => handleInputChange('estado', value)}>
                      <ModalSelectTrigger className="w-full">
                        <ModalSelectValue placeholder="Estado del equipo" />
                      </ModalSelectTrigger>
                      <ModalSelectContent>
                        <ModalSelectItem value="Activo">Activo</ModalSelectItem>
                        <ModalSelectItem value="En Reparación">En Reparación</ModalSelectItem>
                        <ModalSelectItem value="Descontinuado">Descontinuado</ModalSelectItem>
                        <ModalSelectItem value="En Almacén">En Almacén</ModalSelectItem>
                      </ModalSelectContent>
                    </ModalSelect>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1 h-11 text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>
        ) : (
          // Pestaña de Historial
          <div className="modal-body">
            <HistorialAsignaciones equipoId={equipo.id} equipoSerial={equipo.serial} />
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <Button 
                type="button" 
                onClick={() => setOpen(false)}
                className="h-11 px-6 bg-gray-600 hover:bg-gray-700"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      )}
      {open && createPortal(modalContent, document.body)}
    </>
  )
}
