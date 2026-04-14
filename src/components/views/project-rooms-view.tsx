'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { fetchWithAuth } from '@/lib/api'
import {
  Plus,
  ArrowLeft,
  Send,
  Paperclip,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Users,
  Package,
  Search,
  Circle,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

const phaseConfig: Record<string, { text: string; dot: string }> = {
  discovery: { text: 'text-blue-400', dot: 'bg-blue-400' },
  design: { text: 'text-violet-400', dot: 'bg-violet-400' },
  development: { text: 'text-amber-400', dot: 'bg-amber-400' },
  delivery: { text: 'text-emerald-400', dot: 'bg-emerald-400' },
  review: { text: 'text-rose-400', dot: 'bg-rose-400' },
}

export function ProjectRoomsView() {
  const { setView } = useAppStore()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const { toast } = useToast()

  const [newRoom, setNewRoom] = useState({ name: '', clientName: '', clientEmail: '', description: '' })

  useEffect(() => {
    fetchWithAuth('/api/client-rooms')
      .then((r) => r.json())
      .then((data) => setRooms(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load rooms', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    try {
      const res = await fetchWithAuth('/api/client-rooms', {
        method: 'POST',
        body: JSON.stringify(newRoom),
      })
      const room = await res.json()
      setRooms((prev) => [room, ...prev])
      setShowNewDialog(false)
      setNewRoom({ name: '', clientName: '', clientEmail: '', description: '' })
      toast({ title: 'Room Created', description: `"${room.name}" ready.` })
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Client Rooms</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} · {rooms.filter((r) => r.status === 'active').length} active
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-[13px]">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Create Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Project Name</Label>
                <Input placeholder="e.g., Solace Rebrand" className="h-9 text-[13px]" value={newRoom.name} onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Client</Label>
                  <Input placeholder="Client name" className="h-9 text-[13px]" value={newRoom.clientName} onChange={(e) => setNewRoom((p) => ({ ...p, clientName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Email</Label>
                  <Input placeholder="email@" className="h-9 text-[13px]" value={newRoom.clientEmail} onChange={(e) => setNewRoom((p) => ({ ...p, clientEmail: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Description</Label>
                <Textarea placeholder="Brief description..." className="text-[13px] min-h-[60px]" value={newRoom.description} onChange={(e) => setNewRoom((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} disabled={!newRoom.name} className="w-full h-9 text-[13px]" size="sm">Create Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
        <Input placeholder="Filter rooms..." className="h-8 pl-8 text-[13px] bg-muted/30 border-transparent focus:border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground" onClick={() => setSearch('')}>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Room List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No rooms yet</p>
          </motion.div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {filtered.map((room, i) => {
              const phase = phaseConfig[room.phase] || phaseConfig.discovery
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group flex-wrap"
                  onClick={() => setView('project-room-detail', room.id)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phase.dot.replace('bg-', '') }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium group-hover:text-primary transition-colors truncate">{room.name}</p>
                    <div className="flex items-center gap-2 mt-px">
                      <span className="text-[11px] text-muted-foreground">{room.clientName}</span>
                      <span className="text-[11px] text-muted-foreground/30">·</span>
                      <span className={`text-[11px] capitalize ${phase.text}`}>{room.phase}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 flex-shrink-0 ml-auto">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {room.messages?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {room.deliverables?.length || 0}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ProjectRoomDetailView() {
  const { selectedId, setView } = useAppStore()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'messages' | 'deliverables'>('messages')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedId) return
    fetchWithAuth('/api/client-rooms')
      .then((r) => r.json())
      .then((data) => setRoom(data.find((r: any) => r.id === selectedId)))
      .finally(() => setLoading(false))
  }, [selectedId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [room?.messages])

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    try {
      const res = await fetchWithAuth('/api/client-rooms', {
        method: 'POST',
        body: JSON.stringify({ action: 'message', roomId: selectedId, content: message, sender: 'user' }),
      })
      if (res.ok) {
        const newMsg = { id: Date.now().toString(), content: message, sender: 'user', type: 'text', createdAt: new Date().toISOString() }
        setRoom((prev: any) => ({ ...prev, messages: [...(prev.messages || []), newMsg] }))
        setMessage('')
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  if (!room) {
    return (
      <div className="text-center py-16">
        <p className="text-[13px] text-muted-foreground">Room not found</p>
        <Button variant="ghost" size="sm" className="mt-3 h-7 text-[12px]" onClick={() => setView('project-rooms')}>Back</Button>
      </div>
    )
  }

  const phase = phaseConfig[room.phase] || phaseConfig.discovery

  return (
    <div className="space-y-3 h-[calc(100vh-7rem)] md:h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setView('project-rooms')}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full ${phase.dot}`} />
          <h2 className="text-[14px] font-medium truncate">{room.name}</h2>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 border-0 ${phase.text} bg-current/10`}>
            {room.phase}
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground">{room.clientName}</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 flex-shrink-0 border-b border-border">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3 py-2 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'messages'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Messages {room.messages?.length ? `(${room.messages.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`px-3 py-2 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'deliverables'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Deliverables {room.deliverables?.length ? `(${room.deliverables.length})` : ''}
        </button>
      </div>

      {activeTab === 'messages' ? (
        <div className="flex-1 flex flex-col min-h-0 border border-border rounded-lg overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-3 max-w-2xl mx-auto">
              {(!room.messages || room.messages.length === 0) && (
                <div className="text-center py-12">
                  <MessageSquare className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">No messages yet</p>
                </div>
              )}
              {[...(room.messages || [])].reverse().map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[480px] rounded-lg px-3 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50'
                  }`}>
                    <p className="text-[13px] leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground/50'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-border bg-card flex-shrink-0">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0">
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <Input
                placeholder="Type a message..."
                className="h-8 text-[13px] bg-muted/30 border-transparent focus:border-border"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={handleSend}
                disabled={!message.trim() || sending}
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 border border-border rounded-lg overflow-hidden">
          {(!room.deliverables || room.deliverables.length === 0) ? (
            <div className="text-center py-12">
              <Package className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground">No deliverables yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {room.deliverables.map((d: any) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <Package className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{d.title}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{d.type}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 h-5 border-0 flex-shrink-0 ${
                      d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
