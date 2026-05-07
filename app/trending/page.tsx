'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonListItem, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { supabase } from '@/lib/supabase'

interface Trend {
  id: string
  niche: string
  momentum: number
  growth_rate: number
  offers_count: number
  ads_count: number
  status: 'rising' | 'stable' | 'declining'
  trending_since: string
}

const ITEMS_PER_PAGE = 12

export default function TrendingPage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [allTrends, setAllTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const loadTrends = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('niche')

        if (error) throw error

        const nicheStats = (data || []).reduce((acc: any, offer: any) => {
          const niche = offer.niche
          if (!acc[niche]) {
            acc[niche] = { count: 0, total_ads: 0 }
          }
          acc[niche].count += 1
          acc[niche].total_ads += offer.num_ads || 0
          return acc
        }, {})

        const trendsData: Trend[] = Object.entries(nicheStats).map(([niche, stats]: any, idx) => ({
          id: String(idx + 1),
          niche,
          momentum: 50 + Math.random() * 50,
          growth_rate: Math.floor(Math.random() * 30) - 5,
          offers_count: stats.count,
          ads_count: stats.total_ads,
          status: Math.random() > 0.5 ? 'rising' : 'stable',
          trending_since: `${Math.floor(Math.random() * 15) + 1} dias`,
        }))

        const sorted = trendsData.sort((a, b) => b.momentum - a.momentum)
        setAllTrends(sorted)
        setCurrentPage(0)
      } catch (error) {
        console.error('Error loading trends:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrends()

    // Real-time subscription
    const channel = supabase
      .channel('offers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          loadTrends()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const filtered = allTrends.filter(t =>
    t.niche.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedTrends = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  const stats = {
    total: filtered.length,
    rising: filtered.filter(t => t.status === 'rising').length,
    avgMomentum: filtered.length > 0 ? Math.round(filtered.reduce((sum, t) => sum + t.momentum, 0) / filtered.length) : 0,
    totalOffers: filtered.reduce((sum, t) => sum + t.offers_count, 0),
  }

  useEffect(() => {
    setTrends(paginatedTrends)
  }, [paginatedTrends])

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Trending</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando nichos...</p>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <SkeletonChart />
            <SkeletonChart />
          </div>

          {/* List Skeleton */}
          <div className="space-y-3">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Trending</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Trending</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Nichos com maior crescimento e potencial de mercado
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Nichos Monitorados</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.rising}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Ascensão</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgMomentum}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Momentum Médio</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Ofertas</div>
          </div>
        </div>

        {/* Momentum Trends Chart */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Niches by Momentum */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Nichos - Momentum</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={trends.slice(0, 8).map(t => ({
                  name: t.niche.substring(0, 10),
                  momentum: Math.round(t.momentum)
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis type="number" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="momentum" fill="#CC2A1E" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Rate Distribution */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Taxa de Crescimento</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={trends.slice(0, 8).map((t, i) => ({
                  name: `${i + 1}`,
                  growth: t.growth_rate
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#CC2A1E"
                  strokeWidth={2}
                  dot={{ fill: '#CC2A1E', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Buscar nicho por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />

        {/* Filters & Sort */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t1 rounded-[2px] transition-all">
              Todos
            </button>
            <button className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-transparent text-t3 hover:text-t2 rounded-[2px] transition-all">
              Em Ascensão
            </button>
            <button className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-transparent text-t3 hover:text-t2 rounded-[2px] transition-all">
              Estáveis
            </button>
          </div>
          <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Ordenar por: Momentum
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              <span className="text-t2">{(currentPage * ITEMS_PER_PAGE) + 1}</span> – <span className="text-t2">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, filtered.length)}</span> de <span className="text-t1 font-syne font-700">{filtered.length}</span> resultados
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

        {/* Trends List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhuma tendência encontrada</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Nenhum nicho corresponde à sua busca</p>
            </div>
          ) : (
            filtered.map((trend) => (
            <div
              key={trend.id}
              className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full" style={{
                    backgroundColor: trend.status === 'rising' ? '#CC2A1E' : trend.status === 'stable' ? '#5E5C58' : '#333230'
                  }} />
                  <h3 className="text-base font-syne font-700 text-t1">{trend.niche}</h3>
                  <div className={`text-xs font-mono uppercase tracking-[0.05em] px-2 py-1 rounded-[2px] ${
                    trend.status === 'rising'
                      ? 'bg-rd border border-red text-red'
                      : trend.status === 'stable'
                      ? 'bg-s1 border border-b1 text-t2'
                      : 'bg-s1 border border-b1 text-t3'
                  }`}>
                    {trend.status === 'rising' ? '+' : ''}{trend.growth_rate}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-t3 mb-1">TRENDING DESDE</div>
                  <div className="text-sm font-syne font-700 text-t1">{trend.trending_since}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Momentum</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-syne font-900 text-t1">{trend.momentum}</div>
                    <div className="text-xs font-mono text-t2 mb-1">/100</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Ofertas</div>
                  <div className="text-2xl font-syne font-900 text-t1">{trend.offers_count}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Anúncios</div>
                  <div className="text-2xl font-syne font-900 text-t1">{trend.ads_count}</div>
                </div>
                <div className="text-right">
                  <div className="w-full bg-s1 rounded-[2px] h-6 flex items-end justify-end pr-2 overflow-hidden">
                    <div
                      className="bg-red"
                      style={{
                        width: `${Math.max(10, trend.momentum)}%`,
                        height: '4px',
                      }}
                    />
                  </div>
                  <div className="text-xs font-mono text-t2 mt-2 group-hover:text-red transition-colors">Ver detalhes →</div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
