"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Heart, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface FormData {
  email: string
}

interface FormErrors {
  [key: string]: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    email: "",
  })

  const handleInputChange = (field: string, value: string) => {
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

    try {
      // Simulate API call - replace with actual password reset API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setErrors({ general: error.message || 'Failed to send reset email. Please try again.' })
    } finally {
      setIsLoading(false)
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
                Reset your password
                <br />
                and get back to shopping.
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                We'll send you a secure link to reset your password and regain access to your Kola account.
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
          {/* Back to Sign In */}
          <div className="mb-6">
            <Link 
              href="/signin" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-terracotta-100 rounded-xl mb-4">
              <Heart className="h-6 w-6 text-terracotta-600" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Forgot Password?</h2>
            <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700">Reset email sent!</p>
                <p className="text-xs text-green-600 mt-1">
                  Check your email for instructions to reset your password.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Reset Password Form */}
          {!isSubmitted && (
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium text-base rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending reset email...
                  </div>
                ) : (
                  "Send reset email"
                )}
              </Button>
            </form>
          )}

          {/* Additional Help */}
          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/signin" className="text-terracotta-600 hover:text-terracotta-700 font-medium underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need help?</h3>
            <p className="text-xs text-gray-600">
              If you're still having trouble, contact our support team at{" "}
              <a href="mailto:support@kola.com" className="text-terracotta-600 hover:text-terracotta-700 underline">
                support@kola.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 