"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  Star,
  Users,
  Globe,
  Heart,
  ShoppingBag,
  Search,
  Filter,
  Sparkles,
  Award,
  Shield,
  Zap,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { fetchProductImage, preloadProductImages } from "@/lib/image-utils"
import { testApiConfiguration } from "@/lib/api-config"

// Hero carousel images of African entrepreneurs
const heroImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    alt: "African woman entrepreneur working on traditional textiles",
    name: "Aisha Textiles",
    location: "Lagos, Nigeria"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    alt: "African craftsman creating beautiful wooden sculptures",
    name: "Kwame Woodcraft",
    location: "Accra, Ghana"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    alt: "African fashion designer showcasing traditional patterns",
    name: "Zara Fashion House",
    location: "Cape Town, South Africa"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80",
    alt: "African beauty entrepreneur with natural products",
    name: "Fatima Beauty",
    location: "Nairobi, Kenya"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1526178613658-3f1622045564?auto=format&fit=crop&w=800&q=80",
    alt: "African jewelry maker crafting traditional beads",
    name: "Mama Beads",
    location: "Dakar, Senegal"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    alt: "African potter creating beautiful ceramics",
    name: "Kofi Pottery",
    location: "Kumasi, Ghana"
  }
]

const featuredEntrepreneurs = [
  {
    id: 1,
    name: "Amara Okafor",
    business: "Amara's Textiles",
    location: "Lagos, Nigeria",
    category: "Fashion & Apparel",
    rating: 4.9,
    sales: 1200,
    image: "/placeholder-user.jpg",
    products: 45,
    story: "Creating beautiful traditional fabrics with modern designs",
  },
  {
    id: 2,
    name: "Kwame Asante",
    business: "Asante Crafts",
    location: "Accra, Ghana",
    category: "Arts & Crafts",
    rating: 4.8,
    sales: 890,
    image: "/placeholder-user.jpg",
    products: 32,
    story: "Handcrafted wooden sculptures and home decor",
  },
  {
    id: 3,
    name: "Fatima Al-Rashid",
    business: "Desert Rose Beauty",
    location: "Marrakech, Morocco",
    category: "Beauty & Wellness",
    rating: 4.9,
    sales: 1500,
    image: "/placeholder-user.jpg",
    products: 28,
    story: "Natural beauty products inspired by Moroccan traditions",
  },
]

const featuredProducts = [
  {
    id: 1,
    name: "Handwoven Kente Scarf",
    price: 89,
    originalPrice: 120,
    image: "/placeholder.jpg",
    entrepreneur: "Amara Okafor",
    rating: 4.9,
    reviews: 156,
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Carved Wooden Mask",
    price: 145,
    originalPrice: null,
    image: "/placeholder.jpg",
    entrepreneur: "Kwame Asante",
    rating: 4.8,
    reviews: 89,
    badge: "Handmade",
  },
  {
    id: 3,
    name: "Argan Oil Hair Treatment",
    price: 34,
    originalPrice: 45,
    image: "/placeholder.jpg",
    entrepreneur: "Fatima Al-Rashid",
    rating: 4.9,
    reviews: 234,
    badge: "Natural",
  },
  {
    id: 4,
    name: "Beaded Jewelry Set",
    price: 67,
    originalPrice: null,
    image: "/placeholder.jpg",
    entrepreneur: "Amara Okafor",
    rating: 4.7,
    reviews: 78,
    badge: "Limited",
  },
]

const stats = [
  { icon: Users, label: "Active Entrepreneurs", value: "2,500+" },
  { icon: Globe, label: "Countries Represented", value: "54" },
  { icon: ShoppingBag, label: "Products Sold", value: "125K+" },
  { icon: Star, label: "Average Rating", value: "4.9" },
]

const features = [
  {
    icon: Shield,
    title: "Verified Entrepreneurs",
    description: "Every entrepreneur is verified to ensure authentic, quality products",
  },
  {
    icon: Heart,
    title: "Direct Impact",
    description: "Your purchases directly support entrepreneurs and their communities",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "All products meet our high standards for craftsmanship and materials",
  },
  {
    icon: Zap,
    title: "Fast Shipping",
    description: "Quick and secure delivery worldwide with tracking included",
  },
]

