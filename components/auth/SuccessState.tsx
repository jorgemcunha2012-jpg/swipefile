'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface SuccessStateProps {
  headline: string
  sub: string
  onComplete: () => void
}

function RavenIconRed() {
  return (
    <svg width={40} height={40} viewBox="0 0 32 32" fill="none">
      <path d="M16 4C10 4 6 8 6 13c0 3 1.5 5.5 4 7l-2 6h3l1.5-4c1 .3 2.2.5 3.5.5s2.5-.2 3.5-.5L21 26h3l-2-6c2.5-1.5 4-4 4-7 0-5-4-9-10-9z" fill="rgba(224,53,42,0.15)" stroke="#E0352A" strokeWidth="0.8" />
      <path d="M10 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#E0352A" strokeWidth="0.8" fill="none" />
      <path d="M6 13c-2 0-3-1-4-2.5L4 9l3 1.5" fill="#E0352A" />
      <path d="M26 13c2 0 3-1 4-2.5L28 9l-3 1.5" fill="#E0352A" />
      <circle cx="13" cy="13" r="1.5" fill="#E0352A" />
      <circle cx="19" cy="13" r="1.5" fill="#E0352A" />
      <path d="M14 17.5c.6.5 1.4.5 2 0" stroke="#E0352A" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M15 20l1 2.5" stroke="#E0352A" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

export function SuccessState({ headline, sub, onComplete }: SuccessStateProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 2200
    const frame = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(frame)
      else onComplete()
    }
    const raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      <RavenIconRed />

      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: 32,
        color: 'var(--t1)',
        marginTop: 20,
        lineHeight: 1.1,
      }}>
        {headline}
      </div>

      <div style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 14,
        color: 'var(--t2)',
        marginTop: 10,
        lineHeight: 1.65,
        whiteSpace: 'pre-line',
      }}>
        {sub}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 32, height: 2, background: 'var(--s2)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: '#E0352A',
          transition: 'width 50ms linear',
        }} />
      </div>
    </motion.div>
  )
}
