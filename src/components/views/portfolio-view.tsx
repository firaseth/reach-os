'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Plus,
  Search,
  ExternalLink,
  Star,
  Sparkles,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

const categories = ['Branding', 'Web Design', 'Print Design', 'Campaign', 'Motion', 'Photography', 'Strategy']

export function PortfolioView() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const { toast } = useToast()

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Branding',
    liveUrl: '',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch {
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject() {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      })
      const project = await res.json()
      setProjects((prev) => [project, ...prev])
      setShowNewDialog(false)
      setNewProject({ title: '', description: '', category: 'Branding', liveUrl: '' })
      toast({ title: 'Project Created', description: `"${project.title}" added to your portfolio.` })
    } catch {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' })
    }
  }

  async function handleAIDescribe() {
    if (!newProject.title) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write-project-description',
          context: { title: newProject.title, category: newProject.category, details: '' },
        }),
      })
      const data = await res.json()
      setNewProject((prev) => ({ ...prev, description: data.content }))
    } catch {
      toast({ title: 'AI Error', description: 'Failed to generate description', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  async function handleAITags(projectId: string) {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-project-tags',
          context: { title: project.title, description: project.description, category: project.category },
        }),
      })
      const data = await res.json()
      const tags = JSON.parse(data.content)
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, tags: JSON.stringify(tags) } : p))
      )
      toast({ title: 'Tags Generated', description: 'AI suggested relevant tags.' })
    } catch {
      toast({ title: 'AI Error', description: 'Failed to generate tags', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Portfolio</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-[13px]">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">Add Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Title</Label>
                <Input
                  placeholder="e.g., Lumina — Brand Identity"
                  className="h-9 text-[13px]"
                  value={newProject.title}
                  onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px]">Description</Label>
                  <button
                    className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                    onClick={handleAIDescribe}
                    disabled={!newProject.title || aiLoading}
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Write
                  </button>
                </div>
                <Textarea
                  placeholder="What was the project about..."
                  className="text-[13px] min-h-[80px]"
                  value={newProject.description}
                  onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Category</Label>
                  <Select value={newProject.category} onValueChange={(v) => setNewProject((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c} className="text-[13px]">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Live URL</Label>
                  <Input
                    placeholder="https://..."
                    className="h-9 text-[13px]"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject((p) => ({ ...p, liveUrl: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" className="h-8 text-[13px]" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button size="sm" className="h-8 text-[13px]" onClick={handleCreateProject} disabled={!newProject.title}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Filter projects..."
            className="h-8 pl-8 text-[13px] bg-muted/30 border-transparent focus:border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
              onClick={() => setSearch('')}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {['all', ...categories.slice(0, 4)].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-2.5 h-7 rounded-md text-[12px] font-medium transition-colors ${
                filterCategory === c
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Project List — table-like layout */}
      <AnimatePresence mode="wait">
        {filteredProjects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No projects found</p>
          </motion.div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr_100px_120px_32px] gap-4 px-4 py-2 border-b border-border bg-muted/20">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Project</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Category</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tags</span>
              <span />
            </div>
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="grid grid-cols-[1fr_100px_120px_32px] gap-4 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors group"
              >
                {/* Project Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-muted to-muted/50 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {project.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      <p className="text-[13px] font-medium truncate">{project.title}</p>
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate mt-px">{project.description}</p>
                  </div>
                </div>
                {/* Category */}
                <span className="text-[12px] text-muted-foreground">{project.category}</span>
                {/* Tags */}
                <div className="flex gap-1 flex-wrap">
                  {JSON.parse(project.tags || '[]').slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground border-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded hover:bg-accent">
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAITags(project.id)}>
                      <Sparkles className="w-3.5 h-3.5 mr-2" />AI Tags
                    </DropdownMenuItem>
                    <DropdownMenuItem><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
