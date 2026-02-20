import { Loader2 } from 'lucide-react'

/**
 * Reusable page loading skeleton
 * Shows a spinner with optional title, providing instant navigation feedback
 */
export function PageLoading({ title }: { title?: string }) {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded bg-muted/50" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted/50" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-4">
          <div className="h-10 flex-1 max-w-md animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>

        {/* Content area with spinner */}
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {title ? `Cargando ${title}...` : 'Cargando...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
