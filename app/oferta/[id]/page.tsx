'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { api, Offer, Alert } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const ALERT_TYPES = [
  { value: 'escalating', label: 'Escalando' },
  { value: 'new', label: 'Nova Oferta' },
  { value: 'price_change', label: 'Mudança de Preço' },
]

export default function OfferPage() {
  const params = useParams()
  const offerId = params.id as string
  const { isAuthenticated } = useAuth()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertType, setAlertType] = useState('escalating')
  const [creatingAlert, setCreatingAlert] = useState(false)
  const [alertError, setAlertError] = useState('')
  const [showAlertForm, setShowAlertForm] = useState(false)

  useEffect(() => {
    api.offers.getById(offerId)
      .then(setOffer)
      .catch((err) => console.error('Error loading offer:', err))
      .finally(() => setLoading(false))
  }, [offerId])

  useEffect(() => {
    if (isAuthenticated) {
      api.alerts.list()
        .then((all) => setAlerts(all.filter((a) => a.offer_id === offerId)))
        .catch(() => {})
    }
  }, [isAuthenticated, offerId])

  const handleCreateAlert = async () => {
    setCreatingAlert(true)
    setAlertError('')
    try {
      const alert = await api.alerts.create(offerId, alertType)
      setAlerts((prev) => [...prev, alert])
      setShowAlertForm(false)
    } catch (err: unknown) {
      setAlertError(err instanceof Error ? err.message : 'Erro ao criar alerta')
    } finally {
      setCreatingAlert(false)
    }
  }

  const handleToggleAlert = async (id: string, current: boolean) => {
    try {
      const updated = await api.alerts.update(id, !current)
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_active: updated.is_active } : a))
    } catch (err: unknown) {
      setAlertError(err instanceof Error ? err.message : 'Erro ao atualizar alerta')
    }
  }

  const handleRemoveAlert = async (id: string) => {
    try {
      await api.alerts.remove(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch (err: unknown) {
      setAlertError(err instanceof Error ? err.message : 'Erro ao remover alerta')
    }
  }

  const handleSaveToLibrary = async () => {
    if (!offer) return
    setSaving(true)
    setSaveError('')
    try {
      await api.savedItems.create(offer.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar')
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
  const isHot = offer.momentum_tag === 'escalating' || offer.momentum_tag === 'hot'

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <Link href="/radar" className="text-sm font-mono text-red hover:text-red transition-colors">
            ← Voltar ao Radar
          </Link>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2 mt-4">{offer.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className={`px-3 py-1 rounded-[2px] border text-xs font-mono uppercase tracking-[0.05em] ${
              isHot ? 'bg-rd border-red text-red' : 'bg-s1 border-b1 text-t2'
            }`}>
              {offer.momentum_tag}
            </span>
            <span className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-t2">
              {offer.platform}
            </span>
            <span className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-t2">
              {offer.niche}
            </span>
            {offer.click_url && (
              <a
                href={offer.click_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-rd border border-red rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-red hover:bg-red hover:text-bg transition-all"
              >
                Ver Oferta →
              </a>
            )}
          </div>
        </div>

        {offer.thumbnail_url && (
          <div className="bg-s2 border border-b1 rounded-[2px] overflow-hidden">
            <img
              src={offer.thumbnail_url}
              alt={offer.name}
              className="w-full max-h-80 object-contain"
            />
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.num_ads}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Anúncios Ativos</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.num_creatives}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Criativos</div>
            <div className="text-[10px] font-mono text-t3 mt-1 opacity-50 leading-snug">peças publicitárias individuais</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.num_clicks}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Cliques</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.days_active}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Dias Ativo</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Comparativa</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Anúncios', value: offer.num_ads },
                { name: 'Criativos', value: offer.num_creatives },
                { name: 'Cliques', value: offer.num_clicks },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 12 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="value" fill="#CC2A1E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Distribuição</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Anúncios', value: offer.num_ads },
                    { name: 'Criativos', value: offer.num_creatives },
                  ]}
                  cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value"
                >
                  <Cell fill="#CC2A1E" /><Cell fill="#9B9591" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Informações Básicas</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Plataforma</div>
                  <div className="text-sm font-syne font-700 text-t1 capitalize">{offer.platform}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Tipo de Produto</div>
                  <div className="text-sm font-syne font-700 text-t1 capitalize">{offer.product_type}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Estrutura</div>
                  <div className="text-sm font-syne font-700 text-t1 capitalize mb-2">{offer.structure ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Idioma</div>
                  <div className="text-sm font-syne font-700 text-t1 capitalize">{offer.language}</div>
                </div>
              </div>
            </div>

            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Timeline</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Detectado em</div>
                  <div className="text-sm font-mono text-t2">
                    {new Date(offer.detected_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-1">Há {daysAgo} dias</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Desempenho</div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Densidade de Anúncios</div>
                    <div className="text-sm font-syne font-700 text-t1">
                      {(offer.num_ads / Math.max(offer.days_active, 1)).toFixed(1)}/dia
                    </div>
                  </div>
                  <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                    <div className="h-full bg-red" style={{ width: `${Math.min((offer.num_ads / 200) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Intensidade Criativa</div>
                    <div className="text-sm font-syne font-700 text-t1">
                      {(offer.num_creatives / Math.max(offer.num_ads, 1)).toFixed(2)}
                    </div>
                  </div>
                  <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                    <div className="h-full bg-t2" style={{ width: `${Math.min((offer.num_creatives / Math.max(offer.num_ads, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Longevidade</div>
                    <div className="text-sm font-syne font-700 text-t1">{offer.days_active} dias</div>
                  </div>
                  <div className="h-2 bg-s1 rounded-[1px] overflow-hidden">
                    <div className="h-full bg-t2" style={{ width: `${Math.min((offer.days_active / 90) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-s2 border border-b1 rounded-[2px] p-5">
              <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Status Atual</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Momentum</div>
                  <div className={`inline-block px-3 py-2 rounded-[2px] text-sm font-syne font-700 ${
                    isHot ? 'bg-rd border border-red text-red' : 'bg-s1 border border-b1 text-t2'
                  }`}>
                    {isHot ? 'Escalando' : offer.momentum_tag ?? 'Estável'}
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

        {offer.num_creatives > 0 && (() => {
          const vslCreatives = offer.creatives?.filter((c) => c.type?.toLowerCase() === 'vsl') ?? []
          const adCreatives = offer.creatives?.filter((c) => c.type?.toLowerCase() !== 'vsl') ?? []
          const noCreatives = !offer.creatives || offer.creatives.length === 0

          const CreativeCard = ({ c, wide = false }: { c: typeof vslCreatives[0]; wide?: boolean }) => {
            const ytId = c.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? null
            const thumbSrc = c.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)
            const isImage = !ytId && !c.thumbnail_url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(c.url)
            const isVsl = c.type?.toLowerCase() === 'vsl'

            return (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-s2 rounded-[2px] overflow-hidden transition-all flex ${wide ? 'border border-red hover:border-red flex-row' : 'border border-b1 hover:border-b2 flex-col'}`}
              >
                <div className={`relative bg-s1 overflow-hidden flex-shrink-0 ${wide ? 'w-48 aspect-[9/16]' : 'aspect-[9/16]'}`}>
                  {thumbSrc ? (
                    <>
                      <img src={thumbSrc} alt={c.headline ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                        <div className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                        </div>
                      </div>
                    </>
                  ) : isImage ? (
                    <img src={c.url} alt={c.headline ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-12 h-12 rounded-full bg-s3 border border-b2 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-t2"><polygon points="5,3 19,12 5,21"/></svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 text-xs font-mono uppercase font-bold rounded-[2px] ${isVsl ? 'bg-red text-bg' : 'bg-black/70 text-t2'}`}>
                      {isVsl ? 'VSL' : c.type}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  {isVsl && (
                    <div className="text-[10px] font-mono text-red uppercase tracking-[0.05em]">Video Sales Letter</div>
                  )}
                  {c.headline && (
                    <p className={`font-mono text-t1 leading-relaxed ${wide ? 'text-sm line-clamp-4' : 'text-xs line-clamp-2'}`}>{c.headline}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-t3 uppercase tracking-[0.05em]">
                    <span>{c.platform}</span>
                  </div>
                  {((c.num_likes ?? 0) > 0 || (c.num_comments ?? 0) > 0 || (c.num_views ?? 0) > 0) && (
                    <div className="flex items-center gap-4 text-xs font-mono text-t2">
                      {(c.num_likes ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          {c.num_likes.toLocaleString('pt-BR')}
                        </span>
                      )}
                      {(c.num_comments ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          {c.num_comments.toLocaleString('pt-BR')}
                        </span>
                      )}
                      {(c.num_views ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          {c.num_views.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </a>
            )
          }

          return (
            <div className="space-y-6">
              {noCreatives && (
                <div className="bg-s2 border border-b1 rounded-[2px] p-8 text-center text-xs font-mono text-t3">
                  Criativos em sincronização — disponíveis no próximo ciclo de busca.
                </div>
              )}

              {vslCreatives.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-red uppercase tracking-[0.05em] font-bold">VSL</span>
                    <span className="text-xs font-mono text-t3">· Video Sales Letter · vídeo principal de vendas</span>
                  </div>
                  <div className="space-y-3">
                    {vslCreatives.map((c) => <CreativeCard key={c.id} c={c} wide />)}
                  </div>
                </div>
              )}

              {adCreatives.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Criativos</span>
                    <span className="text-xs font-mono text-t3">· {adCreatives.length} peças publicitárias</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {adCreatives.map((c) => <CreativeCard key={c.id} c={c} />)}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Alertas */}
        <div className="bg-s2 border border-b1 rounded-[2px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              Alertas {alerts.length > 0 && <span className="text-t1 font-syne font-700 ml-1">({alerts.length})</span>}
            </div>
            {isAuthenticated && !showAlertForm && (
              <button
                onClick={() => { setShowAlertForm(true); setAlertError('') }}
                className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t1 hover:bg-s2 rounded-[2px] transition-all"
              >
                + Novo Alerta
              </button>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-xs font-mono text-t3">
              <Link href="/login" className="text-red hover:underline">Faça login</Link> para configurar alertas desta oferta.
            </p>
          )}

          {alertError && (
            <div className="mb-3 px-3 py-2 bg-rd border border-red rounded-[2px] text-xs font-mono text-red">{alertError}</div>
          )}

          {showAlertForm && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-s1 border border-b1 rounded-[2px]">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="flex-1 px-3 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all"
              >
                {ALERT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button
                onClick={handleCreateAlert}
                disabled={creatingAlert}
                className="px-4 py-2 bg-red text-bg text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all disabled:opacity-50"
              >
                {creatingAlert ? 'Criando...' : 'Criar'}
              </button>
              <button
                onClick={() => { setShowAlertForm(false); setAlertError('') }}
                className="px-3 py-2 bg-s3 border border-b1 text-t3 text-xs font-mono rounded-[2px] hover:text-t1 transition-all"
              >
                ✕
              </button>
            </div>
          )}

          {alerts.length === 0 && isAuthenticated && !showAlertForm && (
            <p className="text-xs font-mono text-t3">Nenhum alerta configurado para esta oferta.</p>
          )}

          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between px-3 py-2 bg-s1 border border-b1 rounded-[2px]">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.is_active ? 'bg-red' : 'bg-t3'}`} />
                    <span className="text-sm font-mono text-t1">
                      {ALERT_TYPES.find((t) => t.value === alert.alert_type)?.label ?? alert.alert_type}
                    </span>
                    <span className={`text-xs font-mono uppercase tracking-[0.05em] ${alert.is_active ? 'text-red' : 'text-t3'}`}>
                      {alert.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s2 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all"
                    >
                      {alert.is_active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleRemoveAlert(alert.id)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s2 border border-b1 text-t3 hover:border-red hover:text-red rounded-[2px] transition-all"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {saveError && (
          <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{saveError}</div>
        )}

        <div className="flex gap-3">
          {isAuthenticated ? (
            <button
              onClick={handleSaveToLibrary}
              disabled={saving || saved}
              className={`px-6 py-3 font-mono text-sm uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                saved ? 'bg-s3 border border-b2 text-t2' : 'bg-red text-bg hover:opacity-90'
              }`}
            >
              {saving ? 'Salvando...' : saved ? '✓ Salvo na Biblioteca' : 'Salvar para Biblioteca'}
            </button>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 bg-s3 border border-b2 font-mono text-sm uppercase tracking-[0.05em] rounded-[2px] transition-all hover:bg-s2 text-t1"
            >
              Fazer login para salvar
            </Link>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
