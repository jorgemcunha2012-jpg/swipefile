'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { api, SystemNotification } from '@/lib/api'

interface Toast extends SystemNotification {
  toastId: string
  exiting: boolean
}

const STORAGE_KEY_SEEN = 'sv_seen_notif'
const STORAGE_KEY_MUTED = 'sv_notifications_muted'
export const STORAGE_KEY_NEW = 'sv_new_offers'
const POLL_INTERVAL = 5 * 60_000
const BELL_WINDOW_H = 24

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function playDing() {
  try {
    const ctx = new AudioContext()
    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur)
    }
    play(1318, 0, 0.35)
    play(1568, 0.18, 0.45)
    setTimeout(() => ctx.close(), 1200)
  } catch {}
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const lastIdRef = useRef<string | null>(null)
  const firstPollRef = useRef(true)

  useEffect(() => {
    setMuted(localStorage.getItem(STORAGE_KEY_MUTED) === '1')
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SEEN) || '[]')
      setReadIds(new Set(saved))
    } catch {}
  }, [])

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const poll = useCallback(async () => {
    try {
      const since = new Date(Date.now() - BELL_WINDOW_H * 3_600_000).toISOString()
      const rows = await api.notifications.list({ since, limit: 50 })
      if (!rows.length) { firstPollRef.current = false; return }

      const newestId = rows[0].id

      if (firstPollRef.current) {
        // Primeira carga: marca tudo como lido silenciosamente
        lastIdRef.current = newestId
        setNotifications(rows)
        setReadIds((prev) => {
          const next = new Set([...prev, ...rows.map((r) => r.id)])
          try { localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify([...next].slice(-500))) } catch {}
          return next
        })
        firstPollRef.current = false
        return
      }

      // Polls seguintes: identifica notificações novas desde o último poll
      const fresh = lastIdRef.current
        ? rows.filter((r) => r.id !== lastIdRef.current && new Date(r.createdAt) > new Date(rows.find(x => x.id === lastIdRef.current)?.createdAt ?? 0))
        : []

      lastIdRef.current = newestId
      setNotifications(rows)

      if (fresh.length > 0) {
        if (!muted) playDing()

        // Dispara toasts flutuantes (máx 3 simultâneos)
        const newToasts: Toast[] = fresh.slice(0, 3).map((n) => ({
          ...n,
          toastId: crypto.randomUUID(),
          exiting: false,
        }))
        setToasts((prev) => [...newToasts, ...prev].slice(0, 5))

        // Auto-dismiss: inicia saída após 5s, remove após 5.4s
        newToasts.forEach((t) => {
          setTimeout(() => {
            setToasts((prev) => prev.map((x) => x.toastId === t.toastId ? { ...x, exiting: true } : x))
            setTimeout(() => {
              setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId))
            }, 400)
          }, 5000)
        })

        // Salva timestamps para o selo "Nova" no radar
        try {
          const map: Record<string, number> = JSON.parse(localStorage.getItem(STORAGE_KEY_NEW) || '{}')
          const now = Date.now()
          for (const n of fresh) if (n.offer_id) map[n.offer_id] = now
          localStorage.setItem(STORAGE_KEY_NEW, JSON.stringify(map))
        } catch {}
      }
    } catch {}
  }, [muted])

  useEffect(() => {
    poll()
    const timer = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [poll])

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.map((x) => x.toastId === toastId ? { ...x, exiting: true } : x))
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.toastId !== toastId)), 400)
  }

  const unread = notifications.filter((n) => !readIds.has(n.id)).length

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    localStorage.setItem(STORAGE_KEY_MUTED, next ? '1' : '0')
  }

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set([...prev, ...notifications.map((n) => n.id)])
      try { localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify([...next].slice(-500))) } catch {}
      return next
    })
  }

  const clearAll = () => setNotifications([])

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open && unread > 0) markAllRead() }}
        className="relative flex items-center justify-center w-8 h-8 rounded-[2px] hover:bg-s3 transition-all"
        title="Notificações"
      >
        {/* Bell icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={unread > 0 ? 'text-red' : 'text-t2'}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red text-bg text-[9px] font-mono font-bold flex items-center justify-center rounded-full">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-s2 border border-b2 rounded-[2px] shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-b1">
            <span className="text-xs font-mono text-t1 uppercase tracking-[0.05em]">
              Alertas {notifications.length > 0 && <span className="text-t3">({notifications.length})</span>}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                title={muted ? 'Ativar som' : 'Silenciar'}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-t3 hover:text-t1 hover:bg-s3 rounded-[2px] transition-all"
              >
                {muted ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                    Ativar som
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <line x1="23" y1="9" x2="17" y2="15"/>
                      <line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                    Silenciar
                  </>
                )}
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-2 py-1 text-xs font-mono text-t3 hover:text-t1 hover:bg-s3 rounded-[2px] transition-all"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-mono text-t3">Nenhuma notificação</p>
                <p className="text-xs font-mono text-t3 mt-1 opacity-60">Novas ofertas escalando aparecerão aqui</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = readIds.has(n.id)
                return (
                  <Link
                    key={n.id}
                    href={`/oferta/${n.offer_id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-b1 hover:bg-s3 transition-all ${isRead ? '' : 'bg-rd'}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-1 ${isRead ? 'bg-t3' : 'bg-red'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-t1 line-clamp-1 mb-1">{n.offer?.name ?? '—'}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-t3 uppercase tracking-[0.05em]">
                        <span className="text-red">Escalando</span>
                        <span>•</span>
                        <span>{n.offer?.niche ?? ''}</span>
                        <span>•</span>
                        <span>{n.offer?.platform ?? ''}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-t3 flex-shrink-0">
                      {relativeTime(n.createdAt)}
                    </span>
                  </Link>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-b1 flex items-center justify-between">
            <span className="text-[10px] font-mono text-t3">Últimas 24h · atualiza 5min</span>
            <Link
              href="/alertas"
              onClick={() => setOpen(false)}
              className="text-[10px] font-mono text-t2 hover:text-red transition-colors uppercase tracking-[0.05em]"
            >
              Ver todos alertas →
            </Link>
          </div>
        </div>
      )}

      {/* Toasts flutuantes */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.toastId}
              style={{
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                opacity: t.exiting ? 0 : 1,
                transform: t.exiting ? 'translateX(110%)' : 'translateX(0)',
              }}
              className="pointer-events-auto w-80 bg-s2 border border-red rounded-[2px] shadow-2xl overflow-hidden"
            >
              {/* barra de progresso */}
              <div
                className="h-0.5 bg-red origin-left"
                style={{ animation: t.exiting ? 'none' : 'shrink 5s linear forwards' }}
              />
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 w-2 h-2 rounded-full bg-red animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-red uppercase tracking-[0.05em]">Nova oferta escalando</span>
                  </div>
                  <Link
                    href={`/oferta/${t.offer_id}`}
                    onClick={() => dismissToast(t.toastId)}
                    className="text-sm font-syne font-700 text-t1 line-clamp-1 hover:text-red transition-colors"
                  >
                    {t.offer?.name ?? '—'}
                  </Link>
                  <p className="text-[10px] font-mono text-t3 mt-0.5 uppercase tracking-[0.05em]">
                    {t.offer?.platform ?? ''} · {t.offer?.niche ?? ''} · {t.offer?.num_ads ?? 0} ads
                  </p>
                </div>
                <button
                  onClick={() => dismissToast(t.toastId)}
                  className="flex-shrink-0 text-t3 hover:text-t1 transition-colors text-xs font-mono leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
