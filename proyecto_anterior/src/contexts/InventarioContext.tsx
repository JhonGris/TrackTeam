'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Interfaces que coinciden con Prisma
export interface Usuario {
  id: string
  nombre: string
  email: string
  departamento: string
  ciudad: string
  telefono?: string
  equiposAsignados: number
  fechaCreacion: string
  estado: 'activo' | 'retirado'
  fechaRetiro?: string
}

export interface Equipo {
  id: string
  serial: string
  marca: string
  modelo: string
  tipo: string
  procesador: string
  ram: number
  ramDetalle?: any
  almacenamientoTipo: string
  almacenamientoGb: number
  discosDetalle?: any
  tarjetaVideo: string
  gpuDetalle?: any
  pantallas: number
  resolucionPantalla: string
  tieneTeclado: boolean
  tieneMouse: boolean
  otrosPeriferico: string
  usuario: string
  departamento: string
  ubicacion: string
  estado: string
  fechaAdquisicion: string
  fechaGarantia: string
  observaciones: string
}

export interface Servicio {
  id: string
  equipoId: string
  equipoSerial?: string
  equipoMarca?: string
  equipoModelo?: string
  tipoMantenimiento: 'Correctivo' | 'Preventivo' | 'Instalación/Upgrade'
  fechaServicio: string
  tecnicoResponsable: string
  diagnostico: string
  descripcionTrabajo: string
  costoReparacion: number
  fotografias?: string[]
}

interface InventarioContextType {
  // Datos
  usuarios: Usuario[]
  equipos: Equipo[]
  servicios: Servicio[]
  isLoading: boolean
  
  // Funciones de usuarios
  agregarUsuario: (usuario: Omit<Usuario, 'id' | 'equiposAsignados' | 'estado'>) => Promise<Usuario | null>
  actualizarUsuario: (id: string, usuario: Partial<Usuario>) => Promise<Usuario | null>
  eliminarUsuario: (id: string) => Promise<boolean>
  retirarUsuario: (id: string) => boolean
  
  // Funciones de equipos
  agregarEquipo: (equipo: any) => Promise<Equipo | null>
  actualizarEquipo: (id: string, equipo: any) => Promise<Equipo | null>
  eliminarEquipo: (id: string) => Promise<boolean>
  
  // Funciones de servicios
  agregarServicio: (servicio: Omit<Servicio, 'id'>) => Promise<Servicio | null>
  
  // Funciones de utilidad
  recargarDatos: () => Promise<void>
}

const InventarioContext = createContext<InventarioContextType | undefined>(undefined)

