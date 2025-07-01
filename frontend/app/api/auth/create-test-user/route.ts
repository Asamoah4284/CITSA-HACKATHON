import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Create test user request body:', body)
    
    // Use the API configuration utility to get the correct backend URL
    const registerUrl = getApiUrl('/auth/register')
    console.log('🌐 Sending request to:', registerUrl)
    
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 Backend response status:', response.status)
    console.log('📡 Backend response headers:', Object.fromEntries(response.headers.entries()))

    let data
    try {
      data = await response.json()
      console.log('📡 Backend response data:', data)
    } catch (parseError) {
      console.error('❌ Failed to parse backend response:', parseError)
      return NextResponse.json(
        { error: 'Invalid response from backend server' },
        { status: 500 }
      )
    }

    if (!response.ok) {
      console.error('❌ Backend registration failed:', data)
      return NextResponse.json(
        { error: data?.error || `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    console.log('✅ Registration successful')
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('💥 Registration API error:', error)
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 