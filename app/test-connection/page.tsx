"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TestConnectionPage() {
  const [status, setStatus] = useState<{
    envVars: boolean
    connection: boolean
    error?: string
  }>({
    envVars: false,
    connection: false,
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Check environment variables
      const hasEnvVars = !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      setStatus(prev => ({ ...prev, envVars: hasEnvVars }))

      if (!hasEnvVars) {
        setStatus(prev => ({ 
          ...prev, 
          error: "Environment variables not found. Check .env.local file." 
        }))
        return
      }

      // Test Supabase connection
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      setStatus({
        envVars: true,
        connection: true,
      })
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        connection: false,
        error: err instanceof Error ? err.message : "Connection failed"
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Environment Variables</span>
              <span className={status.envVars ? "text-green-600" : "text-red-600"}>
                {status.envVars ? "✓ Found" : "✗ Missing"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Supabase Connection</span>
              <span className={status.connection ? "text-green-600" : "text-red-600"}>
                {status.connection ? "✓ Connected" : "✗ Failed"}
              </span>
            </div>
          </div>

          {status.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Error:</strong> {status.error}
            </div>
          )}

          {status.envVars && (
            <div className="space-y-2 text-sm">
              <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={testConnection} className="w-full">
              Test Again
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>

          {!status.connection && (
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check if your Supabase project is fully initialized (takes 2-3 min)</li>
                <li>Verify the URL and key in .env.local are correct</li>
                <li>Make sure you restarted the dev server after updating .env.local</li>
                <li>Check your internet connection</li>
                <li>Try accessing your Supabase project URL in a browser</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
