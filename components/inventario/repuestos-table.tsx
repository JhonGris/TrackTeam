'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Package, History, ArrowLeftRight, User } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditarRepuestoDialog } from './editar-repuesto-dialog'
import { ConfirmarEliminarDialog } from './confirmar-eliminar-dialog'
import { HistorialMovimientosDialog } from './historial-movimientos-dialog'
import { MovimientoDialog } from './movimiento-dialog'
import type { RepuestoConCategoria, CategoriaRepuesto } from '@/types/repuestos'
import type { Colaborador } from '@/types/models'

type Props = {
  repuestos: RepuestoConCategoria[]
  categorias: CategoriaRepuesto[]
  colaboradores: Colaborador[]
}

export function RepuestosTable({ repuestos, categorias, colaboradores }: Props) {
  const [editando, setEditando] = useState<RepuestoConCategoria | null>(null)
  const [eliminando, setEliminando] = useState<RepuestoConCategoria | null>(null)
  const [historial, setHistorial] = useState<RepuestoConCategoria | null>(null)
  const [movimiento, setMovimiento] = useState<RepuestoConCategoria | null>(null)

  // Formatear número con ceros a la izquierda (000, 001, 002...)
  const formatNumero = (num: number) => {
    return num.toString().padStart(3, '0')
  }

  // Check if item is assigned (cantidad === 0 means assigned to someone)
  const isAssigned = (repuesto: RepuestoConCategoria) => repuesto.cantidad === 0

  if (repuestos.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay repuestos</h3>
        <p className="text-muted-foreground">
          Agrega repuestos al inventario para comenzar
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repuestos.map((repuesto) => (
          <div 
            key={repuesto.id}
            className={cn(
              "bg-card border rounded-none p-4 hover:shadow-md transition-shadow",
              isAssigned(repuesto) && "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-700"
            )}
          >
            <div className="flex gap-4">
              {/* Foto */}
              <div className="flex-shrink-0">
                {repuesto.fotoUrl ? (
                  <Image
                    src={repuesto.fotoUrl}
                    alt={repuesto.nombre}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-none border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-none border flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-medium bg-muted px-2 py-0.5 rounded-none">
                        {formatNumero(repuesto.numero)}
                      </span>
                      {repuesto.categoria && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ 
                            borderColor: repuesto.categoria.color,
                            color: repuesto.categoria.color
                          }}
                        >
                          {repuesto.categoria.nombre}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium truncate">{repuesto.nombre}</h3>
                    {repuesto.codigoInterno && (
                      <p className="text-xs text-muted-foreground">
                        {repuesto.codigoInterno}
                      </p>
                    )}
                    {repuesto.descripcion && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {repuesto.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Menú de acciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setMovimiento(repuesto)}>
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Registrar Movimiento
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setHistorial(repuesto)}>
                        <History className="h-4 w-4 mr-2" />
                        Ver Historial
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditando(repuesto)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setEliminando(repuesto)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Asignado a */}
                {(repuesto.asignadoA || isAssigned(repuesto)) && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {isAssigned(repuesto) ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300">
                          Asignado{repuesto.asignadoA ? `: ${repuesto.asignadoA}` : ''}
                        </Badge>
                      ) : (
                        <span>Asignado a: <span className="text-foreground">{repuesto.asignadoA}</span></span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Diálogos */}
      {editando && (
        <EditarRepuestoDialog
          repuesto={editando}
          categorias={categorias}
          open={!!editando}
          onOpenChange={(open: boolean) => !open && setEditando(null)}
        />
      )}

      {historial && (
        <HistorialMovimientosDialog
          repuesto={historial}
          open={!!historial}
          onOpenChange={(open: boolean) => !open && setHistorial(null)}
        />
      )}

      {eliminando && (
        <ConfirmarEliminarDialog
          repuesto={eliminando}
          open={!!eliminando}
          onOpenChange={(open: boolean) => !open && setEliminando(null)}
        />
      )}

      {movimiento && (
        <MovimientoDialog
          repuesto={movimiento}
          colaboradores={colaboradores}
          open={!!movimiento}
          onOpenChange={(open: boolean) => !open && setMovimiento(null)}
        />
      )}
    </>
  )
}
