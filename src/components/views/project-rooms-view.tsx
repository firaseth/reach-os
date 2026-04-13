'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Plus,
  ArrowLeft,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  Circle,
  Loader2,
  MessageSquare,
  Users,
  Package,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const phaseColors: Record<string, string> = {
  discovery: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  design: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  development: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  delivery: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  review: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
}

const phaseIcons: Record<string, typeof Circle> = {
  discovery: Circle,
  design: Circle,
  development: Circle,
  delivery: CheckCircle2,
  review: Circle,
}

export function ProjectRoomsView() {
  const { setView } = useAppStore()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const { toast } = useToast()

  const [newRoom, setNewRoom] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/client-rooms')
      .then((r) => r.json())
      .then((data) => setRooms(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load project rooms', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    try {
      const res = await fetch('/api/client-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      })
      const room = await res.json()
      setRooms((prev) => [room, ...prev])
      setShowNewDialog(false)
      setNewRoom({ name: '', clientName: '', clientEmail: '', description: '' })
      toast({ title: 'Room Created', description: `"${room.name}" is ready for collaboration.` })
    } catch {
      toast({ title: 'Error', description: 'Failed to create room', variant: 'destructive' })
    }
  }

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2" />
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
          <h1 className="text-2xl font-bold tracking-tight">Client Rooms</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Collaborate with clients, share deliverables, and manage project progress
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25">
              <Plus className="w-4 h-4 mr-2" />
              New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Project Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="e.g., Solace Wellness Rebrand"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input
                    placeholder="e.g., Solace Wellness"
                    value={newRoom.clientName}
                    onChange={(e) => setNewRoom((p) => ({ ...p, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    placeholder="email@client.com"
                    value={newRoom.clientEmail}
                    onChange={(e) => setNewRoom((p) => ({ ...p, clientEmail: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief project description..."
                  value={newRoom.description}
                  onChange={(e) => setNewRoom((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newRoom.name}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              >
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search rooms..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Room Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No project rooms yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a room to start collaborating with clients
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((room, i) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 h-full"
                  onClick={() => setView('project-room-detail', room.id)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${phaseColors[room.phase] || ''} capitalize`}>
                          {room.phase}
                        </Badge>
                        {room.status === 'active' && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-amber-500 transition-colors line-clamp-1">
                      {room.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{room.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                      {room.description}
                    </p>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {room.messages?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {room.deliverables?.length || 0}
                        </span>
                      </div>
                      <Clock className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
    fetch('/api/client-rooms')
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((r: any) => r.id === selectedId)
        if (found) {
          setRoom(found)
        }
      })
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
      const res = await fetch('/api/client-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          roomId: selectedId,
          content: message,
          sender: 'user',
        }),
      })

      if (res.ok) {
        const newMsg = { id: Date.now().toString(), content: message, sender: 'user', type: 'text', createdAt: new Date().toISOString() }
        setRoom((prev: any) => ({
          ...prev,
          messages: [...(prev.messages || []), newMsg],
        }))
        setMessage('')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!room) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Room not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => setView('project-rooms')}>
          Back to Rooms
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setView('project-rooms')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <Badge variant="outline" className={`text-[10px] ${phaseColors[room.phase] || ''} capitalize`}>
              {room.phase}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{room.clientName} · {room.clientEmail}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant={activeTab === 'messages' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('messages')}
          className="text-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
          Messages
        </Button>
        <Button
          variant={activeTab === 'deliverables' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('deliverables')}
          className="text-xs"
        >
          <Package className="w-3.5 h-3.5 mr-1.5" />
          Deliverables ({room.deliverables?.length || 0})
        </Button>
      </div>

      {activeTab === 'messages' ? (
        <Card className="flex-1 flex flex-col overflow-hidden border-border/50 min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {(!room.messages || room.messages.length === 0) && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground">Start the conversation with your client</p>
                </div>
              )}
              {[...(room.messages || [])].reverse().map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex-shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 overflow-auto border-border/50">
          <CardContent className="p-4">
            {(!room.deliverables || room.deliverables.length === 0) ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No deliverables yet</p>
                <p className="text-xs text-muted-foreground">Add files and assets for your client to review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {room.deliverables.map((d: any) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-background border flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{d.type} · {d.status}</p>
                    </div>
                    {d.status === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Badge variant="outline" className="text-[10px] capitalize">{d.status}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
