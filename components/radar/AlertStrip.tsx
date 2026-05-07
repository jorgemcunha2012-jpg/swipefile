'use client'

import { Offer } from '@/lib/types'

export function AlertStrip({ offers }: { offers: Offer[] }) {
  const hottest = offers.reduce((prev, current) =>
    prev.growthPercent > current.growthPercent ? prev : current
  )

  const growth48h = Math.round(hottest.growthPercent * 0.8)

  return (
    <div className="bg-rd border border-red border-opacity-20 px-5 py-4 rounded flex items-center gap-4">
      <div className="w-2 h-2 bg-red rounded-full pulse flex-shrink-0" />
      <div className="text-sm font-mono text-t1">
        <span className="text-red font-600">Alerta:</span> {hottest.name} subiu {growth48h}% em
        anúncios nas últimas 48h.
      </div>
    </div>
  )
}
