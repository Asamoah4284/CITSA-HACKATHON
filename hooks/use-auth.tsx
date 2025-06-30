"use client"

import { useState, useEffect, createContext, useContext } from 'react'

interface UserData {
  id: string
  email: string
  name: string
  userType: 'customer' | 'artisan'
  points?: number
  businessName?: string
  businessCategory?: string
  country?: string
  city?: string
}

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')
  return context
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status
  const checkAuth = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } else {
          setUser(null)
        }
      } else {
        // If we're on the server, set user as null
        setUser(null)
      }
    } catch (error) {
      console.error('Error reading auth data:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = (userData: UserData, token: string) => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('userEmail', userData.email)
    }
    setUser(userData)
  }

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setUser(null)
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Check if user is an entrepreneur/artisan
  const isEntrepreneur = user?.userType === 'artisan'

  // Check if user is a customer
  const isCustomer = user?.userType === 'customer'

  useEffect(() => {
    checkAuth()

    // Listen for storage changes (when user logs in/out in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth()
      }
    }

    // Only add event listener in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    isEntrepreneur,
    isCustomer,
    login,
    logout,
    checkAuth
  }
} 