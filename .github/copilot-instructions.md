# TrackTeam - AI Coding Agent Instructions

## Project Overview

**TrackTeam** is a web-based IT equipment management system for tracking 40-50 computers (desktops/laptops) and their maintenance history. This is a **fresh Next.js 16 project** being built from scratch - the `proyecto_anterior/` folder contains reference code from a previous implementation that should **inform but not dictate** the new architecture.

**Tech Stack:**
- Next.js 16.0.4 with App Router
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4 (v4 uses different config approach)
- shadcn/ui components (New York style, RSC mode)
- Lucide React for icons

## Architecture & Data Flow

### Previous Implementation Reference
The `proyecto_anterior/` folder shows a working implementation using:
- Prisma ORM with SQLite
- Client-side context (`InventarioContext`) for state management
- API routes in `src/app/api/` for data operations
- Component-based architecture with clear separation

### Current Project Structure
```
app/                  # Next.js 16 App Router (currently scaffold only)
  layout.tsx         # Root layout with Geist fonts
  page.tsx           # Homepage (default Next.js template)
  globals.css        # Tailwind v4 + shadcn theme variables

lib/
  utils.ts           # cn() utility for Tailwind class merging

components/          # Future shadcn/ui components
types/               # TypeScript type definitions
proyecto_anterior/   # Reference implementation - DO NOT MODIFY
```

## Critical Development Patterns

### 1. Next.js 16 Best Practices - Server-First Architecture

**🚨 PRIORITY: SERVER COMPONENTS BY DEFAULT**

According to Next.js 16 official documentation, **all components are Server Components by default**. Use Client Components (`'use client'`) ONLY when strictly necessary.

#### When to Use Server Components (Default):
- ✅ Fetching data from databases or APIs
- ✅ Accessing backend resources (API keys, tokens, secrets)
- ✅ Keeping large dependencies on the server (reduces client bundle)
- ✅ Static content rendering
- ✅ SEO-friendly content
- ✅ Streaming and progressive rendering

#### When to Use Client Components (`'use client'`):
- ⚠️ State management (`useState`, `useReducer`)
- ⚠️ Event handlers (`onClick`, `onChange`, `onSubmit`)
- ⚠️ Lifecycle effects (`useEffect`, `useLayoutEffect`)
- ⚠️ Browser-only APIs (`localStorage`, `window`, `navigator`)
- ⚠️ Custom React hooks that use state/effects
- ⚠️ Third-party libraries requiring client-side execution

**Example Pattern (From Next.js Docs):**
```tsx
// ✅ Server Component (default) - fetches data
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  
  return (
    <div>
      <h1>{post.title}</h1>
      <LikeButton likes={post.likes} /> {/* Client component for interactivity */}
    </div>
  )
}

// ⚠️ Client Component - handles user interaction
'use client'
import { useState } from 'react'

export default function LikeButton({ likes }: { likes: number }) {
  const [count, setCount] = useState(likes)
  return <button onClick={() => setCount(count + 1)}>Like ({count})</button>
}
```

### 2. Server Actions for Form Handling

**🚨 USE SERVER ACTIONS INSTEAD OF API ROUTES FOR MUTATIONS**

According to Next.js 16 documentation, prefer Server Actions over traditional API routes for data mutations.

**Server Action Pattern (Recommended):**
```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function createColaborador(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  
  await prisma.colaborador.create({
    data: { nombre, apellido, /* ... */ }
  })
  
  revalidatePath('/colaboradores')
}

// app/colaboradores/nuevo/page.tsx (Server Component)
import { createColaborador } from '@/app/actions'

export default function NuevoColaborador() {
  return (
    <form action={createColaborador}>
      <input name="nombre" required />
      <input name="apellido" required />
      <button type="submit">Crear</button>
    </form>
  )
}
```

**Benefits:**
- ✅ Progressive enhancement (works without JavaScript)
- ✅ Automatic revalidation with `revalidatePath()`
- ✅ Type-safe server-side execution
- ✅ Reduced client bundle size
- ✅ Built-in CSRF protection

### 3. Component Composition Best Practices

