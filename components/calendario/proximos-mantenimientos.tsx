import { getProximosMantenimientos } from '@/app/calendario/actions'
import { Calendar, Clock, Wrench, Monitor, AlertTriangle } from 'lucide-react'

// Utility functions
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const TIPO_COLORS: Record<string, string> = {
  Preventivo: 'bg-blue-100 text-blue-800',
  Correctivo: 'bg-red-100 text-red-800',
  Limpieza: 'bg-green-100 text-green-800',
  'Actualización de Software': 'bg-purple-100 text-purple-800',
}

type MantenimientoItem = Awaited<ReturnType<typeof getProximosMantenimientos>>[number]

export async function ProximosMantenimientos() {
  const mantenimientos = await getProximosMantenimientos(30)

  if (mantenimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Calendar className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No hay mantenimientos programados</p>
        <p className="text-xs mt-1">para los próximos 30 días</p>
      </div>
    )
  }

  // Agrupar por día
  const mantenimientosPorDia = mantenimientos.reduce<Record<string, MantenimientoItem[]>>((acc, m) => {
    const fecha = formatDate(m.fechaProgramada)
    if (!acc[fecha]) acc[fecha] = []
    acc[fecha].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(mantenimientosPorDia).map(([fecha, items]) => {
        const fechaObj = new Date(items[0].fechaProgramada)
        const esHoy = new Date().toDateString() === fechaObj.toDateString()
        const esMañana = new Date(Date.now() + 86400000).toDateString() === fechaObj.toDateString()
        
        let etiquetaDia = fecha
        if (esHoy) etiquetaDia = 'Hoy'
        else if (esMañana) etiquetaDia = 'Mañana'

        return (
          <div key={fecha} className="space-y-2">
            <h4 className={`text-sm font-medium ${esHoy ? 'text-orange-600' : 'text-muted-foreground'}`}>
              {etiquetaDia}
              {!esHoy && !esMañana && (
                <span className="ml-2 text-xs font-normal">
                  {fechaObj.toLocaleDateString('es-ES', { weekday: 'long' })}
                </span>
              )}
            </h4>
            
            <div className="space-y-2">
              {items.map((m) => {
                const esVencido = new Date(m.fechaProgramada) < new Date()
                
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                      esVencido ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${TIPO_COLORS[m.tipo] || 'bg-gray-100 text-gray-800'}`}>
                            {m.tipo}
                          </span>
                          {esVencido && (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Vencido
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 flex items-center gap-1.5 text-sm">
                          <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate font-medium">
                            {m.equipo.marca} {m.equipo.modelo}
                          </span>
                        </div>
                        
                        <div className="mt-1 text-xs text-muted-foreground truncate">
                          Serial: {m.equipo.serial}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(m.fechaProgramada)}
                      </div>
                    </div>

                    {m.esRecurrente && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Wrench className="h-3 w-3" />
                        Recurrente: {m.frecuencia}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
