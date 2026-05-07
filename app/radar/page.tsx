'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonCard, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { supabase } from '@/lib/supabase'

interface Offer {
  id: string
  name: string
  platform: string
  num_ads: number
  num_creatives: number
  niche: string
  structure: string
  status: string
  days_active: number
  detected_at: string
  momentum_tag: string
}

const ITEMS_PER_PAGE = 10

export default function RadarPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [allOffers, setAllOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterNiche, setFilterNiche] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null)
  const [filterMomentum, setFilterMomentum] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Get unique values for filters
  const [allNiches, setAllNiches] = useState<string[]>([])
  const [allPlatforms, setAllPlatforms] = useState<string[]>([])

  useEffect(() => {
    const loadOffers = async () => {
      try {
        let query = supabase.from('offers').select('*')

        if (filterNiche) query = query.eq('niche', filterNiche)
        if (filterPlatform) query = query.eq('platform', filterPlatform)
        if (filterMomentum) query = query.eq('momentum_tag', filterMomentum)

        const { data, error } = await query.order('momentum_tag', { ascending: false })

        if (error) throw error
        setAllOffers(data || [])
        setCurrentPage(0)
      } catch (error) {
        console.error('Error loading offers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOffers()

    // Real-time subscription
    const channel = supabase
      .channel('offers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          loadOffers()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [filterNiche, filterPlatform, filterMomentum])

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('niche, platform')

        if (error) throw error
        const niches = [...new Set((data || []).map(o => o.niche))].sort()
        const platforms = [...new Set((data || []).map(o => o.platform))].sort()
        setAllNiches(niches)
        setAllPlatforms(platforms)
      } catch (error) {
        console.error('Error loading filter options:', error)
      }
    }

    loadFilterOptions()
  }, [])

  const filtered = allOffers.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.platform.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedOffers = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  const stats = {
    total: filtered.length,
    escalating: filtered.filter(o => o.momentum_tag === 'escalating').length,
    totalAds: filtered.reduce((sum, o) => sum + o.num_ads, 0),
    avgDaysActive: filtered.length > 0 ? Math.round(filtered.reduce((sum, o) => sum + o.days_active, 0) / filtered.length) : 0,
  }

  useEffect(() => {
    setOffers(paginatedOffers)
  }, [paginatedOffers])

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Radar</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando ofertas...</p>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </div>

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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Radar</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Radar</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Monitoramento em tempo real de ofertas e tendências de mercado
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Ativas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.escalating}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Escalação</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAds}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Anúncios</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgDaysActive}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Dias Médio Ativo</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-4">
          {/* Distribuição por Niche */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Por Niche</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={filtered.reduce((acc: any, o) => {
                    const found = acc.find((item: any) => item.name === o.niche)
                    if (found) found.value += 1
                    else acc.push({ name: o.niche.substring(0, 8), value: 1 })
                    return acc
                  }, []).slice(0, 4)}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={1}
                  dataKey="value"
                >
                  <Cell fill="#CC2A1E" />
                  <Cell fill="#9B9591" />
                  <Cell fill="#5E5C58" />
                  <Cell fill="#3C3C3D" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Plataforma */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Por Plataforma</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={filtered.reduce((acc: any, o) => {
                    const found = acc.find((item: any) => item.name === o.platform)
                    if (found) found.value += 1
                    else acc.push({ name: o.platform, value: 1 })
                    return acc
                  }, []).slice(0, 4)}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={1}
                  dataKey="value"
                >
                  <Cell fill="#CC2A1E" />
                  <Cell fill="#9B9591" />
                  <Cell fill="#5E5C58" />
                  <Cell fill="#3C3C3D" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Momentum Distribution */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Momentum</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Escalando', value: filtered.filter(o => o.momentum_tag === 'escalating').length },
                { name: 'Estável', value: filtered.filter(o => o.momentum_tag === 'stable').length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="value" fill="#CC2A1E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="🔍 Buscar por nome, nicho ou plataforma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
          />

          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Label */}
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Filtros:</div>
            {/* Momentum Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMomentum(null)}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  filterMomentum === null
                    ? 'bg-s3 border border-b2 text-t1'
                    : 'bg-transparent text-t3 hover:text-t2'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterMomentum('escalating')}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  filterMomentum === 'escalating'
                    ? 'bg-rd border border-red text-red'
                    : 'bg-transparent text-t3 hover:text-t2'
                }`}
              >
                Escalando
              </button>
              <button
                onClick={() => setFilterMomentum('stable')}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  filterMomentum === 'stable'
                    ? 'bg-s3 border border-b2 text-t1'
                    : 'bg-transparent text-t3 hover:text-t2'
                }`}
              >
                Estável
              </button>
            </div>

            {/* Niche Filter */}
            {allNiches.length > 0 && (
              <select
                value={filterNiche || ''}
                onChange={(e) => setFilterNiche(e.target.value || null)}
                className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t1 rounded-[2px] transition-all cursor-pointer"
              >
                <option value="">Todos os Nichos</option>
                {allNiches.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
              </select>
            )}

            {/* Platform Filter */}
            {allPlatforms.length > 0 && (
              <select
                value={filterPlatform || ''}
                onChange={(e) => setFilterPlatform(e.target.value || null)}
                className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t1 rounded-[2px] transition-all cursor-pointer"
              >
                <option value="">Todas as Plataformas</option>
                {allPlatforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {(filterNiche || filterPlatform || filterMomentum !== null) && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-t3 uppercase">Filtros ativos:</span>
              {filterNiche && (
                <button
                  onClick={() => setFilterNiche(null)}
                  className="px-2 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono text-t2 hover:border-b2"
                >
                  {filterNiche} ✕
                </button>
              )}
              {filterPlatform && (
                <button
                  onClick={() => setFilterPlatform(null)}
                  className="px-2 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono text-t2 hover:border-b2"
                >
                  {filterPlatform} ✕
                </button>
              )}
              {filterMomentum && (
                <button
                  onClick={() => setFilterMomentum(null)}
                  className="px-2 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono text-t2 hover:border-b2"
                >
                  {filterMomentum} ✕
                </button>
              )}
            </div>
          )}
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

        {/* Cards Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-2 bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhuma oferta encontrada</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Ajuste os filtros ou tente uma busca diferente</p>
            </div>
          ) : (
            filtered.map((offer) => (
            <div
              key={offer.id}
              className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all overflow-hidden cursor-pointer group"
            >
              {/* Card Header - Thumbnail area */}
              <div className="h-24 bg-s3 border-b border-b1 flex items-center justify-center relative overflow-hidden">
                <div className="absolute text-3xl font-syne font-900 opacity-10 uppercase tracking-tight">
                  {offer.niche.substring(0, 2)}
                </div>
                <div className="relative z-10 flex gap-2">
                  <div className={`px-3 py-1 rounded-[2px] border text-xs font-mono uppercase tracking-[0.05em] ${
                    offer.momentum_tag === 'escalating'
                      ? 'bg-rd border-red text-red'
                      : 'bg-s1 border-b1 text-t2'
                  }`}>
                    {offer.momentum_tag}
                  </div>
                  <div className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-t2">
                    {offer.num_ads} ads
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col">
                <div className="text-xs font-mono text-t3 uppercase tracking-[0.08em] mb-3">
                  {offer.niche} • {offer.platform} • {offer.structure}
                </div>

                <h3 className="text-base font-syne font-700 text-t1 mb-4 leading-snug line-clamp-2">
                  {offer.name}
                </h3>

                <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Criativos</div>
                    <div className="text-t1 font-600">{offer.num_creatives}</div>
                  </div>
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Dias Ativo</div>
                    <div className="text-t1 font-600">{offer.days_active}</div>
                  </div>
                  <div>
                    <div className="text-t3 uppercase tracking-[0.05em] mb-1">Status</div>
                    <div className={`font-600 ${offer.status === 'escalating' ? 'text-red' : 'text-t2'}`}>
                      {offer.status}
                    </div>
                  </div>
                </div>

                <Link href={`/oferta/${offer.id}`} className="block pt-3 border-t border-b1 text-xs font-mono text-t2 group-hover:text-red transition-colors">
                  Ver detalhes →
                </Link>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