**Minimize Client Component Boundaries:**
```tsx
// ❌ BAD - Entire layout becomes client component
'use client'
import Logo from './logo'
import Search from './search'

export default function Layout({ children }) {
  return (
    <nav>
      <Logo /> {/* Unnecessarily part of client bundle */}
      <Search />
    </nav>
  )
}

// ✅ GOOD - Only interactive part is client component
import Logo from './logo' // Server Component
import Search from './search' // Client Component

export default function Layout({ children }) {
  return (
    <nav>
      <Logo />
      <Search /> {/* Only this needs 'use client' */}
    </nav>
  )
}
```

**Pass Server Components as Children to Client Components:**
```tsx
// Client Component wrapper
'use client'
export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// Server Component usage
import Modal from './modal'
import Cart from './cart' // Server Component

export default function Page() {
  return (
    <Modal>
      <Cart /> {/* Rendered on server, passed to client modal */}
    </Modal>
  )
}
```

### 4. Data Fetching Patterns

**Direct Database Access in Server Components:**
```tsx
// app/colaboradores/page.tsx
import prisma from '@/lib/prisma'

export default async function ColaboradoresPage() {
  // Fetch directly in Server Component
  const colaboradores = await prisma.colaborador.findMany({
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }]
  })
  
  return (
    <div>
      {colaboradores.map(c => (
        <ColaboradorCard key={c.id} colaborador={c} />
      ))}
    </div>
  )
}
```

**Streaming with Suspense:**
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ColaboradoresList />
    </Suspense>
  )
}
```

### 5. Form Validation Best Practices

**Progressive Enhancement with Server Actions:**
```tsx
// app/actions.ts
'use server'

import { z } from 'zod'

const ColaboradorSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  cargo: z.string().min(1, 'Cargo requerido'),
})

export async function createColaborador(formData: FormData) {
  const validatedFields = ColaboradorSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    cargo: formData.get('cargo'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Proceed with validated data
  await prisma.colaborador.create({ data: validatedFields.data })
  revalidatePath('/colaboradores')
  redirect('/colaboradores')
}
```

**Client-Side Enhancement (when needed):**
```tsx
'use client'

import { useActionState } from 'react'
import { createColaborador } from '@/app/actions'

export function ColaboradorForm() {
  const [state, formAction, pending] = useActionState(createColaborador, null)

  return (
    <form action={formAction}>
      <input name="nombre" aria-describedby="nombre-error" />
      {state?.errors?.nombre && <span id="nombre-error">{state.errors.nombre}</span>}
      
      <button type="submit" disabled={pending}>
        {pending ? 'Creando...' : 'Crear'}
      </button>
    </form>
  )
}
```

### 6. Next.js 16 Specifics
- **Use App Router exclusively** - no Pages Router
- Server Components by default (`'use client'` only when needed)
- Async `params` and `searchParams` in page components (Next.js 16 breaking change)
- Type-safe routing with auto-generated types in `types/routes.d.ts`

### 7. shadcn/ui Component System
- Install components via: `npx shadcn@latest add <component-name>`
- Configuration in `components.json` (New York style, RSC-enabled)
- All components use path aliases: `@/components`, `@/lib`, `@/utils`
- Components go in `components/ui/` with organized feature folders

### 8. Styling Conventions
- **Tailwind CSS v4** uses `@theme inline` in `globals.css` - different from v3!
- Custom CSS variables defined in `:root` for shadcn theme
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Previous project used custom CSS classes (`.sidebar-layout`, `.stat-card`) - migrate these to Tailwind utilities

### 9. TypeScript Patterns
```typescript
// Path aliases configured in tsconfig.json
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Next.js 16 page component pattern
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const search = await searchParams
  // ...
}
```

### 10. Data Models (from PRD and previous schema)
Core entities to implement:
```typescript
// Usuario (User/Collaborator)
type Usuario = {
  id: string
  nombre: string
  apellido: string
  cargo: string
  email: string
  ciudad?: string
}

// Equipo (Equipment)
type Equipo = {
  id: string
  serial: string
  tipo: 'Desktop' | 'Portátil'
  marca: string
  modelo: string
  procesador: string
  ram: number
  almacenamiento: string
  gpu: string
  estadoSalud: 'Bueno' | 'Regular' | 'Malo'
  fechaAdquisicion: Date
  usuarioId?: string
}

