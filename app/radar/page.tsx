'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkeletonCard, SkeletonStatBox, SkeletonChart } from '@/components/SkeletonLoader'
import { api, Offer } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { STORAGE_KEY_NEW } from '@/components/NotificationBell'

// Each blip's delay is computed from its clockwise angle from north so it
// appears exactly when the sweep line passes over it.
const SWEEP_S = 4

function blipDelay(topPct: number, leftPct: number) {
  const dx = leftPct - 50
  const dy = topPct - 50
  // clockwise angle from north: atan2(dx, -dy)
  const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
  return `${((deg / 360) * SWEEP_S).toFixed(2)}s`
}

const BLIPS = [
  { top: 22, left: 62 },
  { top: 58, left: 32 },
  { top: 72, left: 68 },
  { top: 28, left: 28 },
  { top: 42, left: 78 },
  { top: 68, left: 44 },
  { top: 18, left: 52 },
  { top: 82, left: 38 },
  { top: 35, left: 55 },
  { top: 50, left: 20 },
].map((b) => ({ ...b, delay: blipDelay(b.top, b.left) }))

function RadarScope({ running, detected, isLastTen }: { running: boolean; detected: number; isLastTen: boolean }) {
  const sweepDuration = isLastTen ? 0.7 : running ? 1.2 : SWEEP_S
  return (
    <div className="relative flex-shrink-0" style={{ width: 220, height: 220 }}>

      {/* Concentric rings */}
      {[100, 66, 33].map((pct, i) => (
        <div key={i} className="absolute rounded-full" style={{
          inset: `${(100 - pct) / 2}%`,
          border: `1px solid rgba(224,53,42,${0.08 + i * 0.04})`,
        }} />
      ))}

      {/* Cross hairs */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="w-full h-px" style={{ background: 'rgba(224,53,42,0.07)' }} />
      </div>
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="h-full w-px" style={{ background: 'rgba(224,53,42,0.07)' }} />
      </div>

      {/* Sweep trail (conic gradient) */}
      <div className="absolute inset-0 rounded-full overflow-hidden"
        style={{ animation: `radar-sweep ${sweepDuration}s linear infinite` }}>
        <div className="absolute inset-0 rounded-full" style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 210deg,
            rgba(224,53,42,0.03) 260deg,
            rgba(224,53,42,0.12) 310deg,
            rgba(224,53,42,0.45) 352deg,
            rgba(224,53,42,0.85) 358deg,
            rgba(255,90,80,1)    360deg
          )`,
        }} />
      </div>

      {/* Sweep tip — bright line from center to edge */}
      <div className="absolute inset-0 flex items-center pointer-events-none"
        style={{ animation: `radar-sweep ${sweepDuration}s linear infinite`, transformOrigin: 'center' }}>
        <div className="w-1/2 ml-auto" style={{
          height: isLastTen ? 3 : 2,
          background: 'linear-gradient(to right, transparent 0%, rgba(224,53,42,0.4) 40%, rgba(255,100,90,1) 100%)',
          boxShadow: isLastTen ? '0 0 12px 3px rgba(224,53,42,0.9)' : '0 0 6px 1px rgba(224,53,42,0.7)',
        }} />
      </div>

      {/* Blip markers — appear exactly as sweep passes over */}
      {BLIPS.map((b, i) => (
        <div key={i} className="absolute" style={{ top: `${b.top}%`, left: `${b.left}%` }}>
          {/* Diamond marker */}
          <div className="absolute bg-red" style={{
            width: 7, height: 7,
            boxShadow: '0 0 6px 2px rgba(224,53,42,0.8)',
            animation: `radar-blip ${SWEEP_S}s ${b.delay} ease-out infinite`,
          }} />
          {/* Expanding ring */}
          <div className="absolute rounded-full border border-red" style={{
            width: 6, height: 6,
            animation: `radar-ping ${SWEEP_S}s ${b.delay} ease-out infinite`,
          }} />
        </div>
      ))}

      {/* Center origin dot */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="rounded-full bg-red" style={{
          width: 8, height: 8,
          boxShadow: '0 0 10px 3px rgba(224,53,42,0.7)',
          animation: `pulse ${running ? '0.7s' : '2s'} ease-in-out infinite`,
        }} />
      </div>

      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full" style={{
        border: isLastTen ? '1px solid rgba(224,53,42,0.7)' : '1px solid rgba(224,53,42,0.25)',
        boxShadow: isLastTen
          ? '0 0 32px 6px rgba(224,53,42,0.35), inset 0 0 32px 6px rgba(224,53,42,0.15)'
          : '0 0 20px 2px rgba(224,53,42,0.1), inset 0 0 20px 2px rgba(224,53,42,0.05)',
        animation: isLastTen ? 'pulse 0.5s ease-in-out infinite' : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }} />

      {/* Detected count badge */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
        <div className="text-[10px] font-mono text-red uppercase tracking-[0.1em]">
          {detected} alvos
        </div>
      </div>
    </div>
  )
}

function useJobStatus() {
  const [nextRun, setNextRun] = useState<Date | null>(null)
  const [running, setRunning] = useState(false)
  const [justFinished, setJustFinished] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [isLastTen, setIsLastTen] = useState(false)
  const prevLastRunRef = useRef<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { job } = await api.status.get()
        setRunning(job.running)
        setNextRun(job.nextRun ? new Date(job.nextRun) : null)
        if (prevLastRunRef.current !== null && job.lastRun && prevLastRunRef.current !== job.lastRun) {
          setJustFinished(true)
          setTimeout(() => setJustFinished(false), 12_000)
        }
        prevLastRunRef.current = job.lastRun
      } catch {}
    }
    fetchStatus()
    const iv = setInterval(fetchStatus, 15_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!nextRun) return
    const HOUR = 3_600_000
    const tick = () => {
      let target = nextRun.getTime()
      const now = Date.now()
      while (target <= now) target += HOUR
      const diff = target - now
      if (diff <= 10_000) {
        setIsLastTen(true)
        setCountdown(String(Math.ceil(diff / 1000)))
      } else if (diff < HOUR) {
        setIsLastTen(false)
        const m = Math.floor(diff / 60_000)
        const s = Math.floor((diff % 60_000) / 1000)
        setCountdown(`${m}m ${s.toString().padStart(2, '0')}s`)
      } else {
        setIsLastTen(false)
        const h = Math.floor(diff / HOUR)
        const m = Math.floor((diff % HOUR) / 60_000)
        setCountdown(`${h}h ${m}m`)
      }
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [nextRun])

  return { countdown, running, justFinished, isLastTen }
}

interface ScanEntry {
  key: string
  name: string
  tag: string
  num_ads: number
  time: string
}

function ScanFeed({ offers }: { offers: Offer[] }) {
  const [log, setLog] = useState<ScanEntry[]>([])

  useEffect(() => {
    if (offers.length === 0) return
    const sorted = [...offers].sort((a, b) => {
      const rank: Record<string, number> = { escalating: 0, hot: 1 }
      return (rank[a.momentum_tag ?? ''] ?? 2) - (rank[b.momentum_tag ?? ''] ?? 2)
    })
    let idx = 0
    const add = () => {
      const o = sorted[idx % sorted.length]
      const t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setLog((prev) => [{ key: `${o.id}-${Date.now()}`, name: o.name, tag: o.momentum_tag ?? '', num_ads: o.num_ads, time: t }, ...prev].slice(0, 7))
      idx++
    }
    add()
    const timer = setInterval(add, 3500)
    return () => clearInterval(timer)
  }, [offers])

  if (log.length === 0) return null

  return (
    <div className="border-t border-b1 pt-3 mt-1">
      <div className="text-[10px] font-mono text-t3 uppercase tracking-[0.1em] mb-2 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-red animate-pulse inline-block" />
        Log de varredura
      </div>
      <div className="space-y-1.5">
        {log.map((entry, i) => (
          <div
            key={entry.key}
            className="flex items-center gap-2 font-mono text-xs"
            style={{ opacity: i === 0 ? 1 : Math.max(0.12, 1 - i * 0.18), transition: 'opacity 0.4s' }}
          >
            <span className="text-t3 text-[10px] flex-shrink-0 tabular-nums">{entry.time}</span>
            <span className={`flex-shrink-0 text-[10px] ${entry.tag === 'escalating' || entry.tag === 'hot' ? 'text-red' : 'text-t3'}`}>▸</span>
            <span className={`truncate ${i === 0 ? 'text-t1' : 'text-t2'}`}>{entry.name}</span>
            <span className="text-t3 text-[10px] flex-shrink-0 ml-auto">{entry.num_ads > 0 ? `${entry.num_ads} ads` : ''}</span>
            {(entry.tag === 'escalating' || entry.tag === 'hot') && i < 3 && (
              <span className="text-red text-[9px] flex-shrink-0 uppercase tracking-[0.05em]">{entry.tag}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 10

export default function RadarPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterNiche, setFilterNiche] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterMomentum, setFilterMomentum] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [allNiches, setAllNiches] = useState<string[]>([])
  const [allPlatforms, setAllPlatforms] = useState<string[]>([])
  const [contextMenu, setContextMenu] = useState<{ offer: Offer; x: number; y: number } | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()
  const [newOfferIds, setNewOfferIds] = useState<Set<string>>(new Set())

  const loadOffers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.offers.list({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        niche: filterNiche || undefined,
        platform: filterPlatform || undefined,
        momentum_tag: filterMomentum || undefined,
        q: searchTerm || undefined,
        status: 'active',
      })
      setOffers(result.data)
      setTotal(result.meta.total)
    } catch (err) {
      console.error('Error loading offers:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterNiche, filterPlatform, filterMomentum, searchTerm])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  useEffect(() => {
    api.offers.getNichos().then((nichos) => {
      setAllNiches(nichos.map((n) => n.niche).sort())
    }).catch(() => {})
  }, [])

  useEffect(() => {
    api.offers.list({ limit: 100, status: 'active' }).then((res) => {
      const platforms = [...new Set(res.data.map((o) => o.platform))].sort()
      setAllPlatforms(platforms)
    }).catch(() => {})
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterNiche, filterPlatform, filterMomentum, searchTerm])

  // Selo "Nova" — lê timestamps do localStorage e expira após 4 minutos
  useEffect(() => {
    const NEW_TTL = 4 * 60 * 1000
    const check = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_NEW)
        if (!raw) return
        const map: Record<string, number> = JSON.parse(raw)
        const now = Date.now()
        const active = new Set(
          Object.entries(map)
            .filter(([, ts]) => now - ts < NEW_TTL)
            .map(([id]) => id)
        )
        setNewOfferIds(active)
      } catch {}
    }
    check()
    const timer = setInterval(check, 30_000)
    return () => clearInterval(timer)
  }, [])

  // Fecha o menu ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!contextMenu) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

  const handleContextMenu = (e: React.MouseEvent, offer: Offer) => {
    e.preventDefault()
    const x = Math.min(e.clientX, window.innerWidth - 220)
    const y = Math.min(e.clientY, window.innerHeight - 120)
    setContextMenu({ offer, x, y })
  }

  const handleNotInterested = () => {
    if (!contextMenu) return
    setHiddenIds((prev) => new Set([...prev, contextMenu.offer.id]))
    setContextMenu(null)
  }

  const handleSave = async () => {
    if (!contextMenu) return
    const offer = contextMenu.offer
    setContextMenu(null)
    if (savedIds.has(offer.id)) return
    setSavingId(offer.id)
    try {
      await api.savedItems.create(offer.id)
      setSavedIds((prev) => new Set([...prev, offer.id]))
    } catch {
      // silencia — usuário pode não estar logado
    } finally {
      setSavingId(null)
    }
  }

  const { countdown, running, justFinished, isLastTen } = useJobStatus()
  const [banner, setBanner] = useState<{ msg: string; type: 'loading' | 'result' } | null>(null)
  const prevTotalRef = useRef(0)

  useEffect(() => {
    if (!justFinished) return
    prevTotalRef.current = total
    setBanner({ msg: 'Varrendo novas ofertas...', type: 'loading' })
    api.offers.list({
      page: currentPage, limit: ITEMS_PER_PAGE,
      niche: filterNiche || undefined, platform: filterPlatform || undefined,
      momentum_tag: filterMomentum || undefined, q: searchTerm || undefined,
      status: 'active',
    }).then(res => {
      setOffers(res.data)
      setTotal(res.meta.total)
      const diff = res.meta.total - prevTotalRef.current
      const msg = diff > 0
        ? `+${diff} nova${diff !== 1 ? 's' : ''} oferta${diff !== 1 ? 's' : ''} detectada${diff !== 1 ? 's' : ''}`
        : 'Varredura concluída — sem novas ofertas'
      setBanner({ msg, type: 'result' })
      setTimeout(() => setBanner(null), 7000)
    }).catch(() => setBanner(null))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justFinished])


  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const stats = {
    total,
    escalating: offers.filter((o) => o.momentum_tag === 'escalating').length,
    totalAds: offers.reduce((s, o) => s + o.num_ads, 0),
    avgDaysActive: offers.length > 0
      ? Math.round(offers.reduce((s, o) => s + o.days_active, 0) / offers.length)
      : 0,
  }

  if (loading && offers.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Radar</h1>
            <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">Carregando ofertas...</p>
          </div>
          <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
            <SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox /><SkeletonStatBox />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SkeletonChart /><SkeletonChart /><SkeletonChart />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* Remessa banner */}
        {banner && (
          <div className={`flex items-center gap-3 px-4 py-2 rounded-[2px] border font-mono text-xs uppercase tracking-[0.05em] -mb-4 ${
            banner.type === 'loading'
              ? 'bg-s2 border-b2 text-t2'
              : banner.msg.startsWith('+')
                ? 'bg-rd border-red text-red'
                : 'bg-s2 border-b2 text-t3'
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${banner.type === 'loading' ? 'bg-t3 animate-pulse' : banner.msg.startsWith('+') ? 'bg-red' : 'bg-t3'}`} />
            {banner.msg}
          </div>
        )}

        {/* Hero — Radar scope + countdown */}
        <div className={`bg-s2 border rounded-[2px] px-6 pt-6 pb-8 flex items-start gap-8 overflow-hidden relative transition-colors duration-300 ${isLastTen ? 'border-red/40' : 'border-b1'}`}>
          {/* subtle grid bg */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(224,53,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(224,53,42,1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="flex flex-col items-center gap-2 flex-shrink-0 mt-2">
            <RadarScope running={running} detected={stats.escalating} isLastTen={isLastTen} />
          </div>

          <div className="relative z-10 flex-1 min-w-0">
            <div className="text-[10px] font-mono text-t3 uppercase tracking-[0.1em] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse inline-block" />
              Monitoramento ativo
            </div>
            <h1 className="text-4xl font-syne font-900 text-t1 mb-1">Radar</h1>
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-5">
              Detecção em tempo real de ofertas em escalação
            </p>

            <div className="flex items-center gap-6 flex-wrap mb-1">
              <div>
                <div className={`text-[10px] font-mono uppercase tracking-[0.05em] mb-1 ${isLastTen ? 'text-red' : 'text-t3'}`}>
                  {isLastTen ? '⚡ remessa chegando' : 'Próxima remessa'}
                </div>
                {isLastTen ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-syne font-900 text-red tabular-nums" style={{ animation: 'pulse 0.5s ease-in-out infinite' }}>
                      {countdown}
                    </span>
                    <span className="text-sm font-mono text-red">s</span>
                  </div>
                ) : countdown ? (
                  <div className="text-2xl font-syne font-900 text-t1 tabular-nums">
                    em {countdown}
                  </div>
                ) : (
                  <div className="text-sm font-mono text-t3">—</div>
                )}
                {running && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse flex-shrink-0" />
                    <span className="text-[10px] font-mono text-red">Buscando agora</span>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-b1" />

              <div>
                <div className="text-[10px] font-mono text-t3 uppercase tracking-[0.05em] mb-1">Ciclo</div>
                <div className="text-sm font-mono text-t2">1 hora</div>
              </div>

              <div className="h-8 w-px bg-b1" />

              <div>
                <div className="text-[10px] font-mono text-t3 uppercase tracking-[0.05em] mb-1">Ativas</div>
                <div className="text-2xl font-syne font-900 text-t1">{total}</div>
              </div>
            </div>

            <ScanFeed offers={offers} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Ofertas Ativas</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.escalating}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Em Escalação</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalAds}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Anúncios (pág.)</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.avgDaysActive}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Dias Médio Ativo</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Por Nicho</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={offers.reduce((acc: { name: string; value: number }[], o) => {
                    const found = acc.find((i) => i.name === o.niche)
                    if (found) found.value += 1
                    else acc.push({ name: o.niche.substring(0, 8), value: 1 })
                    return acc
                  }, []).slice(0, 4)}
                  cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={1} dataKey="value"
                >
                  <Cell fill="#CC2A1E" /><Cell fill="#9B9591" /><Cell fill="#5E5C58" /><Cell fill="#3C3C3D" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Por Plataforma</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={offers.reduce((acc: { name: string; value: number }[], o) => {
                    const found = acc.find((i) => i.name === o.platform)
                    if (found) found.value += 1
                    else acc.push({ name: o.platform, value: 1 })
                    return acc
                  }, []).slice(0, 4)}
                  cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={1} dataKey="value"
                >
                  <Cell fill="#CC2A1E" /><Cell fill="#9B9591" /><Cell fill="#5E5C58" /><Cell fill="#3C3C3D" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-s2 border border-b1 rounded-[2px] p-5">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-4">Momentum</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Hot', value: offers.filter((o) => o.momentum_tag === 'hot').length },
                { name: 'Escalando', value: offers.filter((o) => o.momentum_tag === 'escalating').length },
                { name: 'Estável', value: offers.filter((o) => o.momentum_tag === 'stable').length },
                { name: 'Radar', value: offers.filter((o) => o.momentum_tag === 'radar').length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                <XAxis dataKey="name" tick={{ fill: '#999592', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999592', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1B', border: '1px solid #3C3C3D', borderRadius: '2px' }} />
                <Bar dataKey="value" fill="#CC2A1E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar por nome, nicho ou plataforma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
          />

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Filtros:</div>
            <div className="flex gap-2">
              {['', 'escalating', 'hot', 'stable', 'radar'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterMomentum(tag)}
                  className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                    filterMomentum === tag
                      ? tag === 'escalating' || tag === 'hot'
                        ? 'bg-rd border border-red text-red'
                        : 'bg-s3 border border-b2 text-t1'
                      : 'bg-transparent text-t3 hover:text-t2'
                  }`}
                >
                  {tag === '' ? 'Todos' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>

            {allNiches.length > 0 && (
              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t1 rounded-[2px] cursor-pointer"
              >
                <option value="">Todos os Nichos</option>
                {allNiches.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            )}

            {allPlatforms.length > 0 && (
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] bg-s3 border border-b2 text-t1 rounded-[2px] cursor-pointer"
              >
                <option value="">Todas as Plataformas</option>
                {allPlatforms.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-s1 border border-b1 rounded-[2px] p-4">
            <div className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">
              <span className="text-t2">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> –{' '}
              <span className="text-t2">{Math.min(currentPage * ITEMS_PER_PAGE, total)}</span> de{' '}
              <span className="text-t1 font-syne font-700">{total}</span> resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  currentPage === 1 ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'
                }`}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  currentPage === totalPages ? 'bg-s1 text-t3 cursor-not-allowed' : 'bg-s3 border border-b2 text-t1 hover:bg-s2'
                }`}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {offers.filter((o) => !hiddenIds.has(o.id)).length === 0 ? (
            <div className="col-span-2 bg-s2 border border-b1 rounded-[2px] p-12 text-center">
              <div className="text-4xl font-syne font-900 text-t3 mb-3 opacity-30">⚬</div>
              <p className="text-sm font-syne font-700 text-t2 mb-1">Nenhuma oferta encontrada</p>
              <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em]">Ajuste os filtros ou tente uma busca diferente</p>
            </div>
          ) : (
            offers.filter((o) => !hiddenIds.has(o.id)).map((offer) => (
              <div
                key={offer.id}
                onContextMenu={(e) => handleContextMenu(e, offer)}
                className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all overflow-hidden cursor-pointer group select-none">
                <div className="h-24 bg-s3 border-b border-b1 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute text-3xl font-syne font-900 opacity-10 uppercase tracking-tight">
                    {offer.niche.substring(0, 2)}
                  </div>
                  <div className="relative z-10 flex gap-2 flex-wrap justify-center">
                    {newOfferIds.has(offer.id) && (
                      <div className="px-3 py-1 bg-red text-bg rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] animate-pulse">
                        Nova
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-[2px] border text-xs font-mono uppercase tracking-[0.05em] ${
                      offer.momentum_tag === 'escalating' || offer.momentum_tag === 'hot'
                        ? 'bg-rd border-red text-red'
                        : 'bg-s1 border-b1 text-t2'
                    }`}>
                      {offer.momentum_tag}
                    </div>
                    <div className="px-3 py-1 bg-s1 border border-b1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] text-t2">
                      {offer.num_ads} ads
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col">
                  <div className="text-xs font-mono text-t3 uppercase tracking-[0.08em] mb-3">
                    {offer.niche} • {offer.platform} • {offer.structure}
                  </div>
                  <h3 className="text-base font-syne font-700 text-t1 mb-4 leading-snug line-clamp-2">
                    {offer.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
                    <div>
                      <div className="text-t3 uppercase tracking-[0.05em] mb-1">Criativos</div>
                      <div className="text-t1 font-600">{offer.num_creatives}</div>
                    </div>
                    <div>
                      <div className="text-t3 uppercase tracking-[0.05em] mb-1">Dias Ativo</div>
                      <div className="text-t1 font-600">{offer.days_active}</div>
                    </div>
                    <div>
                      <div className="text-t3 uppercase tracking-[0.05em] mb-1">Cliques</div>
                      <div className="text-t1 font-600">{offer.num_clicks}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-b1">
                    <Link href={`/oferta/${offer.id}`} className="text-xs font-mono text-t2 group-hover:text-red transition-colors flex-1">
                      Ver detalhes →
                    </Link>
                    {savingId === offer.id && (
                      <span className="text-xs font-mono text-t3">Salvando...</span>
                    )}
                    {savedIds.has(offer.id) && (
                      <span className="text-xs font-mono text-t2">✓ Salvo</span>
                    )}
                    {offer.click_url && (
                      <a
                        href={offer.click_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-mono text-red hover:underline"
                      >
                        Oferta ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="w-52 bg-s2 border border-b2 rounded-[2px] shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-b1">
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em] truncate">{contextMenu.offer.name}</p>
          </div>
          {isAuthenticated ? (
            <button
              onClick={handleSave}
              disabled={savedIds.has(contextMenu.offer.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono text-t1 hover:bg-s3 transition-all text-left disabled:text-t3 disabled:cursor-default"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
              {savedIds.has(contextMenu.offer.id) ? 'Já salvo' : 'Salvar na biblioteca'}
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setContextMenu(null)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono text-t3 hover:bg-s3 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
              Login para salvar
            </Link>
          )}
          <button
            onClick={handleNotInterested}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono text-t2 hover:bg-s3 hover:text-red transition-all text-left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            Não tenho interesse
          </button>
        </div>
      )}
    </AppLayout>
  )
}
