'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonListItem, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { api, NichoStats } from '@/lib/api'

interface TrendRow extends NichoStats {
  momentum_score: number
  status: 'rising' | 'stable'
}

const ITEMS_PER_PAGE = 12

export default function TrendingPage() {
  const [allTrends, setAllTrends] = useState<TrendRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [filterStatus, setFilterStatus] = useState<'all' | 'rising' | 'stable'>('all')

  useEffect(() => {
    api.offers.getNichos()
      .then((nichos) => {
        const rows: TrendRow[] = nichos.map((n) => {
          const trending = n.hot_count + n.escalating_count
          const momentum_score = n.offer_count > 0
            ? Math.round((trending / n.offer_count) * 100)
            : 0
          return {
            ...n,
            momentum_score,
            status: trending > 0 ? 'rising' : 'stable',
          }
        })
        rows.sort((a, b) => b.momentum_score - a.momentum_score || b.total_clicks - a.total_clicks)
        setAllTrends(rows)
      })
      .catch((err) => console.error('Error loading trends:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = allTrends.filter((t) => {
    const matchSearch = t.niche.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  const stats = {
    total: filtered.length,
    rising: filtered.filter((t) => t.status === 'rising').length,
    avgMomentum: filtered.length > 0
      ? Math.round(filtered.reduce((s, t) => s + t.momentum_score, 0) / filtered.length)
      : 0,
    totalOffers: filtered.reduce((s, t) => s + t.offer_count, 0),
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Trending</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando nichos...</p>
          </div>
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonChart /><SkeletonChart />
          </div>
          <div className="space-y-3">
            <SkeletonListItem /><SkeletonListItem /><SkeletonListItem />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Trending</span>
        </div>

        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Trending</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Nichos com maior crescimento e potencial de mercado
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Nichos Monitorados</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.rising}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Ascensão</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgMomentum}%</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Momentum Médio</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Ofertas</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Nichos — Momentum</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={allTrends.slice(0, 8).map((t) => ({
                  name: t.niche.substring(0, 10),
                  momentum: t.momentum_score,
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

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Cliques por Nicho (Top 8)</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={allTrends.slice(0, 8).map((t, i) => ({
                  name: `${i + 1}`,
                  clicks: t.total_clicks,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Line type="monotone" dataKey="clicks" stroke="#CC2A1E" strokeWidth={2}
                  dot={{ fill: '#CC2A1E', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar nicho por nome..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0) }}
          className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'rising', 'stable'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setCurrentPage(0) }}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  filterStatus === s ? 'bg-s3 border border-b2 text-t1' : 'bg-transparent text-t3 hover:text-t2'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'rising' ? 'Em Ascensão' : 'Estáveis'}
              </button>
            ))}
          </div>
          <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Ordenar por: Momentum</div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              <span className="text-t2">{currentPage * ITEMS_PER_PAGE + 1}</span> –{' '}
              <span className="text-t2">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, filtered.length)}</span> de{' '}
              <span className="text-t1 font-syne font-700">{filtered.length}</span> resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  currentPage === 0 ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'
                }`}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  currentPage === totalPages - 1 ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'
                }`}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhuma tendência encontrada</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Nenhum nicho corresponde à sua busca</p>
            </div>
          ) : (
            paginated.map((trend, idx) => (
              <div key={trend.niche} className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-xs font-mono text-t3 w-6">#{currentPage * ITEMS_PER_PAGE + idx + 1}</div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: trend.status === 'rising' ? '#CC2A1E' : '#5E5C58' }} />
                    <h3 className="text-base font-syne font-700 text-t1">{trend.niche}</h3>
                    <div className={`text-xs font-mono uppercase tracking-[0.05em] px-2 py-1 rounded-[2px] ${
                      trend.status === 'rising' ? 'bg-rd border border-red text-red' : 'bg-s1 border border-b1 text-t2'
                    }`}>
                      {trend.hot_count + trend.escalating_count} quentes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-t3 mb-1">DIAS MÉDIO</div>
                    <div className="text-sm font-syne font-700 text-t1">{Math.round(trend.avg_days_active)}d</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Momentum</div>
                    <div className="flex items-end gap-1">
                      <div className="text-2xl font-syne font-900 text-t1">{trend.momentum_score}</div>
                      <div className="text-xs font-mono text-t2 mb-1">/100</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Ofertas</div>
                    <div className="text-2xl font-syne font-900 text-t1">{trend.offer_count}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Anúncios</div>
                    <div className="text-2xl font-syne font-900 text-t1">{trend.total_ads}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Cliques</div>
                    <div className="text-2xl font-syne font-900 text-t1">{trend.total_clicks}</div>
                  </div>
                  <div className="text-right">
                    <div className="w-full bg-s1 rounded-[2px] h-6 flex items-center overflow-hidden mb-2">
                      <div className="bg-red h-1" style={{ width: `${Math.max(4, trend.momentum_score)}%` }} />
                    </div>
                    <div className="text-xs font-mono text-t2 group-hover:text-red transition-colors">Ver detalhes →</div>
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
