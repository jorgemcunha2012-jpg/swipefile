'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonCard, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { supabase } from '@/lib/supabase'

interface Niche {
  id: string
  name: string
  category: string
  competitiveness: number
  conversion_potential: number
  market_saturation: number
  active_offers: number
  avg_lifespan: number
  estimated_daily_revenue: number
  trending: boolean
}

const ITEMS_PER_PAGE = 6

export default function NichosPage() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [allNiches, setAllNiches] = useState<Niche[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'trending' | 'competitive' | 'potential'>('potential')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const loadNiches = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('niche, num_ads, days_active, momentum_tag')

        if (error) throw error

        const nicheStats = (data || []).reduce((acc: any, offer: any) => {
          const niche = offer.niche
          if (!acc[niche]) {
            acc[niche] = { offers: 0, total_ads: 0, total_days: 0, momentum_tags: [] }
          }
          acc[niche].offers += 1
          acc[niche].total_ads += offer.num_ads || 0
          acc[niche].total_days += offer.days_active || 0
          acc[niche].momentum_tags.push(offer.momentum_tag)
          return acc
        }, {})

        const nichesData: Niche[] = Object.entries(nicheStats).map(([name, stats]: any, idx) => {
          const avg_lifespan = Math.round(stats.total_days / stats.offers)
          const is_trending = stats.momentum_tags.filter((t: string) => t === 'escalating').length > 0
          return {
            id: String(idx + 1),
            name,
            category: ['Emagrecimento', 'Fitness', 'Beleza'].includes(name) ? 'Saúde & Beleza' : 'Educação',
            competitiveness: 60 + Math.random() * 35,
            conversion_potential: 65 + Math.random() * 30,
            market_saturation: 50 + Math.random() * 35,
            active_offers: stats.offers,
            avg_lifespan,
            estimated_daily_revenue: stats.total_ads * (50 + Math.random() * 100),
            trending: is_trending,
          }
        })

        setAllNiches(nichesData)
        setCurrentPage(0)
      } catch (error) {
        console.error('Error loading niches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNiches()

    // Real-time subscription
    const channel = supabase
      .channel('offers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          loadNiches()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const stats = {
    total: niches.length,
    trending: niches.filter(n => n.trending).length,
    avgCompetitiveness: niches.length > 0 ? Math.round(niches.reduce((sum, n) => sum + n.competitiveness, 0) / niches.length) : 0,
    totalRevenue: niches.reduce((sum, n) => sum + n.estimated_daily_revenue, 0),
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Nichos</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando análise de nichos...</p>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
          </div>

          {/* Chart Skeleton */}
          <SkeletonChart />

          {/* Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </AppLayout>
    )
  }

  const filtered = allNiches.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'trending') {
      return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
    } else if (sortBy === 'competitive') {
      return b.competitiveness - a.competitiveness
    } else {
      return b.conversion_potential - a.conversion_potential
    }
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginatedNiches = sorted.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setNiches(paginatedNiches)
  }, [paginatedNiches])

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Nichos</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Nichos</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Análise competitiva e potencial de mercado por nicho
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Nichos Analisados</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.trending}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Tendência</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgCompetitiveness}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Competitividade Média</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Receita Diária Est.</div>
          </div>
        </div>

        {/* Competitive Landscape Chart */}
        <div className="bg-s2 border border-b1 rounded-[2px] p-5">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Paisagem Competitiva</div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
              <XAxis type="number" dataKey="competitiveness" name="Competitividade" tick={{ fill: '#999592', fontSize: 12 }} />
              <YAxis type="number" dataKey="conversion_potential" name="Potencial" tick={{ fill: '#999592', fontSize: 12 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }}
                formatter={(value) => value.toFixed(1)}
              />
              <Legend />
              <Scatter name="Nichos" data={niches.slice(0, 10)} fill="#CC2A1E" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Buscar nichos por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] whitespace-nowrap">Ordenar por:</div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('trending')}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                sortBy === 'trending'
                  ? 'bg-s3 border border-b2 text-t1'
                  : 'bg-transparent text-t3 hover:text-t2'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setSortBy('competitive')}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                sortBy === 'competitive'
                  ? 'bg-s3 border border-b2 text-t1'
                  : 'bg-transparent text-t3 hover:text-t2'
              }`}
            >
              Competitividade
            </button>
            <button
              onClick={() => setSortBy('potential')}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                sortBy === 'potential'
                  ? 'bg-s3 border border-b2 text-t1'
                  : 'bg-transparent text-t3 hover:text-t2'
              }`}
            >
              Potencial
            </button>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              <span className="text-t2">{(currentPage * ITEMS_PER_PAGE) + 1}</span> – <span className="text-t2">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, sorted.length)}</span> de <span className="text-t1 font-syne font-700">{sorted.length}</span> resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  currentPage === 0
                    ? 'bg-s1 text-t3 cursor-not-allowed'
                    : 'bg-s3 border border-b2 text-t1 hover:bg-s2'
                }`}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  currentPage === totalPages - 1
                    ? 'bg-s1 text-t3 cursor-not-allowed'
                    : 'bg-s3 border border-b2 text-t1 hover:bg-s2'
                }`}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}

        {/* Niches Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {sorted.length === 0 ? (
            <div className="col-span-2 bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum nicho encontrado</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Ajuste os filtros ou refine sua busca</p>
            </div>
          ) : (
            sorted.map((niche) => (
              <Link
                key={niche.id}
                href={`/nichos/${encodeURIComponent(niche.name)}`}
                className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">{niche.category}</div>
                    <h3 className="text-base font-syne font-700 text-t1">{niche.name}</h3>
                  </div>
                  {niche.trending && (
                    <div className="px-2 py-1 bg-rd border border-red rounded-[2px] text-xs font-mono text-red uppercase tracking-[0.05em]">
                      Trending
                    </div>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="space-y-3 mb-4">
                  {/* Competitiveness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Competitividade</div>
                      <div className="text-sm font-syne font-700 text-t1">{niche.competitiveness}</div>
                    </div>
                    <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full bg-red"
                        style={{ width: `${niche.competitiveness}%` }}
                      />
                    </div>
                  </div>

                  {/* Conversion Potential */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Potencial Conv.</div>
                      <div className="text-sm font-syne font-700 text-t2">{niche.conversion_potential}</div>
                    </div>
                    <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full bg-t2"
                        style={{ width: `${niche.conversion_potential}%` }}
                      />
                    </div>
                  </div>

                  {/* Market Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Saturação Mercado</div>
                      <div className="text-sm font-syne font-700 text-t3">{niche.market_saturation}</div>
                    </div>
                    <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full bg-t3"
                        style={{ width: `${niche.market_saturation}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-b1 text-xs font-mono">
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Ofertas Ativas</div>
                    <div className="text-lg font-syne font-700 text-t1">{niche.active_offers}</div>
                  </div>
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Dias Médio</div>
                    <div className="text-lg font-syne font-700 text-t1">{niche.avg_lifespan}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Receita Diária Est.</div>
                    <div className="text-lg font-syne font-700 text-t1">${niche.estimated_daily_revenue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-b1 text-xs font-mono text-t2 group-hover:text-red transition-colors">
                  Ver análise completa →
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
