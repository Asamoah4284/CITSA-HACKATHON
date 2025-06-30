"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePaystackPayment } from 'react-paystack'

interface PaymentButtonProps {
  total: number
  currency: string
  onSuccess: () => void
}

export default function PaymentButton({ total, currency, onSuccess }: PaymentButtonProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Paystack config
  const config = {
    reference: new Date().getTime().toString(),
    email: "customer@example.com", // Replace with real user email
    amount: total * 100, // smallest currency unit (convert to kobo/pesewas)
    publicKey: "pk_test_c827720756c17a27051917f50a45e18e1cb423ae",
    currency: currency,
    onSuccess: (reference: any) => {
      setIsProcessingPayment(false)
      onSuccess()
    },
    onClose: () => {
      setIsProcessingPayment(false)
      alert('Payment dialog closed')
    }
  }

  const initializePayment = usePaystackPayment(config)

  const handlePayment = () => {
    setIsProcessingPayment(true)
    initializePayment()
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