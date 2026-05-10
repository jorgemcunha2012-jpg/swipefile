const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

let _accessToken: string | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
  }
}

export function getAccessToken(): string | null {
  if (!_accessToken && typeof window !== 'undefined') {
    _accessToken = localStorage.getItem('access_token')
  }
  return _accessToken
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401) {
    try {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json()
        setAccessToken(accessToken)
        const retryRes = await fetch(`${API_URL}/api${path}`, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        })
        if (retryRes.status === 204) return undefined as T
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({}))
          throw new Error(err.message || 'Request failed')
        }
        return retryRes.json()
      }
    } catch {
      setAccessToken(null)
    }
    throw new Error('Unauthorized')
  }

  if (res.status === 204) return undefined as T
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Offer {
  id: string
  name: string
  platform: string
  product_type: string
  niche: string
  structure: string | null
  language: string
  status: string
  num_ads: number
  num_creatives: number
  num_clicks: number
  days_active: number
  momentum_tag: string | null
  thumbnail_url: string | null
  click_url: string | null
  external_id: string | null
  low_ticket: boolean | null
  etv: number | null
  detected_at: string
  createdAt: string
  updatedAt: string
  creatives?: Creative[]
}

export interface Creative {
  id: string
  offer_id: string
  url: string
  type: string
  platform: string
  headline: string | null
  thumbnail_url: string | null
  num_likes: number
  num_comments: number
  num_views: number
}

export interface NichoStats {
  niche: string
  offer_count: number
  total_ads: number
  total_clicks: number
  avg_days_active: number
  hot_count: number
  escalating_count: number
  dropshipping_count: number
  infoproduto_count: number
  hot_type_count: number
}

export interface NichoDetail {
  summary: NichoStats
  offers: Offer[]
}

export interface PaginatedResult<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export interface Alert {
  id: string
  user_id: string
  offer_id: string
  alert_type: string
  is_active: boolean
  createdAt: string
  updatedAt: string
  offer?: Pick<Offer, 'id' | 'name' | 'platform' | 'product_type' | 'niche'>
}

export interface AlertLog {
  id: string
  alert_id: string
  offer_id: string
  alert_type: string
  details: Record<string, unknown>
  triggered_at: string
}

export interface SavedItem {
  id: string
  user_id: string
  offer_id: string
  createdAt: string
  updatedAt: string
  offer?: Offer
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  plan: 'free' | 'pro' | 'ultra'
}

export interface OfferBody {
  name: string
  platform: string
  product_type: string
  niche: string
  structure?: string
  language?: string
  status?: string
  num_ads?: number
  num_creatives?: number
  num_clicks?: number
  thumbnail_url?: string | null
  click_url?: string | null
  detected_at?: string
}

export interface CreativeBody {
  url: string
  type: string
  platform: string
  headline?: string | null
  thumbnail_url?: string | null
  num_likes?: number
  num_comments?: number
  num_views?: number
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  email_verified: boolean
  createdAt: string
}

export interface SystemNotification {
  id: string
  type: string
  offer_id: string
  createdAt: string
  offer?: Pick<Offer, 'id' | 'name' | 'niche' | 'platform' | 'momentum_tag' | 'num_ads'>
}

export interface AdminStats {
  active_offers: number
  total_offers: number
  total_users: number
  total_alerts: number
  active_alerts: number
  total_saves: number
  total_creatives: number
  hot_offers: number
  escalating_offers: number
}

export interface OfferListParams {
  page?: number
  limit?: number
  product_type?: string
  platform?: string
  niche?: string
  momentum_tag?: string
  language?: string
  status?: string
  q?: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

function toQs(params: Record<string, unknown>): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export async function uploadImage(file: File): Promise<string> {
  const token = getAccessToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || 'Falha no upload')
  }
  const { url } = await res.json()
  return url
}

