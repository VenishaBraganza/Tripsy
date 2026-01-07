import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface SupportTicket {
  id: string
  user_id: string
  ticket_number: string
  title: string
  description: string
  category: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  trip_id?: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal: boolean
  created_at: string
}

export function useSupportTickets(userId?: string) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchTickets = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setTickets(data || [])
    } catch (err: any) {
      console.error('Error fetching support tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()

    // Set up real-time subscription for ticket updates
    if (!userId) return

    const channel = supabase
      .channel('support-tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setTickets(prev => [payload.new as SupportTicket, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTickets(prev =>
              prev.map(t => t.id === payload.new.id ? payload.new as SupportTicket : t)
            )
          } else if (payload.eventType === 'DELETE') {
            setTickets(prev => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const createTicket = async (ticketData: {
    title: string
    description: string
    category: string
    trip_id?: string
    priority?: string
  }) => {
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const ticketNumber = `T-${Date.now().toString().slice(-6)}`

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticketData,
          user_id: userId,
          ticket_number: ticketNumber,
          status: 'open',
          priority: ticketData.priority || 'normal'
        })
        .select()
        .single()

      if (error) throw error

      setTickets(prev => [data, ...prev])
      return { success: true, data }
    } catch (err: any) {
      console.error('Error creating ticket:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    tickets,
    loading,
    error,
    createTicket,
    refetch: fetchTickets
  }
}

export function useSupportMessages(ticketId?: string) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchMessages = async () => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    // Set up real-time subscription for new messages
    if (!ticketId) return

    const channel = supabase
      .channel('support-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload: any) => {
          const newMessage = payload.new as SupportMessage
          if (!newMessage.is_internal) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId])

  const sendMessage = async (message: string, senderId: string) => {
    if (!ticketId) {
      return { success: false, error: 'No ticket selected' }
    }

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: senderId,
          message,
          is_internal: false
        })
        .select()
        .single()

      if (error) throw error

      setMessages(prev => [...prev, data])
      return { success: true, data }
    } catch (err: any) {
      console.error('Error sending message:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  }
}
