'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function TestPersonalizationPage() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkTableExists()
    fetchUserPreferences()
  }, [])

  const checkTableExists = async () => {
    try {
      const response = await fetch('/api/migrate/personalization-table')
      const data = await response.json()
      setTableExists(data.exists)
    } catch (error) {
      console.error('Error checking table:', error)
      setTableExists(false)
    }
  }

  const createTable = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/migrate/personalization-table', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Personalization table created successfully",
        })
        setTableExists(true)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create table",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create table",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/personalization')
      const data = await response.json()
      
      if (data.success) {
        setUserPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const testPersonalizationSave = async () => {
    setLoading(true)
    try {
      const testData = {
        preferredRegion: 'south-karnataka',
        tripDuration: '4-7-days',
        numberOfTravelers: 2,
        travelType: 'couple',
        interests: ['nature-hills', 'food-cuisine'],
        budgetPreference: 'medium',
        travelPace: 'balanced',
        safetyPreferences: ['safe-connected'],
        accommodationPreference: 'any',
        foodPreference: 'no-preference'
      }

      const response = await fetch('/api/personalization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Test personalization data saved successfully",
        })
        fetchUserPreferences()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save test data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save test data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personalization System Test
          </h1>
          <p className="text-gray-600">
            Test the personalization table and API endpoints
          </p>
        </div>

        <div className="grid gap-6">
          {/* Database Migration */}
          <Card>
            <CardHeader>
              <CardTitle>Database Migration</CardTitle>
              <CardDescription>
                Add required columns and tables for personalization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Run this if you're getting "onboarding_completed column not found" errors
                  </p>
                </div>
                <Button 
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const response = await fetch('/api/migrate/add-onboarding-column', {
                        method: 'POST'
                      })
                      const data = await response.json()
                      
                      if (data.success) {
                        toast({
                          title: "Success",
                          description: "Database migration completed successfully",
                        })
                      } else {
                        toast({
                          title: "Migration Info",
                          description: data.message || "Migration completed with warnings",
                          variant: "default",
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to run migration",
                        variant: "destructive",
                      })
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Running...' : 'Run Migration'}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Database Table Status</CardTitle>
              <CardDescription>
                Check if the user_personalization table exists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    Table Status: {' '}
                    <span className={`font-medium ${
                      tableExists === true ? 'text-green-600' : 
                      tableExists === false ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {tableExists === true ? 'EXISTS' : 
                       tableExists === false ? 'NOT FOUND' : 'CHECKING...'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={checkTableExists}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  {tableExists === false && (
                    <Button 
                      onClick={createTable}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Table'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Test */}
          <Card>
            <CardHeader>
              <CardTitle>API Test</CardTitle>
              <CardDescription>
                Test saving personalization data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Save test personalization data to verify the API works
                  </p>
                </div>
                <Button 
                  onClick={testPersonalizationSave}
                  disabled={loading || tableExists !== true}
                >
                  {loading ? 'Testing...' : 'Test Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Preferences Display */}
          {userPreferences && (
            <Card>
              <CardHeader>
                <CardTitle>Current User Preferences</CardTitle>
                <CardDescription>
                  Your saved personalization data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(userPreferences, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>
                Test the personalization flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.location.href = '/personalization'}
                  variant="outline"
                >
                  Go to Personalization Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}