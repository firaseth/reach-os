'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Briefcase,
  FileText,
  Presentation,
  Users,
  ArrowUpRight,
  Clock,
  Circle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface DashboardData {
  projectCount: number
  caseStudyCount: number
  pitchDeckCount: number
  clientRoomCount: number
  featuredProjects: any[]
  recentCaseStudies: any[]
  recentPitchDecks: any[]
  activeRooms: any[]
}

export function DashboardView() {
  const { setView } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, caseStudiesRes, pitchDecksRes, roomsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/case-studies'),
          fetch('/api/pitch-decks'),
          fetch('/api/client-rooms'),
        ])
        const projects = await projectsRes.json()
        const caseStudies = await caseStudiesRes.json()
        const pitchDecks = await pitchDecksRes.json()
        const rooms = await roomsRes.json()

        setData({
          projectCount: projects.length,
          caseStudyCount: caseStudies.length,
          pitchDeckCount: pitchDecks.length,
          clientRoomCount: rooms.length,
          featuredProjects: projects.filter((p: any) => p.featured).slice(0, 3),
          recentCaseStudies: caseStudies.slice(0, 3),
          recentPitchDecks: pitchDecks.slice(0, 3),
          activeRooms: rooms.filter((r: any) => r.status === 'active'),
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[72px] bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: 'Projects', value: data.projectCount, icon: Briefcase, view: 'portfolio' as const },
    { label: 'Case Studies', value: data.caseStudyCount, icon: FileText, view: 'case-studies' as const },
    { label: 'Proposals', value: data.pitchDeckCount, icon: Presentation, view: 'pitch-decks' as const },
    { label: 'Client Rooms', value: data.clientRoomCount, icon: Users, view: 'project-rooms' as const },
  ]

  const phaseColors: Record<string, string> = {
    discovery: 'text-blue-400',
    design: 'text-violet-400',
    development: 'text-amber-400',
    delivery: 'text-emerald-400',
    review: 'text-rose-400',
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Overview of your creative studio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[13px]"
          onClick={() => setView('portfolio')}
        >
          New Project
        </Button>
      </div>

      {/* Stats — Linear-style metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <div
              className="h-[72px] px-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between"
              onClick={() => setView(stat.view)}
            >
              <div>
                <p className="text-[12px] text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-semibold mt-0.5 tracking-tight">{stat.value}</p>
              </div>
              <stat.icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Work — takes 7 cols */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="lg:col-span-7"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Featured Work
            </h2>
            <Button variant="ghost" size="sm" className="h-7 text-[12px] text-muted-foreground" onClick={() => setView('portfolio')}>
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {data.featuredProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => setView('portfolio')}
              >
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-muted to-muted/50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {project.title}
                  </p>
                  <p className="text-[12px] text-muted-foreground truncate">{project.category} · {project.year}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {JSON.parse(project.tags || '[]').slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/60 text-muted-foreground border-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {data.featuredProjects.length === 0 && (
              <div className="text-center py-8 text-[13px] text-muted-foreground">
                No featured projects yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column — takes 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Projects
              </h2>
              <Button variant="ghost" size="sm" className="h-7 text-[12px] text-muted-foreground" onClick={() => setView('project-rooms')}>
                View all
              </Button>
            </div>
            <div className="space-y-1">
              {data.activeRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setView('project-room-detail', room.id)}
                >
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{room.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{room.clientName}</span>
                      <span className="text-[11px] text-muted-foreground/40">·</span>
                      <span className={`text-[11px] capitalize ${phaseColors[room.phase] || 'text-muted-foreground'}`}>
                        {room.phase}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {data.activeRooms.length === 0 && (
                <p className="text-[12px] text-muted-foreground text-center py-6">No active projects</p>
              )}
            </div>
          </motion.div>

          {/* Recent Case Studies */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                Recent Case Studies
              </h2>
              <Button variant="ghost" size="sm" className="h-7 text-[12px] text-muted-foreground" onClick={() => setView('case-studies')}>
                View all
              </Button>
            </div>
            <div className="space-y-1">
              {data.recentCaseStudies.map((cs) => (
                <div
                  key={cs.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setView('case-study-detail', cs.id)}
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{cs.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{cs.subtitle}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 h-5 border-0 flex-shrink-0 ${
                      cs.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {cs.status}
                  </Badge>
                </div>
              ))}
              {data.recentCaseStudies.length === 0 && (
                <p className="text-[12px] text-muted-foreground text-center py-6">No case studies yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
