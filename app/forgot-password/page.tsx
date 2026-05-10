'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { AuthError } from '@/components/auth/AuthError'

type Lang = 'en' | 'pt'

const T = {
  en: {
    label: 'ACCOUNT RECOVERY',
    headline: 'Reset your password.',
    sub: "Enter your email and we'll send you a link.",
    field_email: 'EMAIL',
    cta: 'Send reset link →',
    loading: 'Sending...',
    back: '← Back to sign in',
    success_h: 'Check your inbox.',
    success_sub: (email: string) => `We sent a reset link to ${maskEmail(email)}.\nIt expires in 30 minutes.`,
    link_pre: 'Remember your password?',
    link_cta: 'Sign in →',
  },
  pt: {
    label: 'RECUPERAR CONTA',
    headline: 'Redefina sua senha.',
    sub: 'Digite seu email e enviaremos um link.',
    field_email: 'EMAIL',
    cta: 'Enviar link →',
    loading: 'Enviando...',
    back: '← Voltar ao login',
    success_h: 'Verifique seu email.',
    success_sub: (email: string) => `Enviamos um link para ${maskEmail(email)}.\nExpira em 30 minutos.`,
    link_pre: 'Lembrou sua senha?',
    link_cta: 'Entrar →',
  },
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  return `${user[0]}${'*'.repeat(Math.max(1, user.length - 2))}${user[user.length - 1] ?? ''}@${domain}`
}

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [apiError, setApiError] = useState('')
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const t = T[lang]

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const emailValue = watch('email')

  const onSubmit = async (data: ForgotForm) => {
    setApiError('')
    try {
      // Simulated delay — wire up to real endpoint when available
      await new Promise((r) => setTimeout(r, 1200))
      setSentEmail(data.email)
    } catch {
      setApiError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout lang={lang} onLangChange={setLang}>
      <AnimatePresence mode="wait">
        {sentEmail ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center' }}
          >
            <CheckCircle size={36} color="var(--t2)" strokeWidth={1.5} />

            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(22px, 3.5vw, 28px)',
              color: 'var(--t1)',
              marginTop: 20,
              lineHeight: 1.1,
            }}>
              {t.success_h}
            </div>

            <div style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 14,
              color: 'var(--t2)',
              marginTop: 12,
              lineHeight: 1.65,
              whiteSpace: 'pre-line',
            }}>
              {t.success_sub(sentEmail)}
            </div>

            <Link
              href="/login"
              style={{
                display: 'inline-block',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 13,
                color: 'var(--t2)',
                marginTop: 28,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#E0352A' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t2)' }}
            >
              {t.back}
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
          >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                {t.label}
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--t1)', lineHeight: 1.1, margin: 0 }}>
                {t.headline}
              </h1>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, color: 'var(--t2)', marginTop: 8, lineHeight: 1.55 }}>
                {t.sub}
              </p>
            </div>

            {/* Email field */}
            <div style={{ marginBottom: 24 }}>
              <FormField
                label={t.field_email}
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />
            </div>

            {/* API Error */}
            <AnimatePresence>
              {apiError && (
                <div style={{ marginBottom: 16 }}>
                  <AuthError message={apiError} />
                </div>
              )}
            </AnimatePresence>

            <SubmitButton loading={isSubmitting} label={t.cta} loadingLabel={t.loading} />

            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t2)', textAlign: 'center', marginTop: 20 }}>
              {t.link_pre}{' '}
              <Link
                href="/login"
                style={{ color: 'var(--t1)', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#E0352A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t1)' }}
              >
                {t.link_cta}
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
