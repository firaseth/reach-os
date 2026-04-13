'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardView } from '@/components/views/dashboard-view'
import { PortfolioView } from '@/components/views/portfolio-view'
import { CaseStudiesView, CaseStudyDetailView } from '@/components/views/case-studies-view'
import { PitchDecksView, PitchDeckDetailView } from '@/components/views/pitch-decks-view'
import { ProjectRoomsView, ProjectRoomDetailView } from '@/components/views/project-rooms-view'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { currentView, sidebarOpen } = useAppStore()

  useEffect(() => {
    // Scroll to top on view change
    window.scrollTo(0, 0)
  }, [currentView])

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'portfolio':
        return <PortfolioView />
      case 'case-studies':
        return <CaseStudiesView />
      case 'case-study-detail':
        return <CaseStudyDetailView />
      case 'pitch-decks':
        return <PitchDecksView />
      case 'pitch-deck-detail':
        return <PitchDeckDetailView />
      case 'project-rooms':
        return <ProjectRoomsView />
      case 'project-room-detail':
        return <ProjectRoomDetailView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-[68px]'
        )}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
