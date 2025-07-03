"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, User, Store, Mail, Lock, Phone, MapPin, Globe, Heart, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { getDeviceToken } from "@/lib/device-token"

const africanCountries = [
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ghana",
  "Egypt",
  "Morocco",
  "Ethiopia",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Senegal",
  "Ivory Coast",
  "Cameroon",
  "Zimbabwe",
  "Zambia",
  "Botswana",
  "Namibia",
  "Mauritius",
  "Tunisia",
  "Algeria",
]

const businessCategories = [
  "Fashion & Apparel",
  "Arts & Crafts",
  "Food & Beverages",
  "Technology",
  "Beauty & Wellness",
  "Home & Living",
  "Jewelry & Accessories",
  "Agriculture",
  "Education",
  "Health & Fitness",
  "Music & Entertainment",
  "Sports & Recreation",
]

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  enteredReferralCode: string
  phone: string
  country: string
  city: string
  businessName: string
  businessCategory: string
  businessDescription: string
  website: string
  agreeToTerms: boolean
  subscribeNewsletter: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function SignUpPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("customer")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    enteredReferralCode: "",
    phone: "",
    country: "",
    city: "",
    businessName: "",
    businessCategory: "",
    businessDescription: "",
    website: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
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
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.agreeToTerms) newErrors.terms = "You must agree to the terms"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Artisan-specific validation
    if (activeTab === "entrepreneur") {
      if (!formData.businessName.trim()) newErrors.businessName = "Business name is required"
      if (!formData.businessCategory) newErrors.businessCategory = "Business category is required"
      if (!formData.businessDescription.trim()) newErrors.businessDescription = "Business description is required"
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
      if (!formData.country) newErrors.country = "Country is required"
      if (!formData.city.trim()) newErrors.city = "City is required"
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
      const userType = activeTab === "entrepreneur" ? "artisan" : "customer"
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()

      const requestData: any = {
        email: formData.email,
        password: formData.password,
        name: fullName,
        userType
      }

      // Add referral code if provided
      if (formData.enteredReferralCode.trim()) {
        requestData.enteredReferralCode = formData.enteredReferralCode.trim().toUpperCase()
      }

      // Add artisan-specific fields
      if (userType === "artisan") {
        requestData.businessName = formData.businessName
        requestData.businessCategory = formData.businessCategory
        requestData.businessDescription = formData.businessDescription
        requestData.phone = formData.phone
        requestData.country = formData.country
        requestData.city = formData.city
        if (formData.website) requestData.website = formData.website
      }

      const deviceToken = await getDeviceToken()
      if (deviceToken) {
        requestData.deviceToken = deviceToken
      }

      // Debug logging
      console.log('🔍 Device Token Debug:')
      console.log('Device Token:', deviceToken)
      console.log('Full Request Payload:', requestData)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on user type
      if (userType === "artisan") {
        router.push('/dashboard')
      } else {
        router.push('/marketplace')
      }

    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({ general: error.message || 'Registration failed. Please try again.' })
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
                Empowering African
                <br />
                entrepreneurs worldwide.
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join a thriving marketplace where creativity meets opportunity, and every purchase supports dreams
                across Africa.
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
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Get Started</h2>
            <p className="text-muted-foreground">Welcome to Kola — Let's create your account</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Account Type Selection */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="entrepreneur" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Entrepreneur
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Customer Form */}
              <TabsContent value="customer" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`h-11 ${errors.firstName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`h-11 ${errors.lastName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Your email
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
                  <Label htmlFor="enteredReferralCode" className="text-sm font-medium">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="enteredReferralCode"
                    placeholder="Enter referral code if you have one"
                    value={formData.enteredReferralCode}
                    onChange={(e) => handleInputChange("enteredReferralCode", e.target.value.toUpperCase())}
                    className={`h-11 ${errors.enteredReferralCode ? 'border-red-500' : ''}`}
                  />
                  {errors.enteredReferralCode && <p className="text-xs text-red-500">{errors.enteredReferralCode}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter a friend's referral code to earn bonus points on signup
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger className={`h-11 ${errors.country ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Create new password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 h-11 ${errors.password ? 'border-red-500' : ''}`}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 h-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </TabsContent>

              {/* Entrepreneur Form */}
              <TabsContent value="entrepreneur" className="space-y-4">
                <div className="bg-terracotta-50 border border-terracotta-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-terracotta-500 hover:bg-terracotta-600">Entrepreneur</Badge>
                    <span className="text-sm font-medium text-terracotta-800">Additional Details Required</span>
                  </div>
                  <p className="text-sm text-terracotta-700">
                    Help us create your business profile to start selling on Kola.
                  </p>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`h-11 ${errors.firstName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`h-11 ${errors.lastName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Your email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="hi@yourbusiness.com"
                      className={`pl-10 h-11 ${errors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enteredReferralCode" className="text-sm font-medium">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="enteredReferralCode"
                    placeholder="Enter referral code if you have one"
                    value={formData.enteredReferralCode}
                    onChange={(e) => handleInputChange("enteredReferralCode", e.target.value.toUpperCase())}
                    className={`h-11 ${errors.enteredReferralCode ? 'border-red-500' : ''}`}
                  />
                  {errors.enteredReferralCode && <p className="text-xs text-red-500">{errors.enteredReferralCode}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter a friend's referral code to earn bonus points on signup
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 123 456 7890"
                      className={`pl-10 h-11 ${errors.phone ? 'border-red-500' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                <Separator className="my-4" />

                {/* Business Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-5 w-5 text-terracotta-600" />
                    <h3 className="text-lg font-semibold">Business Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium">
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Your Business Name"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      className={`h-11 ${errors.businessName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.businessName && <p className="text-xs text-red-500">{errors.businessName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessCategory" className="text-sm font-medium">
                      Business Category
                    </Label>
                    <Select
                      value={formData.businessCategory}
                      onValueChange={(value) => handleInputChange("businessCategory", value)}
                    >
                      <SelectTrigger className={`h-11 ${errors.businessCategory ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select your business category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessCategory && <p className="text-xs text-red-500">{errors.businessCategory}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessDescription" className="text-sm font-medium">
                      Business Description
                    </Label>
                    <Textarea
                      id="businessDescription"
                      placeholder="Tell us about your business and what makes it special..."
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                      rows={3}
                      className={`resize-none ${errors.businessDescription ? 'border-red-500' : ''}`}
                    />
                    {errors.businessDescription && <p className="text-xs text-red-500">{errors.businessDescription}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium">
                        Country
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                        <SelectTrigger className={`h-11 ${errors.country ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {africanCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        City
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="Lagos"
                          className={`pl-10 h-11 ${errors.city ? 'border-red-500' : ''}`}
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}