'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Pencil, Trash2, Camera, Mail, Loader2 } from 'lucide-react'
import { deleteServicio, enviarReporteServicio } from '@/app/servicios/actions'
import { EditarServicioDialog } from './editar-servicio-dialog'
import { ServicioArchivosDialog } from './servicio-archivos-dialog'
import type { ArchivoServicio } from '@/types/servicios'

type EquipoSelect = {
  id: string
  serial: string
  marca: string
  modelo: string
  colaborador: {
    nombre: string
    apellido: string
  } | null
}

type Servicio = {
  id: string
  equipoId: string
  tipo: string
  fechaServicio: Date
  problemas: string
  soluciones: string
  tiempoInvertido: number
  estadoResultante: string
  archivos?: ArchivoServicio[]
  equipo?: {
    serial: string
    marca: string
    modelo: string
  }
}

type ServicioCardActionsProps = {
  servicio: Servicio
  equipos: EquipoSelect[]
}

export function ServicioCardActions({ servicio, equipos }: ServicioCardActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [archivosOpen, setArchivosOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingEmail, startEmailTransition] = useTransition()
  const [emailResult, setEmailResult] = useState<{ success?: boolean; error?: string } | null>(null)

  // Format archivos for dialog
  const archivosFormateados = (servicio.archivos || []).map(a => ({
    ...a,
    createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt as unknown as string).toISOString(),
  }))

  // Description for the photos dialog
  const servicioDescripcion = servicio.equipo 
    ? `${servicio.tipo} - ${servicio.equipo.marca} ${servicio.equipo.modelo}`
    : servicio.tipo

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteServicio(servicio.id)
    if (!result.success) {
      alert(result.error || 'Error al eliminar')
    }
    setIsDeleting(false)
    setDeleteOpen(false)
  }

  const handleSendEmail = () => {
    setEmailResult(null)
    startEmailTransition(async () => {
      const result = await enviarReporteServicio(servicio.id)
      setEmailResult(result)
      if (result.success) {
        // Clear success message after 3 seconds
        setTimeout(() => setEmailResult(null), 3000)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Email status indicator */}
      {emailResult && (
        <span className={`text-xs px-2 py-1 rounded ${emailResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {emailResult.success ? '✓ Enviado' : emailResult.error}
        </span>
      )}

      {/* Botón de fotos siempre visible */}
      <ServicioArchivosDialog
        servicioId={servicio.id}
        servicioDescripcion={servicioDescripcion}
        archivos={archivosFormateados}
      />
      
      {/* Menú de acciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSendEmail} disabled={isSendingEmail}>
            {isSendingEmail ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {isSendingEmail ? 'Enviando...' : 'Enviar Reporte'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditarServicioDialog
        servicio={servicio}
        equipos={equipos}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este
              registro de servicio técnico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
