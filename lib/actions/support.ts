'use server'

import { revalidatePath } from 'next/cache'
import { createSupportTicket, addTicketMessage, getUserTickets } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function createTicket(ticketData: {
  title: string
  description: string
  category: string
  trip_id?: string
  priority?: string
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const ticket = await createSupportTicket({
      ...ticketData,
      user_id: user.id,
      status: 'open',
      priority: ticketData.priority || 'normal',
    })
    
    revalidatePath('/support')
    return { success: true, data: ticket }
  } catch (error: any) {
    console.error('Error creating ticket:', error)
    return { success: false, error: error.message }
  }
}

export async function sendTicketMessage(ticketId: string, message: string) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const msg = await addTicketMessage(ticketId, user.id, message)
    revalidatePath('/support')
    return { success: true, data: msg }
  } catch (error: any) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message }
  }
}

export async function getTickets() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const tickets = await getUserTickets(user.id)
    return { success: true, data: tickets }
  } catch (error: any) {
    console.error('Error fetching tickets:', error)
    return { success: false, error: error.message }
  }
}
