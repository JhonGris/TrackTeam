'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

// Tipos
interface DiscoDuro {
  id: string
  marca: string
  serial: string
  tipo: string // SSD, HDD, NVMe
  capacidadGb: number
}

interface TarjetaRAM {
  id: string
  marca: string
  capacidadGb: number
  velocidad: string // DDR3, DDR4, DDR5
  slot: string
}

interface GPU {
  marca: string
  modelo: string
  serial: string
  memoriaGb: number
}

interface Equipo {
  id: number
  serial: string
  marca: string
  modelo: string
  tipo: string
  estado: string
  usuario?: string
  departamento: string
  procesador: string
  ram: TarjetaRAM[]
  discosDuros: DiscoDuro[]
  gpu?: GPU
  fechaAdquisicion: string
}

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

interface HistorialAsignacion {
  id: string
  usuarioId: string
  equipoId: number
  equipoSerial: string
  equipoMarca: string
  equipoModelo: string
  fechaAsignacion: string
  fechaLiberacion?: string
  motivo?: 'retirado' | 'reasignacion' | 'equipo_retirado'
}

interface Servicio {
  id: number
  equipoSerial: string
  equipoMarca: string
  equipoModelo: string
  tipo: 'Correctivo' | 'Preventivo' | 'Instalación/Upgrade'
  fecha: string
  tecnico: string
  diagnostico: string
  descripcion: string
  costo: number
  estado: 'Pendiente' | 'En Progreso' | 'Completado'
  fotografias?: string[] // URLs de las fotografías del servicio
}

interface InventarioContextType {
  equipos: Equipo[]
  setEquipos: React.Dispatch<React.SetStateAction<Equipo[]>>
  agregarEquipo: (equipo: Omit<Equipo, 'id'>) => void
  actualizarEquipo: (id: number, equipo: Partial<Equipo>) => void
  eliminarEquipo: (id: number) => void
  usuarios: Usuario[]
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>
  agregarUsuario: (usuario: Omit<Usuario, 'id' | 'equiposAsignados' | 'estado'>) => void
  actualizarUsuario: (id: number, usuario: Partial<Usuario>) => void
  eliminarUsuario: (id: number) => boolean // Retorna si se pudo eliminar
  retirarUsuario: (id: number) => boolean // Retorna si se pudo retirar
  reactivarUsuario: (id: number) => void
  servicios: Servicio[]
  setServicios: React.Dispatch<React.SetStateAction<Servicio[]>>
  agregarServicio: (servicio: Omit<Servicio, 'id'>) => void
  actualizarServicio: (id: number, servicio: Partial<Servicio>) => void
  eliminarServicio: (id: number) => void
  historialAsignaciones: HistorialAsignacion[]
  setHistorialAsignaciones: React.Dispatch<React.SetStateAction<HistorialAsignacion[]>>
  obtenerHistorialUsuario: (usuarioId: number) => HistorialAsignacion[]
}

// Contexto
const InventarioContext = createContext<InventarioContextType | undefined>(undefined)

