'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Monitor, Home, Users, BarChart3, Wrench, UserX, Menu, X } from 'lucide-react'
import { LoadingIndicator, useNavigation } from '@/components/ui/loading'

interface MainLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Usuarios', href: '/usuarios', icon: Users },
  { name: 'Equipos', href: '/equipos', icon: Monitor },
  { name: 'Servicio Técnico', href: '/servicios', icon: Wrench },
  { name: 'Usuarios Retirados', href: '/usuarios-retirados', icon: UserX },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
]

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isNavigating } = useNavigation()

  return (
    <div className="sidebar-layout">
      {/* Loading indicator */}
      <LoadingIndicator isLoading={isNavigating} />
      
      {/* Sidebar fijo */}
      <div className="sidebar-fixed">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">I</div>
          <div className="sidebar-logo-text">
            <h1 className="sidebar-logo-title">IGLOO LAB</h1>
            <p className="sidebar-logo-subtitle">Servicio Técnico e Inventario</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="sidebar-nav-icon" size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Usuario info */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar"></div>
            <div className="sidebar-user-details">
              <p className="sidebar-user-name">Admin</p>
              <p className="sidebar-user-role">IGLOO LAB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="sidebar-content">
        {children}
      </div>

      {/* Header móvil */}
      <div className="mobile-header">
        <button 
          className="mobile-menu-button"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        
        <div className="mobile-logo">
          <div className="mobile-logo-icon">I</div>
          <h1 className="mobile-logo-title">IGLOO LAB</h1>
        </div>

        <div className="mobile-user-avatar"></div>
      </div>

      {/* Sidebar móvil overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="sidebar-fixed open">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">I</div>
              <div className="sidebar-logo-text">
                <h1 className="sidebar-logo-title">IGLOO LAB</h1>
                <p className="sidebar-logo-subtitle">Servicio Técnico e Inventario</p>
              </div>
            </div>

            <nav className="sidebar-nav">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="sidebar-nav-icon" size={20} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}