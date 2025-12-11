'use client'

import { useActionState, useEffect, useState } from 'react'
import { createEquipo } from '@/app/equipos/actions'
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
import { Monitor, Settings, MapPin, Plus, X } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

type Colaborador = {
  id: string
  nombre: string
  apellido: string
  cargo: string
}

type RamModule = {
  id: string
  marca: string
  capacidadGb: string
  velocidad: string
  slot: string
}

type DiscoDuro = {
  id: string
  marca: string
  serial: string
  tipo: string
  capacidadGb: string
}

type GpuInfo = {
  marca: string
  modelo: string
  serial: string
  memoriaGb: string
}

type NuevoEquipoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NuevoEquipoDialog({ open, onOpenChange }: NuevoEquipoDialogProps) {
  const [state, formAction, isPending] = useActionState(createEquipo, null)
  
  // Colaboradores
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loadingColaboradores, setLoadingColaboradores] = useState(false)
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<string>('sin-asignar')
  
  // Form fields (controlled for selects)
  const [tipo, setTipo] = useState<string>('Desktop')
  const [marca, setMarca] = useState<string>('')
  const [estadoSalud, setEstadoSalud] = useState<string>('Bueno')
  const [estado, setEstado] = useState<string>('Activo')
  
  // RAM modules (dynamic)
  const [ramModules, setRamModules] = useState<RamModule[]>([
    { id: '1', marca: '', capacidadGb: '', velocidad: '', slot: '' }
  ])
  
  // Discos duros (dynamic)
  const [discosDuros, setDiscosDuros] = useState<DiscoDuro[]>([
    { id: '1', marca: '', serial: '', tipo: '', capacidadGb: '' }
  ])
  
  // GPU
  const [gpu, setGpu] = useState<GpuInfo>({
    marca: '',
    modelo: '',
    serial: '',
    memoriaGb: ''
  })

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch colaboradores when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingColaboradores(true)
      fetch('/api/colaboradores')
        .then(res => res.json())
        .then(data => setColaboradores(data))
        .catch(err => console.error('Error loading colaboradores:', err))
        .finally(() => setLoadingColaboradores(false))
    }
  }, [open])

  // Reset form on success
  useEffect(() => {
    if (state?.success) {
      resetForm()
      onOpenChange(false)
    }
  }, [state?.success, onOpenChange])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetForm = () => {
    setSelectedColaboradorId('sin-asignar')
    setTipo('Desktop')
    setMarca('')
    setEstadoSalud('Bueno')
    setEstado('Activo')
    setRamModules([{ id: '1', marca: '', capacidadGb: '', velocidad: '', slot: '' }])
    setDiscosDuros([{ id: '1', marca: '', serial: '', tipo: '', capacidadGb: '' }])
    setGpu({ marca: '', modelo: '', serial: '', memoriaGb: '' })
  }

  // RAM handlers
  const addRamModule = () => {
    const newId = (ramModules.length + 1).toString()
    setRamModules(prev => [...prev, { id: newId, marca: '', capacidadGb: '', velocidad: '', slot: '' }])
  }

  const removeRamModule = (id: string) => {
    if (ramModules.length > 1) {
      setRamModules(prev => prev.filter(ram => ram.id !== id))
    }
  }

  const updateRamModule = (id: string, field: keyof RamModule, value: string) => {
    setRamModules(prev => prev.map(ram => 
      ram.id === id ? { ...ram, [field]: value } : ram
    ))
  }

  // Disco handlers
  const addDiscoDuro = () => {
    const newId = (discosDuros.length + 1).toString()
    setDiscosDuros(prev => [...prev, { id: newId, marca: '', serial: '', tipo: '', capacidadGb: '' }])
  }

  const removeDiscoDuro = (id: string) => {
    if (discosDuros.length > 1) {
      setDiscosDuros(prev => prev.filter(disco => disco.id !== id))
    }
  }

  const updateDiscoDuro = (id: string, field: keyof DiscoDuro, value: string) => {
    setDiscosDuros(prev => prev.map(disco => 
      disco.id === id ? { ...disco, [field]: value } : disco
    ))
  }

  // GPU handler
  const updateGpu = (field: keyof GpuInfo, value: string) => {
    setGpu(prev => ({ ...prev, [field]: value }))
  }

  // Calculate totals for hidden fields
  const ramTotal = ramModules
    .filter(ram => ram.capacidadGb)
    .reduce((total, ram) => total + (parseInt(ram.capacidadGb) || 0), 0)

  const discoPrincipal = discosDuros.find(disco => disco.capacidadGb)
  const almacenamientoGbTotal = discoPrincipal?.capacidadGb ? parseInt(discoPrincipal.capacidadGb) : 0
  const almacenamientoTipoValue = discoPrincipal?.tipo || 'SSD'

  const gpuString = gpu.marca && gpu.modelo 
    ? `${gpu.marca} ${gpu.modelo}${gpu.memoriaGb && gpu.memoriaGb !== '0' ? ` ${gpu.memoriaGb}GB` : ''}`
    : 'Integrada'

  // Prepare JSON for detailed fields
  const ramDetalleJson = JSON.stringify(
    ramModules
      .filter(ram => ram.capacidadGb)
      .map(ram => ({
        marca: ram.marca,
        capacidadGb: parseInt(ram.capacidadGb) || 0,
        velocidad: ram.velocidad,
        slot: ram.slot
      }))
  )

  const discosDetalleJson = JSON.stringify(
    discosDuros
      .filter(disco => disco.capacidadGb)
      .map(disco => ({
        marca: disco.marca,
        serial: disco.serial,
        tipo: disco.tipo,
        capacidadGb: parseInt(disco.capacidadGb) || 0
      }))
  )

  const gpuDetalleJson = gpu.marca && gpu.modelo 
    ? JSON.stringify({
        marca: gpu.marca,
        modelo: gpu.modelo,
        serial: gpu.serial,
        memoriaGb: parseInt(gpu.memoriaGb) || 0
      })
    : ''

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Equipo</DialogTitle>
          <DialogDescription>
            Complete la información del equipo para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {state?.message && !state.success && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {state.message}
            </div>
          )}

          {/* Hidden fields for calculated values */}
          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="marca" value={marca} />
          <input type="hidden" name="estadoSalud" value={estadoSalud} />
          <input type="hidden" name="estado" value={estado} />
          <input type="hidden" name="ram" value={ramTotal || 8} />
          <input type="hidden" name="almacenamiento" value={`${almacenamientoGbTotal || 256}GB ${almacenamientoTipoValue}`} />
          <input type="hidden" name="almacenamientoTipo" value={almacenamientoTipoValue} />
          <input type="hidden" name="almacenamientoGb" value={almacenamientoGbTotal || 256} />
          <input type="hidden" name="gpu" value={gpuString} />
          <input type="hidden" name="colaboradorId" value={selectedColaboradorId === 'sin-asignar' ? '' : selectedColaboradorId} />
          <input type="hidden" name="ramDetalle" value={ramDetalleJson} />
          <input type="hidden" name="discosDetalle" value={discosDetalleJson} />
          <input type="hidden" name="gpuDetalle" value={gpuDetalleJson} />

          {/* ================================================================ */}
          {/* SECCIÓN: Información Básica */}
          {/* ================================================================ */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Monitor className="h-5 w-5 text-primary" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serial">Serial *</Label>
                <Input
                  id="serial"
                  name="serial"
                  placeholder="Ej: LT-2024-001"
                  required
                  aria-describedby="serial-error"
                />
                {state?.errors?.serial && (
                  <p id="serial-error" className="text-sm text-destructive">
                    {state.errors.serial}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desktop">Desktop</SelectItem>
                    <SelectItem value="Portátil">Portátil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Select value={marca} onValueChange={setMarca}>
                  <SelectTrigger id="marca">
                    <SelectValue placeholder="Selecciona la marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dell">Dell</SelectItem>
                    <SelectItem value="HP">HP</SelectItem>
                    <SelectItem value="Lenovo">Lenovo</SelectItem>
                    <SelectItem value="ASUS">ASUS</SelectItem>
                    <SelectItem value="Acer">Acer</SelectItem>
                    <SelectItem value="Apple">Apple</SelectItem>
                    <SelectItem value="Otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.marca && (
                  <p className="text-sm text-destructive">{state.errors.marca}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  placeholder="Ej: Latitude 5520"
                  required
                />
                {state?.errors?.modelo && (
                  <p className="text-sm text-destructive">{state.errors.modelo}</p>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECCIÓN: Especificaciones Técnicas */}
          {/* ================================================================ */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Especificaciones Técnicas
            </h3>
            
            {/* Procesador */}
            <div className="space-y-2">
              <Label htmlFor="procesador" className="font-semibold">Procesador *</Label>
              <Input
                id="procesador"
                name="procesador"
                placeholder="Ej: Intel i7-11850H"
                required
              />
              {state?.errors?.procesador && (
                <p className="text-sm text-destructive">{state.errors.procesador}</p>
              )}
            </div>

            {/* Módulos de RAM */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Módulos de RAM</Label>
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ramModules.map((ram, index) => (
                  <div key={ram.id} className="border rounded-lg p-4 space-y-3 bg-background">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Módulo {index + 1}</span>
                      {ramModules.length > 1 && (
                        <Button 
                          type="button"
                          onClick={() => removeRamModule(ram.id)}
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Marca</Label>
                        <Input
                          value={ram.marca}
                          onChange={(e) => updateRamModule(ram.id, 'marca', e.target.value)}
                          placeholder="Ej: Kingston"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Capacidad (GB) *</Label>
                        <Select 
                          value={ram.capacidadGb} 
                          onValueChange={(value) => updateRamModule(ram.id, 'capacidadGb', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="GB" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 GB</SelectItem>
                            <SelectItem value="4">4 GB</SelectItem>
                            <SelectItem value="8">8 GB</SelectItem>
                            <SelectItem value="16">16 GB</SelectItem>
                            <SelectItem value="32">32 GB</SelectItem>
                            <SelectItem value="64">64 GB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Velocidad</Label>
                        <Input
                          value={ram.velocidad}
                          onChange={(e) => updateRamModule(ram.id, 'velocidad', e.target.value)}
                          placeholder="Ej: DDR4-3200"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Slot</Label>
                        <Input
                          value={ram.slot}
                          onChange={(e) => updateRamModule(ram.id, 'slot', e.target.value)}
                          placeholder="Ej: Slot 1"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {ramTotal > 0 && (
                <p className="text-sm text-muted-foreground">
                  RAM Total: <span className="font-semibold text-foreground">{ramTotal} GB</span>
                </p>
              )}
            </div>

            {/* Discos Duros / Almacenamiento */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Discos Duros / Almacenamiento</Label>
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
                <div key={disco.id} className="border rounded-lg p-4 space-y-3 bg-background">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Disco {index + 1}</span>
                    {discosDuros.length > 1 && (
                      <Button 
                        type="button"
                        onClick={() => removeDiscoDuro(disco.id)}
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Marca</Label>
                      <Input
                        value={disco.marca}
                        onChange={(e) => updateDiscoDuro(disco.id, 'marca', e.target.value)}
                        placeholder="Ej: Samsung"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Serial</Label>
                      <Input
                        value={disco.serial}
                        onChange={(e) => updateDiscoDuro(disco.id, 'serial', e.target.value)}
                        placeholder="Ej: SSD001234"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tipo</Label>
                      <Select 
                        value={disco.tipo} 
                        onValueChange={(value) => updateDiscoDuro(disco.id, 'tipo', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SSD">SSD</SelectItem>
                          <SelectItem value="HDD">HDD</SelectItem>
                          <SelectItem value="NVMe">NVMe</SelectItem>
                          <SelectItem value="Híbrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Capacidad (GB) *</Label>
                      <Select 
                        value={disco.capacidadGb} 
                        onValueChange={(value) => updateDiscoDuro(disco.id, 'capacidadGb', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="GB" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="128">128 GB</SelectItem>
                          <SelectItem value="256">256 GB</SelectItem>
                          <SelectItem value="512">512 GB</SelectItem>
                          <SelectItem value="1000">1 TB</SelectItem>
                          <SelectItem value="2000">2 TB</SelectItem>
                          <SelectItem value="4000">4 TB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* GPU / Tarjeta de Video */}
            <div className="space-y-4">
              <Label className="font-semibold">GPU / Tarjeta de Video (Opcional)</Label>
              <div className="border rounded-lg p-4 space-y-3 bg-background">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Marca</Label>
                    <Input
                      value={gpu.marca}
                      onChange={(e) => updateGpu('marca', e.target.value)}
                      placeholder="Ej: NVIDIA"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Modelo</Label>
                    <Input
                      value={gpu.modelo}
                      onChange={(e) => updateGpu('modelo', e.target.value)}
                      placeholder="Ej: GeForce RTX 3060"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Serial</Label>
                    <Input
                      value={gpu.serial}
                      onChange={(e) => updateGpu('serial', e.target.value)}
                      placeholder="Ej: GTX3060001"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Memoria (GB)</Label>
                    <Select 
                      value={gpu.memoriaGb} 
                      onValueChange={(value) => updateGpu('memoriaGb', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Memoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Integrada</SelectItem>
                        <SelectItem value="2">2 GB</SelectItem>
                        <SelectItem value="4">4 GB</SelectItem>
                        <SelectItem value="6">6 GB</SelectItem>
                        <SelectItem value="8">8 GB</SelectItem>
                        <SelectItem value="12">12 GB</SelectItem>
                        <SelectItem value="16">16 GB</SelectItem>
                        <SelectItem value="24">24 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones y Estado del Equipo</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                placeholder="Ej: Equipo en excelente estado, incluye teclado y mouse inalámbricos, batería nueva..."
                rows={3}
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECCIÓN: Asignación */}
          {/* ================================================================ */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Asignación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="colaboradorId">Colaborador Asignado</Label>
                <Select 
                  value={selectedColaboradorId} 
                  onValueChange={setSelectedColaboradorId}
                >
                  <SelectTrigger id="colaboradorId" className="w-full">
                    <SelectValue placeholder={loadingColaboradores ? "Cargando..." : "Seleccionar colaborador"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {colaboradores
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.nombre} {col.apellido} - {col.cargo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECCIÓN: Información Adicional */}
          {/* ================================================================ */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold text-lg">Información Adicional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaAdquisicion">Fecha de Adquisición *</Label>
                <Input
                  id="fechaAdquisicion"
                  name="fechaAdquisicion"
                  type="date"
                  required
                />
                {state?.errors?.fechaAdquisicion && (
                  <p className="text-sm text-destructive">{state.errors.fechaAdquisicion}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaGarantia">Fecha de Garantía</Label>
                <Input
                  id="fechaGarantia"
                  name="fechaGarantia"
                  type="date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estadoSalud">Estado de Salud</Label>
                <Select value={estadoSalud} onValueChange={setEstadoSalud}>
                  <SelectTrigger id="estadoSalud">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado Operativo</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="En Reparación">En Reparación</SelectItem>
                    <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                    <SelectItem value="En Almacén">En Almacén</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Periféricos */}
              <div className="space-y-2">
                <Label htmlFor="pantallas">Número de Pantallas</Label>
                <Input
                  id="pantallas"
                  name="pantallas"
                  type="number"
                  min="0"
                  defaultValue="1"
                  placeholder="1, 2, 3..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolucionPantalla">Resolución de Pantalla</Label>
                <Input
                  id="resolucionPantalla"
                  name="resolucionPantalla"
                  placeholder="1920x1080, 4K..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="tieneTeclado" name="tieneTeclado" defaultChecked />
                <Label htmlFor="tieneTeclado" className="font-normal">
                  Tiene Teclado
                </Label>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="tieneMouse" name="tieneMouse" defaultChecked />
                <Label htmlFor="tieneMouse" className="font-normal">
                  Tiene Mouse
                </Label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="otrosPeriferico">Otros Periféricos</Label>
                <Input
                  id="otrosPeriferico"
                  name="otrosPeriferico"
                  placeholder="Webcam, micrófono, bocinas..."
                />
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* Botones de acción */}
          {/* ================================================================ */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? 'Creando...' : 'Agregar Equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
