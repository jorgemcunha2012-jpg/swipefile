'use client'

import Link from 'next/link'
import { Offer } from '@/lib/types'

const statusColors = {
  explodindo: { bg: 'rd', border: 'border-red', text: 'text-red' },
  'em-alta': { bg: 's3', border: 'border-b2', text: 'text-t2' },
  'novo-radar': { bg: 's3', border: 'border-b2', text: 'text-t2' },
  estavel: { bg: 's3', border: 'border-b2', text: 'text-t2' },
  declinando: { bg: 's3', border: 'border-b2', text: 'text-t3' },
}

const statusLabel = {
  explodindo: 'EXPLODINDO',
  'em-alta': 'EM ALTA',
  'novo-radar': 'NOVO RADAR',
  estavel: 'ESTÁVEL',
  declinando: 'DECLINANDO',
}

const assetIcons = {
  vsl: 'V',
  criativo: 'C',
  grafico: 'G',
  lp: 'L',
}

export function OfferCard({ offer }: { offer: Offer }) {
  const colors = statusColors[offer.status]

  return (
    <Link href={`/oferta/${offer.id}`}>
      <div
        className={`bg-s2 border border-b1 ${
          offer.status === 'explodindo' ? 'border-l-2 border-l-red' : ''
        } transition-all hover:bg-s3 hover:border-b2 cursor-pointer flex flex-col`}
      >
        {/* Thumb */}
        <div className="h-28 bg-s3 border-b border-b1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute text-4xl font-syne font-900 opacity-10 uppercase tracking-tight">
            {offer.niche}
          </div>
          <div className="flex gap-3 z-10">
            {/* Status */}
            <div
              className={`px-3 py-2 text-sm font-mono uppercase tracking-[0.05em] ${colors.bg} ${colors.border} border rounded-[2px]`}
            >
              <span className={colors.text}>{statusLabel[offer.status]}</span>
            </div>
            {/* Ads count */}
            <div className="px-3 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 rounded-[2px] text-t2">
              {offer.activeAds} anúncios
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.08em] mb-3">
            {offer.niche} · {offer.platform} · {offer.market}
          </div>

          <h3 className="text-lg font-syne font-700 text-t1 mb-4 leading-snug line-clamp-2">
            {offer.name}
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4 text-sm font-mono">
            <div>
              <div className="text-t3 uppercase tracking-[0.05em] text-xs mb-2">Crescimento</div>
              <div className={`font-600 text-base ${offer.growthPercent > 0 ? 'text-red' : 'text-t2'}`}>
                {offer.growthPercent > 0 ? '+' : ''}
                {offer.growthPercent}%
              </div>
            </div>
            <div>
              <div className="text-t3 uppercase tracking-[0.05em] text-xs mb-2">Preço médio</div>
              <div className="text-t2 font-600 text-base">
                {offer.currency === 'BRL' ? 'R$' : '$'}
                {offer.avgPrice}
              </div>
            </div>
            <div>
              <div className="text-t3 uppercase tracking-[0.05em] text-xs mb-2">Score</div>
              <div className="text-t1 font-600 text-base">{offer.score}/100</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-b1 flex items-center justify-between">
          <div className="flex gap-2">
            {offer.assets.map((asset) => (
              <div
                key={asset.type}
                className={`w-6 h-6 flex items-center justify-center text-sm font-mono font-600 rounded-[2px] ${
                  asset.available
                    ? 'bg-b2 text-t2 border border-b2'
                    : 'bg-b1 text-t3 border border-b1'
                }`}
              >
                {assetIcons[asset.type]}
              </div>
            ))}
          </div>
          <div className="text-sm font-mono text-t2 hover:text-red transition-colors">
            Ver →
          </div>
        </div>
      </div>
    </Link>
  )
}
