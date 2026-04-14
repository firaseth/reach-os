'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { fetchWithAuth } from '@/lib/api'
import {
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
  Search,
  X,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

  const [newCS, setNewCS] = useState({ title: '' })
  const [editingCS, setEditingCS] = useState<any>(null)
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', challenge: '', solution: '', results: '', testimonial: '', testimonialBy: '', status: 'draft' })
  const [editSaving, setEditSaving] = useState(false)
  const [deletingCS, setDeletingCS] = useState<any>(null)
  const [deleteSaving, setDeleteSaving] = useState(false)

  function handleEdit(cs: any) {
    setEditingCS(cs)
    setEditForm({
      title: cs.title || '',
      subtitle: cs.subtitle || '',
      challenge: cs.challenge || '',
      solution: cs.solution || '',
      results: cs.results || '',
      testimonial: cs.testimonial || '',
      testimonialBy: cs.testimonialBy || '',
      status: cs.status || 'draft',
    })
  }

  function handleDelete(cs: any) {
    setDeletingCS(cs)
  }

  async function handleSaveEdit() {
    if (!editingCS) return
    setEditSaving(true)
    try {
      const res = await fetchWithAuth('/api/case-studies', {
        method: 'PUT',
        body: JSON.stringify({ id: editingCS.id, ...editForm }),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setCaseStudies((prev) => prev.map((cs) => (cs.id === updated.id ? { ...cs, ...updated } : cs)))
      setEditingCS(null)
      toast({ title: 'Updated', description: 'Case study saved successfully.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update case study', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingCS) return
    setDeleteSaving(true)
    try {
      const res = await fetchWithAuth(`/api/case-studies?id=${deletingCS.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setCaseStudies((prev) => prev.filter((cs) => cs.id !== deletingCS.id))
      setDeletingCS(null)
      toast({ title: 'Deleted', description: 'Case study removed.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete case study', variant: 'destructive' })
    } finally {
      setDeleteSaving(false)
    }
  }

  useEffect(() => {
    fetchWithAuth('/api/case-studies')
      .then((r) => r.json())
      .then((data) => setCaseStudies(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load case studies', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleAIGenerate() {
    if (!newCS.title) return
    setAiLoading(true)
    try {
      const res = await fetchWithAuth('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate-case-study',
          context: { title: newCS.title, description: '', category: 'Branding', tags: '' },
        }),
      })
      const data = await res.json()
      const parsed = JSON.parse(data.content)
      await fetchWithAuth('/api/case-studies', {
        method: 'POST',
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
      setNewCS({ title: '' })
      const updated = await fetchWithAuth('/api/case-studies').then((r) => r.json())
      setCaseStudies(updated)
      toast({ title: 'Draft Generated', description: 'AI created a case study draft.' })
    } catch {
      toast({ title: 'AI Error', description: 'Failed to generate', variant: 'destructive' })
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
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Case Studies</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {caseStudies.length} case stud{caseStudies.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-[13px]">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Generate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Generate Case Study</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Enter a project title and AI will draft a complete case study with challenge, solution, results, and process steps.
              </p>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Title</Label>
                <Input
                  placeholder="e.g., How We Rebranded Lumina"
                  className="h-9 text-[13px]"
                  value={newCS.title}
                  onChange={(e) => setNewCS({ title: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={!newCS.title || aiLoading}
                className="w-full h-9 text-[13px]"
                size="sm"
              >
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
        <Input
          placeholder="Filter case studies..."
          className="h-8 pl-8 text-[13px] bg-muted/30 border-transparent focus:border-border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No case studies yet</p>
          </motion.div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {filtered.map((cs, i) => (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => setView('case-study-detail', cs.id)}
              >
                <FileText className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium group-hover:text-primary transition-colors truncate">{cs.title}</p>
                  {cs.subtitle && <p className="text-[12px] text-muted-foreground truncate mt-px">{cs.subtitle}</p>}
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 h-5 border-0 flex-shrink-0 ${
                    cs.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {cs.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded hover:bg-accent">
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(cs) }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(cs) }}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Edit Dialog */}
      <Dialog open={!!editingCS} onOpenChange={(open) => !open && setEditingCS(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Case Study</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">Update the case study details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Title</Label>
              <Input
                className="h-9 text-[13px]"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Subtitle</Label>
              <Input
                className="h-9 text-[13px]"
                value={editForm.subtitle}
                onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Optional subtitle"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Status</Label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm((f) => ({ ...f, status: val }))}>
                <SelectTrigger className="h-9 text-[13px] w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Challenge</Label>
              <Textarea
                className="text-[13px] min-h-[80px]"
                value={editForm.challenge}
                onChange={(e) => setEditForm((f) => ({ ...f, challenge: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Solution</Label>
              <Textarea
                className="text-[13px] min-h-[80px]"
                value={editForm.solution}
                onChange={(e) => setEditForm((f) => ({ ...f, solution: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Results</Label>
              <Textarea
                className="text-[13px] min-h-[80px]"
                value={editForm.results}
                onChange={(e) => setEditForm((f) => ({ ...f, results: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Testimonial</Label>
              <Textarea
                className="text-[13px] min-h-[60px]"
                value={editForm.testimonial}
                onChange={(e) => setEditForm((f) => ({ ...f, testimonial: e.target.value }))}
                placeholder="Optional client testimonial"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Testimonial By</Label>
              <Input
                className="h-9 text-[13px]"
                value={editForm.testimonialBy}
                onChange={(e) => setEditForm((f) => ({ ...f, testimonialBy: e.target.value }))}
                placeholder="e.g., Jane Doe, CEO"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" size="sm" className="h-8 text-[13px]" onClick={() => setEditingCS(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-[13px]" onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCS} onOpenChange={(open) => !open && setDeletingCS(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Case Study</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Are you sure you want to delete &ldquo;{deletingCS?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" size="sm" className="h-8 text-[13px]" onClick={() => setDeletingCS(null)} disabled={deleteSaving}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="h-8 text-[13px]" onClick={handleConfirmDelete} disabled={deleteSaving}>
              {deleteSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function CaseStudyDetailView() {
  const { selectedId, setView } = useAppStore()
  const [caseStudy, setCaseStudy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const { toast } = useToast()

  const [editingCS, setEditingCS] = useState<any>(null)
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', challenge: '', solution: '', results: '', testimonial: '', testimonialBy: '', status: 'draft' })
  const [editSaving, setEditSaving] = useState(false)
  const [deletingCS, setDeletingCS] = useState<any>(null)
  const [deleteSaving, setDeleteSaving] = useState(false)

  function handleEditFromDetail() {
    if (!caseStudy) return
    setEditingCS(caseStudy)
    setEditForm({
      title: caseStudy.title || '',
      subtitle: caseStudy.subtitle || '',
      challenge: caseStudy.challenge || '',
      solution: caseStudy.solution || '',
      results: caseStudy.results || '',
      testimonial: caseStudy.testimonial || '',
      testimonialBy: caseStudy.testimonialBy || '',
      status: caseStudy.status || 'draft',
    })
  }

  async function handleSaveEditFromDetail() {
    if (!editingCS) return
    setEditSaving(true)
    try {
      const res = await fetchWithAuth('/api/case-studies', {
        method: 'PUT',
        body: JSON.stringify({ id: editingCS.id, ...editForm }),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setCaseStudy(updated)
      setEditingCS(null)
      toast({ title: 'Updated', description: 'Case study saved successfully.' })
      setView('case-studies')
    } catch {
      toast({ title: 'Error', description: 'Failed to update case study', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  async function handleConfirmDeleteFromDetail() {
    if (!deletingCS) return
    setDeleteSaving(true)
    try {
      const res = await fetchWithAuth(`/api/case-studies?id=${deletingCS.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDeletingCS(null)
      toast({ title: 'Deleted', description: 'Case study removed.' })
      setView('case-studies')
    } catch {
      toast({ title: 'Error', description: 'Failed to delete case study', variant: 'destructive' })
    } finally {
      setDeleteSaving(false)
    }
  }

  useEffect(() => {
    if (!selectedId) return
    fetchWithAuth('/api/case-studies')
      .then((r) => r.json())
      .then((data) => setCaseStudy(data.find((cs: any) => cs.id === selectedId)))
      .catch(() => toast({ title: 'Error', description: 'Failed to load', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [selectedId])

  async function handleAIImprove(section: string) {
    if (!caseStudy) return
    setAiLoading(true)
    try {
      const res = await fetchWithAuth('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ action: 'improve-case-study', context: caseStudy[section] }),
      })
      const data = await res.json()
      setCaseStudy((prev: any) => ({ ...prev, [section]: data.content }))
      toast({ title: 'Improved', description: 'Section enhanced.' })
    } catch {
      toast({ title: 'AI Error', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  if (!caseStudy) {
    return (
      <div className="text-center py-16">
        <p className="text-[13px] text-muted-foreground">Not found</p>
        <Button variant="ghost" size="sm" className="mt-3 h-7 text-[12px]" onClick={() => setView('case-studies')}>Back</Button>
      </div>
    )
  }

  const process = JSON.parse(caseStudy.process || '[]')

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" className="h-7 text-[12px] -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setView('case-studies')}>
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Case Studies
      </Button>

      {/* Title Block */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-5 border-0 ${
              caseStudy.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {caseStudy.status}
          </Badge>
          {caseStudy.project?.title && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground border-0">
              {caseStudy.project.title}
            </Badge>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" className="h-7 text-[12px]" onClick={handleEditFromDetail}>
              <Pencil className="w-3 h-3 mr-1" />Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[12px] text-destructive hover:text-destructive" onClick={() => setDeletingCS(caseStudy)}>
              <Trash2 className="w-3 h-3 mr-1" />Delete
            </Button>
          </div>
        </div>
        <h1 className="text-xl font-semibold tracking-tight leading-tight">{caseStudy.title}</h1>
        {caseStudy.subtitle && (
          <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed">{caseStudy.subtitle}</p>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Sections */}
      {caseStudy.challenge && (
        <SectionBlock
          icon={<Target className="w-4 h-4 text-rose-400" />}
          title="Challenge"
          content={caseStudy.challenge}
          aiLoading={aiLoading}
          onAIImprove={() => handleAIImprove('challenge')}
          delay={0.05}
        />
      )}

      {caseStudy.solution && (
        <SectionBlock
          icon={<Lightbulb className="w-4 h-4 text-amber-400" />}
          title="Solution"
          content={caseStudy.solution}
          aiLoading={aiLoading}
          onAIImprove={() => handleAIImprove('solution')}
          delay={0.1}
        />
      )}

      {caseStudy.results && (
        <SectionBlock
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          title="Results"
          content={caseStudy.results}
          aiLoading={aiLoading}
          onAIImprove={() => handleAIImprove('results')}
          delay={0.15}
        />
      )}

      {/* Process */}
      {process.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-primary/60" />
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Process</h2>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            {process.map((step: any, i: number) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
                <span className="text-[11px] font-mono text-muted-foreground/50 mt-px w-4 text-right flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[13px] font-medium">{step.phase}</p>
                  <p className="text-[12px] text-muted-foreground mt-px">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Testimonial */}
      {caseStudy.testimonial && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <Quote className="w-4 h-4 text-muted-foreground/20 mb-2" />
            <p className="text-[13px] leading-relaxed italic text-muted-foreground">
              &ldquo;{caseStudy.testimonial}&rdquo;
            </p>
            {caseStudy.testimonialBy && (
              <p className="text-[12px] font-medium text-muted-foreground mt-3">&mdash; {caseStudy.testimonialBy}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Edit Dialog (Detail View) */}
      <Dialog open={!!editingCS} onOpenChange={(open) => !open && setEditingCS(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Case Study</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">Update the case study details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Title</Label>
              <Input
                className="h-9 text-[13px]"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Subtitle</Label>
              <Input
                className="h-9 text-[13px]"
                value={editForm.subtitle}
                onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Optional subtitle"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Status</Label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm((f) => ({ ...f, status: val }))}>
                <SelectTrigger className="h-9 text-[13px] w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Challenge</Label>
              <Textarea
                className="text-[13px] min-h-[80px]"
                value={editForm.challenge}
                onChange={(e) => setEditForm((f) => ({ ...f, challenge: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Solution</Label>
              <Textarea
                className="text-[13px] min-h-[80px]"
                value={editForm.solution}
                onChange={(e) => setEditForm((f) => ({ ...f, solution: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Results</Label>
              <Textarea
                className="text-[13px] min-h-[80px]"
                value={editForm.results}
                onChange={(e) => setEditForm((f) => ({ ...f, results: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Testimonial</Label>
              <Textarea
                className="text-[13px] min-h-[60px]"
                value={editForm.testimonial}
                onChange={(e) => setEditForm((f) => ({ ...f, testimonial: e.target.value }))}
                placeholder="Optional client testimonial"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Testimonial By</Label>
              <Input
                className="h-9 text-[13px]"
                value={editForm.testimonialBy}
                onChange={(e) => setEditForm((f) => ({ ...f, testimonialBy: e.target.value }))}
                placeholder="e.g., Jane Doe, CEO"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" size="sm" className="h-8 text-[13px]" onClick={() => setEditingCS(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-[13px]" onClick={handleSaveEditFromDetail} disabled={editSaving}>
              {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (Detail View) */}
      <Dialog open={!!deletingCS} onOpenChange={(open) => !open && setDeletingCS(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Case Study</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Are you sure you want to delete &ldquo;{deletingCS?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" size="sm" className="h-8 text-[13px]" onClick={() => setDeletingCS(null)} disabled={deleteSaving}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="h-8 text-[13px]" onClick={handleConfirmDeleteFromDetail} disabled={deleteSaving}>
              {deleteSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionBlock({
  icon,
  title,
  content,
  aiLoading,
  onAIImprove,
  delay,
}: {
  icon: React.ReactNode
  title: string
  content: string
  aiLoading: boolean
  onAIImprove: () => void
  delay: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">{title}</h2>
        </div>
        <button
          className="text-[11px] text-primary/60 hover:text-primary font-medium flex items-center gap-1 transition-colors"
          onClick={onAIImprove}
          disabled={aiLoading}
        >
          {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Improve
        </button>
      </div>
      <div className="border border-border rounded-lg p-4">
        <p className="text-[13px] leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </motion.div>
  )
}
