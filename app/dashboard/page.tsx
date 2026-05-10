'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { api, NichoStats } from '@/lib/api'

interface DashboardStats {
  totalOffers: number
  escalatingOffers: number
  totalAds: number
  avgDaysActive: number
  totalSaves: number
  totalAlerts: number
  topNiches: Array<{ name: string; count: number }>
  momentumDist: Array<{ name: string; value: number }>
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [nichos, savesRes, alertsRes] = await Promise.allSettled([
          api.offers.getNichos(),
          api.savedItems.list(),
          api.alerts.list(),
        ])

        const nichoData: NichoStats[] = nichos.status === 'fulfilled' ? nichos.value : []

        const totalOffers = nichoData.reduce((s, n) => s + n.offer_count, 0)
        const escalatingOffers = nichoData.reduce((s, n) => s + n.escalating_count, 0)
        const hotOffers = nichoData.reduce((s, n) => s + n.hot_count, 0)
        const totalAds = nichoData.reduce((s, n) => s + n.total_ads, 0)
        const avgDaysActive =
          totalOffers > 0
            ? Math.round(
                nichoData.reduce((s, n) => s + n.avg_days_active * n.offer_count, 0) / totalOffers,
              )
            : 0

        const topNiches = [...nichoData]
          .sort((a, b) => b.total_clicks - a.total_clicks)
          .slice(0, 8)
          .map((n) => ({ name: n.niche, count: n.offer_count }))

        const stableOffers = totalOffers - escalatingOffers - hotOffers
        const momentumDist = [
          { name: 'Hot', value: hotOffers },
          { name: 'Escalando', value: escalatingOffers },
          { name: 'Estável', value: Math.max(0, stableOffers) },
        ]

        setStats({
          totalOffers,
          escalatingOffers,
          totalAds,
          avgDaysActive,
          totalSaves: savesRes.status === 'fulfilled' ? savesRes.value.length : 0,
          totalAlerts: alertsRes.status === 'fulfilled' ? alertsRes.value.length : 0,
          topNiches,
          momentumDist,
        })
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Análise Geral</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando dashboard...</p>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox />
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

  if (!stats) return null

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Dashboard</span>
        </div>

        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Análise Geral</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Visão consolidada de todas as métricas
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Monitoradas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.escalatingOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Escalação</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAds}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Anúncios</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgDaysActive}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Dias Médio de Vida</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalSaves}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Salvos em Biblioteca</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAlerts}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Alertas Criados</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Nichos por Cliques</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topNiches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis type="number" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#999592', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="count" fill="#CC2A1E" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Distribuição de Momentum</div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.momentumDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Area type="monotone" dataKey="value" stroke="#CC2A1E" fill="#CC2A1E" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Link href="/radar" className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Navegação</div>
            <h3 className="text-base font-syne font-700 text-t1 group-hover:text-red transition-colors">Radar</h3>
            <p className="text-xs font-mono text-t3 mt-2">Todas as ofertas monitoradas</p>
          </Link>
          <Link href="/nichos" className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Navegação</div>
            <h3 className="text-base font-syne font-700 text-t1 group-hover:text-red transition-colors">Nichos</h3>
            <p className="text-xs font-mono text-t3 mt-2">Análise competitiva de nichos</p>
          </Link>
          <Link href="/trending" className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Navegação</div>
            <h3 className="text-base font-syne font-700 text-t1 group-hover:text-red transition-colors">Trending</h3>
            <p className="text-xs font-mono text-t3 mt-2">Nichos com maior crescimento</p>
          </Link>
          <Link href="/biblioteca" className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5 cursor-pointer group">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Navegação</div>
            <h3 className="text-base font-syne font-700 text-t1 group-hover:text-red transition-colors">Biblioteca</h3>
            <p className="text-xs font-mono text-t3 mt-2">Ofertas salvas</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
