// ============================================================================
// SERVER COMPONENT - Stats Display (Single Responsibility)
// ============================================================================

interface StatsProps {
  stats: {
    totalColaboradores: number
    conEquipos: number
    sinEquipos: number
    totalEquipos: number
  }
}

/**
 * Colaboradores stats component
 * Server Component - pure presentation, no interactivity
 * Follows Dependency Inversion - receives data through props
 */
export function ColaboradoresStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card border rounded-none p-4 text-center">
        <p className="text-2xl font-bold">{stats.totalColaboradores}</p>
        <p className="text-sm text-muted-foreground">Total</p>
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-primary">{stats.conEquipos}</p>
        <p className="text-sm text-primary/70">Con Equipos</p>
      </div>
      <div className="bg-accent/10 border border-accent/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-accent">{stats.sinEquipos}</p>
        <p className="text-sm text-accent/70">Sin Equipos</p>
      </div>
      <div className="bg-secondary/10 border border-secondary/20 rounded-none p-4 text-center">
        <p className="text-2xl font-bold text-secondary">{stats.totalEquipos}</p>
        <p className="text-sm text-secondary/70">Equipos Asignados</p>
      </div>
    </div>
  )
}
