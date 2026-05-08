'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User, setAccessToken, getAccessToken } from './api'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { user, accessToken } = await api.auth.login(email, password)
    setAccessToken(accessToken)
    setUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const { user, accessToken } = await api.auth.register(name, email, password)
    setAccessToken(accessToken)
    setUser(user)
  }

  const logout = async () => {
    try { await api.auth.logout() } catch { /* ignore */ }
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
