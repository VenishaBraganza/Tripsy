'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, AlertCircle, Copy } from 'lucide-react'

export default function FixDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const runDatabaseFix = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fix-database', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        })
      } else {
        toast({
          title: "Manual Setup Required",
          description: "Please follow the SQL instructions below",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "SQL copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Fix Database for Personalization
          </h1>
          <p className="text-gray-600">
            This will check and fix your database to enable the personalization system
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Database Status Check</CardTitle>
            <CardDescription>
              Click the button below to check if your database needs fixing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDatabaseFix}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Checking Database...' : 'Check & Fix Database'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                {result.success ? 'Database Ready!' : 'Manual Setup Required'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <p className="text-green-700">{result.message}</p>
                  <p className="text-sm text-gray-600">{result.next_step}</p>
                  <Button 
                    onClick={() => window.location.href = '/personalization'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Go to Personalization Form
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-orange-700 mb-4">{result.error}</p>
                  
                  {result.instructions && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-3">Follow these steps:</h3>
                      <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        <li>{result.instructions.step1}</li>
                        <li>{result.instructions.step2}</li>
                        <li>{result.instructions.step3}</li>
                      </ol>
                      
                      {result.instructions.sql && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-blue-900">SQL to run:</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(result.instructions.sql)}
                              className="text-blue-700 border-blue-300"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy SQL
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
                            {result.instructions.sql}
                          </pre>
                        </div>
                      )}
                      
                      <p className="mt-3 text-blue-800">
                        <strong>{result.instructions.step4}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/personalization'}
              >
                Try Personalization Form
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/test-personalization'}
              >
                Test Personalization System
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://supabase.com', '_blank')}
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}