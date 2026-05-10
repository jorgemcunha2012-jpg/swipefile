'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { PasswordField } from '@/components/auth/PasswordField'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { AuthError } from '@/components/auth/AuthError'
import { useAuth } from '@/lib/auth'

type Lang = 'en' | 'pt'

const T = {
  en: {
    label: 'WELCOME BACK',
    headline: 'Sign in to DarkRaven.',
    sub: 'The radar is running. Get back in.',
    email: 'EMAIL',
    password: 'PASSWORD',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    cta: 'Sign in →',
    loading: 'Signing in...',
    link_pre: "Don't have an account?",
    link_cta: 'Start for free →',
    err_credentials: 'Invalid email or password.',
  },
  pt: {
    label: 'BEM-VINDO DE VOLTA',
    headline: 'Entre no DarkRaven.',
    sub: 'O radar tá rodando. Volta pra dentro.',
    email: 'EMAIL',
    password: 'SENHA',
    remember: 'Lembrar de mim',
    forgot: 'Esqueceu a senha?',
    cta: 'Entrar →',
    loading: 'Entrando...',
    link_pre: 'Ainda não tem conta?',
    link_cta: 'Começar de graça →',
    err_credentials: 'Email ou senha incorretos.',
  },
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  const t = T[lang]

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: LoginForm) => {
    setApiError('')
    try {
      await login(data.email, data.password)
      router.push('/radar')
    } catch {
      setApiError(t.err_credentials)
    }
  }

  return (
    <AuthLayout lang={lang} onLangChange={setLang}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

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

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 18 }}>
          <FormField
            label={t.email}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            label={t.password}
            placeholder="Your password"
            value={passwordValue}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        {/* Remember + Forgot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              {...register('remember')}
              style={{ accentColor: '#E0352A', width: 14, height: 14 }}
            />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t2)' }}>{t.remember}</span>
          </label>
          <Link
            href="/forgot-password"
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--t2)', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.textDecoration = 'none' }}
          >
            {t.forgot}
          </Link>
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

        {/* Sign up link */}
        <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t2)', textAlign: 'center', marginTop: 20 }}>
          {t.link_pre}{' '}
          <Link
            href="/signup"
            style={{ color: 'var(--t1)', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#E0352A' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t1)' }}
          >
            {t.link_cta}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
