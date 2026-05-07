'use client'

import { Offer } from '@/lib/types'

export function StatCards({ offers }: { offers: Offer[] }) {
  const activeCount = offers.length
  const escalatingCount = offers.filter((o) => o.status === 'explodindo').length
  const topGrowth = Math.max(...offers.map((o) => o.growthPercent))
  const alertsCount = offers.filter((o) => o.status === 'explodindo' || o.status === 'novo-radar').length

  const stats = [
    { label: 'Ofertas ativas', value: activeCount },
    { label: 'Escalando agora', value: escalatingCount, highlighted: true },
    { label: '+TOP crescimento', value: `+${topGrowth}%`, highlighted: true },
    { label: 'Alertas novos', value: alertsCount },
  ]

  return (
    <div className="grid grid-cols-4 border border-b1 bg-s1 mb-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`px-4 py-3 border-r border-r-b1 ${
            idx === stats.length - 1 ? 'border-r-0' : ''
          } ${stat.highlighted ? 'bg-rd' : ''}`}
        >
          <div className="text-2xl font-syne font-900 text-t1 mb-1">
            {stat.value}
          </div>
          <div className="text-xs font-mono uppercase tracking-[0.06em] text-t3">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
