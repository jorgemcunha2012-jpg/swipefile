'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonListItem, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { api, SavedItem } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const ITEMS_PER_PAGE = 15

export default function BibliotecaPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { setLoading(false); return }

    api.savedItems.list()
      .then(setItems)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca'))
      .finally(() => setLoading(false))
  }, [authLoading, isAuthenticated])

  const removeItem = async (id: string) => {
    try {
      await api.savedItems.remove(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao remover item')
    }
  }

  const platforms = [...new Set(items.map((i) => i.offer?.platform).filter(Boolean))] as string[]

  const filtered = items.filter((item) => {
    const matchPlatform = filterPlatform === 'all' || item.offer?.platform === filterPlatform
    const q = searchTerm.toLowerCase()
    const matchSearch =
      !q ||
      (item.offer?.name ?? '').toLowerCase().includes(q) ||
      (item.offer?.niche ?? '').toLowerCase().includes(q) ||
      (item.offer?.platform ?? '').toLowerCase().includes(q)
    return matchPlatform && matchSearch
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  const stats = {
    total: items.length,
    escalating: items.filter((i) => i.offer?.momentum_tag === 'escalating' || i.offer?.momentum_tag === 'hot').length,
    platforms: platforms.length,
    niches: new Set(items.map((i) => i.offer?.niche)).size,
  }

  const platformDist = platforms.map((p) => ({
    name: p,
    value: items.filter((i) => i.offer?.platform === p).length,
  }))

  const nicheDist = [...new Set(items.map((i) => i.offer?.niche).filter(Boolean))]
    .map((n) => ({
      name: (n as string).substring(0, 8),
      value: items.filter((i) => i.offer?.niche === n).length,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  if (authLoading) return null

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Biblioteca</h1>
          </div>
          <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
            <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
            <p className="text-sm font-syne font-700 text-t2 mb-1">Login necessário</p>
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-6">
              Faça login para acessar sua biblioteca de ofertas salvas
            </p>
            <Link href="/login" className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all">
              Fazer Login
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Biblioteca</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando biblioteca...</p>
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
          <span className="text-t1">Biblioteca</span>
        </div>

        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Biblioteca</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Ofertas salvas para acompanhamento
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{error}</div>
        )}

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Salvas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.escalating}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Hot / Escalando</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.platforms}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Plataformas</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.niches}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Nichos</div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Por Plataforma</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={platformDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={1} dataKey="value">
                    <Cell fill="#CC2A1E" /><Cell fill="#9B9591" /><Cell fill="#5E5C58" /><Cell fill="#3C3C3D" /><Cell fill="#2C2C2C" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Por Nicho</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={nicheDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                  <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                  <Bar dataKey="value" fill="#CC2A1E" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Buscar por nome, nicho ou plataforma..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0) }}
          className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterPlatform('all')}
            className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
              filterPlatform === 'all' ? 'bg-s3 border border-b2 text-t1' : 'bg-transparent text-t3 hover:text-t2'
            }`}
          >
            Todos
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlatform(p)}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                filterPlatform === p ? 'bg-s3 border border-b2 text-t1' : 'bg-transparent text-t3 hover:text-t2'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
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

        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum item na biblioteca</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
                Salve ofertas no <Link href="/radar" className="text-t1 hover:text-red transition-colors">Radar</Link> para construir sua biblioteca
              </p>
            </div>
          ) : (
            paginated.map((item) => (
              <div key={item.id} className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {item.offer?.momentum_tag && (
                        <div className={`px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] border ${
                          item.offer.momentum_tag === 'escalating' || item.offer.momentum_tag === 'hot'
                            ? 'bg-rd border-red text-red'
                            : 'bg-s1 border-b1 text-t2'
                        }`}>
                          {item.offer.momentum_tag}
                        </div>
                      )}
                      <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
                        {item.offer?.platform}
                      </div>
                      <div className="text-xs font-mono text-t2">
                        Salvo em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <h3 className="text-base font-syne font-700 text-t1 mb-2 group-hover:text-red transition-colors">
                      {item.offer?.name ?? item.offer_id}
                    </h3>

                    <div className="flex gap-4 text-xs font-mono text-t3">
                      {item.offer?.niche && <span>Nicho: <span className="text-t2">{item.offer.niche}</span></span>}
                      {item.offer?.num_ads !== undefined && <span>Ads: <span className="text-t2">{item.offer.num_ads}</span></span>}
                      {item.offer?.days_active !== undefined && <span>Dias: <span className="text-t2">{item.offer.days_active}</span></span>}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <Link
                      href={`/oferta/${item.offer_id}`}
                      className="px-4 py-2 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all"
                    >
                      Ver oferta
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="px-4 py-2 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 hover:border-red hover:text-red rounded-[2px] transition-all"
                    >
                      Remover
                    </button>
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
