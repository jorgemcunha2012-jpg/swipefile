'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonChart, SkeletonStatBox } from '@/components/SkeletonLoader'
import { api, NichoDetail } from '@/lib/api'

export default function NichoDetailPage() {
  const params = useParams()
  const nicheId = params?.id
  const niche = nicheId ? decodeURIComponent(nicheId as string) : ''
  const [data, setData] = useState<NichoDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!niche) { setLoading(false); return }
    api.offers.getNichoById(niche)
      .then(setData)
      .catch((err) => console.error('Error loading niche detail:', err))
      .finally(() => setLoading(false))
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
            <SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonChart /><SkeletonChart />
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

  const { summary, offers } = data
  const competitionLevel = Math.min((summary.offer_count / 50) * 100, 100)

  const platformDistribution = offers.reduce((acc: { name: string; value: number }[], offer) => {
    const existing = acc.find((p) => p.name === offer.platform)
    if (existing) existing.value += 1
    else acc.push({ name: offer.platform, value: 1 })
    return acc
  }, [])

  const statusDistribution = [
    { name: 'Hot', value: summary.hot_count, fill: '#CC2A1E' },
    { name: 'Escalando', value: summary.escalating_count, fill: '#9B9591' },
    { name: 'Estável', value: summary.offer_count - summary.hot_count - summary.escalating_count, fill: '#5E5C58' },
  ].filter((d) => d.value > 0)

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em] mb-4">
            <Link href="/nichos" className="text-red hover:text-red transition-colors">Nichos</Link>
            <span className="mx-2 text-t3">/</span>
            <span className="text-t1">{summary.niche}</span>
          </div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-3">{summary.niche}</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Análise aprofundada do nicho</p>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{summary.offer_count}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Ativas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{summary.hot_count + summary.escalating_count}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Hot / Escalando</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{summary.total_ads}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Anúncios</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{summary.total_clicks}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Cliques</div>
          </div>
        </div>

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
                <span className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Média de Dias Ativo: </span>
                <span className="text-sm font-syne font-700 text-t1">{Math.round(summary.avg_days_active)} dias</span>
              </div>
              <div>
                <span className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Anúncios Médios/Oferta: </span>
                <span className="text-sm font-syne font-700 text-t1">
                  {Math.round(summary.total_ads / Math.max(summary.offer_count, 1))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Status das Ofertas</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2} dataKey="value">
                  {statusDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Ofertas — Cliques</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={offers.slice(0, 6).map((o) => ({ name: o.name.substring(0, 12), clicks: o.num_clicks }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 10 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="clicks" fill="#CC2A1E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

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

        <div className="bg-s2 border border-b1 rounded-[2px] p-5">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Ofertas neste Nicho</div>
          <div className="space-y-3">
            {offers.slice(0, 8).map((offer, index) => (
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
                    {(offer.momentum_tag === 'escalating' || offer.momentum_tag === 'hot') && (
                      <span className="px-2 py-1 bg-rd border border-red rounded-[2px] text-xs font-mono text-red uppercase tracking-[0.05em]">
                        {offer.momentum_tag}
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
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Cliques</div>
                    <div className="text-lg font-syne font-700 text-t2">{offer.num_clicks}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

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
