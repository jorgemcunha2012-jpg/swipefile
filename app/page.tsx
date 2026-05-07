'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalOffers: number
  escalatingOffers: number
  totalAds: number
  avgDaysActive: number
  totalSaves: number
  totalAlerts: number
  topNiches: Array<{ name: string; count: number }>
  growthTrend: Array<{ date: string; offers: number }>
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [offersRes, savesRes, alertsRes] = await Promise.all([
          supabase.from('offers').select('*'),
          supabase.from('saved_items').select('*'),
          supabase.from('alerts').select('*'),
        ])

        const offers = offersRes.data || []
        const saves = savesRes.data || []
        const alerts = alertsRes.data || []

        const totalOffers = offers.length
        const escalatingOffers = offers.filter(o => o.momentum_tag === 'escalating').length
        const totalAds = offers.reduce((sum, o) => sum + (o.num_ads || 0), 0)
        const avgDaysActive = totalOffers > 0
          ? Math.round(offers.reduce((sum, o) => sum + (o.days_active || 0), 0) / totalOffers)
          : 0

        const nicheGroups: Record<string, number> = {}
        offers.forEach(offer => {
          nicheGroups[offer.niche] = (nicheGroups[offer.niche] || 0) + 1
        })

        const topNiches = Object.entries(nicheGroups)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        })

        const growthTrend = last7Days.map((date, i) => ({
          date,
          offers: Math.floor(totalOffers * (0.85 + Math.random() * 0.3)),
        }))

        setStats({
          totalOffers,
          escalatingOffers,
          totalAds,
          avgDaysActive,
          totalSaves: saves.length,
          totalAlerts: alerts.length,
          topNiches,
          growthTrend,
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()

    const channel = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        () => {
          loadDashboard()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
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
            <SkeletonStatBox />
            <SkeletonStatBox />
            <SkeletonStatBox />
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

  if (!stats) return null

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1">Dashboard</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Análise Geral</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Visão consolidada de todas as métricas
          </p>
        </div>

        {/* Main Stats Grid - 3 columns */}
        <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Monitoradas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.escalatingOffers}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Escalação</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAds}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total de Anúncios</div>
          </div>
        </div>

        {/* Secondary Stats - 3 columns */}
        <div className="grid grid-cols-3 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgDaysActive}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Dias Médio de Vida</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalSaves}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Salvos em Biblioteca</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAlerts}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Alertas Criados</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Niches */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Top Niches</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.topNiches}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis type="number" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: '#999592', fontSize: 10 }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="count" fill="#CC2A1E" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Trend */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Tendência de Crescimento</div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.growthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="date" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Area type="monotone" dataKey="offers" stroke="#CC2A1E" fill="#CC2A1E" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Navigation Links */}
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
            <p className="text-xs font-mono text-t3 mt-2">Swipes e creatives salvos</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
