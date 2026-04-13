'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Presentation,
  Users,
  Command,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase, shortcut: '⌘2' },
  { id: 'case-studies' as const, label: 'Case Studies', icon: FileText, shortcut: '⌘3' },
  { id: 'pitch-decks' as const, label: 'Proposals', icon: Presentation, shortcut: '⌘4' },
  { id: 'project-rooms' as const, label: 'Client Rooms', icon: Users, shortcut: '⌘5' },
]

export function AppSidebar() {
  const { currentView, setView, sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-200',
        'bg-sidebar border-r border-sidebar-border',
        sidebarOpen ? 'w-[232px]' : 'w-[52px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-12 flex-shrink-0',
        sidebarOpen ? 'px-5 justify-between' : 'px-0 justify-center'
      )}>
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Command className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-[13px] font-semibold tracking-tight text-foreground">
                Creative OS
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={toggleSidebar}
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 mt-1">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id ||
              (item.id === 'case-studies' && currentView?.startsWith('case-study')) ||
              (item.id === 'pitch-decks' && currentView?.startsWith('pitch-deck')) ||
              (item.id === 'project-rooms' && currentView?.startsWith('project-room'))

            const button = (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  'w-full flex items-center rounded-md text-[13px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  sidebarOpen ? 'h-8 px-2.5 gap-2.5' : 'h-8 justify-center',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-sidebar-foreground/60'
                )} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {sidebarOpen && item.shortcut && (
                  <span className="ml-auto text-[11px] text-sidebar-foreground/30 font-normal">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )

            if (!sidebarOpen) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }
            return button
          })}
        </div>
      </nav>

      {/* User */}
      <div className={cn(
        'border-t border-sidebar-border flex-shrink-0',
        sidebarOpen ? 'px-3 py-2.5' : 'py-2.5 flex justify-center'
      )}>
        <div className={cn(
          'flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors cursor-default',
          !sidebarOpen && 'p-0'
        )}>
          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
            <span className="text-[11px] font-semibold text-primary">EF</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                Engineer Firas
              </p>
              <p className="text-[11px] text-sidebar-foreground truncate leading-tight">
                Creative Director
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
