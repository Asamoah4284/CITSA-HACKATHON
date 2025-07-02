"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { usePaystackPayment } from 'react-paystack'

interface PaymentButtonProps {
  total: number
  currency: string
  onSuccess: (reference?: string) => void
}

export default function PaymentButton({ total, currency, onSuccess }: PaymentButtonProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [userEmail, setUserEmail] = useState("customer@example.com")

  // Get user email from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          if (user.email) {
            setUserEmail(user.email)
            console.log('📧 Using user email for payment:', user.email)
          }
        } catch (error) {
          console.error('❌ Failed to parse user data:', error)
        }
      } else {
        console.log('⚠️ No user found in localStorage, using default email')
      }
    }
  }, [])

  // Paystack config
  const config = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: total * 100, // smallest currency unit (convert to kobo/pesewas)
    publicKey: "pk_test_c827720756c17a27051917f50a45e18e1cb423ae",
    currency: currency,
    onSuccess: (response: any) => {
      console.log('✅ Payment successful! Full response:', response)
      console.log('✅ Payment reference from response:', response.reference)
      console.log('✅ Payment transaction ID:', response.trxref)
      console.log('✅ Payment status:', response.status)
      setIsProcessingPayment(false)
      
      // Use the transaction reference from Paystack response
      const paymentReference = response.reference || response.trxref || config.reference
      console.log('✅ Final payment reference to use:', paymentReference)
      onSuccess(paymentReference)
    },
    onClose: () => {
      console.log('❌ Payment dialog closed by user')
      setIsProcessingPayment(false)
      alert('Payment was cancelled. Please try again.')
    },
    onError: (error: any) => {
      console.error('💥 Payment error:', error)
      setIsProcessingPayment(false)
      alert(`Payment failed: ${error.message || 'Unknown error occurred'}`)
    }
  }

  const initializePayment = usePaystackPayment(config)

  const handlePayment = () => {
    console.log('🚀 Starting payment process...')
    console.log('💰 Amount:', total, currency)
    console.log('📧 Email:', userEmail)
    console.log('🔧 Config reference:', config.reference)
    console.log('🔧 Config amount:', config.amount)
    
    setIsProcessingPayment(true)
    
    try {
      // Check if initializePayment is a function before calling
      if (typeof initializePayment === 'function') {
        console.log('✅ Calling initializePayment function...')
        initializePayment({}) // Pass empty object as required by react-paystack v6+
      } else {
        console.error('❌ initializePayment is not a function:', initializePayment)
        throw new Error('Payment initialization function is not available')
      }
    } catch (error) {
      console.error('💥 Failed to initialize payment:', error)
      setIsProcessingPayment(false)
      alert('Failed to initialize payment. Please try again.')
    }
  }

  return (
    <Button
      className="w-full bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white"
      size="lg"
      disabled={isProcessingPayment}
      onClick={handlePayment}
    >
      {isProcessingPayment ? 'Processing...' : 'Proceed to Checkout'}
    </Button>
  )
} 