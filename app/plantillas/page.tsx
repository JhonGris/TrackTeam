import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getPlantillas } from './actions'
import { PlantillasTable } from '@/components/plantillas/plantillas-table'
import { NuevaPlantillaButton } from '@/components/plantillas/nueva-plantilla-button'

export const metadata = {
  title: 'Plantillas de Mantenimiento | TrackTeam',
  description: 'Gestión de plantillas para servicios técnicos',
}

export default async function PlantillasPage() {
  const plantillas = await getPlantillas()

  // Estadísticas
  const totalPlantillas = plantillas.length
  const plantillasActivas = plantillas.filter(p => p.activa).length
  const porTipo = {
    Preventivo: plantillas.filter(p => p.tipo === 'Preventivo').length,
    Correctivo: plantillas.filter(p => p.tipo === 'Correctivo').length,
    Limpieza: plantillas.filter(p => p.tipo === 'Limpieza').length,
    'Actualización de Software': plantillas.filter(p => p.tipo === 'Actualización de Software').length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Plantillas de Mantenimiento
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea plantillas para agilizar el registro de servicios técnicos
          </p>
        </div>
        <NuevaPlantillaButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-none p-4 text-center">
          <p className="text-2xl font-bold">{totalPlantillas}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-primary">{porTipo.Preventivo}</p>
          <p className="text-sm text-primary/70">Preventivo</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-accent">{porTipo.Correctivo}</p>
          <p className="text-sm text-accent/70">Correctivo</p>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
          <p className="text-2xl font-bold text-secondary">
            {porTipo.Limpieza + porTipo['Actualización de Software']}
          </p>
          <p className="text-sm text-secondary/70">Otros</p>
        </div>
      </div>

      {/* Table */}
      {plantillas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay plantillas</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Las plantillas te permiten pre-llenar formularios de servicio técnico 
              con información común, ahorrando tiempo en cada registro.
            </p>
            <NuevaPlantillaButton />
          </CardContent>
        </Card>
      ) : (
        <PlantillasTable plantillas={plantillas} />
      )}
    </div>
  )
}
