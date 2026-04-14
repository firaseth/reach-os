'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileHeader } from '@/components/mobile-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { DashboardView } from '@/components/views/dashboard-view'
import { RevenueView } from '@/components/views/revenue-view'
import { FinanceView } from '@/components/views/finance-view'
import { CapacityView } from '@/components/views/capacity-view'
import { PricingView } from '@/components/views/pricing-view'
import { PortfolioView } from '@/components/views/portfolio-view'
import { CaseStudiesView, CaseStudyDetailView } from '@/components/views/case-studies-view'
import { PitchDecksView, PitchDeckDetailView } from '@/components/views/pitch-decks-view'
import { ProjectRoomsView, ProjectRoomDetailView } from '@/components/views/project-rooms-view'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { currentView, sidebarOpen } = useAppStore()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentView])

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />
      case 'revenue': return <RevenueView />
      case 'finance': return <FinanceView />
      case 'capacity': return <CapacityView />
      case 'pricing': return <PricingView />
      case 'portfolio': return <PortfolioView />
      case 'case-studies': return <CaseStudiesView />
      case 'case-study-detail': return <CaseStudyDetailView />
      case 'pitch-decks': return <PitchDecksView />
      case 'pitch-deck-detail': return <PitchDeckDetailView />
      case 'project-rooms': return <ProjectRoomsView />
      case 'project-room-detail': return <ProjectRoomDetailView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header — only shows on mobile */}
      <MobileHeader />

      {/* Sidebar — different behavior on mobile vs desktop */}
      <AppSidebar />

      <main
        className={cn(
          'transition-all duration-200 ease-out',
          // Mobile: full width, padded for header and bottom nav
          'pt-12 pb-16',
          // Desktop: sidebar margin
          'md:pt-0 md:pb-0',
          sidebarOpen ? 'md:ml-[232px]' : 'md:ml-[52px]'
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav — only shows on mobile */}
      <MobileBottomNav />
    </div>
  )
}
