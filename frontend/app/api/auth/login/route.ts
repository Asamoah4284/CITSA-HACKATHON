import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  console.log('🚀 Login API route called')
  
  try {
    const body = await request.json()
    console.log('🔐 Login request body:', body)
    
    // Use the API configuration utility to get the correct backend URL
    const loginUrl = getApiUrl('/auth/login')
    console.log('🌐 Backend URL from env:', process.env.NEXT_PUBLIC_BACKEND_URL)
    console.log('🌐 Sending request to:', loginUrl)
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 Backend response status:', response.status)

    const data = await response.json()
    console.log('📡 Backend response data:', data)

    if (!response.ok) {
      console.error('❌ Backend login failed:', data)
      return NextResponse.json(
        { error: data?.error || `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    console.log('✅ Login successful')
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('💥 Login API error:', error)
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 