export default function HomePage() {
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [imagesLoading, setImagesLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heroImagesLoaded, setHeroImagesLoaded] = useState<boolean[]>(new Array(heroImages.length).fill(false))

  // Debug: Log hero images on component mount
  useEffect(() => {
    console.log('Hero images array:', heroImages)
    console.log('Hero images length:', heroImages.length)
    console.log('Current image index:', currentImageIndex)
  }, [currentImageIndex])

  // Test API configuration on component mount
  useEffect(() => {
    testApiConfiguration()
  }, [])

  // Auto-rotate carousel images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Load product images on component mount
  useEffect(() => {
    const loadImages = async () => {
      setImagesLoading(true)
      try {
        console.log('Loading product images...')
        const imageCache = await preloadProductImages(
          featuredProducts.map(p => ({ 
            name: p.name, 
            category: p.name.includes("Scarf") || p.name.includes("Dress") ? "Fashion" :
                     p.name.includes("Mask") ? "Art" :
                     p.name.includes("Oil") ? "Beauty" :
                     p.name.includes("Jewelry") ? "Jewelry" : "Fashion"
          }))
        )
        console.log('Product images loaded:', imageCache)
        setProductImages(imageCache)
      } catch (error) {
        console.error('Failed to load product images:', error)
      } finally {
        setImagesLoading(false)
      }
    }

    loadImages()
  }, [])

  // Handle hero image load events
  const handleHeroImageLoad = (index: number) => {
    console.log(`Hero image ${index} loaded successfully`)
    setHeroImagesLoaded(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  // Get the current hero image source (primary or fallback)
  const getCurrentHeroImageSrc = () => {
    const currentImage = heroImages[currentImageIndex]
    return currentImage.src
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <Badge className="bg-terracotta-100 text-terracotta-800 hover:bg-terracotta-200 text-sm px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  ENTREPRENEUR MARKETPLACE
                </Badge>
                
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Amplify Your{" "}
                  <span className="text-terracotta-500">Hustle</span>.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Kola connects Africa's most innovative entrepreneurs with the world. 
                  Turn your customers into your marketing team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                  <Button 
                    size="lg" 
                    className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3 text-lg rounded-full"
                  >
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/entrepreneurs">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-8 py-3 text-lg border-terracotta-200 hover:bg-terracotta-50 rounded-full"
                  >
                    Meet Entrepreneurs
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Column - Image Carousel with Clipped Background */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Clipped Background Shape */}
                <div 
                  className="absolute inset-0 bg-terracotta-500 rounded-3xl"
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)'
                  }}
                />
                
                {/* Image Carousel Container */}
                <div className="relative bg-terracotta-500 rounded-3xl p-8 min-h-[500px] lg:min-h-[600px]"
                     style={{
                       clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)'
                     }}>

                  {/* Image Carousel */}
                  <div className="relative w-full h-full overflow-hidden rounded-2xl">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0"
                      >
                        {/* Loading state for hero images */}
                        {!heroImagesLoaded[currentImageIndex] && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                          </div>
                        )}
                        
                        <img
                          src='https://i.pinimg.com/736x/74/50/88/74508867279bc50021c77e80d5f0c1fb.jpg'
                          alt={heroImages[currentImageIndex].alt}
                          className="w-full h-full object-cover rounded-2xl"
                          style={{ minHeight: 400, background: "#fff" }}
                        />
                        
                        {/* Image Overlay with Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-2xl">
                          <div className="text-white">
                            <h3 className="font-semibold text-lg mb-1">
                              {heroImages[currentImageIndex].name}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {heroImages[currentImageIndex].location}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Image Indicators */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-20 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-32 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-terracotta-100 rounded-xl mb-4">
                  <stat.icon className="h-6 w-6 text-terracotta-600" />
                </div>
                <div className="font-mono text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover handpicked products from our most talented entrepreneurs
            </p>
          </motion.div>

          {imagesLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-terracotta-500" />
              <span className="ml-2 text-muted-foreground">Loading beautiful product images...</span>
            </div>
          )}

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {featuredProducts.map((product, index) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-muted">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={productImages[product.name] || product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                  {imagesLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-terracotta-500 hover:bg-terracotta-600">
                    {product.badge}
                  </Badge>
                  <Button size="icon" variant="ghost" className="absolute top-3 right-3 bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-heading text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">by {product.entrepreneur}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <Button size="sm" className="bg-terracotta-500 hover:bg-terracotta-600 text-white">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-terracotta-200 hover:bg-terracotta-50">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Entrepreneurs */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Meet Our Entrepreneurs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get to know the talented creators behind these amazing products
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {featuredEntrepreneurs.map((entrepreneur, index) => (
              <Card key={entrepreneur.id} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <img
                      src={entrepreneur.image || "/placeholder.svg"}
                      alt={entrepreneur.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover"
                    />
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-terracotta-500">
                      {entrepreneur.category}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-1">{entrepreneur.name}</h3>
                  <p className="text-terracotta-600 font-medium mb-2">{entrepreneur.business}</p>
                  <p className="text-sm text-muted-foreground mb-4">{entrepreneur.location}</p>
                  <p className="text-sm mb-4 line-clamp-2">{entrepreneur.story}</p>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="font-bold text-lg">{entrepreneur.rating}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{entrepreneur.products}</div>
                      <div className="text-xs text-muted-foreground">Products</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{entrepreneur.sales}</div>
                      <div className="text-xs text-muted-foreground">Sales</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-terracotta-200 hover:bg-terracotta-50 bg-transparent"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Link href="/entrepreneurs">
              <Button
                variant="outline"
                size="lg"
                className="border-terracotta-200 hover:bg-terracotta-50 bg-transparent"
              >
                Meet All Entrepreneurs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to creating meaningful connections between entrepreneurs and customers
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-100 rounded-2xl mb-6">
                  <feature.icon className="h-8 w-8 text-terracotta-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Join thousands of customers who are already supporting African entrepreneurs and discovering
              unique products that tell a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3 text-lg">
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/entrepreneurs">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg border-terracotta-200 hover:bg-terracotta-50"
                >
                  Meet Entrepreneurs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
