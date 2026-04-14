'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Gauge,
  CreditCard,
  Briefcase,
  FileText,
  Presentation,
  Users,
  Command,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'

const navSections = [
  {
    label: 'Business',
    items: [
      { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
      { id: 'revenue' as const, label: 'Revenue', icon: DollarSign, shortcut: '⌘2' },
      { id: 'finance' as const, label: 'Finance', icon: Receipt, shortcut: '⌘3' },
      { id: 'capacity' as const, label: 'Capacity', icon: Gauge, shortcut: '⌘4' },
      { id: 'pricing' as const, label: 'Pricing', icon: CreditCard, shortcut: '⌘5' },
    ],
  },
  {
    label: 'Creative',
    items: [
      { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase, shortcut: '⌘6' },
      { id: 'case-studies' as const, label: 'Case Studies', icon: FileText, shortcut: '⌘7' },
      { id: 'pitch-decks' as const, label: 'Proposals', icon: Presentation, shortcut: '⌘8' },
      { id: 'project-rooms' as const, label: 'Client Rooms', icon: Users, shortcut: '⌘9' },
    ],
  },
]

export function AppSidebar() {
  const {
    currentView, setView, sidebarOpen, toggleSidebar,
    mobileMenuOpen, setMobileMenuOpen
  } = useAppStore()

  const isActive = (id: string) =>
    currentView === id ||
    (id === 'case-studies' && currentView?.startsWith('case-study')) ||
    (id === 'pitch-decks' && currentView?.startsWith('pitch-deck')) ||
    (id === 'project-rooms' && currentView?.startsWith('project-room'))

  // Close mobile menu on navigation
  const handleNav = (id: string) => {
    setView(id as any)
    setMobileMenuOpen(false)
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen flex flex-col transition-transform duration-200 ease-out',
          'bg-sidebar border-r border-sidebar-border',
          // Desktop: always visible with width transition
          'md:translate-x-0',
          sidebarOpen ? 'md:w-[232px]' : 'md:w-[52px]',
          // Mobile: off-screen by default, slide in when open
          mobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]',
          // Mobile overrides desktop width
          'max-md:w-[280px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-12 flex-shrink-0',
          // Always expanded on mobile, conditionally on desktop
          'px-4 justify-between max-md:px-4 max-md:justify-between',
          sidebarOpen ? 'px-5' : 'px-0 justify-center md:px-0 md:justify-center'
        )}>
          {/* Mobile always shows logo */}
          <div className="flex items-center gap-2.5 max-md:flex md:hidden">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Command className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-foreground">
              Reach OS
            </span>
          </div>
          {sidebarOpen && (
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Command className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-[13px] font-semibold tracking-tight text-foreground">
                Reach OS
              </span>
            </div>
          )}
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          {/* Desktop toggle button */}
          {!mobileMenuOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-3.5 h-3.5" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 mt-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {(sidebarOpen || mobileMenuOpen) && (
                <span className="px-2.5 mb-1 block text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-widest max-md:block md:block">
                  {section.label}
                </span>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.id)
                  // On mobile, always show expanded; on desktop, depends on sidebarOpen
                  const isExpanded = mobileMenuOpen || sidebarOpen

                  const button = (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        'w-full flex items-center rounded-md text-[13px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        isExpanded ? 'h-8 px-2.5 gap-2.5' : 'h-8 justify-center md:justify-center',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <item.icon className={cn(
                        'w-4 h-4 flex-shrink-0',
                        active ? 'text-primary' : 'text-sidebar-foreground/60'
                      )} />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                      {isExpanded && !mobileMenuOpen && item.shortcut && (
                        <span className="ml-auto text-[11px] text-sidebar-foreground/30 font-normal max-md:hidden md:inline">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )

                  // Only show tooltips on desktop when sidebar is collapsed
                  if (!sidebarOpen && !mobileMenuOpen) {
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
            </div>
          ))}
        </nav>

        {/* User */}
        <div className={cn(
          'border-t border-sidebar-border flex-shrink-0',
          (mobileMenuOpen || sidebarOpen) ? 'px-3 py-2.5' : 'py-2.5 flex justify-center'
        )}>
          <div className={cn(
            'flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors cursor-default',
            !(mobileMenuOpen || sidebarOpen) && 'p-0'
          )}>
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
              <span className="text-[11px] font-semibold text-primary">EF</span>
            </div>
            {(mobileMenuOpen || sidebarOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate leading-tight">Engineer Firas</p>
                <p className="text-[11px] text-sidebar-foreground truncate leading-tight">Creative Director</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
