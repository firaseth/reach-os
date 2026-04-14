'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ExportToolbar } from '@/components/export-toolbar'

export function CapacityView() {
  const [logs, setLogs] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetch('/api/capacity').then((r) => r.json()), fetch('/api/projects').then((r) => r.json())])
      .then(([l, p]) => { setLogs(l); setProjects(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    if (logs.length === 0) return null

    const totalHoursAvailable = logs.reduce((s, l) => s + l.hoursAvailable, 0)
    const totalHoursWorked = logs.reduce((s, l) => s + l.hoursWorked, 0)
    const avgUtilization = (totalHoursWorked / totalHoursAvailable) * 100

    // Utilization trend (last 6 months vs first 6 months)
    const half = Math.floor(logs.length / 2)
    const firstHalf = logs.slice(0, half)
    const secondHalf = logs.slice(half)
    const firstUtil = firstHalf.reduce((s, l) => s + l.hoursWorked, 0) / firstHalf.reduce((s, l) => s + l.hoursAvailable, 0) * 100
    const secondUtil = secondHalf.reduce((s, l) => s + l.hoursWorked, 0) / secondHalf.reduce((s, l) => s + l.hoursAvailable, 0) * 100
    const utilTrend = secondUtil - firstUtil

    // Available capacity for new work
    const latestLog = logs[logs.length - 1]
    const availableHours = latestLog.hoursAvailable - latestLog.hoursWorked
    const availableProjects = Math.floor(availableHours / 40) // avg 40 hrs per project

    // Project capacity (total hours across projects)
    const totalProjectHours = projects.reduce((s, p) => s + (p.totalHours || 0), 0)
    const avgProjectSize = projects.length > 0 ? totalProjectHours / projects.length : 0

    // Billable value
    const avgRate = projects.length > 0
      ? projects.reduce((s, p) => s + (p.hourlyRate || 0), 0) / projects.length
      : 80
    const potentialRevenue = availableHours * avgRate

    return {
      totalHoursAvailable, totalHoursWorked, avgUtilization, utilTrend,
      availableHours, availableProjects, avgRate,
      potentialRevenue, totalProjectHours, avgProjectSize,
      latestLog,
      monthlyData: logs.map((l) => ({
        date: l.date,
        label: new Date(l.date + '-01').toLocaleString('en', { month: 'short', year: '2-digit' }),
        worked: l.hoursWorked,
        available: l.hoursAvailable,
        utilization: ((l.hoursWorked / l.hoursAvailable) * 100).toFixed(1),
      })),
    }
  }, [logs, projects])

  if (loading || !metrics) {
    return <div className="space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  const fmt = (n: number) => Math.round(n).toLocaleString()

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Capacity</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Plan your workload and optimize utilization</p>
        </div>
        <ExportToolbar reportType="capacity" reportLabel="Capacity" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div className="h-[72px] px-4 rounded-lg border border-border bg-card flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground font-medium">Avg Utilization</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className={`text-2xl font-semibold tracking-tight ${metrics.avgUtilization >= 70 ? 'text-emerald-400' : metrics.avgUtilization >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {metrics.avgUtilization.toFixed(0)}%
                </p>
                {metrics.utilTrend !== 0 && (
                  <span className={`text-[11px] font-medium ${metrics.utilTrend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.utilTrend > 0 ? '+' : ''}{metrics.utilTrend.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <Target className="w-4 h-4 text-muted-foreground/40" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.04 }}>
          <div className="h-[72px] px-4 rounded-lg border border-border bg-card flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground font-medium">Available Now</p>
              <p className="text-2xl font-semibold tracking-tight mt-0.5">{fmt(metrics.availableHours)} hrs</p>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground/40" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.08 }}>
          <div className="h-[72px] px-4 rounded-lg border border-border bg-card flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground font-medium">Room for Projects</p>
              <p className="text-2xl font-semibold tracking-tight mt-0.5">~{metrics.availableProjects} projects</p>
            </div>
            <Zap className="w-4 h-4 text-muted-foreground/40" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.12 }}>
          <div className="h-[72px] px-4 rounded-lg border border-border bg-card flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground font-medium">Revenue Potential</p>
              <p className="text-2xl font-semibold tracking-tight mt-0.5">${fmt(metrics.potentialRevenue)}</p>
            </div>
            <BarChart3 className="w-4 h-4 text-muted-foreground/40" />
          </div>
        </motion.div>
      </div>

      {/* Utilization Chart */}
      <div>
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Monthly Utilization</h2>
        <div className="border border-border rounded-lg p-4">
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex items-end gap-[6px] h-[200px] min-w-[500px]">
              {metrics.monthlyData.map((m) => {
              const util = parseFloat(m.utilization)
              return (
                <div key={m.date} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[9px] text-muted-foreground/50 mb-1">{util}%</span>
                  <div
                    className="w-full rounded-t-sm min-h-[3px]"
                    style={{
                      height: `${util}%`,
                      backgroundColor: util >= 80
                        ? 'rgba(229, 72, 77, 0.6)'
                        : util >= 65
                          ? 'rgba(45, 212, 160, 0.6)'
                          : 'rgba(94, 106, 210, 0.5)',
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground/50 mt-1">{m.label.split(' ')[0]}</span>
                </div>
              )
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/50" />
              <span className="text-[11px] text-muted-foreground">Under-utilized (&lt;65%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
              <span className="text-[11px] text-muted-foreground">Optimal (65-80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/60" />
              <span className="text-[11px] text-muted-foreground">Overloaded (&gt;80%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Breakdown */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Hours Breakdown</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 grid grid-cols-3 gap-4">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Month</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Worked</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase text-right">Available</span>
            </div>
            {[...metrics.monthlyData].reverse().map((m) => (
              <div key={m.date} className="px-4 py-2.5 border-b border-border last:border-0 grid grid-cols-3 gap-4 hover:bg-accent/30 transition-colors">
                <span className="text-[13px]">{m.label}</span>
                <span className="text-[13px] text-right font-medium">{fmt(m.worked)}h</span>
                <span className="text-[13px] text-right text-muted-foreground">{fmt(m.available)}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Insights */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Insights</h2>
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              {metrics.avgUtilization >= 65 && metrics.avgUtilization <= 80 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-[13px] font-medium">Utilization Target</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {metrics.avgUtilization >= 65 && metrics.avgUtilization <= 80
                    ? 'You are in the optimal utilization range. Great balance between productivity and capacity for new work.'
                    : metrics.avgUtilization < 65
                      ? 'Under-utilized. Consider taking on more projects or increasing marketing to fill capacity.'
                      : 'Over-utilized. Risk of burnout. Consider raising rates or outsourcing to free up capacity.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium">Available Capacity</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  You have approximately {metrics.availableHours} billable hours available this month,
                  enough for roughly {metrics.availableProjects} average-sized projects.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3 className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium">Revenue Opportunity</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  At your average rate of ${metrics.avgRate.toFixed(0)}/hr, your available capacity
                  represents ${fmt(metrics.potentialRevenue)} in potential revenue.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium">Pricing Insight</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  With {projects.length} completed projects averaging {fmt(metrics.avgProjectSize)} hours each,
                  your average project value is ${fmt(metrics.avgProjectSize * metrics.avgRate)}.
                  Keep prices competitive to attract new clients to Reach OS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
