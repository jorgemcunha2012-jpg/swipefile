'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { NotificationBell } from '@/components/NotificationBell'
import { api, Offer } from '@/lib/api'

// ─── Confetti ────────────────────────────────────────────────────────────────
function shootConfetti() {
  if (typeof window === 'undefined') return
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100000'
  document.body.appendChild(canvas)
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')!
  const COLORS = ['#E0352A','#FF6B6B','#FFD700','#00FF87','#4ECDC4','#FF9F43','#A29BFE','#FD79A8','#55EFC4','#FDCB6E']
  type P = { x:number;y:number;vx:number;vy:number;w:number;h:number;color:string;r:number;dr:number;opacity:number }
  const burst = (cx:number,cy:number,n:number):P[] => Array.from({length:n},()=>{
    const a=Math.random()*Math.PI*2,sp=Math.random()*16+6
    return{x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-10,w:Math.random()*14+4,h:Math.random()*7+3,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],r:Math.random()*360,dr:(Math.random()-.5)*14,opacity:1}
  })
  const W=canvas.width,H=canvas.height
  const ps:P[]=[...burst(W*.2,H*.35,55),...burst(W*.8,H*.35,55),...burst(W*.5,H*.3,70)]
  let frame=0
  const draw=()=>{
    ctx.clearRect(0,0,W,H)
    let alive=false
    for(const p of ps){
      p.vx*=.98;p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=p.dr
      if(frame>50)p.opacity-=.013
      if(p.opacity<=0||p.y>H+40)continue
      alive=true
      ctx.save();ctx.globalAlpha=Math.max(0,p.opacity)
      ctx.translate(p.x,p.y);ctx.rotate(p.r*Math.PI/180)
      ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h)
      ctx.restore()
    }
    frame++
    if(alive&&frame<240)requestAnimationFrame(draw);else canvas.remove()
  }
  requestAnimationFrame(draw)
}

// ─── Victory sound ────────────────────────────────────────────────────────────
function playVictory() {
  try {
    const ctx = new AudioContext()
    const notes = [
      { freq: 523, t: 0,    dur: 0.18 },
      { freq: 659, t: 0.14, dur: 0.18 },
      { freq: 784, t: 0.28, dur: 0.18 },
      { freq: 1047,t: 0.42, dur: 0.6  },
      { freq: 784, t: 0.42, dur: 0.6  },
      { freq: 523, t: 0.42, dur: 0.6  },
    ]
    notes.forEach(({ freq, t, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + t)
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + dur + 0.05)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch {}
}

// Woooosh dos confetes — ruído branco filtrado descendente
function playWhoosh() {
  try {
    const ctx = new AudioContext()
    const len = ctx.sampleRate * 0.45
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.45)
    filter.Q.value = 1.2
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
    src.start(); src.stop(ctx.currentTime + 0.45)
    setTimeout(() => ctx.close(), 600)
  } catch {}
}

// Som suave de abertura do modal — swipe ascendente
function playModalReveal() {
  try {
    const ctx = new AudioContext()
    const play = (freq: number, t: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + t)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + t + dur * 0.6)
      gain.gain.setValueAtTime(0, ctx.currentTime + t)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + dur)
    }
    play(440, 0,    0.25, 0.18)
    play(660, 0.08, 0.25, 0.15)
    play(880, 0.16, 0.3,  0.12)
    setTimeout(() => ctx.close(), 800)
  } catch {}
}

// Beep de contagem regressiva — pitch sobe de 700→1470Hz em 10 passos
function playCountdownBeep(secondsLeft: number) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 700 + (10 - secondsLeft) * 77
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
    setTimeout(() => ctx.close(), 300)
  } catch {}
}

