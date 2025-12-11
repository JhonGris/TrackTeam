// ============================================================================
// SERVER COMPONENT - Equipos Stats Display (Single Responsibility)
// ============================================================================

interface StatsProps {
  stats: {
    totalEquipos: number
    asignados: number
    sinAsignar: number
    desktops: number
    portatiles: number
    estadoBueno: number
    estadoRegular: number
    estadoMalo: number
  }
}

/**
 * Equipos stats component
 * Server Component - pure presentation, no interactivity
 * Follows Dependency Inversion - receives data through props
 */
export function EquiposStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-card border rounded-none p-4 text-center">
        <p className="text-2xl font-bold">{stats.totalEquipos}</p>
        <p className="text-sm text-muted-foreground">Total</p>
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-primary">{stats.asignados}</p>
        <p className="text-sm text-primary/70">Asignados</p>
      </div>
      <div className="bg-accent/10 border border-accent/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-accent">{stats.sinAsignar}</p>
        <p className="text-sm text-accent/70">Sin Asignar</p>
      </div>
      <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-secondary">{stats.desktops}</p>
        <p className="text-sm text-secondary/70">Desktops</p>
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-primary">{stats.portatiles}</p>
        <p className="text-sm text-primary/70">Portátiles</p>
      </div>
    </div>
  )
}
