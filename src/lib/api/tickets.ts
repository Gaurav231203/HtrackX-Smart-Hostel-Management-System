import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']
type TicketRow = Database['public']['Tables']['tickets']['Row']

/**
 * Create a new ticket
 */
export async function createTicket(
  userId: string,
  roomNo: string,
  category: string,
  description: string
): Promise<TicketRow> {
  try {
    const ticketData: TicketInsert = {
      user_id: userId,
      room_no: roomNo,
      category,
      description,
      status: 'pending',
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

/**
 * Get all tickets for a user
 */
export async function getUserTickets(userId: string): Promise<TicketRow[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    throw error
  }
}

/**
 * Get all tickets (admin only)
 */
export async function getAllTickets(): Promise<TicketRow[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all tickets:', error)
    throw error
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: 'pending' | 'in_progress' | 'resolved'
): Promise<TicketRow> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}

/**
 * Delete a ticket
 */
export async function deleteTicket(ticketId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting ticket:', error)
    throw error
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<TicketRow | null> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching ticket:', error)
    throw error
  }
}
