'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonListItem, SkeletonStatBox } from '@/components/SkeletonLoader'
import { api, Alert, AlertLog, Offer, SystemNotification } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const alertTypeLabel: Record<string, string> = {
  escalating: 'Escalando',
  new: 'Nova Oferta',
  price_change: 'Mudança de Preço',
}

const ALERT_TYPES = [
  { value: 'escalating', label: 'Escalando' },
  { value: 'new', label: 'Nova Oferta' },
  { value: 'price_change', label: 'Mudança de Preço' },
]

export default function AlertasPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [logs, setLogs] = useState<AlertLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'alerts' | 'logs' | 'notifications'>('notifications')
  const [sysNotifications, setSysNotifications] = useState<SystemNotification[]>([])
  const [error, setError] = useState('')

  // modal criar alerta
  const [showCreate, setShowCreate] = useState(false)
  const [offerSearch, setOfferSearch] = useState('')
  const [offerResults, setOfferResults] = useState<Offer[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [newAlertType, setNewAlertType] = useState('escalating')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const alertsData = await api.alerts.list()
      setAlerts(alertsData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alertas')
    } finally {
      setLoading(false)
    }
    try {
      const logsData = await api.alerts.getLogs({ limit: 50 })
      setLogs(logsData.data)
    } catch {}
    try {
      const notifs = await api.notifications.list({ limit: 100 })
      setSysNotifications(notifs)
    } catch {}
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadData()
    else if (!authLoading) setLoading(false)
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!offerSearch.trim()) { setOfferResults([]); return }
    const t = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await api.offers.list({ q: offerSearch, limit: 6 })
        setOfferResults(res.data)
      } catch { setOfferResults([]) }
      finally { setSearchLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [offerSearch])

  const handleCreate = async () => {
    if (!selectedOffer) return
    setCreating(true)
    setCreateError('')
    try {
      const alert = await api.alerts.create(selectedOffer.id, newAlertType)
      setAlerts((prev) => [alert, ...prev])
      setShowCreate(false)
      setSelectedOffer(null)
      setOfferSearch('')
      setNewAlertType('escalating')
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao criar alerta')
    } finally {
      setCreating(false)
    }
  }

  const toggleAlert = async (id: string, current: boolean) => {
    try {
      const updated = await api.alerts.update(id, !current)
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar alerta')
    }
  }

  const removeAlert = async (id: string) => {
    try {
      await api.alerts.remove(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao remover alerta')
    }
  }

  if (authLoading) return null

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Alertas</h1>
          </div>
          <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
            <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
            <p className="text-sm font-syne font-700 text-t2 mb-1">Login necessário</p>
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-6">
              Faça login para acessar seus alertas
            </p>
            <Link href="/login" className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all">
              Fazer Login
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const stats = {
    active: alerts.filter((a) => a.is_active).length,
    total: alerts.length,
    notifications: sysNotifications.length,
    recent: sysNotifications.filter((n) => {
      return Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
    }).length,
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Alertas</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando alertas...</p>
          </div>
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox />
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Alertas</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
              Notificações automáticas de mercado e movimentos competitivos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="px-4 py-2 text-xs font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t2 hover:text-t1 rounded-[2px] transition-all"
            >
              ↻ Recarregar
            </button>
            <button
              onClick={() => { setShowCreate(true); setCreateError(''); setSelectedOffer(null); setOfferSearch('') }}
              className="px-5 py-2 text-xs font-mono uppercase tracking-[0.05em] bg-red text-bg rounded-[2px] hover:opacity-90 transition-all"
            >
              + Novo Alerta
            </button>
          </div>
        </div>

        {/* Modal criar alerta */}
        {showCreate && (
          <div className="fixed inset-0 bg-bg bg-opacity-80 z-50 flex items-center justify-center px-4">
            <div className="bg-s2 border border-b1 rounded-[2px] w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-syne font-900 text-t1">Novo Alerta</h2>
                <button onClick={() => setShowCreate(false)} className="text-t3 hover:text-t1 text-xl font-mono transition-colors">✕</button>
              </div>

              <div className="space-y-4">
                {/* Busca de oferta */}
                <div>
                  <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Oferta</label>
                  {selectedOffer ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-s3 border border-b2 rounded-[2px]">
                      <div>
                        <div className="text-sm font-syne font-700 text-t1">{selectedOffer.name}</div>
                        <div className="text-xs font-mono text-t3">{selectedOffer.platform} · {selectedOffer.niche}</div>
                      </div>
                      <button onClick={() => { setSelectedOffer(null); setOfferSearch('') }}
                        className="text-t3 hover:text-red text-xs font-mono transition-colors">✕</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar oferta por nome..."
                        value={offerSearch}
                        onChange={(e) => setOfferSearch(e.target.value)}
                        autoFocus
                        className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
                      />
                      {(offerResults.length > 0 || searchLoading) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-s2 border border-b1 rounded-[2px] overflow-hidden z-10">
                          {searchLoading ? (
                            <div className="px-3 py-2 text-xs font-mono text-t3">Buscando...</div>
                          ) : offerResults.map((o) => (
                            <button key={o.id} onClick={() => { setSelectedOffer(o); setOfferSearch(o.name) }}
                              className="w-full text-left px-3 py-2 hover:bg-s3 transition-all border-b border-b1 last:border-0">
                              <div className="text-sm font-mono text-t1">{o.name}</div>
                              <div className="text-xs font-mono text-t3">{o.platform} · {o.niche}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tipo de alerta */}
                <div>
                  <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Tipo de Alerta</label>
                  <div className="flex gap-2">
                    {ALERT_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setNewAlertType(t.value)}
                        className={`flex-1 px-3 py-2 text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] border transition-all ${
                          newAlertType === t.value
                            ? 'bg-rd border-red text-red'
                            : 'bg-s1 border-b1 text-t2 hover:border-b2'
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {createError && (
                  <div className="px-3 py-2 bg-rd border border-red rounded-[2px] text-xs font-mono text-red">{createError}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleCreate} disabled={!selectedOffer || creating}
                    className="flex-1 px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all disabled:opacity-40">
                    {creating ? 'Criando...' : 'Criar Alerta'}
                  </button>
                  <button onClick={() => setShowCreate(false)}
                    className="px-6 py-3 bg-s3 border border-b2 text-t1 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:bg-s2 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.active}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Alertas Ativos</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total Configurados</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.notifications}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Notificações Total</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.recent}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Escalações 24h</div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-b1">
          {([
            { id: 'notifications', label: 'Notificações' },
            { id: 'alerts', label: 'Alertas Configurados' },
            { id: 'logs', label: 'Histórico' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-mono uppercase tracking-[0.05em] border-b-2 transition-all ${
                activeTab === tab.id ? 'border-red text-red' : 'border-transparent text-t3 hover:text-t2'
              }`}
            >
              {tab.label}
              {tab.id === 'notifications' && stats.recent > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red text-bg text-[9px] font-mono rounded-full">{stats.recent}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {sysNotifications.length === 0 ? (
              <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
                <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
                <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhuma notificação ainda</p>
                <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
                  Aparecerão aqui quando novas ofertas entrarem em escalação
                </p>
              </div>
            ) : (
              sysNotifications.map((n) => {
                const isRecent = Date.now() - new Date(n.createdAt).getTime() < 4 * 60 * 60 * 1000
                return (
                  <Link
                    key={n.id}
                    href={`/oferta/${n.offer_id}`}
                    className={`flex items-center gap-4 bg-s2 border rounded-[2px] p-4 hover:bg-s3 hover:border-b2 transition-all ${isRecent ? 'border-red bg-rd' : 'border-b1'}`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isRecent ? 'bg-red' : 'bg-t3'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono px-2 py-0.5 bg-rd border border-red rounded-[2px] text-red uppercase tracking-[0.05em]">
                          Escalando
                        </span>
                        {isRecent && (
                          <span className="text-xs font-mono text-red uppercase tracking-[0.05em]">Nova</span>
                        )}
                      </div>
                      <p className="text-sm font-syne font-700 text-t1 line-clamp-1">{n.offer?.name ?? '—'}</p>
                      <p className="text-xs font-mono text-t3 mt-0.5">
                        {n.offer?.platform ?? ''} · {n.offer?.niche ?? ''} · {n.offer?.num_ads ?? 0} ads
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono text-t2">
                        {new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div className="text-xs font-mono text-t3">
                        {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
                <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
                <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum alerta configurado</p>
                <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-6">
                  Abra uma oferta no Radar e clique em &quot;+ Novo Alerta&quot;
                </p>
                <Link href="/radar" className="px-6 py-3 bg-s3 border border-b2 text-t1 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:bg-s2 transition-all">
                  Ir para o Radar
                </Link>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-syne font-700 text-t1">
                          {alert.offer?.name ?? alert.offer_id}
                        </h3>
                        <span className={`text-xs font-mono px-2 py-1 rounded-[2px] uppercase tracking-[0.05em] border ${
                          alert.is_active ? 'bg-rd border-red text-red' : 'bg-s1 border-b1 text-t3'
                        }`}>
                          {alert.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="text-sm font-mono text-t3 mb-1">
                        Tipo: <span className="text-t2">{alertTypeLabel[alert.alert_type] ?? alert.alert_type}</span>
                      </div>
                      {alert.offer && (
                        <div className="text-xs font-mono text-t3">
                          {alert.offer.platform} · {alert.offer.niche}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-6">
                      <button
                        onClick={() => toggleAlert(alert.id, alert.is_active)}
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                          alert.is_active
                            ? 'bg-rd border border-red text-red hover:bg-red hover:text-bg'
                            : 'bg-s1 border border-b1 text-t2 hover:bg-s3'
                        }`}
                      >
                        {alert.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => removeAlert(alert.id)}
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
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
                <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
                <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum acionamento registrado</p>
                <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
                  Os logs aparecerão quando seus alertas forem acionados
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-s2 border border-b1 rounded-[2px] p-4 hover:border-b2 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono px-2 py-1 bg-rd border border-red rounded-[2px] text-red uppercase tracking-[0.05em]">
                          {alertTypeLabel[log.alert_type] ?? log.alert_type}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-t2 mt-2">
                        {typeof log.details === 'object' && log.details !== null
                          ? `Tag: ${(log.details as Record<string, unknown>).new_tag ?? ''} · Cliques: ${(log.details as Record<string, unknown>).num_clicks ?? ''}`
                          : JSON.stringify(log.details)}
                      </p>
                      <div className="text-xs font-mono text-t3 mt-1">
                        {new Date(log.triggered_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
