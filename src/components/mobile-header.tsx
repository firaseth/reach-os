'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function MobileHeader() {
  const { toggleMobileMenu } = useAppStore()
  const { user } = useAuth()

  const initials = useMemo(() => user?.name ? getInitials(user.name) : '??', [user?.name])

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-12 px-4 bg-[#0D0D14] border-b border-border md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={toggleMobileMenu}
      >
        <Menu className="w-5 h-5" />
      </Button>
      <span className="text-[13px] font-semibold tracking-tight text-foreground">
        Reach OS
      </span>
      {user ? (
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
          <span className="text-[10px] font-semibold text-primary">{initials}</span>
        </div>
      ) : (
        <div className="w-8" />
      )}
    </header>
  )
}
