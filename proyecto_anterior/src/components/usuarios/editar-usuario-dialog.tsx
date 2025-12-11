'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useInventario, type Usuario } from '@/contexts/InventarioContext'
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
import { X, User, Save } from 'lucide-react'

interface EditarUsuarioDialogProps {
  usuario: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditarUsuarioDialog({ usuario, open, onOpenChange }: EditarUsuarioDialogProps) {
  const { actualizarUsuario } = useInventario()
  const [mounted, setMounted] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    departamento: '',
    ciudad: '',
    telefono: ''
  })

  // Validación
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializar formulario cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      console.log('=== CARGANDO USUARIO PARA EDITAR ===');
      console.log('Usuario recibido:', usuario);
      console.log('Departamento:', usuario.departamento);
      console.log('Ciudad:', usuario.ciudad);
      
      const newFormData = {
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        departamento: usuario.departamento || '',
        ciudad: usuario.ciudad || '',
        telefono: usuario.telefono || ''
      };
      
      console.log('FormData a establecer:', newFormData);
      setFormData(newFormData);
      setErrores({});
      
      console.log('=== FIN CARGA USUARIO ===');
    }
  }, [usuario])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error si existe
    if (errores[field]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev }
        delete nuevosErrores[field]
        return nuevosErrores
      })
    }
  }

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido'
    }

    if (!formData.departamento.trim()) {
      nuevosErrores.departamento = 'El departamento es requerido'
    }

    if (!formData.ciudad.trim()) {
      nuevosErrores.ciudad = 'La ciudad es requerida'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!usuario || !validarFormulario()) {
      return
    }

    // Actualizar usuario
    actualizarUsuario(usuario.id, {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      departamento: formData.departamento,
      ciudad: formData.ciudad,
      telefono: formData.telefono.trim()
    })

    onOpenChange(false)
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

  if (typeof window === 'undefined' || !mounted || !open || !usuario) {
    return null
  }

  return createPortal(
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChange(false)}
          className="modal-close-button"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="pb-4 border-b border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Editar Usuario</h2>
          <p className="text-gray-600 mt-1">
            Modifica la información de {usuario.nombre}
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
                <div>
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Nombre completo del usuario"
                    className={errores.nombre ? 'border-red-500' : ''}
                    required
                  />
                  {errores.nombre && <span className="text-sm text-red-500">{errores.nombre}</span>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="usuario@empresa.com"
                    className={errores.email ? 'border-red-500' : ''}
                    required
                  />
                  {errores.email && <span className="text-sm text-red-500">{errores.email}</span>}
                </div>
              </div>

              <div className="modal-form-grid">
                <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                  <ModalSelect 
                    key={`departamento-${usuario?.id || 'new'}-${formData.departamento}`}
                    defaultValue={formData.departamento}
                    value={formData.departamento || undefined}
                    onValueChange={(value) => handleInputChange('departamento', value)}
                  >
                    <ModalSelectTrigger className={errores.departamento ? 'border-red-500' : ''}>
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
                  {errores.departamento && <span className="text-sm text-red-500">{errores.departamento}</span>}
                </div>

                <div>
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <ModalSelect 
                    key={`ciudad-${usuario?.id || 'new'}-${formData.ciudad}`}
                    defaultValue={formData.ciudad}
                    value={formData.ciudad || undefined}
                    onValueChange={(value) => handleInputChange('ciudad', value)}
                  >
                    <ModalSelectTrigger className={errores.ciudad ? 'border-red-500' : ''}>
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
                  {errores.ciudad && <span className="text-sm text-red-500">{errores.ciudad}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Fecha de creación */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="text-sm">
              <span className="text-gray-600">Fecha de Creación:</span>
              <span className="ml-2">{new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-11 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}