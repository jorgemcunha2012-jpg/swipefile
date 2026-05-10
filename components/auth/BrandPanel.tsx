'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

type Lang = 'en' | 'pt'

const QUOTES = {
  en: [
    { h: '4,000+ offers monitored.', s: "See what's scaling before\nanyone else does." },
    { h: 'White. Grey. Black.', s: 'Every market. No filters.\nNo judgement.' },
    { h: 'Updated every hour.', s: "By the time your competitor finds it,\nyou're already running." },
  ],
  pt: [
    { h: '4.000+ ofertas monitoradas.', s: 'Veja o que está escalando\nantes de todo mundo.' },
    { h: 'White. Grey. Black.', s: 'Todo mercado. Sem filtros.\nSem julgamento.' },
    { h: 'Atualizado toda hora.', s: 'Quando seu concorrente achar,\nvocê já está rodando.' },
  ],
}

const METRICS = {
  en: [
    { num: '4,000+', label: 'OFFERS MONITORED' },
    { num: '3', label: 'PLATFORMS' },
    { num: 'Every hour', label: 'DATABASE UPDATE' },
  ],
  pt: [
    { num: '4.000+', label: 'OFERTAS MONITORADAS' },
    { num: '3', label: 'PLATAFORMAS' },
    { num: 'Toda hora', label: 'ATUALIZAÇÃO DO BANCO' },
  ],
}


export function BrandPanel({ lang }: { lang: Lang }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { setIdx(0) }, [lang])

  const quotes = QUOTES[lang]
  const metrics = METRICS[lang]

  return (
    <div style={{
      background: 'var(--s1)',
      borderRight: '1px solid var(--b2)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 40,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Silhouette decorative — bottom right */}
      <div style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.07, pointerEvents: 'none' }}>
        <Image src="/logosilhueta.png" alt="" width={260} height={260} style={{ objectFit: 'contain' }} />
      </div>

      {/* Logo */}
      <div>
        <Image
          src="/logocoompleta.png"
          alt="Raven Spy"
          height={36}
          width={144}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </div>

      {/* Rotating quote */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ minHeight: 130, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${lang}-${idx}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(22px, 2.4vw, 30px)',
                lineHeight: 1.15,
                color: 'var(--t1)',
                marginBottom: 16,
              }}>
                {quotes[idx].h}
              </div>
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 14,
                lineHeight: 1.65,
                color: 'var(--t2)',
                whiteSpace: 'pre-line',
              }}>
                {quotes[idx].s}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quote dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                height: 4,
                width: i === idx ? 16 : 4,
                borderRadius: i === idx ? 2 : '50%',
                background: i === idx ? '#CC2A1E' : 'var(--t3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 300ms ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        {metrics.map((m, i) => (
          <div key={i}>
            {i > 0 && <div style={{ height: 1, background: 'var(--b1)', margin: '14px 0' }} />}
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t1)', lineHeight: 1.1 }}>
              {m.num}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
