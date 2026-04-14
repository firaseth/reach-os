'use client'

import { useEffect, useState, useMemo } from 'react'
import { fetchWithAuth } from '@/lib/api'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Minus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ExportToolbar } from '@/components/export-toolbar'

export function RevenueView() {
  const [data, setData] = useState<{ incomes: any[]; expenses: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithAuth('/api/finance')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    if (!data) return null

    const months: Record<string, { income: number; expense: number }> = {}
    let totalIncome = 0
    let totalExpense = 0
    let recurringIncome = 0

    data.incomes.forEach((i) => {
      if (!months[i.date]) months[i.date] = { income: 0, expense: 0 }
      months[i.date].income += i.amount
      totalIncome += i.amount
      if (i.recurring) recurringIncome += i.amount
    })

    data.expenses.forEach((e) => {
      if (!months[e.date]) months[e.date] = { income: 0, expense: 0 }
      months[e.date].expense += e.amount
      totalExpense += e.amount
    })

    const sortedMonths = Object.entries(months).sort(([a], [b]) => a.localeCompare(b))
    const monthLabels = sortedMonths.map(([k]) => {
      const [y, m] = k.split('-')
      return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en', { month: 'short', year: '2-digit' })
    })
    const incomeData = sortedMonths.map(([, v]) => Math.round(v.income))
    const expenseData = sortedMonths.map(([, v]) => Math.round(v.expense))
    const profitData = sortedMonths.map(([, v]) => Math.round(v.income - v.expense))

    // Last 3 months for trend
    const recentMonths = sortedMonths.slice(-3)
    const prevMonths = sortedMonths.slice(-6, -3)
    const recentIncome = recentMonths.reduce((s, [, v]) => s + v.income, 0)
    const prevIncome = prevMonths.length > 0 ? prevMonths.reduce((s, [, v]) => s + v.income, 0) : recentIncome
    const incomeTrend = prevIncome > 0 ? ((recentIncome - prevIncome) / prevIncome) * 100 : 0

    const recentExpense = recentMonths.reduce((s, [, v]) => s + v.expense, 0)
    const prevExpense = prevMonths.length > 0 ? prevMonths.reduce((s, [, v]) => s + v.expense, 0) : recentExpense
    const expenseTrend = prevExpense > 0 ? ((recentExpense - prevExpense) / prevExpense) * 100 : 0

    // Average monthly
    const numMonths = sortedMonths.length || 1
    const avgMonthlyIncome = totalIncome / numMonths
    const avgMonthlyProfit = (totalIncome - totalExpense) / numMonths

    // Income by category
    const incomeByCategory: Record<string, number> = {}
    data.incomes.forEach((i) => {
      incomeByCategory[i.category] = (incomeByCategory[i.category] || 0) + i.amount
    })

    // Expense by category
    const expenseByCategory: Record<string, number> = {}
    data.expenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
    })

    // Top income sources
    const incomeBySource: Record<string, number> = {}
    data.incomes.forEach((i) => {
      incomeBySource[i.source] = (incomeBySource[i.source] || 0) + i.amount
    })
    const topSources = Object.entries(incomeBySource)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      totalIncome, totalExpense,
      netProfit: totalIncome - totalExpense,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
      recurringIncome,
      mrr: sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1][1].income : 0,
      avgMonthlyIncome, avgMonthlyProfit,
      incomeTrend, expenseTrend,
      monthLabels, incomeData, expenseData, profitData,
      incomeByCategory, expenseByCategory,
      topSources,
    }
  }, [data])

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[72px] bg-muted/30 rounded-lg animate-pulse" />)}
        </div>
        <div className="h-[300px] bg-muted/30 rounded-lg animate-pulse" />
      </div>
    )
  }

  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
    return `$${Math.round(n).toLocaleString()}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Revenue</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Track income, expenses, and profitability</p>
        </div>
        <ExportToolbar reportType="revenue" reportLabel="Revenue" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          { label: 'Total Revenue', value: fmt(metrics.totalIncome), icon: TrendingUp },
          { label: 'Total Expenses', value: fmt(metrics.totalExpense), icon: TrendingDown },
          { label: 'Net Profit', value: fmt(metrics.netProfit), icon: DollarSign },
          { label: 'Profit Margin', value: `${metrics.profitMargin.toFixed(1)}%`, icon: ArrowUpRight },
        ] as const).map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
            <div className="h-[72px] px-4 rounded-lg border border-border bg-card flex items-center justify-between">
              <div>
                <p className="text-[12px] text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-semibold mt-0.5 tracking-tight">{s.value}</p>
              </div>
              <s.icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Monthly Revenue vs Expenses</h2>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex items-end justify-between gap-[6px] h-[220px] min-w-[500px]">
                {metrics.monthLabels.map((label, i) => {
                  const maxVal = Math.max(...metrics.incomeData, ...metrics.expenseData, 1)
                  const incH = (metrics.incomeData[i] / maxVal) * 100
                  const expH = (metrics.expenseData[i] / maxVal) * 100
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-[2px]">
                      <div className="w-full flex gap-[2px] items-end h-[180px]">
                        <div className="flex-1 rounded-t-sm bg-primary/80 min-h-[2px]" style={{ height: `${incH}%` }} />
                        <div className="flex-1 rounded-t-sm bg-destructive/40 min-h-[2px]" style={{ height: `${expH}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground/50 mt-1">{label.split(' ')[0]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary/80" />
                <span className="text-[11px] text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-destructive/40" />
                <span className="text-[11px] text-muted-foreground">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Trend */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Monthly Profit</h2>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex items-end gap-[4px] h-[220px] min-w-[400px]">
                {metrics.profitData.map((val, i) => {
                  const maxVal = Math.max(...metrics.profitData.map(Math.abs), 1)
                  const h = (Math.abs(val) / maxVal) * 100
                  const isPositive = val >= 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-muted-foreground/50 mb-1">{isPositive ? '' : ''}</span>
                      <div
                        className="w-full rounded-t-sm min-h-[3px]"
                        style={{
                          height: `${h}%`,
                          backgroundColor: isPositive ? 'rgba(45, 212, 160, 0.6)' : 'rgba(229, 72, 77, 0.5)',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground">Avg Monthly</span>
              <span className={`text-[13px] font-semibold ${metrics.avgMonthlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmt(metrics.avgMonthlyProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Source */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Income by Source</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            {metrics.topSources.map(([source, amount], i) => {
              const pct = metrics.totalIncome > 0 ? (amount / metrics.totalIncome) * 100 : 0
              return (
                <div key={source} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0">
                  <span className="text-[12px] text-muted-foreground w-5 text-right font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium truncate">{source}</span>
                      <span className="text-[13px] font-semibold ml-2">{fmt(amount)}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Expense Breakdown</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            {Object.entries(metrics.expenseByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const pct = metrics.totalExpense > 0 ? (amount / metrics.totalExpense) * 100 : 0
                return (
                  <div key={category} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-medium">{category}</span>
                        <span className="text-[13px] font-semibold ml-2">{fmt(amount)}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-destructive/40 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5">
              <Repeat className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground">Recurring: {fmt(data!.expenses.filter(e => e.recurring).reduce((s, e) => s + e.amount, 0))}/mo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground">One-time: {fmt(data!.expenses.filter(e => !e.recurring).reduce((s, e) => s + e.amount, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="border border-border rounded-lg p-4">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Key Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Monthly Recurring Revenue</p>
            <p className="text-[15px] font-semibold mt-0.5">{fmt(metrics.recurringIncome)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Most Recent Month Revenue</p>
            <p className="text-[15px] font-semibold mt-0.5">{fmt(metrics.mrr)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Avg Monthly Revenue</p>
            <p className="text-[15px] font-semibold mt-0.5">{fmt(metrics.avgMonthlyIncome)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Revenue vs Expenses Ratio</p>
            <p className="text-[15px] font-semibold mt-0.5">
              {metrics.totalExpense > 0 ? (metrics.totalIncome / metrics.totalExpense).toFixed(2) : '—'}x
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
