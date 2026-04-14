'use client'

import { useEffect, useState, useMemo } from 'react'
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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ExportToolbar } from '@/components/export-toolbar'

export function FinanceView() {
  const [data, setData] = useState<{ incomes: any[]; expenses: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/finance')
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

  if (loading || !metrics) {
    return <div className="space-y-6">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`
  const pctFmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

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
        <ExportToolbar reportType="finance" reportLabel="Finance" />
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
    </div>
  )
}
