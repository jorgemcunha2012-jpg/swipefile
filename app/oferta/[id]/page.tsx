'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabase'

interface Offer {
  id: string
  name: string
  platform: string
  num_ads: number
  num_creatives: number
  niche: string
  structure: string
  product_type: string
  status: string
  days_active: number
  detected_at: string
  updated_at: string
  momentum_tag: string
  language: string
}

export default function OfferPage() {
  const params = useParams()
  const offerId = params.id as string
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadOffer = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('id', offerId)
          .single()

        if (error) throw error
        setOffer(data)
      } catch (error) {
        console.error('Error loading offer:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOffer()
  }, [offerId])

  const handleSaveToLibrary = async () => {
    if (!offer) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('saved_items')
        .insert([{ offer_id: offer.id }])

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving to library:', error)
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <Link href="/radar" className="text-sm font-mono text-red hover:text-red transition-colors">
              ← Voltar ao Radar
            </Link>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2 mt-4">Carregando...</h1>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!offer) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <Link href="/radar" className="text-sm font-mono text-red hover:text-red transition-colors">
              ← Voltar ao Radar
            </Link>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2 mt-4">Oferta não encontrada</h1>
          </div>
        </div>
      </AppLayout>
    )
  }

  const daysAgo = Math.floor((Date.now() - new Date(offer.detected_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link href="/radar" className="text-sm font-mono text-red hover:text-red transition-colors">
            ← Voltar ao Radar
          </Link>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2 mt-4">{offer.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className={`px-3 py-1 rounded-[2px] border text-xs font-mono uppercase tracking-[0.05em] ${
              offer.momentum_tag === 'escalating'
                ? 'bg-rd border-red text-red'
                : 'bg-s1 border-b1 text-t2'
            }`}>
              {offer.momentum_tag}
            </span>
            <span className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-t2">
              {offer.platform}
            </span>
            <span className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-t2">
              {offer.niche}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.num_ads}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Anúncios Ativos</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.num_creatives}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Criativos</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.days_active}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Dias Ativo</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{daysAgo}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Detectado Há</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Ads vs Creatives Chart */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Comparativa</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Anúncios', value: offer.num_ads, fill: '#CC2A1E' },
                { name: 'Criativos', value: offer.num_creatives, fill: '#9B9591' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 12 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Distribution */}
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Distribuição de Performance</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Anúncios', value: offer.num_ads },
                    { name: 'Criativos', value: offer.num_creatives }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#CC2A1E" />
                  <Cell fill="#9B9591" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Info Card 1 */}
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Informações Básicas</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Plataforma</div>
                  <div className="text-sm font-syne font-700 text-t1 capitalize">{offer.platform}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Estrutura</div>
                  <div className="text-sm font-syne font-700 text-t1">{offer.structure}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Tipo de Produto</div>
                  <div className="text-sm font-syne font-700 text-t1">{offer.product_type || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Idioma</div>
                  <div className="text-sm font-syne font-700 text-t1">{offer.language}</div>
                </div>
              </div>
            </div>

            {/* Info Card 2 */}
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Timeline</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Detectado em</div>
                  <div className="text-sm font-mono text-t2">{new Date(offer.detected_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Última atualização</div>
                  <div className="text-sm font-mono text-t2">{new Date(offer.updated_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Performance Metrics */}
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Desempenho</div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Densidade de Anúncios</div>
                    <div className="text-sm font-syne font-700 text-t1">{(offer.num_ads / Math.max(offer.days_active, 1)).toFixed(1)}/dia</div>
                  </div>
                  <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                    <div
                      className="h-full bg-red"
                      style={{ width: `${Math.min((offer.num_ads / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Intensidade Criativa</div>
                    <div className="text-sm font-syne font-700 text-t1">{(offer.num_creatives / Math.max(offer.num_ads, 1)).toFixed(2)}</div>
                  </div>
                  <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                    <div
                      className="h-full bg-t2"
                      style={{ width: `${Math.min((offer.num_creatives / offer.num_ads) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Longevidade</div>
                    <div className="text-sm font-syne font-700 text-t1">{offer.days_active} dias</div>
                  </div>
                  <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                    <div
                      className="h-full bg-t2"
                      style={{ width: `${Math.min((offer.days_active / 90) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Status Atual</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Momentum</div>
                  <div className={`inline-block px-3 py-2 rounded-[2px] text-sm font-syne font-700 ${
                    offer.momentum_tag === 'escalating'
                      ? 'bg-rd border border-red text-red'
                      : 'bg-s1 border border-b1 text-t2'
                  }`}>
                    {offer.momentum_tag === 'escalating' ? '📈 Escalando' : '→ Estável'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Status Geral</div>
                  <div className="inline-block px-3 py-2 rounded-[2px] text-sm font-syne font-700 bg-s1 border border-b1 text-t2 capitalize">
                    {offer.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveToLibrary}
            disabled={saving || saved}
            className={`px-6 py-3 font-mono text-sm uppercase tracking-[0.05em] rounded-[2px] transition-all ${
              saved
                ? 'bg-s3 border border-b2 text-t2'
                : 'bg-red text-bg hover:bg-opacity-90'
            }`}
          >
            {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar para Biblioteca'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
