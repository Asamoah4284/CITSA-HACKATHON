import { NextResponse } from 'next/server'
import { getBackendUrl, getApiUrl } from '@/lib/api-config'

export async function GET() {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    nextPublicBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    backendUrl: process.env.BACKEND_URL,
    finalBackendUrl: getBackendUrl(),
    sampleApiUrl: getApiUrl('/auth/login'),
    timestamp: new Date().toISOString()
  }

  console.log('🔧 API Config Test:', config)

  return NextResponse.json({
    message: 'API Configuration Test',
    config,
    success: true
  })
} 