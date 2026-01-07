import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { errors } = await request.json()
    
    if (!Array.isArray(errors)) {
      return NextResponse.json({ error: 'Invalid errors format' }, { status: 400 })
    }

    // Log errors to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🐛 Client Errors Received:', errors.length, 'errors')
      errors.forEach((error: any) => {
        console.error(`[${error.severity.toUpperCase()}] ${error.message}`, {
          id: error.id,
          url: error.url,
          stack: error.stack,
          metadata: error.metadata
        })
      })
    }

    // In production, store errors and potentially send alerts
    if (process.env.NODE_ENV === 'production') {
      const supabase = await getSupabaseServerClient()
      
      // Store in database (you'd need to create an error_reports table)
      const { error: dbError } = await supabase
        .from('error_reports')
        .insert(
          errors.map((error: any) => ({
            error_id: error.id,
            message: error.message,
            stack: error.stack,
            url: error.url,
            line_number: error.lineNumber,
            column_number: error.columnNumber,
            user_id: error.userId,
            session_id: error.sessionId,
            user_agent: error.userAgent,
            severity: error.severity,
            metadata: error.metadata,
            timestamp: new Date(error.timestamp).toISOString(),
          }))
        )
      
      if (dbError) {
        console.error('Failed to store error reports:', dbError)
      }

      // Send alerts for critical errors
      const criticalErrors = errors.filter((error: any) => error.severity === 'critical')
      if (criticalErrors.length > 0) {
        await sendCriticalErrorAlert(criticalErrors)
      }
    }

    return NextResponse.json({ success: true, received: errors.length })
  } catch (error) {
    console.error('Error processing error reports:', error)
    return NextResponse.json({ error: 'Failed to process error reports' }, { status: 500 })
  }
}

async function sendCriticalErrorAlert(errors: any[]) {
  try {
    // In a real application, you might:
    // 1. Send email alerts
    // 2. Post to Slack/Discord
    // 3. Create tickets in issue tracking system
    // 4. Send push notifications to developers
    
    console.error('🚨 CRITICAL ERRORS DETECTED:', errors.length)
    errors.forEach(error => {
      console.error(`Critical Error: ${error.message}`, error)
    })
    
    // Example: Send to webhook (Slack, Discord, etc.)
    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 ${errors.length} critical error(s) detected in production`,
          attachments: errors.map(error => ({
            color: 'danger',
            title: error.message,
            fields: [
              { title: 'URL', value: error.url, short: true },
              { title: 'User ID', value: error.userId || 'Anonymous', short: true },
              { title: 'Timestamp', value: new Date(error.timestamp).toISOString(), short: true },
            ]
          }))
        }),
      })
    }
  } catch (alertError) {
    console.error('Failed to send critical error alert:', alertError)
  }
}