"use client"

import { useEffect, useState } from "react"

interface Order {
  _id: string
  userId: string
  items: any[]
  total: number
  reference: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError("")
      try {
        const userId = (typeof window !== 'undefined' && localStorage.getItem('userId')) || 'guest'
        const res = await fetch(`http://localhost:5000/app/orders?userId=${userId}`)
        if (!res.ok) throw new Error("Failed to fetch orders")
        const data = await res.json()
        setOrders(data)
      } catch (e: any) {
        setError(e.message || "Error loading orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Your Orders</h1>
      {loading && <div>Loading orders...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div className="text-muted-foreground">You have no orders yet.</div>
      )}
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-semibold">Order Ref: {order.reference}</div>
                <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="font-mono font-bold text-lg">${order.total.toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Items:</div>
              <ul className="list-disc pl-5">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    {item.name} x{item.quantity} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 