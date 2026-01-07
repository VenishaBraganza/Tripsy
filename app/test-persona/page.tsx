'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPersonaPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testDebugAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/persona/debug')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testSavePersonas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personas: ['nature-lover', 'photographer']
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testSkipPersonas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/persona', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Persona API Test</h1>
      
      <div className="grid gap-4 mb-6">
        <Button onClick={testDebugAPI} disabled={loading}>
          Test Debug API
        </Button>
        <Button onClick={testSavePersonas} disabled={loading}>
          Test Save Personas
        </Button>
        <Button onClick={testSkipPersonas} disabled={loading}>
          Test Skip Personas
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}