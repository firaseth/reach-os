import { useState, useCallback } from 'react'
import { fetchWithAuth } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export function useCrud<T>(baseUrl: string, itemName: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetchWithAuth(baseUrl)
      const data = await res.json()
      setItems(data)
    } catch {
      toast({ title: 'Error', description: `Failed to load ${itemName}`, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [baseUrl, itemName, toast])

  const updateItem = useCallback(async (id: string, updates: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetchWithAuth(baseUrl, { method: 'PUT', body: JSON.stringify({ id, ...updates }) })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setItems(prev => prev.map(item => (item as any).id === id ? updated : item))
      toast({ title: 'Updated', description: `${itemName} saved.` })
      return updated
    } catch {
      toast({ title: 'Error', description: `Failed to update ${itemName}`, variant: 'destructive' })
      return null
    } finally {
      setSaving(false)
    }
  }, [baseUrl, itemName, toast])

  const deleteItem = useCallback(async (item: T & { id: string }, onSuccess?: () => void) => {
    setDeleteLoading(true)
    try {
      const res = await fetchWithAuth(`${baseUrl}?id=${item.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems(prev => prev.filter(i => (i as any).id !== item.id))
      setDeleting(null)
      toast({ title: 'Deleted', description: `${itemName} removed.` })
      onSuccess?.()
    } catch {
      toast({ title: 'Error', description: `Failed to delete ${itemName}`, variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }, [baseUrl, itemName, toast])

  return { items, setItems, loading, saving, deleting, setDeleting, deleteLoading, fetchItems, updateItem, deleteItem }
}
