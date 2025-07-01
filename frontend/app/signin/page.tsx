"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Mail, Lock, Heart, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function SignInPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Basic validation
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    // Add comprehensive logging for debugging
    console.log('🚀 Starting login process...')
    console.log('📧 Email:', formData.email)
    console.log('🔗 API Endpoint:', '/api/auth/login')
    console.log('📦 Request payload:', {
      email: formData.email,
      password: '[HIDDEN]'
    })

    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      let data
      try {
        data = await response.json()
        console.log('📡 Response data:', data)
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        console.error('❌ Login failed:', data)
        throw new Error(data.error || `Login failed (${response.status})`)
      }

      console.log('✅ Login successful, user data:', data.user)
      console.log('🔑 Token received:', data.token ? 'Yes' : 'No')

      // Use the login function from useAuth hook
      login(data.user, data.token)
      
      // Save user email to localStorage for referral system
      if (data.user && data.user.email) {
        localStorage.setItem('userEmail', data.user.email)
        console.log('💾 Saved user email to localStorage')
      }

      // Redirect based on user type, with a short delay to allow context update
      setTimeout(() => {
        console.log('👤 User type:', data.user.userType)
        if (data.user.userType === "artisan") {
          console.log('🔄 Redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          console.log('🔄 Redirecting to marketplace...')
          router.push('/marketplace')
        }
      }, 100)

    } catch (error: any) {
      console.error('💥 Login error:', error)
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      setErrors({ 
        general: error.message || 'Login failed. Please check your credentials and try again.' 
      })
    } finally {
      setIsLoading(false)
      console.log('🏁 Login process completed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Gradient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-terracotta-500/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-terracotta-600/40 via-terracotta-500/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-500 rounded-2xl mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-heading font-bold text-white mb-4">
                Welcome back to
                <br />
                the Kola community.
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Continue your journey of discovering amazing products and supporting talented African entrepreneurs.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-terracotta-400 mb-2">2,500+</div>
                <div className="text-sm text-gray-400">Entrepreneurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terracotta-400 mb-2">54</div>
                <div className="text-sm text-gray-400">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terracotta-400 mb-2">125K+</div>
                <div className="text-sm text-gray-400">Products Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terracotta-400 mb-2">4.9★</div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-terracotta-100 rounded-xl mb-4">
              <Heart className="h-6 w-6 text-terracotta-600" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your Kola account</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hi@kola.com"
                  className={`pl-10 h-11 ${errors.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-terracotta-600 hover:text-terracotta-700 underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium text-base rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  Sign in to your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <Separator className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </Separator>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-11 border-gray-300 hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
              
              <Button variant="outline" className="w-full h-11 border-gray-300 hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                Continue with Twitter
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-terracotta-600 hover:text-terracotta-700 font-medium underline">
                  Create one
                </Link>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Having issues?{" "}
                <Link href="/test-connection" className="text-terracotta-600 hover:text-terracotta-700 underline">
                  Test backend connection
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 