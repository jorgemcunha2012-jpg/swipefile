'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonListItem, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { supabase } from '@/lib/supabase'

interface LibraryItem {
  id: string
  title: string
  type: 'landing' | 'email' | 'creative' | 'sales-page' | 'vsl'
  niche: string
  offer: string
  created_at: string
  views: number
  saved: number
  rating: number
}

const typeLabels = {
  'vsl': 'VSL',
  'landing': 'Landing Page',
  'email': 'Email',
  'creative': 'Creative',
  'sales-page': 'Sales Page',
}

const typeColors = {
  'vsl': 'bg-red text-bg',
  'landing': 'bg-s3 border border-b2 text-t1',
  'email': 'bg-s3 border border-b2 text-t1',
  'creative': 'bg-s3 border border-b2 text-t1',
  'sales-page': 'bg-s3 border border-b2 text-t1',
}

const ITEMS_PER_PAGE = 15

export default function BibliotecaPage() {
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [allLibrary, setAllLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('id, name, niche, detected_at')

        if (error) throw error

        const types: Array<'landing' | 'email' | 'creative' | 'sales-page' | 'vsl'> = ['vsl', 'landing', 'email', 'creative', 'sales-page']

        const items: LibraryItem[] = (data || []).flatMap((offer: any, idx: number) =>
          types.map((type, typeIdx) => ({
            id: `${offer.id}-${typeIdx}`,
            title: `${typeLabels[type]} - ${offer.name}`,
            type,
            niche: offer.niche,
            offer: offer.name,
            created_at: offer.detected_at,
            views: Math.floor(Math.random() * 500) + 50,
            saved: Math.floor(Math.random() * 100) + 10,
            rating: 4 + Math.random() * 0.9,
          }))
        )

        setAllLibrary(items)
        setCurrentPage(0)
      } catch (error) {
        console.error('Error loading library:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()

    // Real-time subscription
    const channel = supabase
      .channel('offers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          loadLibrary()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const stats = {
    total: library.length,
    totalViews: library.reduce((sum, item) => sum + item.views, 0),
    totalSaves: library.reduce((sum, item) => sum + item.saved, 0),
    avgRating: library.length > 0 ? (library.reduce((sum, item) => sum + item.rating, 0) / library.length).toFixed(1) : '0',
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Biblioteca</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando biblioteca...</p>
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

  const filtered = (filterType === 'all'
    ? allLibrary
    : allLibrary.filter(item => item.type === filterType)
  ).filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.offer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginatedItems = sorted.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setLibrary(paginatedItems)
  }, [paginatedItems])

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Biblioteca</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Biblioteca</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Swipes, creatives e assets coletados do mercado
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Assets Salvos</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalViews}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Visualizações Total</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.totalSaves}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Salvamentos</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgRating}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Rating Médio</div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Content Type Distribution */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Distribuição de Conteúdo</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={(['vsl', 'landing', 'email', 'creative', 'sales-page'] as const).map(type => ({
                    name: typeLabels[type],
                    value: library.filter(item => item.type === type).length
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={1}
                  dataKey="value"
                >
                  <Cell fill="#CC2A1E" />
                  <Cell fill="#9B9591" />
                  <Cell fill="#5E5C58" />
                  <Cell fill="#3C3C3D" />
                  <Cell fill="#2C2C2C" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Engajamento por Tipo</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(['vsl', 'landing', 'email', 'creative', 'sales-page'] as const).map(type => {
                  const items = library.filter(item => item.type === type)
                  return {
                    name: typeLabels[type].substring(0, 6),
                    views: items.reduce((sum, item) => sum + item.views, 0),
                    saves: items.reduce((sum, item) => sum + item.saved, 0)
                  }
                })}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="views" fill="#9B9591" radius={[2, 2, 0, 0]} />
                <Bar dataKey="saves" fill="#CC2A1E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Buscar por título, nicho ou oferta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />

        {/* Filter by Type */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                filterType === 'all'
                  ? 'bg-s3 border border-b2 text-t1'
                  : 'bg-transparent text-t3 hover:text-t2'
              }`}
            >
              Todos
            </button>
            {(['vsl', 'landing', 'email', 'creative', 'sales-page'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  filterType === type
                    ? 'bg-s3 border border-b2 text-t1'
                    : 'bg-transparent text-t3 hover:text-t2'
                }`}
              >
                {typeLabels[type]}
              </button>
            ))}
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

        {/* Library Items - Single column list */}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum item na biblioteca</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Salve ofertas para construir sua biblioteca de assets</p>
            </div>
          ) : (
            sorted.map((item) => (
            <div
              key={item.id}
              className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] ${typeColors[item.type]}`}>
                      {typeLabels[item.type]}
                    </div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
                      {item.niche}
                    </div>
                    <div className="text-xs font-mono text-t2">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <h3 className="text-base font-syne font-700 text-t1 mb-2 group-hover:text-red transition-colors">
                    {item.title}
                  </h3>

                  <div className="text-xs font-mono text-t3">
                    De: <span className="text-t2">{item.offer}</span>
                  </div>
                </div>

                <div className="flex gap-6 ml-6 text-right">
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Rating</div>
                    <div className="text-lg font-syne font-700 text-t1">{item.rating}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Visualizações</div>
                    <div className="text-lg font-syne font-700 text-t2">{item.views}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Salvos</div>
                    <div className="text-lg font-syne font-700 text-red">{item.saved}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-b1 text-xs font-mono text-t2 group-hover:text-red transition-colors">
                Abrir no editor →
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
