import { createClient } from '@/lib/supabase/client'
import { ErrorHandler } from '@/lib/errors/error-handler'

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking' | 'wallet'
  last4?: string
  brand?: string
  exp_month?: number
  exp_year?: number
}

export interface PaymentResult {
  success: boolean
  payment_intent_id?: string
  error?: string
  booking_id?: string
}

class PaymentService {
  private supabase = createClient()

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    bookingId: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          booking_id: bookingId,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Payment intent creation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.payment_intent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw ErrorHandler.handleError(error, 'PAYMENT_ERROR')
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Payment confirmation failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Update booking status if payment successful
      if (result.success && result.booking_id) {
        await this.updateBookingStatus(result.booking_id, 'confirmed')
      }

      return result
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw ErrorHandler.handleError(error, 'PAYMENT_ERROR')
    }
  }

  async getPaymentMethods(customerId?: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payments/methods${customerId ? `?customer_id=${customerId}` : ''}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.statusText}`)
      }

      const data = await response.json()
      return data.payment_methods || []
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  async savePaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/save-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          customer_id: customerId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error saving payment method:', error)
      return false
    }
  }

  async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select(`
          *,
          bookings (
            id,
            package_name,
            total_amount,
            travel_date
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payment history:', error)
      throw ErrorHandler.handleError(error, 'DATABASE_ERROR')
    }
  }

  private async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating booking status:', error)
      // Don't throw here as payment was successful
    }
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          amount,
          reason,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error processing refund:', error)
      return false
    }
  }
}

export const paymentService = new PaymentService()