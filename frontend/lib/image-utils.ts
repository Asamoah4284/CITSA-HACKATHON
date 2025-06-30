// Image utility functions for fetching real product images

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo-key'

interface UnsplashImage {
  id: string
  urls: {
    regular: string
    small: string
    thumb: string
  }
  alt_description: string
  description: string
}

// Search terms mapped to product categories for better image matching
const PRODUCT_SEARCH_TERMS = {
  'Adinkra Silk Scarf': 'african silk scarf adinkra pattern',
  'Handwoven Kente Bag': 'african kente cloth bag handwoven',
  'Shea Butter Skincare Set': 'shea butter skincare african beauty',
  'Wooden Sculpture Art': 'african wooden sculpture art',
  'Ethiopian Coffee Blend': 'ethiopian coffee beans traditional',
  'Beaded Jewelry Collection': 'african beaded jewelry traditional',
  'Adinkra Earrings': 'african adinkra earrings traditional',
  'Ankara Print Dress': 'african ankara print dress',
  'Kente Headwrap': 'african kente headwrap traditional',
  'Handwoven Kente Scarf': 'african kente scarf handwoven',
  'Carved Wooden Mask': 'african wooden mask carved',
  'Argan Oil Hair Treatment': 'argan oil hair treatment moroccan',
  'Beaded Jewelry Set': 'african beaded jewelry set',
  'Moroccan Tea Set': 'moroccan tea set ceramic traditional',
  'Decorative Plate': 'african decorative plate traditional',
  'Recycled Bead Necklace': 'african bead necklace recycled',
  'Bone Carved Bracelet': 'african bone bracelet carved'
}

// Fallback search terms for categories
const CATEGORY_SEARCH_TERMS = {
  'Fashion': 'african fashion traditional clothing',
  'Accessories': 'african accessories traditional',
  'Beauty': 'african beauty products natural',
  'Art': 'african art traditional sculpture',
  'Food': 'african food traditional cuisine',
  'Jewelry': 'african jewelry traditional beads',
  'Kitchenware': 'african kitchenware traditional',
  'Decor': 'african home decor traditional'
}

export async function fetchProductImage(productName: string, category: string): Promise<string> {
  try {
    // Use specific search term for the product if available
    const searchTerm = PRODUCT_SEARCH_TERMS[productName as keyof typeof PRODUCT_SEARCH_TERMS] || 
                      CATEGORY_SEARCH_TERMS[category as keyof typeof CATEGORY_SEARCH_TERMS] ||
                      `${category.toLowerCase()} african traditional`
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      // Return a random image from the results for variety
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5))
      return data.results[randomIndex].urls.regular
    }
    
    throw new Error('No images found')
  } catch (error) {
    console.error('Error fetching product image:', error)
    // Return a fallback image
    return getFallbackImage(category)
  }
}

function getFallbackImage(category: string): string {
  // Fallback to high-quality placeholder images based on category
  const fallbackImages = {
    'Fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    'Accessories': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
    'Beauty': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    'Art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    'Food': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    'Kitchenware': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    'Decor': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
  }
  
  return fallbackImages[category as keyof typeof fallbackImages] || 
         'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
}

// Pre-fetch images for better performance
export async function preloadProductImages(products: Array<{name: string, category: string}>): Promise<Record<string, string>> {
  const imageCache: Record<string, string> = {}
  
  for (const product of products) {
    try {
      const imageUrl = await fetchProductImage(product.name, product.category)
      imageCache[product.name] = imageUrl
    } catch (error) {
      console.error(`Failed to preload image for ${product.name}:`, error)
      imageCache[product.name] = getFallbackImage(product.category)
    }
  }
  
  return imageCache
} 