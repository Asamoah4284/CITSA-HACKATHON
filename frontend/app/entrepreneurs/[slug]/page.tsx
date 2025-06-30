"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Heart, Star, Copy, ExternalLink, Users, Globe, Award, Loader2 } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { fetchProductImage, preloadProductImages } from "@/lib/image-utils"
import { useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function EntrepreneurPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [imagesLoading, setImagesLoading] = useState(true)
  const [entrepreneur, setEntrepreneur] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claimingReferral, setClaimingReferral] = useState(false)

  // Handle referral link claiming
  useEffect(() => {
    const handleReferralClaim = async () => {
      const referralCode = searchParams.get('ref')
      if (referralCode && isAuthenticated && user) {
        console.log("=== REFERRAL CLAIM DEBUG ===")
        console.log("Referral code:", referralCode)
        console.log("User authenticated:", isAuthenticated)
        console.log("User:", user)
        
        setClaimingReferral(true)
        
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            toast({
              title: "Authentication error",
              description: "Please log in again to claim referral.",
              variant: "destructive"
            })
            return
          }

          console.log("Sending claim request to:", 'http://localhost:5000/app/claim-referral')
          const response = await fetch('http://localhost:5000/app/claim-referral', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ referralCode })
          })
          
          const data = await response.json()
          console.log("Claim response status:", response.status)
          console.log("Claim response data:", data)
          
          if (response.ok) {
            toast({
              title: "Referral claimed successfully!",
              description: `You've joined ${data.artisan.name}'s circle and earned points!`,
            })
          } else {
            console.error('Failed to claim referral:', data.error)
            if (data.error.includes('already used')) {
              toast({
                title: "Already claimed",
                description: "You've already used this referral link.",
                variant: "destructive"
              })
            } else if (data.error.includes('own referral')) {
              toast({
                title: "Cannot claim own referral",
                description: "You cannot claim your own referral link.",
                variant: "destructive"
              })
            } else if (data.error.includes('already claimed')) {
              toast({
                title: "Already joined circle",
                description: "You've already joined this artisan's circle.",
                variant: "destructive"
              })
            } else {
              toast({
                title: "Failed to claim referral",
                description: data.error || "Something went wrong",
                variant: "destructive"
              })
            }
          }
        } catch (error) {
          console.error('Error claiming referral:', error)
          toast({
            title: "Connection error",
            description: "Failed to claim referral link. Please try again.",
            variant: "destructive"
          })
        } finally {
          setClaimingReferral(false)
        }
      } else if (referralCode && !isAuthenticated) {
        console.log("Referral code found but user not authenticated")
        toast({
          title: "Login required",
          description: "Please log in to claim this referral link.",
          variant: "destructive"
        })
      }
    }

    handleReferralClaim()
  }, [searchParams, isAuthenticated, user, toast])

  // Fetch entrepreneur data
  useEffect(() => {
    const fetchEntrepreneur = async () => {
      try {
        const res = await fetch(`http://localhost:5000/public/artisans/${params.slug}`)
        const data = await res.json()
        if (data.artisan) {
          setEntrepreneur(data.artisan)
          console.log("Fetched entrepreneur:", data.artisan)
        } else {
          console.error("No artisan data found")
        }
      } catch (error) {
        console.error('Failed to fetch entrepreneur:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchEntrepreneur()
    }
  }, [params.slug])

  // Load product images on component mount
  useEffect(() => {
    if (entrepreneur && entrepreneur.products) {
      const loadImages = async () => {
        setImagesLoading(true)
        try {
          const imageCache = await preloadProductImages(
            entrepreneur.products.map((p: any) => ({ name: p.name, category: p.category || "Fashion" }))
          )
          setProductImages(imageCache)
        } catch (error) {
          console.error('Failed to load product images:', error)
        } finally {
          setImagesLoading(false)
        }
      }

      loadImages()
    }
  }, [entrepreneur])

  const copyReferralCode = () => {
    if (entrepreneur?.referralCode) {
      navigator.clipboard.writeText(entrepreneur.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-accent-primary)] mx-auto mb-4" />
          <p className="text-gray-600">Loading entrepreneur profile...</p>
        </div>
      </div>
    )
  }

  if (claimingReferral) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-accent-primary)] mx-auto mb-4" />
          <p className="text-gray-600">Claiming referral link...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we process your referral</p>
        </div>
      </div>
    )
  }

  if (!entrepreneur) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Entrepreneur not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden">
        <Image
          src={entrepreneur.bannerImage || "/placeholder.svg"}
          alt={`${entrepreneur.name} banner`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Header */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-[var(--color-surface)]">
              <AvatarImage src={entrepreneur.imageUrl || "/placeholder.svg"} alt={entrepreneur.name} />
              <AvatarFallback className="text-2xl">
                {entrepreneur.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">{entrepreneur.name}</h1>
            <p className="text-xl text-gray-200 mb-4">{entrepreneur.specialty}</p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white">
                <Heart className="h-4 w-4 mr-2" />
                Join Circle
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardContent className="p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[var(--color-accent-primary)] mb-1">
                {entrepreneur.productCount || 0}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">Products</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardContent className="p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[var(--color-accent-primary)] mb-1">
                {entrepreneur.location}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">Location</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardContent className="p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[var(--color-accent-primary)] mb-1">
                {entrepreneur.isActive ? "Active" : "Inactive"}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">Status</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-mono text-2xl font-bold text-[var(--color-accent-primary)]">
                  4.8
                </span>
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">Rating</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Story & Products */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="story">The Story</TabsTrigger>
                <TabsTrigger value="products">Collection</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
                    <CardContent className="p-6">
                      <p className="text-lg leading-relaxed text-[var(--color-text-primary)]">{entrepreneur.story}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                {entrepreneur.products && entrepreneur.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {entrepreneur.products.map((product: any, index: number) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="card-glow bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
                          <div className="aspect-square relative">
                            <Image
                              src={productImages[product.name] || product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            {!product.isAvailable && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-semibold">Out of Stock</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-heading text-lg font-semibold mb-2">{product.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xl font-bold">${product.price}</span>
                            </div>
                            <Button
                              className="w-full mt-3 bg-black hover:bg-terracotta-500 text-white"
                              disabled={!product.isAvailable}
                            >
                              {product.isAvailable ? "Add to Cart" : "Out of Stock"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No products available yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Circle Info */}
          <div className="space-y-6">
            {/* Circle Progress */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="font-heading text-xl growth-arc">The Inner Circle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Circle Growth</span>
                      <span className="font-mono">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">Join the circle to unlock exclusive benefits</p>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <h4 className="font-semibold mb-3">Share Your Link</h4>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                        <span className="font-mono text-sm">Join the circle to get your referral link</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyReferralCode}
                        className="border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-transparent"
                      >
                        {copied ? <ExternalLink className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Patrons Leaderboard */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Top Patrons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(entrepreneur.topPatrons ?? []).map((patron: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-full">
                          {index + 1}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={patron.avatar || "/placeholder.svg"} alt={patron.name} />
                          <AvatarFallback className="text-xs">
                            {patron.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{patron.name}</div>
                          <div className="text-xs text-[var(--color-text-secondary)]">{patron.points} points</div>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {patron.score}/100
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
