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
import { useInventario } from '@/contexts/InventarioContext'
import { Plus, User, X } from 'lucide-react'

interface NuevoUsuarioDialogProps {
  onUsuarioCreado?: (usuario: any) => void
}

export function NuevoUsuarioDialog({ onUsuarioCreado }: NuevoUsuarioDialogProps) {
  const { agregarUsuario } = useInventario()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    departamento: '',
    ciudad: '',
    fechaCreacion: new Date().toISOString().split('T')[0]
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.email || !formData.departamento || !formData.ciudad) {
      alert('Por favor complete todos los campos obligatorios marcados con *')
      return
    }

    // Crear el nuevo usuario
    const nuevoUsuario = {
      nombre: formData.nombre,
      email: formData.email,
      departamento: formData.departamento,
      ciudad: formData.ciudad,
      fechaCreacion: formData.fechaCreacion
    }

    console.log('=== NUEVO USUARIO ===');
    console.log('Datos del formulario:', formData);
    console.log('Usuario a enviar:', nuevoUsuario);

    // Agregar al contexto
    agregarUsuario(nuevoUsuario)

    // Llamar al callback si existe (para compatibilidad)
    if (onUsuarioCreado) {
      onUsuarioCreado(nuevoUsuario)
    }

    // Limpiar formulario y cerrar
    setFormData({
      nombre: '',
      email: '',
      departamento: '',
      ciudad: '',
      fechaCreacion: new Date().toISOString().split('T')[0]
    })
    setOpen(false)
  }

  // Efecto para hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

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
    return null
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md"
      >
        <Plus className="h-4 w-4" />
        Nuevo Usuario
      </Button>

      {mounted && open && typeof window !== 'undefined' && createPortal(
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
              <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Usuario</h2>
              <p className="text-gray-600 mt-1">
                Complete la información del usuario para agregarlo al sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div className="modal-form-section">
                <h3>
                  <User className="h-4 w-4" />
                  Información Personal
                </h3>
                <div className="space-y-4">
                  <div className="modal-form-grid">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Ej: juan.perez@empresa.com"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-form-grid">
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento *</Label>
                      <ModalSelect value={formData.departamento} onValueChange={(value: string) => handleInputChange('departamento', value)}>
                        <ModalSelectTrigger className="w-full">
                          <ModalSelectValue placeholder="Seleccionar departamento" />
                        </ModalSelectTrigger>
                        <ModalSelectContent>
                          <ModalSelectItem value="Diseñador Gráfico">Diseñador Gráfico</ModalSelectItem>
                          <ModalSelectItem value="Diseño Industrial">Diseño Industrial</ModalSelectItem>
                          <ModalSelectItem value="Copy">Copy</ModalSelectItem>
                          <ModalSelectItem value="Project Manager">Project Manager</ModalSelectItem>
                          <ModalSelectItem value="Administrativo">Administrativo</ModalSelectItem>
                          <ModalSelectItem value="Logistica">Logistica</ModalSelectItem>
                          <ModalSelectItem value="Motion Graphics">Motion Graphics</ModalSelectItem>
                          <ModalSelectItem value="Desarrollador">Desarrollador</ModalSelectItem>
                          <ModalSelectItem value="Gerencia">Gerencia</ModalSelectItem>
                          <ModalSelectItem value="KAM">KAM</ModalSelectItem>
                          <ModalSelectItem value="Comercial">Comercial</ModalSelectItem>
                        </ModalSelectContent>
                      </ModalSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad *</Label>
                      <ModalSelect value={formData.ciudad} onValueChange={(value: string) => handleInputChange('ciudad', value)}>
                        <ModalSelectTrigger className="w-full">
                          <ModalSelectValue placeholder="Seleccionar ciudad" />
                        </ModalSelectTrigger>
                        <ModalSelectContent>
                          <ModalSelectItem value="Bogotá">Bogotá</ModalSelectItem>
                          <ModalSelectItem value="Medellín">Medellín</ModalSelectItem>
                          <ModalSelectItem value="Cali">Cali</ModalSelectItem>
                          <ModalSelectItem value="Cartagena">Cartagena</ModalSelectItem>
                          <ModalSelectItem value="Bucaramanga">Bucaramanga</ModalSelectItem>
                          <ModalSelectItem value="Palmira">Palmira</ModalSelectItem>
                          <ModalSelectItem value="Jamundí">Jamundí</ModalSelectItem>
                          <ModalSelectItem value="Dapa">Dapa</ModalSelectItem>
                        </ModalSelectContent>
                      </ModalSelect>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaCreacion">Fecha de Ingreso</Label>
                    <Input
                      id="fechaCreacion"
                      type="date"
                      value={formData.fechaCreacion}
                      onChange={(e) => handleInputChange('fechaCreacion', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Agregar Usuario
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