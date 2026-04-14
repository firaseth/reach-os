'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, onClear, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={cn('relative max-w-xs', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
      <Input
        placeholder={placeholder}
        className="h-8 pl-8 text-[13px] bg-muted/30 border-transparent focus:border-border"
        value={value}
        onChange={onChange}
      />
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
          onClick={onClear}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
