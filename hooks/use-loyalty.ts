import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface LoyaltyPoints {
  id: string
  user_id: string
  points: number
  tier: string
  lifetime_points: number
  created_at: string
  updated_at: string
}

export interface LoyaltyTransaction {
  id: string
  user_id: string
  points: number
  reason: string
  transaction_type: 'earned' | 'redeemed'
  created_at: string
}

export function useLoyalty(userId?: string) {
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(null)
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchLoyaltyData = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch loyalty points
      const { data: pointsData, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (pointsError) throw pointsError
      setLoyaltyPoints(pointsData)

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])
    } catch (err: any) {
      console.error('Error fetching loyalty data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoyaltyData()

    // Set up real-time subscription for loyalty points updates
    if (!userId) return

    const channel = supabase
      .channel('loyalty-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_points',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            setLoyaltyPoints(payload.new as LoyaltyPoints)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loyalty_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          setTransactions(prev => [payload.new as LoyaltyTransaction, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const redeemPoints = async (points: number, reason: string) => {
    if (!userId || !loyaltyPoints) {
      return { success: false, error: 'Not authenticated' }
    }

    if (points > loyaltyPoints.points) {
      return { success: false, error: 'Insufficient points' }
    }

    try {
      const { error } = await supabase.rpc('redeem_loyalty_points', {
        p_user_id: userId,
        p_points: points,
        p_reason: reason
      })

      if (error) throw error

      await fetchLoyaltyData()
      return { success: true }
    } catch (err: any) {
      console.error('Error redeeming points:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    loyaltyPoints,
    transactions,
    loading,
    error,
    redeemPoints,
    refetch: fetchLoyaltyData
  }
}
