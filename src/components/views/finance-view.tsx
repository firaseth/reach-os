'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { fetchWithAuth } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Minus,
  Wallet,
  CreditCard,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ExportToolbar } from '@/components/export-toolbar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type EntryType = 'income' | 'expense'
interface EntryForm {
  type: EntryType
  source: string
  vendor: string
  category: string
  amount: string
  date: string
  recurring: boolean
  notes: string
}

const defaultForm = (): EntryForm => ({
  type: 'income',
  source: '',
  vendor: '',
  category: '',
  amount: '',
  date: new Date().toISOString().slice(0, 7),
  recurring: false,
  notes: '',
})

export function FinanceView() {
  const { toast } = useToast()
  const [data, setData] = useState<{ incomes: any[]; expenses: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  // CRUD state
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any | null>(null)
  const [entryForm, setEntryForm] = useState<EntryForm>(defaultForm())
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deletingEntry, setDeletingEntry] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const refetchData = useCallback(() => {
    fetchWithAuth('/api/finance')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetchWithAuth('/api/finance')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    if (!data) return null

    const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0)
    const totalExpense = data.expenses.reduce((s, e) => s + e.amount, 0)
    const netProfit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    const monthlyData: Record<string, { income: number; expense: number; profit: number }> = {}
    data.incomes.forEach((i) => {
      if (!monthlyData[i.date]) monthlyData[i.date] = { income: 0, expense: 0, profit: 0 }
      monthlyData[i.date].income += i.amount
    })
    data.expenses.forEach((e) => {
      if (!monthlyData[e.date]) monthlyData[e.date] = { income: 0, expense: 0, profit: 0 }
      monthlyData[e.date].expense += e.amount
    })
    Object.keys(monthlyData).forEach((k) => {
      monthlyData[k].profit = monthlyData[k].income - monthlyData[k].expense
    })

    const months = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b))
    const currentMonth = months[months.length - 1]?.[1] || { income: 0, expense: 0, profit: 0 }
    const prevMonth = months.length > 1 ? months[months.length - 2]?.[1] : currentMonth

    const totalRecurringIncome = data.incomes.filter((i) => i.recurring).reduce((s, i) => s + i.amount, 0)
    const totalRecurringExpense = data.expenses.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0)

    // Runway: how many months of current expenses can total savings cover
    const monthlyBurnRate = totalExpense / (months.length || 1)
    const runway = monthlyBurnRate > 0 ? Math.floor(netProfit / monthlyBurnRate) : Infinity

    // Savings rate
    const savingsRate = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    // Income breakdown
    const incomeBreakdown: Record<string, number> = {}
    data.incomes.forEach((i) => { incomeBreakdown[i.category] = (incomeBreakdown[i.category] || 0) + i.amount })

    // Expense breakdown
    const expenseBreakdown: Record<string, number> = {}
    data.expenses.forEach((e) => { expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount })

    return {
      totalIncome, totalExpense, netProfit, profitMargin,
      currentMonth, prevMonth,
      totalRecurringIncome, totalRecurringExpense,
      monthlyBurnRate, runway, savingsRate,
      incomeBreakdown, expenseBreakdown,
      monthlyTrend: months.map(([date, d]) => ({
        date,
        label: new Date(date + '-01').toLocaleString('en', { month: 'short', year: '2-digit' }),
        ...d,
      })),
    }
  }, [data])

  // Collect all existing categories for suggestions
  const allCategories = useMemo(() => {
    if (!data) return []
    const cats = new Set<string>()
    data.incomes.forEach((i) => { if (i.category) cats.add(i.category) })
    data.expenses.forEach((e) => { if (e.category) cats.add(e.category) })
    return Array.from(cats).sort()
  }, [data])

  // All entries combined for the management table
  const allEntries = useMemo(() => {
    if (!data) return []
    return [
      ...data.incomes.map((i) => ({ ...i, type: 'income' as const })),
      ...data.expenses.map((e) => ({ ...e, type: 'expense' as const })),
    ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [data])

  if (loading || !metrics) {
    return <div className="space-y-6">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`
  const pctFmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

  // --- CRUD Handlers ---
  const openCreateDialog = (type: EntryType = 'income') => {
    setEditingEntry(null)
    setEntryForm({ ...defaultForm(), type })
    setShowEntryDialog(true)
  }

  const openEditDialog = (entry: any) => {
    const type: EntryType = entry.type || (entry.source !== undefined ? 'income' : 'expense')
    setEditingEntry(entry)
    setEntryForm({
      type,
      source: entry.source || '',
      vendor: entry.vendor || '',
      category: entry.category || '',
      amount: String(entry.amount || ''),
      date: entry.date || new Date().toISOString().slice(0, 7),
      recurring: entry.recurring || false,
      notes: entry.notes || '',
    })
    setShowEntryDialog(true)
  }

  const handleSaveEntry = async () => {
    const amount = parseFloat(entryForm.amount)
    if (!amount || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount.', variant: 'destructive' })
      return
    }
    if (!entryForm.date) {
      toast({ title: 'Date required', description: 'Please select a month.', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const isIncome = entryForm.type === 'income'
      if (editingEntry) {
        // Update
        const payload: any = {
          id: editingEntry.id,
          type: entryForm.type,
          category: entryForm.category || undefined,
          amount,
          date: entryForm.date,
          recurring: entryForm.recurring,
          notes: entryForm.notes || undefined,
        }
        if (isIncome) payload.source = entryForm.source
        else payload.vendor = entryForm.vendor

        const res = await fetchWithAuth('/api/finance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update')
        toast({ title: 'Entry updated', description: 'The entry has been updated successfully.' })
      } else {
        // Create
        const payload: any = {
          type: entryForm.type,
          category: entryForm.category || undefined,
          amount,
          date: entryForm.date,
          recurring: entryForm.recurring,
          notes: entryForm.notes || undefined,
        }
        if (isIncome) payload.source = entryForm.source || 'General'
        else payload.vendor = entryForm.vendor || 'General'

        const res = await fetchWithAuth('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create')
        toast({ title: 'Entry created', description: 'New entry has been added successfully.' })
      }
      setShowEntryDialog(false)
      refetchData()
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!deletingEntry) return
    setDeleteLoading(true)
    try {
      const type: EntryType = deletingEntry.type || (deletingEntry.source !== undefined ? 'income' : 'expense')
      const res = await fetchWithAuth('/api/finance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingEntry.id, type }),
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: 'Entry deleted', description: 'The entry has been removed.' })
      setDeletingEntry(null)
      refetchData()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete entry.', variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const topMetrics = [
    { icon: Wallet, label: 'Total Income', value: fmt(metrics.totalIncome), change: metrics.prevMonth.income > 0 ? pctFmt(((metrics.currentMonth.income - metrics.prevMonth.income) / metrics.prevMonth.income) * 100) : null, positive: metrics.currentMonth.income >= metrics.prevMonth.income },
    { icon: CreditCard, label: 'Total Expenses', value: fmt(metrics.totalExpense), change: metrics.prevMonth.expense > 0 ? pctFmt(((metrics.currentMonth.expense - metrics.prevMonth.expense) / metrics.prevMonth.expense) * 100) : null, positive: metrics.currentMonth.expense <= metrics.prevMonth.expense },
    { icon: PiggyBank, label: 'Net Profit', value: fmt(metrics.netProfit), sub: `Margin: ${metrics.profitMargin.toFixed(1)}%`, valueClass: metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400' },
    { icon: TrendingUp, label: 'Savings Rate', value: `${metrics.savingsRate.toFixed(1)}%`, sub: 'Target: 30%+', valueClass: metrics.savingsRate >= 20 ? 'text-emerald-400' : metrics.savingsRate >= 10 ? 'text-amber-400' : 'text-rose-400' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Finance</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Income vs cost analysis and P&L overview</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportToolbar reportType="finance" reportLabel="Finance" />
          <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => openCreateDialog('income')}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Entry</span>
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {topMetrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <m.icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider">{m.label}</span>
              </div>
              <p className={`text-2xl font-semibold tracking-tight ${m.valueClass || ''}`}>{m.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {m.change !== null && (
                  <span className={`text-[11px] font-medium ${m.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.change} vs prev
                  </span>
                )}
                {m.sub && <span className="text-[11px] text-muted-foreground">{m.sub}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* P&L Balance Sheet */}
      <div>
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Profit & Loss Statement
        </h2>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Income Side */}
          <div className="bg-emerald-500/5 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[13px] font-semibold text-emerald-400">Income</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(metrics.incomeBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">{cat}</span>
                    <span className="text-[13px] font-medium">{fmt(amount)}</span>
                  </div>
                ))}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-emerald-500/20">
                <span className="text-[13px] font-semibold">Total Income</span>
                <span className="text-[13px] font-bold text-emerald-400">{fmt(metrics.totalIncome)}</span>
              </div>
            </div>
          </div>

          {/* Expense Side */}
          <div className="bg-rose-500/5 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[13px] font-semibold text-rose-400">Expenses</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(metrics.expenseBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">{cat}</span>
                    <span className="text-[13px] font-medium">{fmt(amount)}</span>
                  </div>
                ))}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-rose-500/20">
                <span className="text-[13px] font-semibold">Total Expenses</span>
                <span className="text-[13px] font-bold text-rose-400">{fmt(metrics.totalExpense)}</span>
              </div>
            </div>
          </div>

          {/* Net */}
          <div className={`px-4 py-4 ${metrics.netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metrics.netProfit >= 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span className="text-[14px] font-bold">Net Profit</span>
              </div>
              <span className={`text-[18px] font-bold ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmt(metrics.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Table */}
      <div>
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Monthly Breakdown</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 border-b border-border bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Month</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Income</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Expenses</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Profit</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Margin</span>
          </div>
          {[...metrics.monthlyTrend].reverse().map((m) => (
            <div key={m.date} className="hover:bg-accent/30 transition-colors">
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2.5 border-b border-border last:border-0">
                <span className="text-[13px]">{m.label}</span>
                <span className="text-[13px] text-right">{fmt(m.income)}</span>
                <span className="text-[13px] text-right text-rose-400/70">{fmt(m.expense)}</span>
                <span className={`text-[13px] text-right font-medium ${m.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(m.profit)}
                </span>
                <span className="text-[13px] text-right text-muted-foreground">
                  {m.income > 0 ? ((m.profit / m.income) * 100).toFixed(0) : '0'}%
                </span>
              </div>
              {/* Mobile card row */}
              <div className="md:hidden px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium">{m.label}</span>
                  <span className={`text-[14px] font-semibold ${m.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {fmt(m.profit)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Income</span>
                    <p className="text-[13px] font-medium">{fmt(m.income)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Expenses</span>
                    <p className="text-[13px] font-medium text-rose-400/70">{fmt(m.expense)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Margin</span>
                    <p className="text-[13px] font-medium text-muted-foreground">
                      {m.income > 0 ? ((m.profit / m.income) * 100).toFixed(0) : '0'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Indicators */}
      <div className="border border-border rounded-lg p-4">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Financial Health</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            {metrics.profitMargin >= 30 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            <div>
              <p className="text-[11px] text-muted-foreground">Profit Margin</p>
              <p className="text-[13px] font-medium">{metrics.profitMargin.toFixed(1)}% {metrics.profitMargin >= 30 ? '✓' : '— target 30%'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {metrics.savingsRate >= 20 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            <div>
              <p className="text-[11px] text-muted-foreground">Savings Rate</p>
              <p className="text-[13px] font-medium">{metrics.savingsRate.toFixed(1)}% {metrics.savingsRate >= 20 ? '✓' : '— target 20%'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {metrics.totalRecurringIncome > metrics.totalRecurringExpense ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            <div>
              <p className="text-[11px] text-muted-foreground">Recurring Coverage</p>
              <p className="text-[13px] font-medium">
                {metrics.totalRecurringExpense > 0
                  ? `${(metrics.totalRecurringIncome / metrics.totalRecurringExpense).toFixed(1)}x`
                  : '—'} {metrics.totalRecurringIncome > metrics.totalRecurringExpense ? '✓' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {metrics.monthlyBurnRate > 0 && metrics.netProfit > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            <div>
              <p className="text-[11px] text-muted-foreground">Monthly Burn</p>
              <p className="text-[13px] font-medium">{fmt(metrics.monthlyBurnRate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Entries Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">All Entries</h2>
          <Button size="sm" className="h-7 text-[12px] gap-1" onClick={() => openCreateDialog('income')}>
            <Plus className="w-3 h-3" />Add
          </Button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_100px_90px_70px] gap-3 px-4 py-2 border-b border-border bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Source / Vendor</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Category</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Amount</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Date</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Actions</span>
          </div>
          {allEntries.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
              No entries yet. Click "Add" to create your first income or expense entry.
            </div>
          )}
          <div className="max-h-[420px] overflow-y-auto">
            {allEntries.map((entry) => (
              <div key={entry.id} className="group hover:bg-accent/30 transition-colors border-b border-border last:border-0">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[1fr_1fr_100px_90px_70px] gap-3 items-center px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] px-1.5 py-0 h-5 rounded font-medium flex-shrink-0 ${entry.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {entry.type === 'income' ? entry.source : entry.vendor}
                    </span>
                    {entry.recurring && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">↻</span>
                    )}
                  </div>
                  <span className="text-[13px] truncate">{entry.category}</span>
                  <span className={`text-[13px] font-medium text-right ${entry.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {entry.type === 'income' ? '+' : '-'}{fmt(entry.amount)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{entry.date}</span>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEditDialog(entry)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => setDeletingEntry(entry)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                {/* Mobile row */}
                <div className="md:hidden px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] px-1.5 py-0 h-5 rounded font-medium flex-shrink-0 ${entry.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {entry.type === 'income' ? entry.source : entry.vendor}
                      </span>
                      {entry.recurring && (
                        <span className="text-[10px] text-muted-foreground">↻</span>
                      )}
                    </div>
                    <span className={`text-[13px] font-medium ${entry.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === 'income' ? '+' : '-'}{fmt(entry.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-muted-foreground">{entry.category}</span>
                      <span className="text-[11px] text-muted-foreground">· {entry.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditDialog(entry)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeletingEntry(entry)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={(open) => { if (!open) setShowEntryDialog(false) }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Type selector — only in create mode */}
            {!editingEntry && (
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Type</Label>
                <Tabs value={entryForm.type} onValueChange={(v) => setEntryForm({ ...entryForm, type: v as EntryType })}>
                  <TabsList className="w-full h-9">
                    <TabsTrigger value="income" className="flex-1 text-[13px] gap-1.5 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />Income
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="flex-1 text-[13px] gap-1.5 data-[state=active]:bg-rose-500/15 data-[state=active]:text-rose-400">
                      <ArrowDownRight className="w-3.5 h-3.5" />Expense
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Source / Vendor */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">
                {entryForm.type === 'income' ? 'Source' : 'Vendor'}
              </Label>
              <Input
                className="h-9 text-[13px]"
                placeholder={entryForm.type === 'income' ? 'e.g. Client name, Product sale' : 'e.g. AWS, Figma, Software'}
                value={entryForm.type === 'income' ? entryForm.source : entryForm.vendor}
                onChange={(e) =>
                  setEntryForm(entryForm.type === 'income'
                    ? { ...entryForm, source: e.target.value }
                    : { ...entryForm, vendor: e.target.value }
                  )
                }
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Category</Label>
              {allCategories.length > 0 ? (
                <Select
                  value={entryForm.category}
                  onValueChange={(v) => setEntryForm({ ...entryForm, category: v })}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Select or type a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-[13px]">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="h-9 text-[13px]"
                  placeholder="e.g. Consulting, Software, Operations"
                  value={entryForm.category}
                  onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                />
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Amount ($)</Label>
              <Input
                className="h-9 text-[13px]"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={entryForm.amount}
                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
              />
            </div>

            {/* Date (month) */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Month</Label>
              <Input
                className="h-9 text-[13px]"
                type="month"
                value={entryForm.date}
                onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
              />
            </div>

            {/* Recurring + Notes row */}
            <div className="flex items-start gap-4">
              <div className="space-y-1.5 flex-shrink-0">
                <Label className="text-[12px] text-muted-foreground">Recurring</Label>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={entryForm.recurring}
                    onCheckedChange={(v) => setEntryForm({ ...entryForm, recurring: v })}
                  />
                  <span className="text-[12px] text-muted-foreground">
                    {entryForm.recurring ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Notes</Label>
              <Textarea
                className="text-[13px] min-h-[60px] resize-none"
                placeholder="Optional notes..."
                value={entryForm.notes}
                onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" className="text-[12px]" onClick={() => setShowEntryDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-[12px]" onClick={handleSaveEntry} disabled={saving}>
              {saving ? 'Saving...' : editingEntry ? 'Update Entry' : 'Create Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deletingEntry} onOpenChange={(open) => { if (!open) setDeletingEntry(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">Delete Entry</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              Are you sure you want to delete this {deletingEntry?.type === 'income' ? 'income' : 'expense'} entry
              {deletingEntry && (
                <> for <span className="font-medium text-foreground">{deletingEntry.type === 'income' ? deletingEntry.source : deletingEntry.vendor}</span> ({fmt(deletingEntry.amount)})</>
              )}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel asChild>
              <Button variant="ghost" size="sm" className="text-[12px]" disabled={deleteLoading}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                size="sm"
                className="text-[12px]"
                onClick={(e) => { e.preventDefault(); handleDeleteEntry() }}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
