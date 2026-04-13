'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Plus,
  Search,
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  sent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  won: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-600 border-red-500/20',
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
    subtitle: '',
    context: '',
    issues: '',
    industry: '',
  })

  useEffect(() => {
    fetch('/api/pitch-decks')
      .then((r) => r.json())
      .then((data) => setPitchDecks(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load proposals', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleAIGenerate() {
    if (!newPitch.title || !newPitch.clientName) return
    setAiLoading(true)
    try {
      const [problemRes, solutionRes] = await Promise.all([
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-pitch-problem',
            context: {
              clientName: newPitch.clientName,
              industry: newPitch.industry,
              context: newPitch.context,
              issues: newPitch.issues,
            },
          }),
        }),
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-pitch-solution',
            context: {
              clientName: newPitch.clientName,
              problem: newPitch.issues,
              services: 'Branding, Design, Strategy',
            },
          }),
        }),
      ])

      const [problemData, solutionData] = await Promise.all([problemRes.json(), solutionRes.json()])

      const res = await fetch('/api/pitch-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPitch.title,
          clientName: newPitch.clientName,
          subtitle: newPitch.subtitle,
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
      setNewPitch({ title: '', clientName: '', subtitle: '', context: '', issues: '', industry: '' })
      toast({ title: 'Proposal Generated', description: 'AI created a proposal draft for your client.' })
    } catch {
      toast({ title: 'AI Error', description: 'Failed to generate proposal', variant: 'destructive' })
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
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate winning proposals from your past work and case studies
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>AI Proposal Generator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Enter client details and AI will generate a compelling proposal draft with problem framing, solution approach, and recommended deliverables.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    placeholder="e.g., Solace Wellness"
                    value={newPitch.clientName}
                    onChange={(e) => setNewPitch((p) => ({ ...p, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    placeholder="e.g., Health & Wellness"
                    value={newPitch.industry}
                    onChange={(e) => setNewPitch((p) => ({ ...p, industry: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Proposal Title *</Label>
                <Input
                  placeholder="e.g., Brand & Digital Transformation"
                  value={newPitch.title}
                  onChange={(e) => setNewPitch((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Brief Context</Label>
                <Textarea
                  placeholder="What do you know about this client's situation?"
                  value={newPitch.context}
                  onChange={(e) => setNewPitch((p) => ({ ...p, context: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Known Issues / Pain Points</Label>
                <Textarea
                  placeholder="What problems is the client facing?"
                  value={newPitch.issues}
                  onChange={(e) => setNewPitch((p) => ({ ...p, issues: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={!newPitch.title || !newPitch.clientName || aiLoading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Proposal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search proposals..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Proposal List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Presentation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No proposals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use AI to generate a proposal from your case studies
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((pitch, i) => (
              <motion.div
                key={pitch.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card
                  className="group hover:shadow-md transition-all duration-300 border-border/50 cursor-pointer"
                  onClick={() => setView('pitch-deck-detail', pitch.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-[10px] ${statusColors[pitch.status] || ''}`}>
                            {pitch.status === 'won' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {pitch.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{pitch.clientName}</Badge>
                        </div>
                        <h3 className="text-base font-semibold group-hover:text-violet-500 transition-colors line-clamp-1">
                          {pitch.title}
                        </h3>
                        {pitch.subtitle && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{pitch.subtitle}</p>
                        )}
                        {pitch.problem && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {pitch.problem.substring(0, 180)}...
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
    fetch('/api/pitch-decks')
      .then((r) => r.json())
      .then((data) => setPitch(data.find((p: any) => p.id === selectedId)))
      .finally(() => setLoading(false))
  }, [selectedId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!pitch) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Proposal not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => setView('pitch-decks')}>
          Back to Proposals
        </Button>
      </div>
    )
  }

  const deliverables = JSON.parse(pitch.deliverables || '[]')

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => setView('pitch-decks')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={`text-xs ${statusColors[pitch.status] || ''}`}>
            {pitch.status}
          </Badge>
          <Badge variant="outline" className="text-xs">{pitch.clientName}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{pitch.title}</h1>
        {pitch.subtitle && (
          <p className="text-lg text-muted-foreground mt-2">{pitch.subtitle}</p>
        )}
      </div>

      <Separator />

      {/* Problem */}
      {pitch.problem && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-rose-500 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" /> The Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{pitch.problem}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Solution */}
      {pitch.solution && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-emerald-500 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-500" /> Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{pitch.solution}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Approach */}
      {pitch.approach && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-violet-500" /> Approach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{pitch.approach}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pitch.timeline && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Timeline</span>
                </div>
                <p className="text-sm font-medium">{pitch.timeline}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {pitch.investment && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Investment</span>
                </div>
                <p className="text-sm font-medium">{pitch.investment}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deliverables.map((d: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">{d}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Send Button */}
      <div className="flex gap-3 pt-2">
        <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white">
          <Send className="w-4 h-4 mr-2" /> Send to Client
        </Button>
        <Button variant="outline">
          <Presentation className="w-4 h-4 mr-2" /> Export as PDF
        </Button>
      </div>
    </div>
  )
}
