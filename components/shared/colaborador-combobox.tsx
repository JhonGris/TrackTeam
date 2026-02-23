'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, User, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Colaborador = {
  id: string
  nombre: string
  apellido: string
  cargo: string
}

type Props = {
  colaboradores: Colaborador[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** Show "Sin asignar" option (default: true) */
  allowNone?: boolean
  noneLabel?: string
  className?: string
}

export function ColaboradorCombobox({
  colaboradores,
  value,
  onValueChange,
  placeholder = 'Buscar colaborador...',
  disabled = false,
  allowNone = true,
  noneLabel = 'Sin asignar',
  className,
}: Props) {
  const [open, setOpen] = useState(false)

  const selected = colaboradores.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">
                {selected.nombre} {selected.apellido}
                <span className="text-muted-foreground"> — {selected.cargo}</span>
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              {value === null || value === '' ? noneLabel : placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No se encontraron colaboradores.</CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value="__none__"
                  onSelect={() => {
                    onValueChange(null)
                    setOpen(false)
                  }}
                >
                  <UserX className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{noneLabel}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      !value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              )}
              {colaboradores
                .sort((a, b) => {
                  const nameA = `${a.nombre} ${a.apellido}`.toLowerCase()
                  const nameB = `${b.nombre} ${b.apellido}`.toLowerCase()
                  return nameA.localeCompare(nameB)
                })
                .map((col) => (
                  <CommandItem
                    key={col.id}
                    value={`${col.nombre} ${col.apellido} ${col.cargo}`}
                    onSelect={() => {
                      onValueChange(col.id)
                      setOpen(false)
                    }}
                  >
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">
                        {col.nombre} {col.apellido}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {col.cargo}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === col.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
