'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonListItem } from '@/components/SkeletonLoader'
import { api, uploadImage, Offer, OfferBody, AdminUser, AdminStats, Alert } from '@/lib/api'
import { useAuth } from '@/lib/auth'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = ['meta', 'tiktok', 'google', 'youtube', 'kwai', 'outros']
const PRODUCT_TYPES = ['dropshipping', 'infoproduto', 'hot']
const STATUSES = ['active', 'inactive', 'archived']
const LANGUAGES = ['pt', 'en', 'es']
const ALERT_TYPES = ['escalating', 'new', 'price_change']
const ITEMS_PER_PAGE = 20

const emptyOfferForm: OfferBody = {
  name: '', platform: 'meta', product_type: 'dropshipping',
  niche: '', structure: '', language: 'pt', status: 'active',
  num_ads: 0, num_creatives: 0, num_clicks: 0, thumbnail_url: '',
}

// ─── Shared field components ──────────────────────────────────────────────────

function FormField({ label, type = 'text', value, onChange }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">{label}</label>
      <input
        type={type}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
      />
    </div>
  )
}

function FormSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ─── Tab: Visão Geral ─────────────────────────────────────────────────────────

function TabOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  const items = stats ? [
    { label: 'Ofertas Ativas', value: stats.active_offers },
    { label: 'Total de Ofertas', value: stats.total_offers },
    { label: 'Total de Usuários', value: stats.total_users },
    { label: 'Total de Alertas', value: stats.total_alerts },
    { label: 'Alertas Ativos', value: stats.active_alerts },
    { label: 'Itens Salvos', value: stats.total_saves },
    { label: 'Criativos', value: stats.total_creatives },
    { label: 'Ofertas Hot', value: stats.hot_offers },
    { label: 'Escalating', value: stats.escalating_offers },
  ] : []

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-s2 border border-b1 rounded-[2px] px-6 py-5 animate-pulse">
            <div className="h-8 bg-s3 rounded mb-3 w-16" />
            <div className="h-3 bg-s3 rounded w-28" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {items.map(({ label, value }) => (
          <div key={label} className="bg-s2 border border-b1 rounded-[2px] px-6 py-5 hover:border-b2 transition-all">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{value}</div>
            <div className="text-xs font-mono uppercase tracking-[0.05em] text-t3">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Ofertas ─────────────────────────────────────────────────────────────

function TabOfertas() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OfferBody>(emptyOfferForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const loadOffers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.offers.list({ page, limit: ITEMS_PER_PAGE, q: search || undefined })
      setOffers(res.data)
      setTotal(res.meta.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ofertas')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadOffers() }, [loadOffers])
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const openCreate = () => { setEditingId(null); setForm(emptyOfferForm); setFormError(''); setShowForm(true) }
  const openEdit = (o: Offer) => {
    setEditingId(o.id)
    setForm({ name: o.name, platform: o.platform, product_type: o.product_type, niche: o.niche,
      structure: o.structure ?? '', language: o.language, status: o.status, num_ads: o.num_ads,
      num_creatives: o.num_creatives, num_clicks: o.num_clicks, thumbnail_url: o.thumbnail_url ?? '' })
    setFormError(''); setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const payload: OfferBody = { ...form, thumbnail_url: form.thumbnail_url || null, structure: form.structure || undefined }
      if (editingId) {
        const updated = await api.admin.updateOffer(editingId, payload)
        setOffers((prev) => prev.map((o) => (o.id === editingId ? updated : o)))
      } else {
        await api.admin.createOffer(payload); await loadOffers()
      }
      setShowForm(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteOffer(id)
      setOffers((prev) => prev.filter((o) => o.id !== id))
      setTotal((t) => t - 1); setDeleteConfirm(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro ao deletar') }
  }

  const set = (key: keyof OfferBody) => (v: string) =>
    setForm((f) => ({ ...f, [key]: ['num_ads','num_creatives','num_clicks'].includes(key) ? Number(v) : v }))

  return (
    <div className="space-y-6">
      {error && <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{error}</div>}

      <div className="flex items-center justify-between">
        <input
          type="text" placeholder="Buscar por nome..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />
        <button onClick={openCreate}
          className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all">
          + Nova Oferta
        </button>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
            <span className="text-t2">{(page - 1) * ITEMS_PER_PAGE + 1}</span>–
            <span className="text-t2">{Math.min(page * ITEMS_PER_PAGE, total)}</span> de{' '}
            <span className="text-t1 font-syne font-700">{total}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${page === 1 ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'}`}>
              ← Anterior
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${page === totalPages ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'}`}>
              Próxima →
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3"><SkeletonListItem /><SkeletonListItem /><SkeletonListItem /></div>
      ) : offers.length === 0 ? (
        <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
          <p className="text-sm font-syne font-700 text-t2">Nenhuma oferta encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_100px_120px_80px_80px_80px_160px] gap-3 px-4 py-2 text-xs font-mono text-t3 uppercase tracking-[0.05em] border-b border-b1">
            <div>Nome</div><div>Plataforma</div><div>Nicho</div><div>Ads</div><div>Dias</div><div>Status</div><div className="text-right">Ações</div>
          </div>
          {offers.map((offer) => (
            <div key={offer.id} className="grid grid-cols-[1fr_100px_120px_80px_80px_80px_160px] gap-3 px-4 py-3 bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all items-center">
              <div>
                <div className="text-sm font-syne font-700 text-t1 truncate">{offer.name}</div>
                <div className="text-xs font-mono text-t3">{offer.product_type}</div>
              </div>
              <div className="text-xs font-mono text-t2 uppercase">{offer.platform}</div>
              <div className="text-xs font-mono text-t2 truncate">{offer.niche}</div>
              <div className="text-sm font-syne font-700 text-t1">{offer.num_ads}</div>
              <div className="text-sm font-syne font-700 text-t1">{offer.days_active}</div>
              <div>
                <span className={`text-xs font-mono px-2 py-1 rounded-[2px] uppercase tracking-[0.05em] ${
                  offer.momentum_tag === 'hot' || offer.momentum_tag === 'escalating'
                    ? 'bg-rd border border-red text-red' : 'bg-s1 border border-b1 text-t3'}`}>
                  {offer.momentum_tag ?? offer.status}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <Link href={`/oferta/${offer.id}`}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all">
                  Ver
                </Link>
                <Link href={`/admin/oferta/${offer.id}`}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all">
                  Criativos
                </Link>
                <button onClick={() => openEdit(offer)}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all">
                  Editar
                </button>
                {deleteConfirm === offer.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(offer.id)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-red text-bg rounded-[2px] hover:opacity-90 transition-all">
                      Confirmar
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 rounded-[2px] hover:text-t1 transition-all">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(offer.id)}
                    className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 hover:border-red hover:text-red rounded-[2px] transition-all">
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-bg bg-opacity-80 z-50 flex items-start justify-center pt-16 px-4 overflow-y-auto">
          <div className="bg-s2 border border-b1 rounded-[2px] w-full max-w-2xl p-6 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-syne font-900 text-t1">{editingId ? 'Editar Oferta' : 'Nova Oferta'}</h2>
              <button onClick={() => setShowForm(false)} className="text-t3 hover:text-t1 transition-colors text-xl font-mono">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><FormField label="Nome da Oferta" value={form.name} onChange={set('name')} /></div>
                <FormSelect label="Plataforma" value={form.platform} options={PLATFORMS} onChange={set('platform')} />
                <FormSelect label="Tipo de Produto" value={form.product_type} options={PRODUCT_TYPES} onChange={set('product_type')} />
                <FormField label="Nicho" value={form.niche} onChange={set('niche')} />
                <FormField label="Estrutura" value={form.structure ?? ''} onChange={set('structure')} />
                <FormSelect label="Idioma" value={form.language ?? 'pt'} options={LANGUAGES} onChange={set('language')} />
                <FormSelect label="Status" value={form.status ?? 'active'} options={STATUSES} onChange={set('status')} />
                <FormField label="Num. Anúncios" type="number" value={form.num_ads ?? 0} onChange={set('num_ads')} />
                <FormField label="Num. Cliques" type="number" value={form.num_clicks ?? 0} onChange={set('num_clicks')} />
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Thumbnail</label>
                  <label
                    className={`relative flex flex-col items-center justify-center w-full rounded-[2px] border-2 border-dashed transition-all cursor-pointer ${
                      uploading ? 'opacity-50 cursor-not-allowed' :
                      dragOver ? 'border-red bg-rd' : 'border-b2 bg-s1 hover:border-b2 hover:bg-s2'
                    } ${form.thumbnail_url ? 'h-40' : 'h-28'}`}
                    onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault()
                      setDragOver(false)
                      if (uploading) return
                      const file = e.dataTransfer.files?.[0]
                      if (!file) return
                      setUploading(true)
                      try {
                        const url = await uploadImage(file)
                        setForm((f) => ({ ...f, thumbnail_url: url }))
                      } catch (err: unknown) {
                        setFormError(err instanceof Error ? err.message : 'Erro no upload')
                      } finally { setUploading(false) }
                    }}
                  >
                    {form.thumbnail_url ? (
                      <>
                        <img src={form.thumbnail_url} alt="thumb" className="h-full w-full object-contain rounded-[2px]" />
                        <div className="absolute inset-0 bg-bg bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center gap-3 opacity-0 hover:opacity-100 rounded-[2px]">
                          <span className="text-xs font-mono text-t1 uppercase tracking-[0.05em]">Trocar</span>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setForm((f) => ({ ...f, thumbnail_url: '' })) }}
                            className="text-xs font-mono text-red uppercase tracking-[0.05em] hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
                        <div className="text-2xl text-t3">{uploading ? '⟳' : '↑'}</div>
                        <div className="text-xs font-mono text-t2 uppercase tracking-[0.05em]">
                          {uploading ? 'Enviando...' : 'Arraste ou clique para enviar'}
                        </div>
                        <div className="text-xs font-mono text-t3">JPEG · PNG · WebP · GIF · máx 5 MB</div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const url = await uploadImage(file)
                          setForm((f) => ({ ...f, thumbnail_url: url }))
                        } catch (err: unknown) {
                          setFormError(err instanceof Error ? err.message : 'Erro no upload')
                        } finally { setUploading(false); e.target.value = '' }
                      }}
                    />
                  </label>
                </div>
              </div>
              {formError && <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all disabled:opacity-50">
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Oferta'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-s3 border border-b2 text-t1 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:bg-s2 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Alertas ─────────────────────────────────────────────────────────────

function TabAlertas() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [newOfferId, setNewOfferId] = useState('')
  const [newType, setNewType] = useState('escalating')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.admin.listAlerts({ page, limit: ITEMS_PER_PAGE })
      setAlerts(res.data)
      setTotal(res.meta.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alertas')
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const updated = await api.admin.updateAlert(id, !current)
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_active: updated.is_active } : a))
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro ao atualizar') }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteAlert(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
      setTotal((t) => t - 1); setDeleteConfirm(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro ao deletar') }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setCreateError('')
    try {
      const alert = await api.admin.createAlert(newOfferId, newType)
      setAlerts((prev) => [alert, ...prev])
      setTotal((t) => t + 1); setShowCreate(false); setNewOfferId('')
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao criar alerta')
    } finally { setCreating(false) }
  }

  return (
    <div className="space-y-6">
      {error && <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{error}</div>}

      <div className="flex items-center justify-between">
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1 font-syne font-700">{total}</span> alertas
        </div>
        <button onClick={() => { setShowCreate(true); setCreateError('') }}
          className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all">
          + Novo Alerta
        </button>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
            Página <span className="text-t1 font-syne font-700">{page}</span> de <span className="text-t1 font-syne font-700">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${page === 1 ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'}`}>
              ← Anterior
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${page === totalPages ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'}`}>
              Próxima →
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3"><SkeletonListItem /><SkeletonListItem /><SkeletonListItem /></div>
      ) : alerts.length === 0 ? (
        <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
          <p className="text-sm font-syne font-700 text-t2">Nenhum alerta encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_140px_120px_80px_160px] gap-3 px-4 py-2 text-xs font-mono text-t3 uppercase tracking-[0.05em] border-b border-b1">
            <div>Oferta</div><div>Tipo</div><div>Usuário</div><div>Ativo</div><div className="text-right">Ações</div>
          </div>
          {alerts.map((alert) => (
            <div key={alert.id} className="grid grid-cols-[1fr_140px_120px_80px_160px] gap-3 px-4 py-3 bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all items-center">
              <div>
                <div className="text-sm font-syne font-700 text-t1 truncate">{alert.offer?.name ?? alert.offer_id}</div>
                <div className="text-xs font-mono text-t3">{alert.offer?.niche ?? ''}</div>
              </div>
              <div>
                <span className="text-xs font-mono px-2 py-1 rounded-[2px] uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2">
                  {alert.alert_type}
                </span>
              </div>
              <div className="text-xs font-mono text-t3 truncate">
                {(alert as unknown as { user?: { email: string } }).user?.email ?? '—'}
              </div>
              <div>
                <button onClick={() => toggleActive(alert.id, alert.is_active)}
                  className={`text-xs font-mono px-2 py-1 rounded-[2px] uppercase tracking-[0.05em] transition-all ${
                    alert.is_active ? 'bg-rd border border-red text-red hover:opacity-80' : 'bg-s1 border border-b1 text-t3 hover:border-b2'}`}>
                  {alert.is_active ? 'sim' : 'não'}
                </button>
              </div>
              <div className="flex gap-2 justify-end">
                {deleteConfirm === alert.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(alert.id)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-red text-bg rounded-[2px] hover:opacity-90 transition-all">
                      Confirmar
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 rounded-[2px] hover:text-t1 transition-all">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(alert.id)}
                    className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 hover:border-red hover:text-red rounded-[2px] transition-all">
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-bg bg-opacity-80 z-50 flex items-center justify-center px-4">
          <div className="bg-s2 border border-b1 rounded-[2px] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-syne font-900 text-t1">Novo Alerta</h2>
              <button onClick={() => setShowCreate(false)} className="text-t3 hover:text-t1 transition-colors text-xl font-mono">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="ID da Oferta (UUID)" value={newOfferId} onChange={setNewOfferId} />
              <FormSelect label="Tipo de Alerta" value={newType} options={ALERT_TYPES} onChange={setNewType} />
              {createError && <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{createError}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating || !newOfferId.trim()}
                  className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all disabled:opacity-50">
                  {creating ? 'Criando...' : 'Criar Alerta'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-6 py-3 bg-s3 border border-b2 text-t1 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:bg-s2 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Usuários ────────────────────────────────────────────────────────────

function TabUsuarios() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.admin.listUsers({ page, limit: ITEMS_PER_PAGE, q: search || undefined })
      setUsers(res.data)
      setTotal(res.meta.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const handleRoleChange = async (id: string, role: string) => {
    setSaving(true)
    try {
      const updated = await api.admin.updateUser(id, { role })
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: updated.role } : u))
      setEditingRole(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setTotal((t) => t - 1); setDeleteConfirm(null)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro ao deletar') }
  }

  return (
    <div className="space-y-6">
      {error && <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{error}</div>}

      <div className="flex items-center justify-between">
        <input
          type="text" placeholder="Buscar por email..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
        />
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <span className="text-t1 font-syne font-700">{total}</span> usuários
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
          <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
            Página <span className="text-t1 font-syne font-700">{page}</span> de <span className="text-t1 font-syne font-700">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${page === 1 ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'}`}>
              ← Anterior
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${page === totalPages ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'}`}>
              Próxima →
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3"><SkeletonListItem /><SkeletonListItem /><SkeletonListItem /></div>
      ) : users.length === 0 ? (
        <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
          <p className="text-sm font-syne font-700 text-t2">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_200px_100px_80px_160px] gap-3 px-4 py-2 text-xs font-mono text-t3 uppercase tracking-[0.05em] border-b border-b1">
            <div>Nome / Email</div><div>Criado em</div><div>Role</div><div>Verified</div><div className="text-right">Ações</div>
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_200px_100px_80px_160px] gap-3 px-4 py-3 bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all items-center">
              <div>
                <div className="text-sm font-syne font-700 text-t1 truncate">{u.name ?? '—'}</div>
                <div className="text-xs font-mono text-t3 truncate">{u.email}</div>
              </div>
              <div className="text-xs font-mono text-t3">
                {new Date(u.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <div>
                {editingRole === u.id ? (
                  <div className="flex gap-1">
                    <select
                      defaultValue={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={saving}
                      className="px-2 py-1 bg-s1 border border-b2 rounded-[2px] text-xs font-mono text-t1 focus:outline-none"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <button onClick={() => setEditingRole(null)} className="text-t3 hover:text-t1 text-xs font-mono">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingRole(u.id)}
                    className={`text-xs font-mono px-2 py-1 rounded-[2px] uppercase tracking-[0.05em] transition-all hover:border-b2 ${
                      u.role === 'admin' ? 'bg-rd border border-red text-red' : 'bg-s1 border border-b1 text-t2'}`}>
                    {u.role}
                  </button>
                )}
              </div>
              <div>
                <span className={`text-xs font-mono px-2 py-1 rounded-[2px] uppercase ${u.email_verified ? 'text-t2' : 'text-t3'}`}>
                  {u.email_verified ? 'sim' : 'não'}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                {deleteConfirm === u.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-red text-bg rounded-[2px] hover:opacity-90 transition-all">
                      Confirmar
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 rounded-[2px] hover:text-t1 transition-all">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(u.id)}
                    className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 hover:border-red hover:text-red rounded-[2px] transition-all">
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'ofertas' | 'alertas' | 'usuarios'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'ofertas', label: 'Ofertas' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'usuarios', label: 'Usuários' },
]

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  if (authLoading) return null

  if (!user) {
    router.push('/login')
    return null
  }

  if (user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="space-y-8">
          <h1 className="text-4xl font-syne font-900 text-t1">Admin</h1>
          <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
            <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⊘</div>
            <p className="text-sm font-syne font-700 text-t2 mb-1">Acesso negado</p>
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Esta área é restrita a administradores</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Painel Admin</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Gestão completa do sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-b1">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm font-mono uppercase tracking-[0.05em] transition-all border-b-2 -mb-px ${
                tab === id
                  ? 'border-red text-t1 font-700'
                  : 'border-transparent text-t3 hover:text-t2'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && <TabOverview />}
        {tab === 'ofertas' && <TabOfertas />}
        {tab === 'alertas' && <TabAlertas />}
        {tab === 'usuarios' && <TabUsuarios />}
      </div>
    </AppLayout>
  )
}
