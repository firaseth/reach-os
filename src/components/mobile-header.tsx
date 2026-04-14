'use client'

import { useAppStore } from '@/lib/store'
import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileHeader() {
  const { toggleMobileMenu } = useAppStore()

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
      <div className="w-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
