export type OfferStatus = 'explodindo' | 'em-alta' | 'novo-radar' | 'estavel' | 'declinando'
export type Platform = 'TikTok' | 'Meta' | 'YouTube' | 'Google'
export type Market = 'Brasil' | 'Hispânico' | 'EUA'

export interface Asset {
  type: 'vsl' | 'criativo' | 'grafico' | 'lp'
  available: boolean
  url?: string
}

export interface DayVolume {
  date: string
  count: number
}

export interface ScoreDimension {
  label: string
  value: number
}

export interface Offer {
  id: string
  name: string
  niche: string
  platform: Platform
  market: Market
  status: OfferStatus
  activeAds: number
  growthPercent: number
  avgPrice: number
  currency: 'BRL' | 'USD'
  score: number
  assets: Asset[]
  volumeHistory: DayVolume[]
  scoreBreakdown: ScoreDimension[]
  vslSummary?: string
  vslDuration?: string
  creativeCount?: number
  lpUrl?: string
  detectedAt: string
}