export const api = {
  offers: {
    list: (params: OfferListParams = {}) =>
      request<PaginatedResult<Offer>>(`/offers${toQs(params as Record<string, unknown>)}`),

    getById: (id: string) =>
      request<Offer>(`/offers/${id}`),

    getNichos: () =>
      request<NichoStats[]>('/offers/nichos'),

    getNichoById: (niche: string) =>
      request<NichoDetail>(`/offers/nichos/${encodeURIComponent(niche)}`),

    getTrending: (limit = 20) =>
      request<Offer[]>(`/offers/trending?limit=${limit}`),
  },

  auth: {
    login: (email: string, password: string) =>
      request<{ user: User; accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (name: string, email: string, password: string) =>
      request<{ user: User; accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),

    me: () =>
      request<{ user: User }>('/auth/me'),

    logout: () =>
      request<void>('/auth/logout', { method: 'POST' }),

    refresh: () =>
      request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),
  },

  alerts: {
    list: () => request<Alert[]>('/alerts'),

    create: (offer_id: string, alert_type: string) =>
      request<Alert>('/alerts', {
        method: 'POST',
        body: JSON.stringify({ offer_id, alert_type }),
      }),

    update: (id: string, is_active: boolean) =>
      request<Alert>(`/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active }),
      }),

    remove: (id: string) =>
      request<void>(`/alerts/${id}`, { method: 'DELETE' }),

    getLogs: (params: { page?: number; limit?: number; offer_id?: string } = {}) =>
      request<PaginatedResult<AlertLog>>(`/alerts/logs${toQs(params as Record<string, unknown>)}`),
  },

  admin: {
    getStats: () =>
      request<AdminStats>('/admin/stats'),

    // Ofertas
    createOffer: (data: OfferBody) =>
      request<Offer>('/admin/offers', { method: 'POST', body: JSON.stringify(data) }),
    updateOffer: (id: string, data: Partial<OfferBody>) =>
      request<Offer>(`/admin/offers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteOffer: (id: string) =>
      request<void>(`/admin/offers/${id}`, { method: 'DELETE' }),

    // Criativos
    listCreatives: (offerId: string) =>
      request<Creative[]>(`/admin/offers/${offerId}/creatives`),
    createCreative: (offerId: string, data: CreativeBody) =>
      request<Creative>(`/admin/offers/${offerId}/creatives`, { method: 'POST', body: JSON.stringify(data) }),
    updateCreative: (id: string, data: Partial<CreativeBody>) =>
      request<Creative>(`/admin/creatives/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCreative: (id: string) =>
      request<void>(`/admin/creatives/${id}`, { method: 'DELETE' }),

    // Usuários
    listUsers: (params: { page?: number; limit?: number; q?: string } = {}) =>
      request<PaginatedResult<AdminUser>>(`/admin/users${toQs(params as Record<string, unknown>)}`),
    updateUser: (id: string, data: { role?: string; name?: string }) =>
      request<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
      request<void>(`/admin/users/${id}`, { method: 'DELETE' }),

    // Alertas
    listAlerts: (params: { page?: number; limit?: number; offer_id?: string } = {}) =>
      request<PaginatedResult<Alert>>(`/admin/alerts${toQs(params as Record<string, unknown>)}`),
    createAlert: (offer_id: string, alert_type: string) =>
      request<Alert>('/admin/alerts', { method: 'POST', body: JSON.stringify({ offer_id, alert_type }) }),
    updateAlert: (id: string, is_active: boolean) =>
      request<Alert>(`/admin/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    deleteAlert: (id: string) =>
      request<void>(`/admin/alerts/${id}`, { method: 'DELETE' }),
  },

  notifications: {
    list: (params: { since?: string; limit?: number } = {}) =>
      request<SystemNotification[]>(`/notifications${toQs(params as Record<string, unknown>)}`),
  },

  status: {
    get: () => request<{ job: { lastRun: string | null; nextRun: string | null; running: boolean; intervalMs: number } }>('/status'),
  },

  savedItems: {
    list: () => request<SavedItem[]>('/saved-items'),

    create: (offer_id: string) =>
      request<SavedItem>('/saved-items', {
        method: 'POST',
        body: JSON.stringify({ offer_id }),
      }),

    remove: (id: string) =>
      request<void>(`/saved-items/${id}`, { method: 'DELETE' }),
  },

  stripe: {
    createCheckout: () =>
      request<{ url: string }>('/stripe/checkout', { method: 'POST' }),
  },
}
