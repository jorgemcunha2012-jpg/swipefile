'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PLANS = [
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$25',
    period: '/mês',
    desc: 'Facebook + YouTube',
    features: ['Criativos completos (vídeo + imagem)', 'Métricas detalhadas e ETV', 'Análise de estrutura VSL', 'Alertas de escalação'],
    color: '#E0352A',
  },
  {
    id: 'ultra' as const,
    name: 'Ultra',
    badge: '⚡',
    price: '$40',
    period: '/mês',
    desc: 'Facebook + YouTube + TikTok',
    features: ['Tudo do Pro', 'TikTok Ads incluído', 'Maior velocidade de saturação', 'Primeira visão de novas ofertas'],
    color: '#E8820A',
  },
]

interface PaywallGateProps {
  open: boolean
  onClose: () => void
}

export function PaywallGate({ open, onClose }: PaywallGateProps) {
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan')
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'ultra'>('pro')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingNext, setLoadingNext] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const plan = PLANS.find((p) => p.id === selectedPlan)!

  const embeddedOptions = useMemo(() => ({
    clientSecret: clientSecret ?? '',
    onComplete: () => {
      setStep('success')
      setTimeout(() => {
        router.push('/radar?upgraded=1')
        router.refresh()
      }, 2200)
    },
  }), [clientSecret, router])

  const handleContinue = async () => {
    setLoadingNext(true)
    setErrorMsg('')
    try {
      const { clientSecret: cs } = await api.stripe.createEmbeddedCheckout(selectedPlan)
      setClientSecret(cs)
      setStep('payment')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
    } finally {
      setLoadingNext(false)
    }
  }

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setStep('plan')
      setClientSecret(null)
      setErrorMsg('')
    }, 300)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={step === 'plan' ? handleClose : undefined}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(11,11,12,0.9)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Centering container */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9001,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 16px', pointerEvents: 'none',
          }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                maxWidth: step === 'payment' ? 640 : 500,
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                background: 'var(--s1)',
                border: '1px solid var(--b2)',
                borderRadius: 2,
                pointerEvents: 'all',
                transition: 'max-width 0.3s ease',
              }}
            >
              {/* Accent top */}
              <div style={{ height: 3, background: 'linear-gradient(90deg, #E0352A 0%, #E8820A 100%)' }} />

              <div style={{ padding: '28px 28px 24px' }}>

                {/* Step indicator — oculto na tela de sucesso */}
                {step !== 'success' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                    {(['plan', 'payment'] as const).map((s, i) => {
                      const current = step === s
                      const done = step === 'payment' && s === 'plan'
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: current ? '#E0352A' : done ? 'rgba(224,53,42,0.2)' : 'var(--s3)',
                            border: `1px solid ${current ? '#E0352A' : done ? 'rgba(224,53,42,0.3)' : 'var(--b1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                            color: current ? '#fff' : done ? '#E0352A' : 'var(--t3)',
                            transition: 'all 0.2s',
                          }}>
                            {done ? '✓' : i + 1}
                          </div>
                          <span style={{
                            fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                            color: current ? 'var(--t1)' : 'var(--t3)',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                          }}>
                            {s === 'plan' ? 'Plano' : 'Pagamento'}
                          </span>
                          {i === 0 && (
                            <div style={{ width: 24, height: 1, background: 'var(--b1)', margin: '0 2px' }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <AnimatePresence mode="wait">

                  {/* STEP 1 — Plan */}
                  {step === 'plan' && (
                    <motion.div
                      key="plan"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                        Acesso restrito
                      </div>
                      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(18px, 4vw, 22px)', color: 'var(--t1)', lineHeight: 1.15, marginBottom: 6 }}>
                        Detalhar ofertas exige plano pago.
                      </h2>
                      <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t2)', lineHeight: 1.65, marginBottom: 22 }}>
                        Escolha o plano e tenha acesso a criativos, métricas e análise de estrutura.
                      </p>

                      {/* Plan cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                        {PLANS.map((p) => {
                          const active = selectedPlan === p.id
                          return (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPlan(p.id)}
                              style={{
                                padding: '16px',
                                background: active ? `rgba(${p.id === 'pro' ? '224,53,42' : '232,130,10'},0.08)` : 'var(--s2)',
                                border: `1px solid ${active ? (p.id === 'pro' ? 'rgba(224,53,42,0.4)' : 'rgba(232,130,10,0.4)') : 'var(--b1)'}`,
                                borderRadius: 2,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                                position: 'relative',
                              }}
                            >
                              {p.id === 'ultra' && (
                                <div style={{
                                  position: 'absolute', top: -1, right: -1,
                                  background: '#E8820A',
                                  fontFamily: 'IBM Plex Mono, monospace', fontSize: 8,
                                  color: '#fff', padding: '2px 6px',
                                  textTransform: 'uppercase', letterSpacing: '0.08em',
                                  borderRadius: '0 2px 0 2px',
                                }}>
                                  Popular
                                </div>
                              )}
                              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--t1)', marginBottom: 4 }}>
                                {p.name} {p.badge ?? ''}
                              </div>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: active ? p.color : 'var(--t1)', lineHeight: 1, marginBottom: 6 }}>
                                {p.price}
                                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--t3)' }}>{p.period}</span>
                              </div>
                              <div style={{ borderTop: '1px solid var(--b1)', paddingTop: 10, marginTop: 4 }}>
                                {p.features.map((f) => (
                                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                                    <span style={{ color: p.color, fontSize: 8, marginTop: 2, flexShrink: 0 }}>✦</span>
                                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t2)', lineHeight: 1.4 }}>{f}</span>
                                  </div>
                                ))}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {errorMsg && (
                        <div style={{
                          fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#E0352A',
                          background: 'rgba(224,53,42,0.08)', border: '1px solid rgba(224,53,42,0.2)',
                          borderRadius: 2, padding: '10px 14px', marginBottom: 16,
                        }}>
                          {errorMsg}
                        </div>
                      )}

                      <button
                        onClick={handleContinue}
                        disabled={loadingNext}
                        style={{
                          width: '100%', padding: '14px',
                          background: loadingNext ? 'var(--s3)' : '#E0352A',
                          color: loadingNext ? 'var(--t3)' : '#fff',
                          border: 'none', borderRadius: 2,
                          fontFamily: 'IBM Plex Mono, monospace',
                          fontSize: 13, fontWeight: 600,
                          cursor: loadingNext ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.05em',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          transition: 'background 0.15s', marginBottom: 10,
                        }}
                        onMouseEnter={(e) => { if (!loadingNext) e.currentTarget.style.background = '#B8241A' }}
                        onMouseLeave={(e) => { if (!loadingNext) e.currentTarget.style.background = '#E0352A' }}
                      >
                        {loadingNext ? (
                          <>
                            <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                            Preparando...
                          </>
                        ) : (
                          `Continuar com ${plan.name} — ${plan.price}${plan.period} →`
                        )}
                      </button>

                      <button
                        onClick={handleClose}
                        style={{
                          width: '100%', padding: '10px', background: 'transparent',
                          color: 'var(--t3)', border: 'none', borderRadius: 2,
                          fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
                          cursor: 'pointer', letterSpacing: '0.05em',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)' }}
                      >
                        Agora não
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2 — Embedded Checkout */}
                  {step === 'payment' && clientSecret && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.22 }}
                    >
                      {/* Order summary */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(224,53,42,0.06)',
                        border: '1px solid rgba(224,53,42,0.15)',
                        borderRadius: 2,
                        marginBottom: 20,
                      }}>
                        <div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--t1)' }}>
                            Plano {plan.name} {plan.badge ?? ''}
                          </div>
                          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                            {plan.desc}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#E0352A' }}>
                          {plan.price}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--t3)' }}>{plan.period}</span>
                        </div>
                      </div>

                      {/* Stripe Embedded Checkout */}
                      <EmbeddedCheckoutProvider stripe={stripePromise} options={embeddedOptions}>
                        <EmbeddedCheckout />
                      </EmbeddedCheckoutProvider>

                      <button
                        type="button"
                        onClick={() => setStep('plan')}
                        style={{
                          width: '100%', padding: '10px', marginTop: 16,
                          background: 'transparent', color: 'var(--t3)',
                          border: 'none', borderRadius: 2,
                          fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
                          cursor: 'pointer', letterSpacing: '0.05em',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)' }}
                      >
                        ← Voltar
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 3 — Success */}
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ textAlign: 'center', padding: '8px 0' }}
                    >
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(224,53,42,0.1)', border: '1px solid rgba(224,53,42,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E0352A" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t1)', marginBottom: 8 }}>
                        Bem-vindo ao {plan.name}!
                      </div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>
                        Pagamento confirmado. Redirecionando para o radar...
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
