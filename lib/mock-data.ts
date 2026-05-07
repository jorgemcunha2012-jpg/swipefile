import { Offer } from './types'

const generateVolumeHistory = (
  days: number = 90,
  startCount: number,
  growthPattern: 'exponential' | 'linear' | 'decline' | 'stable'
): Array<{ date: string; count: number }> => {
  const today = new Date()
  const result = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    let count = startCount
    const progress = (days - i) / days

    switch (growthPattern) {
      case 'exponential':
        count = Math.round(startCount * Math.pow(1 + progress * 3, 1.2))
        break
      case 'linear':
        count = Math.round(startCount + startCount * progress * 1.5)
        break
      case 'decline':
        count = Math.round(startCount * (1 - progress * 0.5))
        break
      case 'stable':
        count = startCount + Math.round(Math.sin(progress * Math.PI * 4) * startCount * 0.1)
        break
    }

    count += Math.round(Math.random() * startCount * 0.15)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')

    result.push({
      date: `${day}/${month}`,
      count: Math.max(Math.round(count), 5),
    })
  }

  return result
}

export const offers: Offer[] = [
  {
    id: '1',
    name: 'Chá que desinflama o intestino em 7 dias',
    niche: 'Saúde',
    platform: 'TikTok',
    market: 'Brasil',
    status: 'explodindo',
    activeAds: 412,
    growthPercent: 318,
    avgPrice: 67,
    currency: 'BRL',
    score: 94,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: true, url: '#' },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 50, 'exponential'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 92 },
      { label: 'Crescimento recente', value: 100 },
      { label: 'Longevidade da oferta', value: 85 },
      { label: 'Saturação de mercado', value: 89 },
    ],
    vslSummary:
      'VSL clássica de problema-agitação-solução com depoimentos. Foco em alívio rápido e comprovação clínica.',
    vslDuration: '14min',
    creativeCount: 47,
    lpUrl: 'https://example.com/cha-intestino',
    detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Renda passiva com automação — 3h por semana',
    niche: 'Financeiro',
    platform: 'Meta',
    market: 'Hispânico',
    status: 'novo-radar',
    activeAds: 187,
    growthPercent: 142,
    avgPrice: 97,
    currency: 'USD',
    score: 81,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: false },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 80, 'linear'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 76 },
      { label: 'Crescimento recente', value: 88 },
      { label: 'Longevidade da oferta', value: 72 },
      { label: 'Saturação de mercado', value: 78 },
    ],
    vslSummary: 'Story-driven VSL mostrando lifestyle. Case studies de alunos com resultados reais.',
    vslDuration: '11min',
    creativeCount: 34,
    lpUrl: 'https://example.com/renda-automatizada',
    detectedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Sérum coreano que para queda em 14 dias',
    niche: 'Beleza',
    platform: 'TikTok',
    market: 'Brasil',
    status: 'em-alta',
    activeAds: 231,
    growthPercent: 89,
    avgPrice: 47,
    currency: 'BRL',
    score: 76,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: true, url: '#' },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 120, 'linear'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 85 },
      { label: 'Crescimento recente', value: 72 },
      { label: 'Longevidade da oferta', value: 68 },
      { label: 'Saturação de mercado', value: 71 },
    ],
    vslSummary: 'Demonstração visual com before/after. Ingredientes ativos destaque + garantia.',
    vslDuration: '8min',
    creativeCount: 52,
    lpUrl: 'https://example.com/serum-coreano',
    detectedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Protocolo GLP-1 natural — perde 6kg sem injeção',
    niche: 'Emagrecimento',
    platform: 'YouTube',
    market: 'Brasil',
    status: 'em-alta',
    activeAds: 156,
    growthPercent: 67,
    avgPrice: 127,
    currency: 'BRL',
    score: 71,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: true, url: '#' },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 70, 'linear'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 68 },
      { label: 'Crescimento recente', value: 64 },
      { label: 'Longevidade da oferta', value: 75 },
      { label: 'Saturação de mercado', value: 72 },
    ],
    vslSummary: 'Educacional + depoimentos. Explicação científica simples + resultados',
    vslDuration: '12min',
    creativeCount: 28,
    lpUrl: 'https://example.com/glp1-natural',
    detectedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Método de reversão do diabetes tipo 2 em casa',
    niche: 'Saúde',
    platform: 'Meta',
    market: 'Brasil',
    status: 'estavel',
    activeAds: 98,
    growthPercent: 23,
    avgPrice: 197,
    currency: 'BRL',
    score: 65,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: false },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 95, 'stable'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 55 },
      { label: 'Crescimento recente', value: 42 },
      { label: 'Longevidade da oferta', value: 88 },
      { label: 'Saturação de mercado', value: 58 },
    ],
    vslSummary: 'Depoimentos médicos + histórias de pacientes. Foco em remissão.',
    vslDuration: '15min',
    creativeCount: 19,
    lpUrl: 'https://example.com/diabetes-reverso',
    detectedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    name: 'Sistema de apostas esportivas com IA',
    niche: 'Financeiro',
    platform: 'TikTok',
    market: 'Brasil',
    status: 'em-alta',
    activeAds: 203,
    growthPercent: 55,
    avgPrice: 77,
    currency: 'BRL',
    score: 68,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: true, url: '#' },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 100, 'linear'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 72 },
      { label: 'Crescimento recente', value: 58 },
      { label: 'Longevidade da oferta', value: 64 },
      { label: 'Saturação de mercado', value: 68 },
    ],
    vslSummary: 'Demonstração ao vivo com resultados. Urgência + prova social.',
    vslDuration: '9min',
    creativeCount: 41,
    lpUrl: 'https://example.com/apostas-ia',
    detectedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    name: 'Curso de inglês fluente em 90 dias pelo celular',
    niche: 'Educação',
    platform: 'YouTube',
    market: 'Brasil',
    status: 'declinando',
    activeAds: 44,
    growthPercent: -12,
    avgPrice: 37,
    currency: 'BRL',
    score: 48,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: false },
      { type: 'lp', available: false },
    ],
    volumeHistory: generateVolumeHistory(90, 120, 'decline'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 32 },
      { label: 'Crescimento recente', value: 18 },
      { label: 'Longevidade da oferta', value: 72 },
      { label: 'Saturação de mercado', value: 48 },
    ],
    vslSummary: 'Educacional com métodos de aprendizagem. Pouco diferencial.',
    vslDuration: '10min',
    creativeCount: 12,
    lpUrl: 'https://example.com/inglés-90dias',
    detectedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    name: 'Crema despigmentante noturna — sin manchas en 21 días',
    niche: 'Beleza',
    platform: 'TikTok',
    market: 'Hispânico',
    status: 'novo-radar',
    activeAds: 134,
    growthPercent: 198,
    avgPrice: 67,
    currency: 'USD',
    score: 79,
    assets: [
      { type: 'vsl', available: true, url: '#' },
      { type: 'criativo', available: true, url: '#' },
      { type: 'grafico', available: true, url: '#' },
      { type: 'lp', available: true, url: '#' },
    ],
    volumeHistory: generateVolumeHistory(90, 40, 'exponential'),
    scoreBreakdown: [
      { label: 'Volume de anúncios', value: 78 },
      { label: 'Crescimiento reciente', value: 92 },
      { label: 'Longevidad de oferta', value: 68 },
      { label: 'Saturación de mercado', value: 76 },
    ],
    vslSummary: 'Before/after visual compelling. Ingredientes naturales destacados.',
    vslDuration: '7min',
    creativeCount: 39,
    lpUrl: 'https://example.com/crema-despigmentante',
    detectedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
