'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ContentLayout } from '@/components/ui/content-layout'
import { Button } from '@/components/ui/button'
import { useInventario, type Usuario } from '@/contexts/InventarioContext'
import { Users, Filter, Search, RotateCcw, Trash2 } from 'lucide-react'

export default function UsuariosRetiradosPage() {
  const { usuarios, eliminarUsuario } = useInventario()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filtrar usuarios retirados
  const usuariosRetirados = usuarios.filter((usuario: Usuario) => usuario.estado === 'retirado')
  
  // Aplicar filtro de búsqueda
  const usuariosFiltrados = usuariosRetirados.filter((usuario: Usuario) => {
    if (!searchQuery) return true
    
    return usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
           usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           usuario.departamento.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <MainLayout>
      <ContentLayout>
        <div className="p-6 space-y-6">
          <div className="page-header-section">
            <h1 className="page-title">Usuarios Retirados</h1>
            <p className="page-description">
              Historial de usuarios que han sido retirados del sistema
            </p>
          </div>

          {/* Búsqueda */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar usuarios retirados..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Lista de usuarios retirados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {usuariosFiltrados.length > 0 ? (
                <div className="space-y-4">
                  {usuariosFiltrados.map((usuario) => (
                    <div key={usuario.id} className="improved-card">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-gray-600 font-bold text-lg">
                            {usuario.nombre.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{usuario.nombre}</h3>
                          <p className="text-gray-600">{usuario.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="status-badge">{usuario.departamento}</span>
                            <span className="status-badge status-badge--danger">Retirado</span>
                            {usuario.fechaRetiro && (
                              <span className="text-sm text-gray-500">
                                Retirado: {new Date(usuario.fechaRetiro).toLocaleDateString('es-ES')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => console.log('Reactivar usuario')}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reactivar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => eliminarUsuario(usuario.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No hay usuarios retirados
                  </h3>
                  <p className="text-gray-500">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>
    </MainLayout>
  )
}