"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Star, Heart, ShoppingCart, MapPin, Loader2, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { fetchProductImage, preloadProductImages } from "@/lib/image-utils"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-config"

const categories = ["All", "Fashion", "Accessories", "Beauty", "Art", "Food", "Jewelry"]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("featured")
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [imagesLoading, setImagesLoading] = useState(true)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const { addToCart } = useCart()
  const [artisans, setArtisans] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch artisans and products from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting to fetch marketplace data...")
        
        // Fetch artisans
        const artisansUrl = getApiUrl('/public/artisans')
        console.log("Fetching artisans from:", artisansUrl)
        const artisansRes = await fetch(artisansUrl)
        console.log("Artisans response status:", artisansRes.status)
        
        if (!artisansRes.ok) {
          throw new Error(`Failed to fetch artisans: ${artisansRes.status}`)
        }
        
        const artisansData = await artisansRes.json()
        console.log("Raw artisans data:", artisansData)
        
        const artisansArray = Array.isArray(artisansData) ? artisansData : 
                            (artisansData && Array.isArray(artisansData.artisans)) ? artisansData.artisans : []
        setArtisans(artisansArray)
        console.log("Processed artisans array:", artisansArray)

        // Fetch products
        const productsUrl = getApiUrl('/public/products')
        console.log("Fetching products from:", productsUrl)
        const productsRes = await fetch(productsUrl)
        console.log("Products response status:", productsRes.status)
        
        if (!productsRes.ok) {
          throw new Error(`Failed to fetch products: ${productsRes.status}`)
        }
        
        const productsData = await productsRes.json()
        console.log("Raw products data:", productsData)
        
        const productsArray = Array.isArray(productsData) ? productsData : 
                            (productsData && Array.isArray(productsData.products)) ? productsData.products : []
        setProducts(productsArray)
        console.log("Processed products array:", productsArray)

        console.log("Marketplace data fetch completed successfully")
      } catch (error) {
        console.error('Failed to fetch marketplace data:', error)
        toast({
          title: "Failed to load marketplace",
          description: "Unable to load products and artisans. Please try again later.",
          variant: "destructive"
        })
        setArtisans([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load product images on component mount
  useEffect(() => {
    if (products.length > 0) {
      const loadImages = async () => {
        setImagesLoading(true)
        try {
          const imageCache = await preloadProductImages(
            products.map(p => ({ name: p.name, category: p.category }))
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
  }, [products])

  const handleAddToCart = (product: any) => {
    if (!artisans.length) {
      alert("Artisans not loaded yet. Please wait and try again.")
      return
    }
    
    // Find the artisan for this product
    const artisan = artisans.find(a => a.id === product.artisan?.id || a.id === product.artisan)
    if (!artisan) {
      console.error("Artisan not found for product:", product)
      return
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      entrepreneur: artisan.name,
      entrepreneurId: artisan.id,
      image: productImages[product.name] || product.imageUrl || "/placeholder.svg",
      inStock: product.isAvailable,
    }
    addToCart(cartItem)
    
    // Show added state
    setAddedItems(prev => new Set(prev).add(product.id))
    
    // Show toast notification
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    })

    // Reset added state after 2 seconds
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 2000)
  }

  const filteredProducts = products.filter((product) => {
    const artisan = artisans.find(a => a.id === product.artisan?.id || a.id === product.artisan)
    const entrepreneurName = artisan ? artisan.name : ''
    
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneurName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Discover Amazing Products from{" "}
              <span className="text-[var(--color-accent-primary)]">African Creators</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Support talented entrepreneurs while finding unique, high-quality products that tell a story.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products or entrepreneurs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs lg:text-sm">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900">
              {loading ? "Loading..." : `${filteredProducts.length} Products Found`}
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
              <span className="ml-2 text-gray-600">Loading products from our talented artisans...</span>
            </div>
          )}

          {!loading && imagesLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
              <span className="ml-2 text-gray-600">Loading beautiful product images...</span>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found matching your criteria.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const artisan = artisans.find(a => a.id === product.artisan?.id || a.id === product.artisan)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="card-glow border-gray-200 bg-white overflow-hidden h-full">
                    <div className="relative">
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={productImages[product.name] || product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                        {imagesLoading && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
                        {product.discount && <Badge className="bg-red-500 text-white">-{product.discount}%</Badge>}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Stock Status */}
                      {!product.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="secondary" className="bg-white text-gray-900">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                        </div>

                        {artisan && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{artisan.location}</span>
                          </div>
                        )}

                        {artisan && (
                          <Link
                            href={`/entrepreneurs/${artisan.id}`}
                            className="text-sm text-[var(--color-accent-primary)] hover:underline"
                          >
                            by {artisan.name}
                          </Link>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button
                        className={`w-full transition-all duration-200 ${
                          addedItems.has(product.id)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90"
                        }`}
                        disabled={!product.isAvailable}
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedItems.has(product.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.isAvailable ? "Add to Cart" : "Out of Stock"}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Load More */}
          {!loading && filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
