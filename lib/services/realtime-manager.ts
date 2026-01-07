import { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export type SubscriptionCallback = (payload: any) => void

export interface SubscriptionConfig {
  table: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  callback: SubscriptionCallback
}

/**
 * Centralized manager for Supabase real-time subscriptions
 * Handles connection management, error handling, and cleanup
 */
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private supabase = getSupabaseBrowserClient()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second

  /**
   * Subscribe to changes on a specific table
   */
  subscribeToTable(config: SubscriptionConfig): string {
    const channelId = `${config.table}-${Date.now()}`
    
    try {
      const channel = this.supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: config.event || '*',
            schema: 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            try {
              config.callback(payload)
              this.reconnectAttempts = 0 // Reset on successful message
            } catch (error) {
              console.error(`Error in subscription callback for ${config.table}:`, error)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to ${config.table}`)
            this.reconnectAttempts = 0
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Channel error for ${config.table}`)
            this.handleConnectionError(channelId, config)
          } else if (status === 'TIMED_OUT') {
            console.error(`⏱️ Subscription timed out for ${config.table}`)
            this.handleConnectionError(channelId, config)
          }
        })

      this.channels.set(channelId, channel)
      return channelId
    } catch (error) {
      console.error(`Failed to subscribe to ${config.table}:`, error)
      throw error
    }
  }

  /**
   * Subscribe to multiple user-specific data sources
   */
  subscribeToUserData(userId: string, callbacks: {
    onTripsChange?: SubscriptionCallback
    onBookingsChange?: SubscriptionCallback
    onNotificationsChange?: SubscriptionCallback
    onLoyaltyChange?: SubscriptionCallback
    onWishlistChange?: SubscriptionCallback
  }): string[] {
    const channelIds: string[] = []

    if (callbacks.onTripsChange) {
      channelIds.push(
        this.subscribeToTable({
          table: 'trips',
          filter: `user_id=eq.${userId}`,
          callback: callbacks.onTripsChange
        })
      )
    }

    if (callbacks.onBookingsChange) {
      channelIds.push(
        this.subscribeToTable({
          table: 'bookings',
          filter: `user_id=eq.${userId}`,
          callback: callbacks.onBookingsChange
        })
      )
    }

    if (callbacks.onNotificationsChange) {
      channelIds.push(
        this.subscribeToTable({
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
          callback: callbacks.onNotificationsChange
        })
      )
    }

    if (callbacks.onLoyaltyChange) {
      channelIds.push(
        this.subscribeToTable({
          table: 'loyalty_points',
          filter: `user_id=eq.${userId}`,
          callback: callbacks.onLoyaltyChange
        })
      )
    }

    if (callbacks.onWishlistChange) {
      channelIds.push(
        this.subscribeToTable({
          table: 'wishlist',
          filter: `user_id=eq.${userId}`,
          callback: callbacks.onWishlistChange
        })
      )
    }

    return channelIds
  }

  /**
   * Handle connection errors with exponential backoff
   */
  private handleConnectionError(channelId: string, config: SubscriptionConfig) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${config.table}`)
      this.unsubscribe(channelId)
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(
      `Attempting to reconnect to ${config.table} in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    )

    setTimeout(() => {
      this.unsubscribe(channelId)
      this.subscribeToTable(config)
    }, delay)
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelId)
      console.log(`🔌 Unsubscribed from channel: ${channelId}`)
    }
  }

  /**
   * Unsubscribe from multiple channels
   */
  unsubscribeMultiple(channelIds: string[]): void {
    channelIds.forEach(id => this.unsubscribe(id))
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    console.log(`🧹 Cleaning up ${this.channels.size} subscriptions`)
    this.channels.forEach((channel, channelId) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.reconnectAttempts = 0
  }

  /**
   * Get the number of active subscriptions
   */
  getActiveSubscriptionCount(): number {
    return this.channels.size
  }

  /**
   * Check if a specific channel is active
   */
  isChannelActive(channelId: string): boolean {
    return this.channels.has(channelId)
  }
}

// Export a singleton instance
export const realtimeManager = new RealtimeManager()

// Export a hook-friendly version
export function useRealtimeManager() {
  return realtimeManager
}
