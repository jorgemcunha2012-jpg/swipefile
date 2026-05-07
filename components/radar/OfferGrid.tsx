'use client'

import { Offer } from '@/lib/types'
import { OfferCard } from './OfferCard'

export function OfferGrid({ offers }: { offers: Offer[] }) {
  return (
    <div className="grid grid-cols-2 gap-1 bg-b1 border border-b1 rounded-[2px] overflow-hidden">
      {offers.map((offer) => (
        <div key={offer.id}>
          <OfferCard offer={offer} />
        </div>
      ))}
    </div>
  )
}
