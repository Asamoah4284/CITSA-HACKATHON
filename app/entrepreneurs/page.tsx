"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Star, Users, Package, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const categories = ["All", "Fashion", "Accessories", "Technology", "Food & Beverage", "Beauty & Wellness", "Jewelry"]
const locations = ["All Locations", "Nigeria", "Ghana", "Kenya", "Senegal", "Morocco", "South Africa"]

export default function EntrepreneursPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [sortBy, setSortBy] = useState("featured")
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      try {
        const res = await fetch('http://localhost:5000/public/artisans')
        const data = await res.json()
        const entrepreneursArray = Array.isArray(data) ? data : 
                                (data && Array.isArray(data.artisans)) ? data.artisans : []
        setEntrepreneurs(entrepreneursArray)
        console.log("Fetched entrepreneurs:", entrepreneursArray)
      } catch (error) {
        console.error('Failed to fetch entrepreneurs:', error)
        setEntrepreneurs([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntrepreneurs()
  }, [])

  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    const matchesSearch =
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.specialty || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.story || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || entrepreneur.specialty === selectedCategory
    const matchesLocation = selectedLocation === "All Locations" || (entrepreneur.location || "").includes(selectedLocation)
    return matchesSearch && matchesCategory && matchesLocation
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
              Meet the <span className="text-[var(--color-accent-primary)]">Entrepreneurs</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover the talented creators behind amazing products. Each entrepreneur brings unique stories, heritage,
              and innovation to the global marketplace.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search entrepreneurs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="followers">Most Followers</SelectItem>
                  <SelectItem value="products">Most Products</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Entrepreneurs Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900">
              {loading ? "Loading..." : `${filteredEntrepreneurs.length} Entrepreneurs Found`}
            </h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading talented entrepreneurs...</p>
              </div>
            </div>
          )}

          {!loading && filteredEntrepreneurs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No entrepreneurs found matching your criteria.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEntrepreneurs.map((entrepreneur, index) => (
              <motion.div
                key={entrepreneur.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="card-glow border-gray-200 bg-white overflow-hidden h-full">
                  {/* Banner */}
                  <div className="relative h-32">
                    <Image
                      src={entrepreneur.banner || "/placeholder.svg"}
                      alt={`${entrepreneur.name} banner`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {entrepreneur.isActive && <Badge className="bg-green-500 text-white">Active</Badge>}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="relative -mt-12 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={entrepreneur.imageUrl || "/placeholder.svg"}
                        alt={entrepreneur.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <CardContent className="p-6 pt-4">
                    <div className="text-center mb-4">
                      <h3 className="font-heading text-xl font-bold text-gray-900 mb-1">{entrepreneur.name}</h3>
                      <p className="text-[var(--color-accent-primary)] font-medium mb-2">{entrepreneur.specialty}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{entrepreneur.location}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{entrepreneur.story}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Package className="h-4 w-4 text-gray-600" />
                          <span className="font-bold text-gray-900">{entrepreneur.productCount || 0}</span>
                        </div>
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-gray-600" />
                          <span className="font-bold text-gray-900">
                            {entrepreneur.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Status</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/entrepreneurs/${entrepreneur.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90">
                          View Profile
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {!loading && filteredEntrepreneurs.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Entrepreneurs
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