// ServicioTecnico (Maintenance)
type ServicioTecnico = {
  id: string
  equipoId: string
  tipo: 'Preventivo' | 'Correctivo' | 'Limpieza' | 'Actualización de Software'
  fechaServicio: Date
  problemas: string
  soluciones: string
  tiempoInvertido: number
  estadoResultante: 'Bueno' | 'Regular' | 'Malo'
}
```

## Development Workflows

### Starting Development Server
```bash
npm run dev          # Runs on http://localhost:3000
```

### Adding shadcn Components
```bash
npx shadcn@latest add button dialog input label select
```

### Common File Patterns
- **Feature pages:** `app/<feature>/page.tsx`
- **Server Actions:** `app/actions.ts` or `app/<feature>/actions.ts`
- **API routes (legacy):** `app/api/<endpoint>/route.ts` (use Server Actions instead)
- **UI components:** `components/ui/<component>.tsx`
- **Feature components:** `components/<feature>/<component>.tsx`

## Project-Specific Conventions

### Component Export Pattern
From previous implementation - use **named exports** for components:
```typescript
// Good (consistent with proyecto_anterior)
export function EquipoCard({ equipo }: EquipoCardProps) { }

// Avoid
export default function EquipoCard() { }
```

### Color Coding for Equipment Health
Visual indicators from PRD requirements:
- 🟢 Green (`status-badge--success`): Bueno
- 🟡 Yellow (`status-badge--warning`): Regular  
- 🔴 Red (`status-badge--danger`): Malo

### File Naming
- Components: PascalCase (e.g., `NuevoEquipoDialog.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- API routes/actions: kebab-case folders (e.g., `app/api/equipos/route.ts`)

## Key Integration Points

### Database Layer (Implemented)
Using Prisma 6.19.0 with SQLite:
- Prisma schema: `prisma/schema.prisma`
- Database client: `lib/prisma.ts` singleton
- Migration workflow: `npx prisma migrate dev`

### State Management
- **Server Components**: Fetch directly, no state needed
- **Client state**: Use `useState` only in Client Components
- **Form state**: Use Server Actions with `useActionState` for enhanced UX
- **Global state**: Context providers in Client Components wrapping Server Components

### File Upload (Future Phase)
Previous implementation handled equipment photos. Plan for:
- Cloud storage (AWS S3 / Cloudinary per PRD)
- Server Action for file upload
- Image optimization with Next.js `<Image>` component

## Documentation References

- **PRD:** See `PRD.md` for complete product requirements
- **Project Phases:** See `FASES_DEL_PROYECTO.md` for MVP roadmap
- **Previous Implementation:** Explore `proyecto_anterior/src/` for working patterns
- **Next.js 16 Docs:** Always use MCP `nextjs_docs` tool for official patterns

## Phase 1 MVP Priorities

Focus on these core features first (per `FASES_DEL_PROYECTO.md`):
1. CRUD for Colaboradores (Users) - **Server Actions + Server Components**
2. CRUD for Equipos (Equipment) with health status
3. Basic Mantenimientos (Maintenance) registry
4. Simple search/filtering
5. Basic dashboard with stats

## Common Pitfalls to Avoid

1. **Don't use Client Components by default** - Start with Server Components, add `'use client'` only when needed
2. **Don't fetch data in Client Components** - Use Server Components or Server Actions
3. **Don't create API routes for mutations** - Use Server Actions instead
4. **Don't use Tailwind v3 syntax** - this project uses v4 with `@theme inline`
5. **Don't mix Server/Client Components unnecessarily** - compose properly with children pattern
6. **Don't copy proyecto_anterior code directly** - use it as reference, adapt to Next.js 16 patterns
7. **Don't forget async params** - Next.js 16 made `params` and `searchParams` promises
8. **Don't install duplicate dependencies** - check `package.json` first

## Quick Command Reference

```bash
# Development
npm run dev                              # Start dev server
npm run build                            # Production build
npm run lint                             # Run ESLint

# shadcn/ui
npx shadcn@latest add [component]        # Add UI component
npx shadcn@latest diff [component]       # Check component updates

# Database
npx prisma generate                      # Generate Prisma Client
npx prisma migrate dev                   # Run migrations
npx prisma studio                        # Open Prisma Studio GUI
```

---

**Key Principle:** This is a modern Next.js 16 project following official best practices:
1. **Server Components by default** - minimize client-side JavaScript
2. **Server Actions for mutations** - progressive enhancement, type-safety
3. **Proper component composition** - Server Components as children of Client Components
4. **Direct data fetching** - in Server Components, close to the data source
5. Use `proyecto_anterior/` as **reference for business logic** only, implement with Next.js 16 patterns
