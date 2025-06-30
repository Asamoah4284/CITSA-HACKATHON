"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Set your project currency here
const projectCurrency = "USD"; // Change to "USD" or "NGN" as needed

// Determine Paystack currency
let paystackCurrency = "NGN";
if (projectCurrency === "USD") {
  paystackCurrency = "GHS"; // Use Ghana Cedis if project currency is USD
}

// Helper function to safely get origin
const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return '' // Return empty string during SSR
}

// Dynamically import PaymentButton with no SSR
const PaymentButton = dynamic(
  () => import('@/components/PaymentButton'),
  { 
    ssr: false,
    loading: () => (
      <Button disabled className="w-full">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading Payment...
      </Button>
    )
  }
)

export default function CartPage() {
  const { cartItems, cartCount, cartTotal, isLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [showCircleModal, setShowCircleModal] = useState(false)
  const [currentArtisan, setCurrentArtisan] = useState<any>(null)
  const [referralLink, setReferralLink] = useState("")
  const [pendingArtisans, setPendingArtisans] = useState<any[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { isAuthenticated } = useAuth()
  
  // State for client-side values
  const [userId, setUserId] = useState<string>('guest')
  const [userToken, setUserToken] = useState<string>('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const latestReference = useRef<any>(null)

  const shipping = cartTotal > 100 ? 0 : 15
  const total = cartTotal + shipping

  // Initialize client-side values in useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get userId from localStorage
      const storedUserId = localStorage.getItem('userId') || 'guest'
      setUserId(storedUserId)
      // Get token from localStorage
      const storedToken = localStorage.getItem('token') || ''
      setUserToken(storedToken)
    }
  }, [])

  // PaymentButton onSuccess wrapper
  const handlePaymentButtonSuccess = () => {
    setPaymentSuccess(true)
  }

  // Effect to handle order creation and modal logic after payment
  useEffect(() => {
    if (paymentSuccess) {
      // Use the latest reference if needed (could be set in PaymentButton via callback, or just trigger order creation here)
      (async () => {
        setIsProcessingPayment(false)
        try {
          await fetch('http://localhost:5000/app/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              items: cartItems,
              total,
              reference: latestReference.current || 'N/A',
            })
          })
        } catch (e) {
          // Optionally show error toast
        }
        const uniqueArtisanIds = Array.from(new Set(cartItems.map(item => item.entrepreneurId)));
        const uniqueArtisans = uniqueArtisanIds.map(id => {
          const item = cartItems.find(item => item.entrepreneurId === id);
          return {
            _id: id,
            id: id,
            entrepreneurId: id,
            entrepreneur: item?.entrepreneur || 'Unknown Artisan'
          };
        });
        setPendingArtisans(uniqueArtisans)
        setCurrentArtisan(uniqueArtisans[0])
        clearCart();
        toast({
          title: "Payment Successful!",
          description: `Your payment was successful.`,
          action: (
            <button onClick={() => router.push('/orders')} className="underline text-primary">
              View Order
            </button>
          )
        })
        setPaymentSuccess(false)
      })()
    }
  }, [paymentSuccess])

  const handleJoinCircle = async (artisan: any) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to join artisan circles and generate referral links.",
        variant: "destructive"
      });
      return;
    }

    // Get the correct artisan ID - handle both API format (id) and database format (_id)
    const artisanId = artisan._id || artisan.id || artisan.entrepreneurId;
    
    // Validate that we have a valid artisan ID
    if (!artisanId) {
      console.error("No valid artisan ID found in:", artisan);
      toast({
        title: "Error",
        description: "Invalid artisan information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    console.log("=== REFERRAL DEBUG TEST ===");
    console.log("Artisan object:", artisan);
    console.log("Artisan ID being sent:", artisanId, typeof artisanId);
    console.log("Is artisanId 24 hex chars?", /^[a-f0-9]{24}$/.test(artisanId));
    
    try {
      // Use the token from state instead of direct localStorage access
      if (!userToken) {
        toast({
          title: "Authentication required",
          description: "Please log in to generate referral links.",
          variant: "destructive"
        });
        return;
      }

      console.log("Sending request to generate referral for artisan:", artisanId);
      const res = await fetch('http://localhost:5000/app/generate-referral-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          artisanId: artisanId
        })
      })
      
      const data = await res.json()
      console.log("Referral generation response status:", res.status);
      console.log("Referral generation response data:", data);
      
      if (res.ok && data.referral && data.referral.referralCode) {
        const referralLink = `${getOrigin()}/entrepreneurs/${artisanId}?ref=${data.referral.referralCode}`;
        setReferralLink(referralLink)
        toast({
          title: "Referral link generated!",
          description: "Your referral link has been created successfully.",
        });
      } else if (res.status === 400 && data.error && data.error.includes('already generated')) {
        // User already has a referral link for this artisan
        if (data.referral && data.referral.referralCode) {
          const referralLink = `${getOrigin()}/entrepreneurs/${artisanId}?ref=${data.referral.referralCode}`;
          setReferralLink(referralLink)
          toast({
            title: "Existing referral link found",
            description: "You already have a referral link for this artisan.",
          });
        } else {
          setReferralLink('Could not retrieve existing referral link.')
          toast({
            title: "Error",
            description: "Could not retrieve existing referral link.",
            variant: "destructive"
          });
        }
      } else {
        setReferralLink('Could not generate referral link.')
        toast({
          title: "Error",
          description: data.error || "Failed to generate referral link.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error("Referral generation error:", e);
      setReferralLink('Could not generate referral link.')
      toast({
        title: "Connection error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Modal navigation
  const handleModalAccept = async () => {
    if (currentArtisan) {
      await handleJoinCircle(currentArtisan)
    }
  }
  const handleModalNext = () => {
    const idx = pendingArtisans.findIndex(a => a.entrepreneurId === currentArtisan.entrepreneurId)
    if (idx < pendingArtisans.length - 1) {
      setCurrentArtisan(pendingArtisans[idx + 1])
      setReferralLink("")
    } else {
      setShowCircleModal(false)
      setReferralLink("")
    }
  }

  useEffect(() => {
    if (currentArtisan) {
      setShowCircleModal(true);
    }
  }, [currentArtisan]);

  // Modal always rendered so it appears even if cart is empty
  const modal = (
    <Dialog open={showCircleModal} onOpenChange={setShowCircleModal}>
      <DialogContent>
        <DialogTitle>Join {currentArtisan?.entrepreneur}'s Circle?</DialogTitle>
        <DialogDescription>
          Promote {currentArtisan?.entrepreneur} and earn more points! Would you like to join their Artisan Circle?
        </DialogDescription>
        {referralLink ? (
          <div>
            <div className="mb-2">Your referral link:</div>
            <div className="p-2 bg-muted rounded font-mono break-all">{referralLink}</div>
            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={handleModalNext}>Continue</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 justify-end mt-4">
            <Button onClick={handleModalAccept}>Yes, join and get my referral link</Button>
            <Button variant="secondary" onClick={handleModalNext}>No, maybe later</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <>
        {modal}
        <div className="min-h-screen pt-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
              <span className="ml-2 text-gray-600">Loading your cart...</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (cartItems.length === 0) {
    return (
      <>
        {modal}
        <div className="min-h-screen pt-8">
          <div className="container mx-auto px-4">
            <motion.div className="text-center py-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--color-surface)] rounded-full mb-6">
                <ShoppingBag className="h-12 w-12 text-[var(--color-text-secondary)]" />
              </div>
              <h1 className="font-heading text-3xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                Discover amazing products from talented African entrepreneurs and start building your collection.
              </p>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white"
                >
                  Start Shopping
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {modal}
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/marketplace">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold growth-arc">Shopping Cart</h1>
              <p className="text-[var(--color-text-secondary)]">{cartCount} items in your cart</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                              <Link
                                href={`/entrepreneurs/${item.entrepreneurId}`}
                                className="text-sm text-[var(--color-accent-primary)] hover:underline"
                              >
                                by {item.entrepreneur}
                              </Link>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg font-bold">${item.price}</span>
                              {item.originalPrice && (
                                <span className="font-mono text-sm text-[var(--color-text-secondary)] line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[var(--color-surface)] border-[var(--color-border)] sticky top-24">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-mono">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {shipping === 0 && <p className="text-xs text-green-600">Free shipping on orders over $100!</p>}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="font-mono">${total.toFixed(2)}</span>
                  </div>

                  {/* Payment Button (dynamic, client-only) */}
                  <PaymentButton
                    total={total}
                    currency={paystackCurrency}
                    onSuccess={handlePaymentButtonSuccess}
                  />

                  <div className="text-center">
                    <Link href="/marketplace">
                      <Button variant="ghost" className="text-[var(--color-accent-primary)]">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Entrepreneur Circle Invitation */}
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <h4 className="font-semibold mb-2">Join Entrepreneur Circles</h4>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      After purchase, you'll be invited to join the circles of the entrepreneurs whose products you
                      bought.
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Earn rewards for referrals and support
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
