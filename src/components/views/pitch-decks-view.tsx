'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { fetchWithAuth } from '@/lib/api'
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Target,
  Lightbulb,
  ListChecks,
  Clock,
  DollarSign,
  ChevronRight,
  Send,
  Presentation,
  CheckCircle2,
  FileText,
  Search,
  X,
  Circle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

const statusConfig: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  sent: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  won: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  lost: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
}

export function PitchDecksView() {
  const { setView } = useAppStore()
  const [pitchDecks, setPitchDecks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const { toast } = useToast()

  const [newPitch, setNewPitch] = useState({
    title: '',
    clientName: '',
    context: '',
    issues: '',
    industry: '',
  })

  useEffect(() => {
    fetchWithAuth('/api/pitch-decks')
      .then((r) => r.json())
      .then((data) => setPitchDecks(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleAIGenerate() {
    if (!newPitch.title || !newPitch.clientName) return
    setAiLoading(true)
    try {
      const [problemRes, solutionRes] = await Promise.all([
        fetchWithAuth('/api/ai', {
          method: 'POST',
          body: JSON.stringify({
            action: 'generate-pitch-problem',
            context: { clientName: newPitch.clientName, industry: newPitch.industry, context: newPitch.context, issues: newPitch.issues },
          }),
        }),
        fetchWithAuth('/api/ai', {
          method: 'POST',
          body: JSON.stringify({
            action: 'generate-pitch-solution',
            context: { clientName: newPitch.clientName, problem: newPitch.issues, services: 'Branding, Design, Strategy' },
          }),
        }),
      ])

      const [problemData, solutionData] = await Promise.all([problemRes.json(), solutionRes.json()])

      const res = await fetchWithAuth('/api/pitch-decks', {
        method: 'POST',
        body: JSON.stringify({
          title: newPitch.title,
          clientName: newPitch.clientName,
          subtitle: '',
          problem: problemData.content,
          solution: solutionData.content,
          approach: '',
          timeline: 'To be determined',
          investment: 'To be determined',
          status: 'draft',
        }),
      })

      const pitch = await res.json()
      setPitchDecks((prev) => [pitch, ...prev])
      setShowNewDialog(false)
      setNewPitch({ title: '', clientName: '', context: '', issues: '', industry: '' })
      toast({ title: 'Draft Generated', description: 'AI created a proposal.' })
    } catch {
      toast({ title: 'AI Error', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const filtered = pitchDecks.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Proposals</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {pitchDecks.length} proposal{pitchDecks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-[13px]">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">Generate Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Enter client details and AI will draft a complete proposal with problem framing, solution, and recommended approach.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Client Name *</Label>
                  <Input placeholder="e.g., Solace Wellness" className="h-9 text-[13px]" value={newPitch.clientName} onChange={(e) => setNewPitch((p) => ({ ...p, clientName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Industry</Label>
                  <Input placeholder="e.g., Health & Wellness" className="h-9 text-[13px]" value={newPitch.industry} onChange={(e) => setNewPitch((p) => ({ ...p, industry: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Proposal Title *</Label>
                <Input placeholder="e.g., Brand & Digital Transformation" className="h-9 text-[13px]" value={newPitch.title} onChange={(e) => setNewPitch((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Pain Points</Label>
                <Textarea placeholder="What problems is the client facing?" className="text-[13px] min-h-[60px]" value={newPitch.issues} onChange={(e) => setNewPitch((p) => ({ ...p, issues: e.target.value }))} />
              </div>
              <Button onClick={handleAIGenerate} disabled={!newPitch.title || !newPitch.clientName || aiLoading} className="w-full h-9 text-[13px]" size="sm">
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                Generate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
        <Input placeholder="Filter proposals..." className="h-8 pl-8 text-[13px] bg-muted/30 border-transparent focus:border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground" onClick={() => setSearch('')}>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Presentation className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No proposals yet</p>
          </motion.div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {filtered.map((pitch, i) => {
              const sc = statusConfig[pitch.status] || statusConfig.draft
              return (
                <motion.div
                  key={pitch.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => setView('pitch-deck-detail', pitch.id)}
                >
                  <Presentation className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium group-hover:text-primary transition-colors truncate">{pitch.title}</p>
                    <p className="text-[12px] text-muted-foreground truncate mt-px">{pitch.clientName}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 border-0 flex-shrink-0 ${sc.bg} ${sc.text}`}>
                    {pitch.status}
                  </Badge>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PitchDeckDetailView() {
  const { selectedId, setView } = useAppStore()
  const [pitch, setPitch] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedId) return
    fetchWithAuth('/api/pitch-decks')
      .then((r) => r.json())
      .then((data) => setPitch(data.find((p: any) => p.id === selectedId)))
      .finally(() => setLoading(false))
  }, [selectedId])

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  if (!pitch) {
    return (
      <div className="text-center py-16">
        <p className="text-[13px] text-muted-foreground">Not found</p>
        <Button variant="ghost" size="sm" className="mt-3 h-7 text-[12px]" onClick={() => setView('pitch-decks')}>Back</Button>
      </div>
    )
  }

  const deliverables = JSON.parse(pitch.deliverables || '[]')
  const sc = statusConfig[pitch.status] || statusConfig.draft

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" className="h-7 text-[12px] -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setView('pitch-decks')}>
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Proposals
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 border-0 ${sc.bg} ${sc.text}`}>
              {pitch.status}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground border-0">
              {pitch.clientName}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold tracking-tight leading-tight">{pitch.title}</h1>
          {pitch.subtitle && <p className="text-[14px] text-muted-foreground mt-1">{pitch.subtitle}</p>}
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Problem */}
      {pitch.problem && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Problem</h2>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-[13px] leading-relaxed whitespace-pre-line">{pitch.problem}</p>
          </div>
        </motion.div>
      )}

      {/* Solution */}
      {pitch.solution && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Solution</h2>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-[13px] leading-relaxed whitespace-pre-line">{pitch.solution}</p>
          </div>
        </motion.div>
      )}

      {/* Approach */}
      {pitch.approach && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-3.5 h-3.5 text-primary/60" />
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Approach</h2>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-[13px] leading-relaxed whitespace-pre-line">{pitch.approach}</p>
          </div>
        </motion.div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        {pitch.timeline && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Timeline</span>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-[13px] font-medium">{pitch.timeline}</p>
            </div>
          </motion.div>
        )}
        {pitch.investment && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Investment</span>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-[13px] font-medium">{pitch.investment}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Deliverables</h2>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            {deliverables.map((d: string, i: number) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border last:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                <span className="text-[13px]">{d}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" className="h-8 text-[13px]">
          <Send className="w-3.5 h-3.5 mr-1.5" /> Send to Client
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-[13px]">
          <Presentation className="w-3.5 h-3.5 mr-1.5" /> Export PDF
        </Button>
      </div>
    </div>
  )
}
