"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DiagnosePage() {
  const [results, setResults] = useState<string[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setTesting(true)
    setResults([])

    try {
      // Test 1: Check environment variables
      addResult("✓ Testing environment variables...")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl) {
        addResult("✗ NEXT_PUBLIC_SUPABASE_URL is missing!")
        return
      }
      if (!supabaseKey) {
        addResult("✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!")
        return
      }

      addResult(`✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
      addResult(`✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`)

      // Test 2: Create client
      addResult("✓ Creating Supabase client...")
      const supabase = getSupabaseBrowserClient()
      addResult("✓ Client created successfully")

      // Test 3: Test network connection
      addResult("✓ Testing network connection to Supabase...")
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': supabaseKey,
          }
        })
        addResult(`✓ Network response: ${response.status} ${response.statusText}`)
      } catch (netErr) {
        addResult(`✗ Network test failed: ${netErr instanceof Error ? netErr.message : 'Unknown error'}`)
      }

      // Test 4: Test auth session
      addResult("✓ Testing auth.getSession()...")
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addResult(`✗ Session error: ${sessionError.message}`)
      } else {
        addResult(`✓ Session check successful (current session: ${sessionData.session ? 'Active' : 'None'})`)
      }

      // Test 5: Test auth endpoint directly
      addResult("✓ Testing auth endpoint...")
      try {
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/health`, {
          headers: {
            'apikey': supabaseKey,
          }
        })
        const authHealth = await authResponse.json()
        addResult(`✓ Auth health: ${JSON.stringify(authHealth)}`)
      } catch (authErr) {
        addResult(`✗ Auth endpoint error: ${authErr instanceof Error ? authErr.message : 'Unknown error'}`)
      }

      // Test 6: Try a test sign up
      addResult("✓ Testing sign up endpoint...")
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: `test-${Date.now()}@example.com`,
          password: 'test123456',
        })

        if (signUpError) {
          if (signUpError.message.includes("already registered") || signUpError.message.includes("User already registered")) {
            addResult("✓ Sign up endpoint is working (test user exists)")
          } else {
            addResult(`⚠ Sign up returned: ${signUpError.message}`)
          }
        } else {
          addResult("✓ Sign up endpoint is working perfectly!")
        }
      } catch (signUpErr) {
        addResult(`✗ Sign up test failed: ${signUpErr instanceof Error ? signUpErr.message : 'Unknown error'}`)
      }

      addResult("✓ All tests completed!")

    } catch (error) {
      addResult(`✗ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error("Test error:", error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>🔍 Supabase Connection Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={testing} className="flex-1">
              {testing ? "Running Tests..." : "Run Diagnostic Tests"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>

          {results.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {results.map((result, i) => (
                <div 
                  key={i} 
                  className={
                    result.includes('✗') ? 'text-red-400' : 
                    result.includes('⚠') ? 'text-yellow-400' : 
                    'text-green-400'
                  }
                >
                  {result}
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Common Issues:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Environment variables not loaded: Restart dev server</li>
              <li>CORS errors: Check Supabase Auth URL configuration</li>
              <li>Paused project: Check Supabase dashboard</li>
              <li>Wrong URL/Key: Verify from Project Settings → API</li>
              <li>Ad blocker: Try disabling temporarily</li>
              <li>Email provider not enabled: Authentication → Providers → Email</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