export function InventarioProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar datos desde la API
  const cargarDatos = async () => {
    try {
      setIsLoading(true)
      
      // Cargar usuarios
      const responseUsuarios = await fetch('/api/usuarios')
      if (responseUsuarios.ok) {
        const usuariosData = await responseUsuarios.json()
        setUsuarios(usuariosData)
      }
      
      // Cargar equipos
      const responseEquipos = await fetch('/api/equipos')
      if (responseEquipos.ok) {
        const equiposData = await responseEquipos.json()
        setEquipos(equiposData)
      }
      
      // Cargar servicios
      const responseServicios = await fetch('/api/servicios')
      if (responseServicios.ok) {
        const serviciosData = await responseServicios.json()
        setServicios(serviciosData)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al inicializar
  useEffect(() => {
    cargarDatos()
  }, [])

  // Funciones de usuarios
  const agregarUsuario = async (nuevoUsuario: Omit<Usuario, 'id' | 'equiposAsignados' | 'estado'>): Promise<Usuario | null> => {
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoUsuario),
      })
      
      if (response.ok) {
        const usuarioCreado = await response.json()
        setUsuarios(prev => [...prev, usuarioCreado])
        return usuarioCreado
      }
    } catch (error) {
      console.error('Error agregando usuario:', error)
    }
    return null
  }

  const actualizarUsuario = async (id: string, usuarioActualizado: Partial<Usuario>): Promise<Usuario | null> => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioActualizado),
      })
      
      if (response.ok) {
        const usuarioActualizadoResponse = await response.json()
        setUsuarios(prev => 
          prev.map(usuario => 
            usuario.id === id ? { ...usuario, ...usuarioActualizadoResponse } : usuario
          )
        )
        return usuarioActualizadoResponse
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
    }
    return null
  }

  const eliminarUsuario = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setUsuarios(prev => prev.filter(usuario => usuario.id !== id))
        return true
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error)
    }
    return false
  }

  // Función temporal para retirar usuario (mantenemos compatibilidad)
  const retirarUsuario = (id: string): boolean => {
    // Por ahora solo simulamos el retiro actualizando el estado local
    // En el futuro esto debería hacer una llamada a la API
    setUsuarios(prev => 
      prev.map(usuario => 
        usuario.id === id 
          ? { ...usuario, estado: 'retirado' as const, fechaRetiro: new Date().toISOString().split('T')[0] } 
          : usuario
      )
    )
    return true
  }

  // Funciones de equipos
  const agregarEquipo = async (nuevoEquipo: any): Promise<Equipo | null> => {
    try {
      const response = await fetch('/api/equipos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoEquipo),
      })
      
      if (response.ok) {
        const equipoCreado = await response.json()
        setEquipos(prev => [...prev, equipoCreado])
        return equipoCreado
      }
    } catch (error) {
      console.error('Error agregando equipo:', error)
    }
    return null
  }

  const actualizarEquipo = async (id: string, equipoActualizado: any): Promise<Equipo | null> => {
    try {
      console.log('=== ACTUALIZANDO EQUIPO EN CONTEXTO ===');
      console.log('ID:', id, 'Tipo:', typeof id);
      console.log('Datos a actualizar:', equipoActualizado);
      
      const payload = { id, ...equipoActualizado };
      console.log('Payload completo:', payload);
      
      const response = await fetch('/api/equipos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const equipoEditado = await response.json()
        console.log('=== EQUIPO EDITADO ===')
        console.log('ID editado:', id)
        console.log('Usuario asignado:', equipoEditado.usuario)
        console.log('Equipo completo:', equipoEditado)
        setEquipos(prev => {
          const nuevosEquipos = prev.map(e => e.id === id ? equipoEditado : e)
          console.log('Equipos actualizados:', nuevosEquipos.map(eq => ({ id: eq.id, usuario: eq.usuario })))
          return nuevosEquipos
        })
        return equipoEditado
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
      }
    } catch (error) {
      console.error('Error actualizando equipo:', error)
    }
    return null
  }

  const eliminarEquipo = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/equipos/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setEquipos(prev => prev.filter(e => e.id !== id))
        return true
      }
    } catch (error) {
      console.error('Error eliminando equipo:', error)
    }
    return false
  }

  // Funciones de servicios
  const agregarServicio = async (nuevoServicio: Omit<Servicio, 'id'>): Promise<Servicio | null> => {
    try {
      const response = await fetch('/api/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoServicio),
      })
      
      if (response.ok) {
        const servicioCreado = await response.json()
        setServicios(prev => [...prev, servicioCreado])
        return servicioCreado
      }
    } catch (error) {
      console.error('Error agregando servicio:', error)
    }
    return null
  }

  const recargarDatos = async () => {
    await cargarDatos()
  }

  const contextValue: InventarioContextType = {
    usuarios,
    equipos,
    servicios,
    isLoading,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    retirarUsuario,
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
    agregarServicio,
    recargarDatos
  }

  return (
    <InventarioContext.Provider value={contextValue}>
      {children}
    </InventarioContext.Provider>
  )
}

export function useInventario(): InventarioContextType {
  const context = useContext(InventarioContext)
  if (context === undefined) {
    throw new Error('useInventario debe usarse dentro de un InventarioProvider')
  }
  return context
}