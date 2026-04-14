'use client'

import { useAppStore, ViewType } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  DollarSign,
  Briefcase,
  Users,
  MoreHorizontal,
  Receipt,
  Gauge,
  CreditCard,
  FileText,
  Presentation,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

const mainNavItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'revenue' as ViewType, label: 'Revenue', icon: DollarSign },
  { id: 'portfolio' as ViewType, label: 'Portfolio', icon: Briefcase },
  { id: 'project-rooms' as ViewType, label: 'Client Rooms', icon: Users },
]

const moreNavItems = [
  { id: 'finance' as ViewType, label: 'Finance', icon: Receipt },
  { id: 'capacity' as ViewType, label: 'Capacity', icon: Gauge },
  { id: 'pricing' as ViewType, label: 'Pricing', icon: CreditCard },
  { id: 'case-studies' as ViewType, label: 'Case Studies', icon: FileText },
  { id: 'pitch-decks' as ViewType, label: 'Proposals', icon: Presentation },
]

export function MobileBottomNav() {
  const { currentView, setView, setMobileMenuOpen } = useAppStore()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (id: ViewType) =>
    currentView === id ||
    (id === 'case-studies' && currentView?.startsWith('case-study')) ||
    (id === 'pitch-decks' && currentView?.startsWith('pitch-deck')) ||
    (id === 'project-rooms' && currentView?.startsWith('project-room'))

  const handleNav = (id: ViewType) => {
    setView(id)
    setMoreOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-14 bg-[#0D0D14] border-t border-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-full px-1">
        {mainNavItems.map((item) => {
          const active = isActive(item.id)
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-md transition-colors',
                active
                  ? 'text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/70'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-7 rounded-md transition-colors',
                  active && 'bg-sidebar-accent'
                )}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] leading-none font-medium">{item.label}</span>
            </button>
          )
        })}

        {/* More button */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors">
              <div className="flex items-center justify-center w-8 h-7 rounded-md">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="text-[10px] leading-none font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl bg-[#0D0D14] border-border p-0">
            <SheetTitle className="sr-only">More navigation</SheetTitle>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-[13px] font-semibold text-foreground">More</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setMoreOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="py-2">
              {moreNavItems.map((item) => {
                const active = isActive(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <item.icon className={cn('w-4 h-4', active ? 'text-primary' : 'text-sidebar-foreground/60')} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
