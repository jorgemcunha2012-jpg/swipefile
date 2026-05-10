'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'

interface PaywallGateProps {
  open: boolean
  onClose: () => void
}

export function PaywallGate({ open, onClose }: PaywallGateProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { url } = await api.stripe.createCheckout()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(11,11,12,0.85)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: '50%', left: '50%', zIndex: 9001,
              transform: 'translate(-50%, -50%)',
              width: 'min(480px, calc(100vw - 32px))',
              background: 'var(--s1)',
              border: '1px solid var(--b2)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Top accent */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #E0352A 0%, #E8820A 100%)' }} />

            <div style={{ padding: '32px 32px 28px' }}>
              {/* Label */}
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                color: 'var(--t3)', textTransform: 'uppercase',
                letterSpacing: '0.12em', marginBottom: 14,
              }}>
                Plano necessário
              </div>

              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 'clamp(20px, 3vw, 26px)', color: 'var(--t1)',
                lineHeight: 1.15, marginBottom: 12,
              }}>
                Detalhar ofertas é exclusivo do Pro.
              </h2>

              <p style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 13,
                color: 'var(--t2)', lineHeight: 1.65, marginBottom: 28,
              }}>
                No plano <strong style={{ color: 'var(--t1)' }}>Free</strong> você visualiza o radar e todas as ofertas detectadas.
                Para ver criativos, métricas detalhadas e análise de estrutura, faça upgrade para o <strong style={{ color: '#E0352A' }}>Pro</strong>.
              </p>

              {/* Feature list */}
              <div style={{
                background: 'var(--s2)', border: '1px solid var(--b1)',
                borderRadius: 2, padding: '16px 20px', marginBottom: 24,
              }}>
                {[
                  'Criativos completos (vídeo + imagem)',
                  'Métricas: ETV, cliques, dias ativo',
                  'Análise de estrutura de oferta',
                  'Alertas de escalação em tempo real',
                  'Facebook + YouTube + TikTok',
                ].map((feat) => (
                  <div key={feat} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 12,
                    color: 'var(--t2)', marginBottom: 8,
                  }}>
                    <span style={{ color: '#E0352A', fontSize: 10 }}>✦</span>
                    {feat}
                  </div>
                ))}
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: 'var(--t1)' }}>
                  $25
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t3)' }}>
                  / mês
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    background: loading ? 'var(--s3)' : '#E0352A',
                    color: loading ? 'var(--t3)' : '#fff',
                    border: 'none',
                    borderRadius: 2,
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.04em',
                    transition: 'background 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading && (
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  )}
                  {loading ? 'Redirecionando...' : 'Fazer upgrade — Pro'}
                </button>

                <button
                  onClick={onClose}
                  style={{
                    padding: '13px 20px',
                    background: 'transparent',
                    color: 'var(--t3)',
                    border: '1px solid var(--b1)',
                    borderRadius: 2,
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    transition: 'color 0.15s, border-color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderColor = 'var(--b2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'var(--b1)' }}
                >
                  Agora não
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
