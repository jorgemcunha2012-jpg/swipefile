'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonCard, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { api, NichoStats } from '@/lib/api'

interface NichoRow extends NichoStats {
  trending: boolean
  competitiveness: number   // total_ads normalised 0-100
  conversion_potential: number  // avg_days_active normalised 0-100
  market_saturation: number // offer_count normalised 0-100
}

const ITEMS_PER_PAGE = 6

function normalize(value: number, max: number): number {
  if (max === 0) return 0
  return Math.round((value / max) * 100)
}

export default function NichosPage() {
  const [allNiches, setAllNiches] = useState<NichoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'trending' | 'competitive' | 'potential'>('potential')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    api.offers.getNichos()
      .then((nichos) => {
        const maxAds = Math.max(...nichos.map((n) => n.total_ads), 1)
        const maxDays = Math.max(...nichos.map((n) => n.avg_days_active), 1)
        const maxCount = Math.max(...nichos.map((n) => n.offer_count), 1)

        const rows: NichoRow[] = nichos.map((n) => ({
          ...n,
          trending: n.hot_count + n.escalating_count > 0,
          competitiveness: normalize(n.total_ads, maxAds),
          conversion_potential: normalize(n.avg_days_active, maxDays),
          market_saturation: normalize(n.offer_count, maxCount),
        }))

        setAllNiches(rows)
      })
      .catch((err) => console.error('Error loading niches:', err))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: allNiches.length,
    trending: allNiches.filter((n) => n.trending).length,
    avgCompetitiveness: allNiches.length > 0
      ? Math.round(allNiches.reduce((s, n) => s + n.competitiveness, 0) / allNiches.length)
      : 0,
    totalAds: allNiches.reduce((s, n) => s + n.total_ads, 0),
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Nichos</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando análise de nichos...</p>
          </div>
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox />
          </div>
          <SkeletonChart />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
      </AppLayout>
    )
  }

  const filtered = allNiches.filter((n) =>
    n.niche.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
    if (sortBy === 'competitive') return b.competitiveness - a.competitiveness
    return b.conversion_potential - a.conversion_potential
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Nichos</span>
        </div>

        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Nichos</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Análise competitiva e potencial de mercado por nicho
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Nichos Analisados</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.trending}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Tendência</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgCompetitiveness}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Competitividade Média</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAds.toLocaleString()}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Anúncios</div>
          </div>
        </div>

        <div className="bg-s2 border border-b1 rounded-[2px] p-5">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">
            Paisagem Competitiva — Competitividade (x) vs Potencial (y)
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
              <XAxis type="number" dataKey="competitiveness" name="Competitividade" tick={{ fill: '#999592', fontSize: 12 }} domain={[0, 100]} />
              <YAxis type="number" dataKey="conversion_potential" name="Potencial" tick={{ fill: '#999592', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }}
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload as NichoRow
                  return (
                    <div className="bg-s1 border border-b1 rounded-[2px] p-3 text-xs font-mono">
                      <div className="text-t1 font-700 mb-1">{d.niche}</div>
                      <div className="text-t3">Comp: {d.competitiveness} | Pot: {d.conversion_potential}</div>
                      <div className="text-t3">{d.offer_count} ofertas · {d.total_ads} ads</div>
                    </div>
                  )
                }}
              />
              <Scatter name="Nichos" data={allNiches.slice(0, 20)} fill="#CC2A1E" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <input
          type="text"
          placeholder="Buscar nichos por nome..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0) }}
          className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] whitespace-nowrap">Ordenar por:</div>
          <div className="flex gap-2">
            {(['trending', 'competitive', 'potential'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  sortBy === s ? 'bg-s3 border border-b2 text-t1' : 'bg-transparent text-t3 hover:text-t2'
                }`}
              >
                {s === 'trending' ? 'Trending' : s === 'competitive' ? 'Competitividade' : 'Potencial'}
              </button>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              <span className="text-t2">{currentPage * ITEMS_PER_PAGE + 1}</span> –{' '}
              <span className="text-t2">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, sorted.length)}</span> de{' '}
              <span className="text-t1 font-syne font-700">{sorted.length}</span> resultados
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

        <div className="grid grid-cols-2 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-2 bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum nicho encontrado</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Ajuste os filtros ou refine sua busca</p>
            </div>
          ) : (
            paginated.map((niche) => (
              <Link
                key={niche.niche}
                href={`/nichos/${encodeURIComponent(niche.niche)}`}
                className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">
                      {niche.dropshipping_count > niche.infoproduto_count ? 'Dropshipping' : 'Infoproduto'}
                    </div>
                    <h3 className="text-base font-syne font-700 text-t1">{niche.niche}</h3>
                  </div>
                  {niche.trending && (
                    <div className="px-2 py-1 bg-rd border border-red rounded-[2px] text-xs font-mono text-red uppercase tracking-[0.05em]">
                      Trending
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Competitividade</div>
                      <div className="text-sm font-syne font-700 text-t1">{niche.competitiveness}</div>
                    </div>
                    <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                      <div className="h-full bg-red" style={{ width: `${niche.competitiveness}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Potencial Conv.</div>
                      <div className="text-sm font-syne font-700 text-t2">{niche.conversion_potential}</div>
                    </div>
                    <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                      <div className="h-full bg-t2" style={{ width: `${niche.conversion_potential}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Saturação</div>
                      <div className="text-sm font-syne font-700 text-t3">{niche.market_saturation}</div>
                    </div>
                    <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                      <div className="h-full bg-t3" style={{ width: `${niche.market_saturation}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-b1 text-xs font-mono">
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Ofertas</div>
                    <div className="text-lg font-syne font-700 text-t1">{niche.offer_count}</div>
                  </div>
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Dias Médio</div>
                    <div className="text-lg font-syne font-700 text-t1">{Math.round(niche.avg_days_active)}</div>
                  </div>
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Anúncios</div>
                    <div className="text-lg font-syne font-700 text-t1">{niche.total_ads}</div>
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
