'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Briefcase,
  FileText,
  Presentation,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Clock,
  Star,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          recentCaseStudies: caseStudies.slice(0, 2),
          recentPitchDecks: pitchDecks.slice(0, 2),
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: 'Portfolio Projects', value: data.projectCount, icon: Briefcase, color: 'from-amber-500 to-orange-500', view: 'portfolio' as const },
    { label: 'Case Studies', value: data.caseStudyCount, icon: FileText, color: 'from-emerald-500 to-teal-500', view: 'case-studies' as const },
    { label: 'Proposals', value: data.pitchDeckCount, icon: Presentation, color: 'from-violet-500 to-purple-500', view: 'pitch-decks' as const },
    { label: 'Client Rooms', value: data.clientRoomCount, icon: Users, color: 'from-rose-500 to-pink-500', view: 'project-rooms' as const },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Engineer Firas</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening in your creative studio today.
            </p>
          </div>
          <Button
            onClick={() => setView('portfolio')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card
              className="group cursor-pointer hover:shadow-md transition-all duration-300 border-border/50"
              onClick={() => setView(stat.view)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-xs text-muted-foreground">
                  <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Active</span>
                  <span className="ml-1">— Click to view</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Featured Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Featured Work</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView('portfolio')}>
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.featuredProjects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-border/50"
              onClick={() => setView('portfolio')}
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-xs">
                    {project.category}
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm group-hover:text-amber-500 transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  {JSON.parse(project.tags || '[]').slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Case Studies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Recent Case Studies
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setView('case-studies')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentCaseStudies.map((cs: any) => (
                <div
                  key={cs.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => setView('case-study-detail', cs.id)}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cs.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{cs.subtitle}</p>
                  </div>
                  <Badge variant={cs.status === 'published' ? 'default' : 'secondary'} className="text-[10px] flex-shrink-0">
                    {cs.status}
                  </Badge>
                </div>
              ))}
              {data.recentCaseStudies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No case studies yet. Create one from your portfolio.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Client Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  Active Projects
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setView('project-rooms')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.activeRooms.map((room: any) => (
                <div
                  key={room.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => setView('project-room-detail', room.id)}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{room.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{room.clientName}</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0 capitalize">
                        {room.phase}
                      </Badge>
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
              {data.activeRooms.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active project rooms. Create one to start collaborating.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
