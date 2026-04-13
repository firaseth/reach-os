'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Presentation,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase },
  { id: 'case-studies' as const, label: 'Case Studies', icon: FileText },
  { id: 'pitch-decks' as const, label: 'Proposals', icon: Presentation },
  { id: 'project-rooms' as const, label: 'Client Rooms', icon: Users },
]

export function AppSidebar() {
  const { currentView, setView, sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-[68px]'
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              Creative OS
            </h1>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Studio Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id || 
            (item.id === 'case-studies' && currentView?.startsWith('case-study')) ||
            (item.id === 'pitch-decks' && currentView?.startsWith('pitch-deck')) ||
            (item.id === 'project-rooms' && currentView?.startsWith('project-room'))

          const button = (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-10 px-3 font-medium transition-all',
                isActive
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                !sidebarOpen && 'justify-center px-0'
              )}
              onClick={() => setView(item.id)}
            >
              <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-amber-500')} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Button>
          )

          if (!sidebarOpen) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }
          return button
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition-colors',
            !sidebarOpen && 'justify-center p-0'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">EF</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">engineer.Firas</p>
              <p className="text-xs text-muted-foreground truncate">Creative Director</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center h-8 text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  )
}
