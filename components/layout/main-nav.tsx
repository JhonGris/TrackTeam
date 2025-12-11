'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, Monitor, Wrench, LayoutDashboard, Calendar, Package, FileText } from 'lucide-react'
import { GlobalSearch } from './global-search'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Colaboradores', href: '/colaboradores', icon: Users },
  { name: 'Equipos', href: '/equipos', icon: Monitor },
  { name: 'Servicios', href: '/servicios', icon: Wrench },
  { name: 'Calendario', href: '/calendario', icon: Calendar },
  { name: 'Inventario', href: '/inventario', icon: Package },
  { name: 'Plantillas', href: '/plantillas', icon: FileText },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl flex h-14 items-center">
        {/* Logo */}
        <div className="mr-6 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold text-sm">
            TT
          </div>
          <span className="hidden font-semibold sm:inline-block">
            TrackTeam
          </span>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border mr-6 hidden sm:block" />

        {/* Navigation Links */}
        <nav className="flex items-center text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-none transition-all duration-200',
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Separator */}
        <div className="h-6 w-px bg-border ml-auto mr-4 hidden sm:block" />

        {/* Search */}
        <div className="ml-auto sm:ml-0">
          <GlobalSearch />
        </div>
      </div>
    </header>
  )
}