// ─── Countdown overlay ────────────────────────────────────────────────────────
function CountdownOverlay({ countdown, isLastTen }: { countdown: string; isLastTen: boolean }) {
  const [scale, setScale] = useState(1)
  const prev = useRef('')

  useEffect(() => {
    if (!isLastTen || countdown === prev.current) return
    prev.current = countdown
    setScale(1.25)
    const n = parseInt(countdown)
    if (!isNaN(n) && n > 0) playCountdownBeep(n)
    const t = setTimeout(() => setScale(1), 200)
    return () => clearTimeout(t)
  }, [countdown, isLastTen])

  if (!isLastTen) return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[99998] pointer-events-none"
      style={{ background: 'rgba(11,11,12,0.88)', backdropFilter: 'blur(6px)' }}
    >
      <div className="text-[11px] font-mono text-red uppercase tracking-[0.35em] mb-6">
        Nova remessa em
      </div>
      <div
        className="font-syne font-900 text-red leading-none tabular-nums"
        style={{
          fontSize: 'clamp(140px, 28vw, 320px)',
          textShadow: '0 0 60px rgba(224,53,42,0.5), 0 0 120px rgba(224,53,42,0.25)',
          transform: `scale(${scale})`,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {countdown}
      </div>
      <div className="text-[11px] font-mono text-t3 uppercase tracking-[0.2em] mt-6">
        segundos
      </div>
    </div>
  )
}

// ─── Remessa summary modal ────────────────────────────────────────────────────
const RANK_STYLE = [
  { label: '#1', color: '#FFD700', border: 'rgba(255,215,0,0.5)',  glow: 'rgba(255,215,0,0.15)'  },
  { label: '#2', color: '#C0C0C0', border: 'rgba(192,192,192,0.4)', glow: 'rgba(192,192,192,0.1)' },
  { label: '#3', color: '#CD7F32', border: 'rgba(205,127,50,0.4)',  glow: 'rgba(205,127,50,0.1)'  },
]

function RemessaSummaryModal({ offers, total, ts, onClose }: {
  offers: Offer[]
  total: number
  ts: Date
  onClose: () => void
}) {
  useEffect(() => { playModalReveal() }, [])

  const top3 = offers.slice(0, 3)
  const rest  = offers.slice(3)

  return (
    <div
      className="fixed inset-0 z-[99997] flex items-center justify-center p-4"
      style={{ background: 'rgba(11,11,12,0.92)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-s2 border border-b2 rounded-[2px] w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-b1 flex items-start justify-between flex-shrink-0">
          <div>
            <div className="text-[10px] font-mono text-red uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse inline-block" />
              Remessa concluída · {ts.toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
            </div>
            <h2 className="text-3xl font-syne font-900 text-t1">
              {total} <span className="text-red">escalando</span>
            </h2>
            <p className="text-xs font-mono text-t3 uppercase tracking-[0.05em] mt-1">
              Ranking das ofertas detectadas nesta remessa
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-t3 hover:text-t1 transition-colors text-lg font-mono leading-none mt-1 flex-shrink-0"
          >✕</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-t3 uppercase tracking-[0.1em] mb-3">
                Top 3 desta remessa
              </div>
              <div className="grid grid-cols-3 gap-3">
                {top3.map((offer, i) => {
                  const rs = RANK_STYLE[i]
                  return (
                    <Link
                      key={offer.id}
                      href={`/oferta/${offer.id}`}
                      onClick={onClose}
                      className="bg-s3 rounded-[2px] p-4 flex flex-col gap-2 hover:bg-s2 transition-colors"
                      style={{ border: `1px solid ${rs.border}`, boxShadow: `0 0 20px 2px ${rs.glow}` }}
                    >
                      <div className="text-xl font-syne font-900" style={{ color: rs.color }}>
                        {rs.label}
                      </div>
                      <div className="text-sm font-syne font-700 text-t1 line-clamp-2 leading-snug">
                        {offer.name}
                      </div>
                      <div className="mt-auto space-y-0.5">
                        <div className="text-[10px] font-mono text-red uppercase tracking-[0.05em]">
                          {offer.momentum_tag}
                        </div>
                        <div className="text-[10px] font-mono text-t3">
                          {offer.num_ads} ads · {offer.niche}
                        </div>
                        <div className="text-[10px] font-mono text-t3">{offer.platform}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Ranking list */}
          {rest.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-t3 uppercase tracking-[0.1em] mb-3">
                Ranking completo
              </div>
              <div className="space-y-0">
                {rest.map((offer, i) => (
                  <Link
                    key={offer.id}
                    href={`/oferta/${offer.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 border-b border-b1 hover:bg-s3 transition-colors"
                  >
                    <span className="text-xs font-mono text-t3 w-6 flex-shrink-0">#{i + 4}</span>
                    <span className="text-sm font-mono text-t1 flex-1 truncate">{offer.name}</span>
                    <span className="text-[10px] font-mono text-t3 flex-shrink-0">{offer.niche}</span>
                    <span className="text-[10px] font-mono text-red flex-shrink-0 ml-2">{offer.num_ads} ads</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/radar"
              onClick={onClose}
              className="px-5 py-2.5 bg-red text-bg text-xs font-mono uppercase tracking-[0.08em] rounded-[2px] hover:opacity-90 transition-opacity"
            >
              Ver no Radar →
            </Link>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-s3 border border-b2 text-t2 text-xs font-mono uppercase tracking-[0.08em] rounded-[2px] hover:text-t1 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Radar', href: '/radar' },
  { label: 'Trending', href: '/trending' },
  { label: 'Nichos', href: '/nichos' },
  { label: 'Biblioteca', href: '/biblioteca' },
  { label: 'Alertas', href: '/alertas' },
]

function useNextFetchCountdown() {
  const [nextRun, setNextRun] = useState<Date | null>(null)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [isLastTen, setIsLastTen] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { job } = await api.status.get()
        setRunning(job.running)
        setNextRun(job.nextRun ? new Date(job.nextRun) : null)
      } catch {}
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 15_000)
    return () => clearInterval(interval)
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
        setCountdown(`${Math.ceil(diff / 1000)}s`)
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

  return { countdown, running, isLastTen }
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const { countdown, running, isLastTen } = useNextFetchCountdown()

  const [summaryOffers, setSummaryOffers] = useState<Offer[]>([])
  const [summaryTotal, setSummaryTotal]   = useState(0)
  const [summaryTs, setSummaryTs]         = useState<Date>(new Date())
  const [showSummary, setShowSummary]     = useState(false)

  // Dispara confetes + som + busca o resumo quando a contagem termina
  const wasLastTenRef = useRef(false)
  useEffect(() => {
    if (!wasLastTenRef.current || isLastTen) { wasLastTenRef.current = isLastTen; return }
    wasLastTenRef.current = false

    shootConfetti()
    playWhoosh()
    playVictory()

    // Busca top escalando após 2.5s (deixa os confetes aparecerem)
    setTimeout(async () => {
      try {
        const res = await api.offers.list({ momentum_tag: 'escalating', status: 'active', limit: 20 })
        const sorted = [...res.data].sort((a, b) => (b.num_ads ?? 0) - (a.num_ads ?? 0))
        setSummaryOffers(sorted)
        setSummaryTotal(res.meta.total)
        setSummaryTs(new Date())
        setShowSummary(true)
      } catch {}
    }, 2500)
  }, [isLastTen])

  return (
    <>
    <CountdownOverlay countdown={countdown} isLastTen={isLastTen} />
    {showSummary && (
      <RemessaSummaryModal
        offers={summaryOffers}
        total={summaryTotal}
        ts={summaryTs}
        onClose={() => setShowSummary(false)}
      />
    )}
    <div className="flex h-screen bg-bg flex-col">
      {/* Topbar */}
      <header className="h-[52px] bg-s1 border-b border-b1 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red rounded-[2px]" />
            <div className="font-syne font-900 text-sm tracking-tight">
              <span className="text-t1">SPY</span><span className="text-red">VAULT</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono text-t2">
          {isAuthenticated ? (
            <>
              <span className="text-t1 font-syne font-700 text-sm">{user?.name ?? user?.email}</span>
              {user?.role === 'admin' && (
                <Link href="/admin" className={`px-3 py-1 rounded-[2px] text-xs font-mono uppercase tracking-[0.05em] transition-all ${
                  pathname.startsWith('/admin') ? 'bg-rd border border-red text-red' : 'text-t2 hover:text-t1'
                }`}>
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-t2 hover:text-t1 transition-colors text-xs font-mono uppercase tracking-[0.05em]"
              >
                Sair
              </button>
            </>
          ) : (
            <Link href="/login" className="text-t2 hover:text-t1 transition-colors text-xs font-mono uppercase tracking-[0.05em]">
              Login
            </Link>
          )}
          <NotificationBell />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red rounded-full" />
            Online
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-56 bg-s1 border-r border-b1 p-6 overflow-y-auto flex flex-col flex-shrink-0">
          <div className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                    isActive ? 'bg-s3 border border-b2 text-t1' : 'text-t3 hover:bg-s2'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
          <div className="pt-6 border-t border-b1 space-y-4">
            {/* Próxima remessa */}
            <div className={`border rounded-[2px] px-3 py-3 transition-colors duration-300 ${isLastTen ? 'bg-rd border-red/40' : 'bg-s2 border-b1'}`}>
              <div className={`text-[10px] font-mono uppercase tracking-[0.05em] mb-2 ${isLastTen ? 'text-red' : 'text-t3'}`}>
                {isLastTen ? '⚡ chegando' : 'Próxima remessa'}
              </div>
              {isLastTen ? (
                <div className="text-2xl font-syne font-900 text-red tabular-nums" style={{ animation: 'pulse 0.5s ease-in-out infinite' }}>
                  {countdown}
                </div>
              ) : countdown ? (
                <div className="text-lg font-syne font-900 text-t1 tabular-nums">{countdown}</div>
              ) : (
                <div className="text-xs font-mono text-t3">Aguardando...</div>
              )}
              {running && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-mono text-red">Buscando agora</span>
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-t2 space-y-1">
              <div>v1.0.0</div>
              <div>PT-BR</div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-12 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Statusbar */}
      <footer className="h-8 bg-s1 border-t border-b1 px-8 flex items-center text-sm font-mono text-t3 gap-8 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red rounded-full" />
          Online
        </div>
        <div className="text-t2">Sistema operacional</div>
        <div className="ml-auto text-t2">v1.0.0</div>
      </footer>
    </div>
    </>
  )
}
