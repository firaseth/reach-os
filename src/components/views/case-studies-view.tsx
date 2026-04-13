'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Plus,
  Search,
  Sparkles,
  Loader2,
  ArrowLeft,
  BookOpen,
  Target,
  Lightbulb,
  TrendingUp,
  Quote,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

export function CaseStudiesView() {
  const { setView } = useAppStore()
  const [caseStudies, setCaseStudies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const { toast } = useToast()

  const [newCS, setNewCS] = useState({ title: '', subtitle: '' })

  useEffect(() => {
    fetch('/api/case-studies')
      .then((r) => r.json())
      .then((data) => setCaseStudies(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load case studies', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleAIGenerate() {
    if (!newCS.title) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-case-study',
          context: {
            title: newCS.title,
            description: '',
            category: 'Branding',
            tags: '',
          },
        }),
      })
      const data = await res.json()
      const parsed = JSON.parse(data.content)
      await fetch('/api/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parsed.title,
          subtitle: parsed.subtitle,
          challenge: parsed.challenge,
          solution: parsed.solution,
          results: parsed.results,
          process: JSON.stringify(parsed.process),
          status: 'draft',
        }),
      })
      setShowNewDialog(false)
      setNewCS({ title: '', subtitle: '' })
      const updated = await fetch('/api/case-studies').then((r) => r.json())
      setCaseStudies(updated)
      toast({ title: 'Case Study Generated', description: 'AI created a draft based on your title.' })
    } catch {
      toast({ title: 'AI Error', description: 'Failed to generate case study', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const filtered = caseStudies.filter(
    (cs) =>
      cs.title.toLowerCase().includes(search.toLowerCase()) ||
      cs.subtitle.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
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
          <h1 className="text-2xl font-bold tracking-tight">Case Studies</h1>
          <p className="text-muted-foreground text-sm mt-1">
            In-depth looks at your best work and the results you delivered
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>AI Case Study Generator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Enter a project title and AI will generate a complete case study draft with challenge, solution, results, and process steps.
              </p>
              <div className="space-y-2">
                <Label>Project / Case Study Title</Label>
                <Input
                  placeholder="e.g., How We Rebranded Lumina for 180% Growth"
                  value={newCS.title}
                  onChange={(e) => setNewCS((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={!newCS.title || aiLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Case Study
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search case studies..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Case Study List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No case studies yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use AI to generate a draft or create one from your portfolio
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((cs, i) => (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card
                  className="group hover:shadow-md transition-all duration-300 border-border/50 cursor-pointer"
                  onClick={() => setView('case-study-detail', cs.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={cs.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                            {cs.status}
                          </Badge>
                          {cs.project?.title && (
                            <Badge variant="outline" className="text-[10px]">
                              {cs.project.title}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold group-hover:text-amber-500 transition-colors line-clamp-1">
                          {cs.title}
                        </h3>
                        {cs.subtitle && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{cs.subtitle}</p>
                        )}
                        {cs.challenge && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {cs.challenge.substring(0, 150)}...
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

export function CaseStudyDetailView() {
  const { selectedId, setView } = useAppStore()
  const [caseStudy, setCaseStudy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedId) return
    fetch('/api/case-studies')
      .then((r) => r.json())
      .then((data) => setCaseStudy(data.find((cs: any) => cs.id === selectedId)))
      .catch(() => toast({ title: 'Error', description: 'Failed to load case study', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [selectedId])

  async function handleAIImprove(section: string) {
    if (!caseStudy) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve-case-study',
          context: caseStudy[section],
        }),
      })
      const data = await res.json()
      setCaseStudy((prev: any) => ({ ...prev, [section]: data.content }))
      toast({ title: 'Improved', description: `AI enhanced the ${section} section.` })
    } catch {
      toast({ title: 'AI Error', description: 'Failed to improve text', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!caseStudy) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Case study not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => setView('case-studies')}>
          Back to Case Studies
        </Button>
      </div>
    )
  }

  const process = JSON.parse(caseStudy.process || '[]')

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => setView('case-studies')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={caseStudy.status === 'published' ? 'default' : 'secondary'} className="text-xs">
            {caseStudy.status}
          </Badge>
          {caseStudy.project?.title && (
            <Badge variant="outline" className="text-xs">{caseStudy.project.title}</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{caseStudy.title}</h1>
        {caseStudy.subtitle && (
          <p className="text-lg text-muted-foreground mt-2">{caseStudy.subtitle}</p>
        )}
      </div>

      <Separator />

      {/* Challenge */}
      {caseStudy.challenge && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-rose-500 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" /> The Challenge
                </span>
                <Button variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-600" onClick={() => handleAIImprove('challenge')} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} AI Improve
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{caseStudy.challenge}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Solution */}
      {caseStudy.solution && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-emerald-500 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-500" /> The Solution
                </span>
                <Button variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-600" onClick={() => handleAIImprove('solution')} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} AI Improve
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{caseStudy.solution}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {caseStudy.results && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-amber-500 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" /> The Results
                </span>
                <Button variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-600" onClick={() => handleAIImprove('results')} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} AI Improve
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{caseStudy.results}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Process */}
      {process.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" /> Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {process.map((step: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      {i < process.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold">{step.phase}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Testimonial */}
      {caseStudy.testimonial && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-muted/50 to-muted border-border/50">
            <CardContent className="p-6">
              <Quote className="w-8 h-8 text-amber-500/30 mb-3" />
              <p className="text-sm italic leading-relaxed">&ldquo;{caseStudy.testimonial}&rdquo;</p>
              {caseStudy.testimonialBy && (
                <p className="text-xs font-medium text-muted-foreground mt-3">— {caseStudy.testimonialBy}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
