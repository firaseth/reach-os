'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  name: string
  email: string
  title: string
  bio: string
  avatar: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        // Token invalid, clear it
        localStorage.removeItem('reach-os-token')
        setUser(null)
      }
    } catch {
      localStorage.removeItem('reach-os-token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('reach-os-token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }

    const data = await res.json()
    localStorage.setItem('reach-os-token', data.token)
    setUser(data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Registration failed')
    }

    const data = await res.json()
    localStorage.setItem('reach-os-token', data.token)
    setUser(data.user)
  }

  const logout = useCallback(() => {
    localStorage.removeItem('reach-os-token')
    setUser(null)
    router.push('/login')
  }, [router])

  const contextValue = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, loading, login, register, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
