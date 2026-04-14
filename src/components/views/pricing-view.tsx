'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function PricingView() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="h-[300px] bg-muted/30 rounded-lg animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Pricing Strategy</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Keep prices near free to attract clients, then grow through value
        </p>
      </div>

      {/* Strategy Note */}
      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-primary">The Reach OS Approach</p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
              A generous free tier lowers the barrier to entry, letting creatives experience the platform&apos;s value
              before committing. The Pro plan at $9/mo is priced below a cup of coffee — impulse-buy territory.
              Studio and Enterprise tiers unlock real business intelligence features that justify higher pricing
              for serious professionals and agencies.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => {
          const features = JSON.parse(plan.features || '[]')
          const isFree = plan.price === 0
          const isPopular = plan.name === 'Pro'

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className={`border rounded-lg h-full flex flex-col ${
                isPopular
                  ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card'
              }`}>
                <div className="p-4 pb-3">
                  {isPopular && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-medium mb-2">
                      <Zap className="w-3 h-3" /> Most Popular
                    </div>
                  )}
                  <h3 className="text-[14px] font-semibold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[28px] font-bold tracking-tight">
                      {isFree ? 'Free' : `$${plan.price}`}
                    </span>
                    {!isFree && <span className="text-[12px] text-muted-foreground">/mo</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{plan.targetUsers}</p>
                </div>

                <div className="px-4 pb-3 flex-1">
                  <div className="space-y-1.5">
                    {features.map((f: string, fi: number) => (
                      <div key={fi} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-primary' : 'text-emerald-400'}`} />
                        <span className="text-[12px] text-muted-foreground leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button className={`w-full h-8 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-1 ${
                    isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : isFree
                        ? 'bg-accent text-foreground hover:bg-accent/80'
                        : 'border border-border text-foreground hover:bg-accent'
                  }`}>
                    {isFree ? 'Get Started' : `Upgrade to ${plan.name}`}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Conversion Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Step 1</span>
          </div>
          <h3 className="text-[14px] font-semibold mb-1.5">Free → Pro Conversion</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Users hit the 3-project limit or exhaust AI credits, triggering the upgrade prompt.
            At $9/mo, the decision is nearly automatic — less than they spend on a single stock photo.
          </p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Step 2</span>
          </div>
          <h3 className="text-[14px] font-semibold mb-1.5">Pro → Studio Growth</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            As freelancers grow into small teams, they need client rooms, team collaboration,
            and the finance dashboard. Studio at $29/mo unlocks the real business value.
          </p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Step 3</span>
          </div>
          <h3 className="text-[14px] font-semibold mb-1.5">Studio → Enterprise</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Agencies and enterprises need unlimited everything, advanced analytics, custom integrations,
            and dedicated support. $79/mo is still well below alternatives like Monday.com or Asana.
          </p>
        </div>
      </div>

      {/* Competitor Comparison */}
      <div>
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Competitor Price Comparison</h2>
        <div className="overflow-x-auto">
          <div className="border border-border rounded-lg overflow-hidden min-w-[600px]">
          <div className="grid grid-cols-6 gap-4 px-4 py-2.5 border-b border-border bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Feature</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-center">Reach OS</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-center">Notion</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-center">Frame.io</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-center">Dribbble</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase text-center">Pitch</span>
          </div>
          {[
            ['Free Tier', '✓', '✓', '✗', '✗', '✓'],
            ['Portfolio Builder', '✓', '✗', '✗', '✓', '✗'],
            ['Case Studies', '✓', '✗', '✗', '✓', '✓'],
            ['AI Proposals', '✓', '✗', '✗', '✗', '✓'],
            ['Revenue Dashboard', '✓', '✗', '✗', '✗', '✗'],
            ['Capacity Planner', '✓', '✗', '✗', '✗', '✗'],
            ['Client Collaboration', '✓', '✓', '✓', '✗', '✓'],
            ['Starting Price', '$0', '$0', '$15', '$7', '$0'],
            ['Pro Price', '$9', '$10', '$25', '$20', '$20'],
          ].map(([feature, ...cols]) => (
            <div key={feature} className="grid grid-cols-6 gap-4 px-4 py-2.5 border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
              <span className="text-[13px]">{feature}</span>
              {cols.map((val, ci) => (
                <span key={ci} className={`text-[13px] text-center ${
                  ci === 0 ? 'font-medium text-primary' : val === '✓' ? 'text-emerald-400' : val === '✗' ? 'text-muted-foreground/30' : 'text-muted-foreground'
                }`}>{val}</span>
              ))}
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
