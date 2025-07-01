"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestConnectionPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testBackendConnection = async () => {
    setIsLoading(true)
    setTestResults(null)

    try {
      console.log('🧪 Testing backend connection...')
      
      // Test 1: Health check
      const healthResponse = await fetch('https://citsa-hackathon-2.onrender.com/health')
      const healthData = await healthResponse.json()
      
      // Test 2: Test endpoint
      const testResponse = await fetch('https://citsa-hackathon-2.onrender.com/test')
      const testData = await testResponse.json()
      
      // Test 3: Login endpoint (without credentials)
      const loginResponse = await fetch('https://citsa-hackathon-2.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        }),
      })
      const loginData = await loginResponse.json()

      setTestResults({
        health: {
          status: healthResponse.status,
          data: healthData,
          success: healthResponse.ok
        },
        test: {
          status: testResponse.status,
          data: testData,
          success: testResponse.ok
        },
        login: {
          status: loginResponse.status,
          data: loginData,
          success: loginResponse.ok
        }
      })

      console.log('✅ Backend connection test completed')
    } catch (error: any) {
      console.error('❌ Backend connection test failed:', error)
      setTestResults({
        error: error.message,
        stack: error.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Connection Test</h1>
          <p className="text-gray-600">Test the connection to the deployed backend server</p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={testBackendConnection} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Testing...' : 'Test Backend Connection'}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-6">
            {testResults.error ? (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Connection Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 mb-2">{testResults.error}</p>
                  <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                    {testResults.stack}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Health Check
                      <Badge variant={testResults.health.success ? "default" : "destructive"}>
                        {testResults.health.success ? "Success" : "Failed"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {testResults.health.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(testResults.health.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Test Endpoint
                      <Badge variant={testResults.test.success ? "default" : "destructive"}>
                        {testResults.test.success ? "Success" : "Failed"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {testResults.test.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(testResults.test.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Login Endpoint
                      <Badge variant={testResults.login.status === 401 ? "default" : "destructive"}>
                        {testResults.login.status === 401 ? "Expected Error" : "Unexpected"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {testResults.login.status} (Expected: 401 for invalid credentials)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(testResults.login.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 