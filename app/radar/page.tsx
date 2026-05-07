'use client'

import { useState, useMemo } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Statusbar } from '@/components/layout/Statusbar'
import { StatCards } from '@/components/radar/StatCards'
import { AlertStrip } from '@/components/radar/AlertStrip'
import { SortToolbar } from '@/components/radar/SortToolbar'
import { OfferGrid } from '@/components/radar/OfferGrid'
import { offers } from '@/lib/mock-data'
import type { Offer } from '@/lib/types'

type SortOption = 'hot' | 'ads' | 'recent' | 'score'

export default function RadarPage() {
  const [sortBy, setSortBy] = useState<SortOption>('hot')

  const sortedOffers = useMemo(() => {
    const sorted = [...offers]

    switch (sortBy) {
      case 'hot':
        return sorted.sort((a, b) => {
          const scoreA = b.growthPercent * 0.6 + (b.activeAds / 500) * 100 * 0.4
          const scoreB = a.growthPercent * 0.6 + (a.activeAds / 500) * 100 * 0.4
          return scoreA - scoreB
        })
      case 'ads':
        return sorted.sort((a, b) => b.activeAds - a.activeAds)
      case 'recent':
        return sorted.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
      case 'score':
        return sorted.sort((a, b) => b.score - a.score)
      default:
        return sorted
    }
  }, [sortBy])

  return (
    <div className="min-h-screen bg-bg">
      <Topbar />

      <main className="pt-[42px] pb-6 px-6">
        <div className="max-w-[1400px] mx-auto">
          <StatCards offers={offers} />
          <AlertStrip offers={offers} />
          <SortToolbar active={sortBy} onChange={setSortBy} resultCount={sortedOffers.length} />
          <OfferGrid offers={sortedOffers} />
        </div>
      </main>

      <Statusbar />
    </div>
  )
}
