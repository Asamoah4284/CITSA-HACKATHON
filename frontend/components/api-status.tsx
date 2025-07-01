"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBackendUrl, getApiUrl, testApiConfiguration } from "@/lib/api-config"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export function ApiStatus() {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkConfiguration = () => {
    setIsLoading(true)
    testApiConfiguration()
    
    const configData = {
      environment: process.env.NODE_ENV,
      nextPublicBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      backendUrl: process.env.BACKEND_URL,
      finalBackendUrl: getBackendUrl(),
      sampleApiUrl: getApiUrl('/auth/login'),
      timestamp: new Date().toISOString()
    }
    
    setConfig(configData)
    setIsLoading(false)
  }

  useEffect(() => {
    checkConfiguration()
  }, [])

  if (!config) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            API Configuration
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasBackendUrl = !!config.nextPublicBackendUrl || !!config.backendUrl
  const isProduction = config.environment === 'production'
  const isUsingRender = config.finalBackendUrl.includes('onrender.com')

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Configuration
          <Badge variant={hasBackendUrl ? "default" : "destructive"}>
            {hasBackendUrl ? "Configured" : "Not Configured"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Environment:</span>
            <Badge variant={isProduction ? "default" : "secondary"}>
              {config.environment}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Backend URL:</span>
            <div className="flex items-center gap-1">
              {hasBackendUrl ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {hasBackendUrl ? "Set" : "Not Set"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Using Render:</span>
            <div className="flex items-center gap-1">
              {isUsingRender ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isUsingRender ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <strong>Final Backend URL:</strong>
            <div className="break-all mt-1 p-2 bg-muted rounded">
              {config.finalBackendUrl}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <strong>Sample API URL:</strong>
            <div className="break-all mt-1 p-2 bg-muted rounded">
              {config.sampleApiUrl}
            </div>
          </div>
        </div>

        <Button 
          onClick={checkConfiguration} 
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Configuration
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(config.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
} 