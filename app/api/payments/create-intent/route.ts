import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-service'
import { validateRequest } from '@/lib/validation/middleware'
import { z } from 'zod'

const createIntentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('inr'),
  booking_id: z.string().uuid('Invalid booking ID'),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const validation = await validateRequest(request, createIntentSchema)
    if (!validation.success) {
      return validation.response
    }

    const { amount, currency, booking_id, metadata } = validation.data

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify booking belongs to user
    const supabase = await getSupabaseServerClient()
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id, total_amount, status')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      )
    }

    if (booking.status === 'confirmed') {
      return NextResponse.json(
        { error: 'Booking already confirmed' },
        { status: 400 }
      )
    }

    // For demo purposes, create a mock payment intent
    // In production, integrate with Stripe or Razorpay
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'requires_payment_method',
      metadata: {
        booking_id,
        user_id: user.id,
        ...metadata,
      },
    }

    // Store payment intent in database
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        id: paymentIntent.id,
        user_id: user.id,
        booking_id,
        amount,
        currency,
        status: 'pending',
        payment_intent_id: paymentIntent.id,
        metadata: paymentIntent.metadata,
      })

    if (insertError) {
      console.error('Error storing payment intent:', insertError)
      return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment_intent: paymentIntent,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Example Stripe integration (commented out for demo)
/*
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Replace the mock payment intent creation with:
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // Stripe uses cents
  currency,
  metadata: {
    booking_id,
    user_id: user.id,
    ...metadata,
  },
})
*/

// Example Razorpay integration (commented out for demo)
/*
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Replace the mock payment intent creation with:
const order = await razorpay.orders.create({
  amount: amount * 100, // Razorpay uses paise
  currency: currency.toUpperCase(),
  receipt: `receipt_${booking_id}`,
  notes: {
    booking_id,
    user_id: user.id,
    ...metadata,
  },
})

const paymentIntent = {
  id: order.id,
  client_secret: order.id, // Razorpay uses order ID
  amount,
  currency,
  status: 'requires_payment_method',
  metadata: order.notes,
}
*/