// Datos iniciales
const equiposIniciales: Equipo[] = [
  {
    id: 1,
    serial: 'LT-2024-001',
    marca: 'Dell',
    modelo: 'Latitude 5520',
    tipo: 'Portátil',
    estado: 'Activo',
    usuario: 'Juan Pérez',
    departamento: 'Desarrollador',
    procesador: 'Intel i7-11850H',
    ram: [
      {
        id: 'ram1',
        marca: 'Kingston',
        capacidadGb: 16,
        velocidad: 'DDR4-3200',
        slot: 'Slot 1'
      }
    ],
    discosDuros: [
      {
        id: 'hdd1',
        marca: 'Samsung',
        serial: 'SSD001234',
        tipo: 'SSD',
        capacidadGb: 512
      }
    ],
    gpu: {
      marca: 'Intel',
      modelo: 'Iris Xe Graphics',
      serial: 'IGP001',
      memoriaGb: 0
    },
    fechaAdquisicion: '2024-01-15'
  },
  {
    id: 2,
    serial: 'PC-2024-025',
    marca: 'HP',
    modelo: 'EliteDesk 800',
    tipo: 'PC Escritorio',
    estado: 'En Reparación',
    usuario: 'María García',
    departamento: 'Administrativo',
    procesador: 'Intel i5-12400',
    ram: [
      {
        id: 'ram2',
        marca: 'Corsair',
        capacidadGb: 8,
        velocidad: 'DDR4-2666',
        slot: 'Slot 1'
      }
    ],
    discosDuros: [
      {
        id: 'hdd2',
        marca: 'Western Digital',
        serial: 'WD987654',
        tipo: 'SSD',
        capacidadGb: 256
      }
    ],
    gpu: {
      marca: 'NVIDIA',
      modelo: 'GTX 1650',
      serial: 'GTX1650001',
      memoriaGb: 4
    },
    fechaAdquisicion: '2024-02-20'
  },
  {
    id: 3,
    serial: 'LT-2024-002',
    marca: 'Lenovo',
    modelo: 'ThinkPad X1',
    tipo: 'Portátil',
    estado: 'Activo',
    usuario: 'Carlos López',
    departamento: 'KAM',
    procesador: 'Intel i7-13700H',
    ram: [
      {
        id: 'ram3a',
        marca: 'Samsung',
        capacidadGb: 16,
        velocidad: 'DDR5-4800',
        slot: 'Slot 1'
      },
      {
        id: 'ram3b',
        marca: 'Samsung',
        capacidadGb: 16,
        velocidad: 'DDR5-4800',
        slot: 'Slot 2'
      }
    ],
    discosDuros: [
      {
        id: 'hdd3a',
        marca: 'Samsung',
        serial: 'NVMe001',
        tipo: 'NVMe',
        capacidadGb: 1000
      }
    ],
    gpu: {
      marca: 'Intel',
      modelo: 'Iris Xe Graphics',
      serial: 'IGP002',
      memoriaGb: 0
    },
    fechaAdquisicion: '2024-03-05'
  },
  {
    id: 4,
    serial: 'MAC-2024-001',
    marca: 'Apple',
    modelo: 'MacBook Pro M2',
    tipo: 'Portátil',
    estado: 'Activo',
    usuario: 'Ana Rodriguez',
    departamento: 'Diseñador Gráfico',
    procesador: 'Apple M2 Pro',
    ram: [
      {
        id: 'ram4',
        marca: 'Apple',
        capacidadGb: 32,
        velocidad: 'Unified Memory',
        slot: 'Integrada'
      }
    ],
    discosDuros: [
      {
        id: 'hdd4',
        marca: 'Apple',
        serial: 'APPLE001',
        tipo: 'SSD',
        capacidadGb: 1000
      }
    ],
    gpu: {
      marca: 'Apple',
      modelo: 'M2 Pro GPU',
      serial: 'M2GPU001',
      memoriaGb: 0
    },
    fechaAdquisicion: '2024-04-12'
  }
]

// Datos iniciales de usuarios
const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    departamento: 'Desarrollador',
    ciudad: 'Bogotá',
    telefono: '+1 234-567-8901',
    equiposAsignados: 1,
    fechaCreacion: '2024-01-10',
    estado: 'activo'
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria.garcia@empresa.com',
    departamento: 'Administrativo',
    ciudad: 'Medellín',
    telefono: '+1 234-567-8902',
    equiposAsignados: 1,
    fechaCreacion: '2024-01-15',
    estado: 'activo'
  },
  {
    id: 3,
    nombre: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    departamento: 'KAM',
    ciudad: 'Cali',
    telefono: '+1 234-567-8903',
    equiposAsignados: 1,
    fechaCreacion: '2024-02-01',
    estado: 'activo'
  },
  {
    id: 4,
    nombre: 'Ana Rodriguez',
    email: 'ana.rodriguez@empresa.com',
    departamento: 'Diseñador Gráfico',
    ciudad: 'Barranquilla',
    telefono: '+1 234-567-8904',
    equiposAsignados: 1,
    fechaCreacion: '2024-03-15',
    estado: 'activo'
  }
]

