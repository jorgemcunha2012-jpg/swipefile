'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { PasswordField } from '@/components/auth/PasswordField'
import { PlanSelector } from '@/components/auth/PlanSelector'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { AuthError } from '@/components/auth/AuthError'
import { SuccessState } from '@/components/auth/SuccessState'
import { useAuth } from '@/lib/auth'

type Lang = 'en' | 'pt'
type PlanId = 'free' | 'pro'

const T = {
  en: {
    label: 'CREATE YOUR ACCOUNT',
    headline: 'Start for free.',
    sub: 'No credit card required. See the radar instantly.',
    field_name: 'FULL NAME',
    field_email: 'EMAIL',
    field_password: 'PASSWORD',
    field_confirm: 'CONFIRM PASSWORD',
    plan_label: 'START WITH',
    plans: [
      { id: 'free' as PlanId, name: 'Free', desc: 'Limited access' },
      { id: 'pro' as PlanId, name: 'Pro — $25/mo', desc: 'Facebook + YouTube' },
    ],
    terms: 'I agree to the Terms of Service and Privacy Policy',
    cta: 'Create account →',
    loading: 'Creating account...',
    link_pre: 'Already have an account?',
    link_cta: 'Sign in →',
    success_headline: "You're in.",
    success_sub: "Your account is ready.\nTaking you to the radar...",
    err_terms: 'You must accept the terms',
  },
  pt: {
    label: 'CRIAR SUA CONTA',
    headline: 'Comece de graça.',
    sub: 'Sem cartão de crédito. Acesso ao radar na hora.',
    field_name: 'NOME COMPLETO',
    field_email: 'EMAIL',
    field_password: 'SENHA',
    field_confirm: 'CONFIRMAR SENHA',
    plan_label: 'COMEÇAR COM',
    plans: [
      { id: 'free' as PlanId, name: 'Grátis', desc: 'Acesso limitado' },
      { id: 'pro' as PlanId, name: 'Pro — $25/mês', desc: 'Facebook + YouTube' },
    ],
    terms: 'Concordo com os Termos de Uso e Política de Privacidade',
    cta: 'Criar conta →',
    loading: 'Criando conta...',
    link_pre: 'Já tem conta?',
    link_cta: 'Entrar →',
    success_headline: 'Você entrou.',
    success_sub: 'Sua conta está pronta.\nLevando você ao radar...',
    err_terms: 'Você precisa aceitar os termos',
  },
}

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  plan: z.enum(['free', 'pro']),
  terms: z.literal(true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register: authRegister } = useAuth()
  const router = useRouter()
  const t = T[lang]

  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', plan: 'free', terms: undefined },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: SignupForm) => {
    setApiError('')
    try {
      await authRegister(data.fullName, data.email, data.password)
      setSuccess(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create account')
    }
  }

  const handleSuccessComplete = useCallback(() => {
    router.push('/radar')
  }, [router])

  if (success) {
    return (
      <AuthLayout lang={lang} onLangChange={setLang}>
        <SuccessState
          headline={t.success_headline}
          sub={t.success_sub}
          onComplete={handleSuccessComplete}
        />
      </AuthLayout>
    )
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
          <FormField
            label={t.field_name}
            type="text"
            placeholder="John Smith"
            error={errors.fullName?.message}
            autoComplete="name"
            {...register('fullName')}
          />

          <FormField
            label={t.field_email}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordField
                label={t.field_password}
                placeholder="Min. 8 characters"
                value={field.value}
                onChange={field.onChange}
                error={errors.password?.message}
                showStrength
                id="password"
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordField
                label={t.field_confirm}
                placeholder="Repeat your password"
                value={field.value}
                onChange={field.onChange}
                error={errors.confirmPassword?.message}
                id="confirmPassword"
              />
            )}
          />
        </div>

        {/* Plan selector */}
        <div style={{ marginBottom: 20 }}>
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <PlanSelector
                value={field.value}
                onChange={field.onChange}
                label={t.plan_label}
                plans={t.plans}
              />
            )}
          />
        </div>

        {/* Terms checkbox */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              {...register('terms')}
              style={{ accentColor: '#E0352A', width: 14, height: 14, marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--t2)', lineHeight: 1.55 }}>
              {t.terms.split(' Terms of Service').length > 1 ? (
                <>
                  {t.terms.split('Terms of Service')[0]}
                  <a href="#" style={{ color: 'var(--t1)', textDecoration: 'underline' }}>Terms of Service</a>
                  {' and '}
                  <a href="#" style={{ color: 'var(--t1)', textDecoration: 'underline' }}>Privacy Policy</a>
                </>
              ) : t.terms}
            </span>
          </label>
          {errors.terms && (
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#E0352A', marginTop: 6, marginLeft: 24 }}>
              {t.err_terms}
            </p>
          )}
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

        {/* Sign in link */}
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
      </form>
    </AuthLayout>
  )
}
