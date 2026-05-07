'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonChart, SkeletonStatBox } from '@/components/SkeletonLoader'
import { supabase } from '@/lib/supabase'

interface NicheDetail {
  name: string
  activeOffers: number
  totalOffers: number
  escalatingOffers: number
  totalAds: number
  avgDaysActive: number
  offers: Array<{
    id: string
    name: string
    num_ads: number
    num_creatives: number
    days_active: number
    momentum_tag: string
    platform: string
  }>
}

export default function NichoDetailPage() {
  const params = useParams()
  const nicheId = params?.id
  const niche = nicheId ? decodeURIComponent(nicheId as string) : ''
  const [data, setData] = useState<NicheDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!niche) {
      setLoading(false)
      return
    }

    const loadNicheDetail = async () => {
      try {
        const { data: offers, error } = await supabase
          .from('offers')
          .select('*')
          .eq('niche', niche)

        if (error) throw error

        const nichOffers = offers || []
        const escalatingCount = nichOffers.filter(o => o.momentum_tag === 'escalating').length
        const totalAds = nichOffers.reduce((sum, o) => sum + (o.num_ads || 0), 0)
        const avgDaysActive = nichOffers.length > 0
          ? Math.round(nichOffers.reduce((sum, o) => sum + (o.days_active || 0), 0) / nichOffers.length)
          : 0

        setData({
          name: niche,
          activeOffers: nichOffers.length,
          totalOffers: nichOffers.length,
          escalatingOffers: escalatingCount,
          totalAds,
          avgDaysActive,
          offers: nichOffers.sort((a, b) => b.num_ads - a.num_ads),
        })
      } catch (error) {
        console.error('Error loading niche detail:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNicheDetail()

    const channel = supabase
      .channel('offers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          loadNicheDetail()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [niche])

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em] mb-3">
              <Link href="/nichos" className="text-red hover:text-red transition-colors">Nichos</Link>
              <span className="mx-2 text-t3">/</span>
              <span>Carregando...</span>
            </div>
            <h1 className="text-4xl font-syne font-900 text-t1 mt-4">Carregando detalhes...</h1>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em] mb-3">
              <Link href="/nichos" className="text-red hover:text-red transition-colors">Nichos</Link>
              <span className="mx-2 text-t3">/</span>
              <span>Não encontrado</span>
            </div>
            <h1 className="text-4xl font-syne font-900 text-t1 mt-4">Nicho não encontrado</h1>
          </div>
        </div>
      </AppLayout>
    )
  }

  const competitionLevel = Math.min((data.totalOffers / 50) * 100, 100)
  const growthTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i],
    offers: Math.floor(data.activeOffers * (0.8 + Math.random() * 0.4)),
  }))

  const platformDistribution = data.offers.reduce((acc: any, offer) => {
    const existing = acc.find((p: any) => p.name === offer.platform)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: offer.platform, value: 1 })
    }
    return acc
  }, [])

  const statusDistribution = [
    { name: 'Escalando', value: data.escalatingOffers, fill: '#CC2A1E' },
    { name: 'Estável', value: data.totalOffers - data.escalatingOffers, fill: '#5E5C58' },
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb & Header */}
        <div>
          <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em] mb-4">
            <Link href="/nichos" className="text-red hover:text-red transition-colors">Nichos</Link>
            <span className="mx-2 text-t3">/</span>
            <span className="text-t1">{data.name}</span>
          </div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-3">{data.name}</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Análise aprofundada do nicho</p>
        </div>

        {/* Main Stats - 3 columns */}
        <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{data.activeOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Ativas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{data.escalatingOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Escalação</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{data.totalAds}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Anúncios</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Métricas de Competição</div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Nível de Competição</span>
                  <span className="text-sm font-syne font-700 text-t1">{Math.round(competitionLevel)}%</span>
                </div>
                <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                  <div className="h-full bg-red" style={{ width: `${competitionLevel}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Média de Dias Ativo</span>
                  <span className="text-sm font-syne font-700 text-t1">{data.avgDaysActive} dias</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Anúncios Médios/Oferta</span>
                  <span className="text-sm font-syne font-700 text-t1">{Math.round(data.totalAds / Math.max(data.activeOffers, 1))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Status das Ofertas</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[1px] bg-red"></div>
                <span className="text-t3">Escalando</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[1px] bg-t2"></div>
                <span className="text-t3">Estável</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Growth Trend */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Tendência de Crescimento</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="day" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Line type="monotone" dataKey="offers" stroke="#CC2A1E" strokeWidth={2} dot={{ fill: '#CC2A1E', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Plataformas Usadas</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis type="number" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="value" fill="#CC2A1E" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Offers in Niche */}
        <div className="bg-s2 border border-b1 rounded-[2px] p-5">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Ofertas neste Nicho</div>
          <div className="space-y-3">
            {data.offers.slice(0, 8).map((offer, index) => (
              <Link
                key={offer.id}
                href={`/oferta/${offer.id}`}
                className="bg-s1 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-4 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-t3 bg-s2 px-2 py-1 rounded-[1px]">#{index + 1}</span>
                    <h4 className="text-sm font-syne font-700 text-t1 group-hover:text-red transition-colors">
                      {offer.name}
                    </h4>
                    {offer.momentum_tag === 'escalating' && (
                      <span className="px-2 py-1 bg-rd border border-red rounded-[2px] text-xs font-mono text-red uppercase tracking-[0.05em]">
                        Escalando
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-t3">
                    <span>{offer.platform}</span>
                    <span>•</span>
                    <span>{offer.days_active} dias</span>
                  </div>
                </div>
                <div className="flex items-end gap-6 ml-4 text-right">
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Anúncios</div>
                    <div className="text-lg font-syne font-700 text-t1">{offer.num_ads}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Criativos</div>
                    <div className="text-lg font-syne font-700 text-t2">{offer.num_creatives}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back Navigation */}
        <div className="flex gap-3">
          <Link
            href="/nichos"
            className="px-6 py-3 bg-s3 border border-b2 font-mono text-sm uppercase tracking-[0.05em] rounded-[2px] transition-all hover:bg-s2 text-t1"
          >
            ← Voltar aos Nichos
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
