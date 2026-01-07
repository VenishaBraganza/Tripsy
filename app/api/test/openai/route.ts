import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      })
    }

    // Test API key with a simple request
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({
        success: false,
        error: `OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'OpenAI API connected successfully!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Connection failed: ${error.message}`
    })
  }
}