// Datos iniciales de servicios
const serviciosIniciales: Servicio[] = [
  {
    id: 1,
    equipoSerial: 'LT-2024-001',
    equipoMarca: 'Dell',
    equipoModelo: 'Latitude 5520',
    tipo: 'Correctivo',
    fecha: '2024-11-05',
    tecnico: 'Roberto Silva',
    diagnostico: 'Falla en el ventilador, sobrecalentamiento del procesador',
    descripcion: 'Reemplazo de ventilador interno, limpieza de disipador y aplicación de pasta térmica nueva',
    costo: 85.50,
    estado: 'Completado',
    fotografias: []
  },
  {
    id: 2,
    equipoSerial: 'PC-2024-025',
    equipoMarca: 'HP',
    equipoModelo: 'EliteDesk 800',
    tipo: 'Preventivo',
    fecha: '2024-11-03',
    tecnico: 'Juan Pérez',
    diagnostico: 'Mantenimiento preventivo programado',
    descripcion: 'Limpieza general, verificación de componentes, actualización de software y optimización del sistema',
    costo: 35.00,
    estado: 'Completado',
    fotografias: []
  },
  {
    id: 3,
    equipoSerial: 'LT-2024-002',
    equipoMarca: 'Lenovo',
    equipoModelo: 'ThinkPad X1',
    tipo: 'Instalación/Upgrade',
    fecha: '2024-11-02',
    tecnico: 'Ana Martínez',
    diagnostico: 'Solicitud de upgrade de memoria RAM',
    descripcion: 'Instalación de módulo adicional de 16GB RAM DDR4. Verificación de funcionamiento y pruebas de rendimiento',
    costo: 120.00,
    estado: 'Completado',
    fotografias: []
  },
  {
    id: 4,
    equipoSerial: 'MAC-2024-001',
    equipoMarca: 'Apple',
    equipoModelo: 'MacBook Pro M2',
    tipo: 'Correctivo',
    fecha: '2024-11-01',
    tecnico: 'Carlos López',
    diagnostico: 'Problema con pantalla - parpadeo intermitente',
    descripcion: 'Diagnóstico en progreso. Verificando conexiones internas y drivers de video',
    costo: 0,
    estado: 'En Progreso',
    fotografias: []
  },
  {
    id: 5,
    equipoSerial: 'PC-2024-030',
    equipoMarca: 'HP',
    equipoModelo: 'ProDesk 400',
    tipo: 'Instalación/Upgrade',
    fecha: '2024-10-30',
    tecnico: 'María García',
    diagnostico: 'Instalación de software especializado',
    descripcion: 'Instalación y configuración de AutoCAD 2024, configuración de licencias y pruebas de funcionamiento',
    costo: 25.00,
    estado: 'Completado',
    fotografias: []
  }
]

// Datos iniciales de historial
const historialInicial: HistorialAsignacion[] = [
  {
    id: '1',
    usuarioId: 1,
    equipoId: 1,
    equipoSerial: 'LT-2024-001',
    equipoMarca: 'Dell',
    equipoModelo: 'Latitude 5520',
    fechaAsignacion: '2024-01-15',
  },
  {
    id: '2',
    usuarioId: 2,
    equipoId: 2,
    equipoSerial: 'LT-2024-002',
    equipoMarca: 'Lenovo',
    equipoModelo: 'ThinkPad X1',
    fechaAsignacion: '2024-01-20',
  },
  {
    id: '3',
    usuarioId: 3,
    equipoId: 3,
    equipoSerial: 'MAC-2024-001',
    equipoMarca: 'Apple',
    equipoModelo: 'MacBook Pro M2',
    fechaAsignacion: '2024-02-05',
  },
  {
    id: '4',
    usuarioId: 4,
    equipoId: 4,
    equipoSerial: 'PC-2024-030',
    equipoMarca: 'HP',
    equipoModelo: 'ProDesk 400',
    fechaAsignacion: '2024-03-20',
  }
]

