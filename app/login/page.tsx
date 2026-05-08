'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { login, register } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-sm mx-auto mt-16 space-y-8">
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            {mode === 'login' ? 'Acesse sua conta SpyVault' : 'Crie sua conta SpyVault'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-t3 uppercase tracking-[0.05em] mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-s2 border border-b1 rounded-[2px] text-sm font-mono text-t1 placeholder-t3 focus:outline-none focus:border-b2 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-rd border border-red rounded-[2px] text-sm font-mono text-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-red text-bg text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs font-mono text-t3 hover:text-t1 transition-colors"
          >
            {mode === 'login' ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
