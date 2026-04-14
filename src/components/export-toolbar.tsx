'use client'

import { useState } from 'react'
import {
  Download,
  Share2,
  Link2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { fetchWithAuth } from '@/lib/api'

interface ExportToolbarProps {
  reportType: 'revenue' | 'finance' | 'capacity' | 'portfolio'
  reportLabel: string
}

export function ExportToolbar({ reportType, reportLabel }: ExportToolbarProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareExpires, setShareExpires] = useState('')
  const [generatingShare, setGeneratingShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  async function handleExportCSV() {
    try {
      const res = await fetchWithAuth(`/api/export/${reportType}?format=csv`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reach-os-${reportType}-report.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({ title: 'Exported', description: `${reportLabel} report downloaded as CSV.` })
    } catch {
      toast({ title: 'Export Failed', description: 'Could not generate CSV file.', variant: 'destructive' })
    }
  }

  async function handleExportJSON() {
    try {
      const res = await fetchWithAuth(`/api/export/${reportType}?format=json`)
      if (!res.ok) throw new Error('Export failed')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reach-os-${reportType}-report.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({ title: 'Exported', description: `${reportLabel} report downloaded as JSON.` })
    } catch {
      toast({ title: 'Export Failed', description: 'Could not generate JSON file.', variant: 'destructive' })
    }
  }

  async function handleGenerateShare(expiresIn: '24h' | '7d' | '30d') {
    setGeneratingShare(true)
    try {
      const res = await fetchWithAuth('/api/export/share', {
        method: 'POST',
        body: JSON.stringify({ type: reportType, expiresIn }),
      })
      if (!res.ok) throw new Error('Share failed')
      const data = await res.json()
      const fullUrl = `${window.location.origin}${data.shareUrl}`
      setShareUrl(fullUrl)
      setShareExpires(data.expiresAt)
      setShareOpen(true)
      toast({ title: 'Link Generated', description: `Share link expires in ${expiresIn}.` })
    } catch {
      toast({ title: 'Share Failed', description: 'Could not generate share link.', variant: 'destructive' })
    } finally {
      setGeneratingShare(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Copied', description: 'Share link copied to clipboard.' })
    } catch {
      toast({ title: 'Copy Failed', description: 'Could not copy to clipboard.', variant: 'destructive' })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-[13px] gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-2" />
            Download CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            <Download className="w-3.5 h-3.5 mr-2" />
            Download JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Share2 className="w-3.5 h-3.5 mr-2" />
              Share Report
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleGenerateShare('24h')} disabled={generatingShare}>
                {generatingShare ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Link2 className="w-3.5 h-3.5 mr-2" />}
                Expires in 24 hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateShare('7d')} disabled={generatingShare}>
                {generatingShare ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Link2 className="w-3.5 h-3.5 mr-2" />}
                Expires in 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateShare('30d')} disabled={generatingShare}>
                {generatingShare ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Link2 className="w-3.5 h-3.5 mr-2" />}
                Expires in 30 days
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share Link Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Share {reportLabel} Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-[13px] text-muted-foreground">
              Anyone with this link can view the {reportLabel.toLowerCase()} report.
              The link expires on {new Date(shareExpires).toLocaleDateString()}.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/30">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-[13px] text-muted-foreground truncate">{shareUrl}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 text-[13px] flex-shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>This link provides read-only access to the report data.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