// Proveedor
export function InventarioProvider({ children }: { children: ReactNode }) {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [servicios, setServicios] = useState<Servicio[]>(serviciosIniciales)
  const [historialAsignaciones, setHistorialAsignaciones] = useState<HistorialAsignacion[]>(historialInicial)

  // Cargar datos desde la API al inicializar
  useEffect(() => {
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
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    cargarDatos()
  }, [])

  const agregarEquipo = (nuevoEquipo: Omit<Equipo, 'id'>) => {
    const id = Math.max(...equipos.map(e => e.id), 0) + 1
    setEquipos(prev => [...prev, { ...nuevoEquipo, id }])
  }

  const actualizarEquipo = (id: number, equipoActualizado: Partial<Equipo>) => {
    setEquipos(prev => 
      prev.map(equipo => 
        equipo.id === id ? { ...equipo, ...equipoActualizado } : equipo
      )
    )
  }

  const eliminarEquipo = (id: number) => {
    setEquipos(prev => prev.filter(equipo => equipo.id !== id))
  }

  // Funciones para usuarios
  const agregarUsuario = async (nuevoUsuario: Omit<Usuario, 'id' | 'equiposAsignados' | 'estado'>) => {
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
      return null
    }
  }

  const actualizarUsuario = async (id: string, usuarioActualizado: Partial<Usuario>) => {
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
      return null
    }
  }

  // Eliminar usuario permanentemente (solo si no tiene equipos)
  const eliminarUsuario = (id: string): boolean => {
    const usuario = usuarios.find(u => u.id === id)
    if (!usuario) return false
    
    // No permitir eliminar si tiene equipos asignados
    if (usuario.equiposAsignados > 0) {
      return false
    }

    setUsuarios(prev => prev.filter(usuario => usuario.id !== id))
    
    // Eliminar del historial también
    setHistorialAsignaciones(prev => 
      prev.filter(hist => hist.usuarioId !== id)
    )
    
    return true
  }

  // Retirar usuario (liberar equipos y marcar como retirado)
  const retirarUsuario = (id: number): boolean => {
    const usuario = usuarios.find(u => u.id === id)
    if (!usuario || usuario.estado === 'retirado') return false

    const fechaActual = new Date().toISOString().split('T')[0]

    // Liberar todos los equipos asignados
    setEquipos(prev => 
      prev.map(equipo => 
        equipo.usuario === usuario.nombre 
          ? { ...equipo, usuario: undefined, estado: 'Disponible' }
          : equipo
      )
    )

    // Actualizar historial - marcar como liberados
    setHistorialAsignaciones(prev => 
      prev.map(hist => 
        hist.usuarioId === id && !hist.fechaLiberacion
          ? { 
              ...hist, 
              fechaLiberacion: fechaActual,
              motivo: 'retirado'
            }
          : hist
      )
    )

    // Marcar usuario como retirado
    setUsuarios(prev => 
      prev.map(user => 
        user.id === id 
          ? { 
              ...user, 
              estado: 'retirado',
              equiposAsignados: 0,
              fechaRetiro: fechaActual
            }
          : user
      )
    )

    return true
  }

  // Reactivar usuario retirado
  const reactivarUsuario = (id: number): void => {
    setUsuarios(prev => 
      prev.map(user => 
        user.id === id && user.estado === 'retirado'
          ? { 
              ...user, 
              estado: 'activo',
              fechaRetiro: undefined
            }
          : user
      )
    )
  }

  // Obtener historial de un usuario específico
  const obtenerHistorialUsuario = (usuarioId: number): HistorialAsignacion[] => {
    return historialAsignaciones.filter(hist => hist.usuarioId === usuarioId)
  }

  // Funciones para servicios
  const agregarServicio = (nuevoServicio: Omit<Servicio, 'id'>) => {
    const id = Math.max(...servicios.map(s => s.id), 0) + 1
    setServicios(prev => [...prev, { ...nuevoServicio, id }])
  }

  const actualizarServicio = (id: number, servicioActualizado: Partial<Servicio>) => {
    setServicios(prev => 
      prev.map(servicio => 
        servicio.id === id ? { ...servicio, ...servicioActualizado } : servicio
      )
    )
  }

  const eliminarServicio = (id: number) => {
    setServicios(prev => prev.filter(servicio => servicio.id !== id))
  }

  // Memorizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    equipos,
    setEquipos,
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
    usuarios,
    setUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    retirarUsuario,
    reactivarUsuario,
    servicios,
    setServicios,
    agregarServicio,
    actualizarServicio,
    eliminarServicio,
    historialAsignaciones,
    setHistorialAsignaciones,
    obtenerHistorialUsuario
  }), [
    equipos, 
    usuarios, 
    servicios, 
    historialAsignaciones,
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    retirarUsuario,
    reactivarUsuario,
    agregarServicio,
    actualizarServicio,
    eliminarServicio,
    obtenerHistorialUsuario
  ])

  return (
    <InventarioContext.Provider value={contextValue}>
      {children}
    </InventarioContext.Provider>
  )
}

// Hook
export function useInventario() {
  const context = useContext(InventarioContext)
  if (context === undefined) {
    throw new Error('useInventario debe usarse dentro de un InventarioProvider')
  }
  return context
}

export type { Equipo, DiscoDuro, TarjetaRAM, GPU, Servicio, HistorialAsignacion }