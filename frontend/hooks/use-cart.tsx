"use client"

import { useState, useEffect, createContext, useContext } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  entrepreneur: string
  entrepreneurId: string
  image: string
  quantity: number
  inStock: boolean
}

const CartContext = createContext<ReturnType<typeof useCart> | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart()
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCartContext must be used within a CartProvider')
  return context
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart)
            setCartItems(parsedCart)
            console.log('Cart loaded:', parsedCart) // Debug log
          } else {
            setCartItems([])
            console.log('No saved cart found') // Debug log
          }
        } else {
          // If we're on the server, just set empty cart
          setCartItems([])
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        setCartItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()

    // Listen for storage changes (when cart is updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        console.log('Cart storage changed:', e.newValue) // Debug log
        loadCart()
      }
    }

    // Only add event listener in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      console.log('Cart saved:', cartItems) // Debug log
    }
  }, [cartItems, isLoading])

  // Add item to cart
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    console.log('Adding to cart:', item) // Debug log
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        // If item already exists, increase quantity
        const updatedItems = prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
        console.log('Updated existing item, new cart:', updatedItems) // Debug log
        return updatedItems
      } else {
        // If item doesn't exist, add it with quantity 1
        const newItems = [...prevItems, { ...item, quantity: 1 }]
        console.log('Added new item, new cart:', newItems) // Debug log
        return newItems
      }
    })
  }

  // Update item quantity
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id)
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  // Clear entire cart
  const clearCart = () => {
    setCartItems([])
  }

  // Get cart count (total number of items)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Get cart total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0

  console.log('Cart hook state:', { cartItems, cartCount, isLoading }) // Debug log

  return {
    cartItems,
    cartCount,
    cartTotal,
    isCartEmpty,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  }
} 