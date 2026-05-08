'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { api, uploadImage, Offer, Creative, CreativeBody } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const CREATIVE_TYPES = ['vsl', 'banner', 'email', 'landing', 'sales-page']
const PLATFORMS = ['meta', 'tiktok', 'google', 'youtube', 'kwai', 'outros']

const emptyCreative: CreativeBody = {
  url: '',
  type: 'vsl',
  platform: 'meta',
  headline: '',
  thumbnail_url: '',
  num_likes: 0,
  num_comments: 0,
  num_views: 0,
}

function extractYtId(url: string) {
  return url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? null
}

export default function AdminOfertaPage() {
  const params = useParams()
  const offerId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [offer, setOffer] = useState<Offer | null>(null)
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreativeBody>(emptyCreative)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [offerData, creativesData] = await Promise.all([
        api.offers.getById(offerId),
        api.admin.listCreatives(offerId),
      ])
      setOffer(offerData)
      setCreatives(creativesData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [offerId])

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') load()
    else if (!authLoading) setLoading(false)
  }, [authLoading, user, load])

  if (authLoading) return null
  if (!user) { router.push('/login'); return null }
  if (user.role !== 'admin') { router.push('/admin'); return null }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyCreative)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (c: Creative) => {
    setEditingId(c.id)
    setForm({ url: c.url, type: c.type, platform: c.platform, headline: c.headline ?? '',
      thumbnail_url: c.thumbnail_url ?? '',
      num_likes: c.num_likes, num_comments: c.num_comments, num_views: c.num_views })
    setFormError('')
    setShowForm(true)
  }

  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload: CreativeBody = {
        ...form,
        headline: form.headline || null,
        thumbnail_url: form.thumbnail_url || null,
      }
      if (editingId) {
        const updated = await api.admin.updateCreative(editingId, payload)
        setCreatives((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
      } else {
        const created = await api.admin.createCreative(offerId, payload)
        setCreatives((prev) => [created, ...prev])
      }
      setShowForm(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteCreative(id)
      setCreatives((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    }
  }

  const field = (key: keyof CreativeBody, label: string) => (
    <div>
      <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">{label}</label>
      <input
        type="text"
        value={String(form[key] ?? '')}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
      />
    </div>
  )

  const select = (key: keyof CreativeBody, label: string, options: string[]) => (
    <div>
      <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">{label}</label>
      <select
        value={String(form[key] ?? '')}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
          <Link href="/admin" className="text-red hover:text-red transition-colors">Admin</Link>
          <span className="mx-2">/</span>
          <span className="text-t1">Criativos</span>
        </div>

        {offer && (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-syne font-900 text-t1 mb-2">{offer.name}</h1>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase text-t2">{offer.platform}</span>
                <span className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase text-t2">{offer.niche}</span>
                <span className={`px-3 py-1 rounded-[2px] border text-xs font-mono uppercase ${
                  offer.momentum_tag === 'hot' || offer.momentum_tag === 'escalating'
                    ? 'bg-rd border-red text-red' : 'bg-s1 border-b1 text-t2'
                }`}>{offer.momentum_tag}</span>
                <Link
                  href={`/oferta/${offer.id}`}
                  className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase text-t2 hover:border-b2 hover:text-t1 transition-all"
                >
                  Ver oferta →
                </Link>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all"
            >
              + Novo Criativo
            </button>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{error}</div>
        )}

        {/* Stats */}
        {offer && (
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <div className="bg-s2 px-6 py-5 border-r border-b1">
              <div className="text-3xl font-syne font-900 text-t1 mb-2">{creatives.length}</div>
              <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Criativos</div>
            </div>
            <div className="bg-s2 px-6 py-5 border-r border-b1">
              <div className="text-3xl font-syne font-900 text-t1 mb-2">{offer.num_ads}</div>
              <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Anúncios</div>
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
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-bg bg-opacity-80 z-50 flex items-start justify-center pt-16 px-4 overflow-y-auto">
            <div className="bg-s2 border border-b1 rounded-[2px] w-full max-w-lg p-6 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-syne font-900 text-t1">
                  {editingId ? 'Editar Criativo' : 'Novo Criativo'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-t3 hover:text-t1 transition-colors text-xl font-mono">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">URL do Criativo</label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => {
                      const url = e.target.value
                      setForm((f) => {
                        const ytId = extractYtId(url)
                        return { ...f, url, thumbnail_url: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : f.thumbnail_url }
                      })
                    }}
                    className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all"
                  />
                </div>
                {select('type', 'Tipo', CREATIVE_TYPES)}
                {select('platform', 'Plataforma', PLATFORMS)}
                {field('headline', 'Headline (opcional)')}
                <div>
                  <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Capa do Vídeo</label>
                  <div className="flex items-center gap-3">
                    {form.thumbnail_url && (
                      <img src={form.thumbnail_url} alt="capa" className="w-20 h-14 object-cover rounded-[2px] border border-b1 flex-shrink-0" />
                    )}
                    <label className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] border cursor-pointer transition-all ${uploadingThumb ? 'bg-s1 border-b1 text-t3 cursor-not-allowed' : 'bg-s3 border-b2 text-t1 hover:bg-s2'}`}>
                      {uploadingThumb ? 'Enviando...' : form.thumbnail_url ? 'Trocar capa' : 'Upload capa'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingThumb}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploadingThumb(true)
                          try {
                            const url = await uploadImage(file)
                            setForm((f) => ({ ...f, thumbnail_url: url }))
                          } catch (err: unknown) {
                            setFormError(err instanceof Error ? err.message : 'Erro no upload')
                          } finally { setUploadingThumb(false); e.target.value = '' }
                        }}
                      />
                    </label>
                    {form.thumbnail_url && (
                      <button type="button" onClick={() => setForm((f) => ({ ...f, thumbnail_url: '' }))}
                        className="text-xs font-mono text-t3 hover:text-red transition-colors">remover</button>
                    )}
                  </div>
                  <p className="text-xs font-mono text-t3 mt-2">YouTube preenche automaticamente. Para TikTok, Instagram e Facebook faça upload da capa manualmente.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Curtidas</label>
                    <input type="number" min="0" value={form.num_likes ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, num_likes: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Comentários</label>
                    <input type="number" min="0" value={form.num_comments ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, num_comments: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Visualizações</label>
                    <input type="number" min="0" value={form.num_views ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, num_views: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-s1 border border-b1 rounded-[2px] text-sm font-mono text-t1 focus:outline-none focus:border-b2 transition-all" />
                  </div>
                </div>

                {formError && (
                  <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">{formError}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Criativo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-s3 border border-b2 text-t1 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:bg-s2 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Creatives list */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-s2 border border-b1 rounded-[2px] animate-pulse" />
            <div className="h-16 bg-s2 border border-b1 rounded-[2px] animate-pulse" />
          </div>
        ) : creatives.length === 0 ? (
          <div className="bg-s2 border border-b1 rounded-[2px] p-12 text-center">
            <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
            <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhum criativo cadastrado</p>
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              Clique em &quot;Novo Criativo&quot; para adicionar
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_100px_100px_1fr_160px] gap-3 px-4 py-2 text-xs font-mono text-t3 uppercase tracking-[0.05em] border-b border-b1">
              <div>URL</div>
              <div>Tipo</div>
              <div>Plataforma</div>
              <div>Headline</div>
              <div className="text-right">Ações</div>
            </div>

            <div className="space-y-2">
              {creatives.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[1fr_100px_100px_1fr_160px] gap-3 px-4 py-3 bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all items-center"
                >
                  <div className="text-xs font-mono text-t2 truncate">{c.url}</div>
                  <div className="text-xs font-mono text-t2 uppercase">{c.type}</div>
                  <div className="text-xs font-mono text-t2 uppercase">{c.platform}</div>
                  <div className="text-xs font-mono text-t3 truncate">{c.headline ?? '—'}</div>
                  <div className="flex gap-2 justify-end">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all"
                    >
                      Abrir
                    </a>
                    <button
                      onClick={() => openEdit(c)}
                      className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t2 hover:border-b2 hover:text-t1 rounded-[2px] transition-all"
                    >
                      Editar
                    </button>
                    {deleteConfirm === c.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="px-3 py-1 text-xs font-mono uppercase bg-red text-bg rounded-[2px] hover:opacity-90 transition-all"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-mono uppercase bg-s1 border border-b1 text-t3 rounded-[2px] hover:text-t1 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
                        className="px-3 py-1 text-xs font-mono uppercase tracking-[0.05em] bg-s1 border border-b1 text-t3 hover:border-red hover:text-red rounded-[2px] transition-all"
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div>
          <Link
            href="/admin"
            className="px-6 py-3 bg-s3 border border-b2 font-mono text-sm uppercase tracking-[0.05em] rounded-[2px] transition-all hover:bg-s2 text-t1"
          >
            ← Voltar ao Admin
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
