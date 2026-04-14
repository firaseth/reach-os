'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileHeader } from '@/components/mobile-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const loadingSkeleton = (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-6 bg-muted/30 rounded animate-pulse" />
    ))}
  </div>
)

const DashboardView = dynamic(
  () => import('@/components/views/dashboard-view').then(m => ({ default: m.DashboardView })),
  { loading: () => loadingSkeleton }
)
const RevenueView = dynamic(
  () => import('@/components/views/revenue-view').then(m => ({ default: m.RevenueView })),
  { loading: () => loadingSkeleton }
)
const FinanceView = dynamic(
  () => import('@/components/views/finance-view').then(m => ({ default: m.FinanceView })),
  { loading: () => loadingSkeleton }
)
const CapacityView = dynamic(
  () => import('@/components/views/capacity-view').then(m => ({ default: m.CapacityView })),
  { loading: () => loadingSkeleton }
)
const PricingView = dynamic(
  () => import('@/components/views/pricing-view').then(m => ({ default: m.PricingView })),
  { loading: () => loadingSkeleton }
)
const PortfolioView = dynamic(
  () => import('@/components/views/portfolio-view').then(m => ({ default: m.PortfolioView })),
  { loading: () => loadingSkeleton }
)
const CaseStudiesView = dynamic(
  () => import('@/components/views/case-studies-view').then(m => ({ default: m.CaseStudiesView })),
  { loading: () => loadingSkeleton }
)
const CaseStudyDetailView = dynamic(
  () => import('@/components/views/case-studies-view').then(m => ({ default: m.CaseStudyDetailView })),
  { loading: () => loadingSkeleton }
)
const PitchDecksView = dynamic(
  () => import('@/components/views/pitch-decks-view').then(m => ({ default: m.PitchDecksView })),
  { loading: () => loadingSkeleton }
)
const PitchDeckDetailView = dynamic(
  () => import('@/components/views/pitch-decks-view').then(m => ({ default: m.PitchDeckDetailView })),
  { loading: () => loadingSkeleton }
)
const ProjectRoomsView = dynamic(
  () => import('@/components/views/project-rooms-view').then(m => ({ default: m.ProjectRoomsView })),
  { loading: () => loadingSkeleton }
)
const ProjectRoomDetailView = dynamic(
  () => import('@/components/views/project-rooms-view').then(m => ({ default: m.ProjectRoomDetailView })),
  { loading: () => loadingSkeleton }
)

export default function Home() {
  const { currentView, sidebarOpen } = useAppStore()
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentView])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#5E6AD2] animate-spin" />
          <span className="text-[13px] text-white/40">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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
          <AnimatePresence>
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ErrorBoundary>{renderView()}</ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav — only shows on mobile */}
      <MobileBottomNav />
    </div>
  )
}
