"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

type TicketRow = Database['public']['Tables']['tickets']['Row']

/**
 * Real-time hook for tickets
 * Listens for INSERT, UPDATE, and DELETE events on the tickets table
 */
export function useRealtimeTickets(userId: string | null, userType: 'student' | 'admin' | null) {
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !userType) {
      setTickets([])
      setLoading(false)
      return
    }

    let channel: RealtimeChannel

    // Fetch initial tickets
    const fetchTickets = async () => {
      try {
        let query = supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })

        // Students only see their own tickets
        if (userType === 'student') {
          query = query.eq('user_id', userId)
        }

        const { data, error } = await query

        if (error) throw error
        setTickets(data || [])
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()

    // Subscribe to real-time changes
    const channelName = userType === 'admin' ? 'tickets:all' : `tickets:${userId}`
    
    channel = supabase.channel(channelName)

    if (userType === 'student') {
      // Students only listen to their own tickets
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tickets',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newTicket = payload.new as TicketRow
            setTickets((prev) => [newTicket, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tickets',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const updatedTicket = payload.new as TicketRow
            setTickets((prev) =>
              prev.map((ticket) =>
                ticket.id === updatedTicket.id ? updatedTicket : ticket
              )
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'tickets',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const deletedTicket = payload.old as TicketRow
            setTickets((prev) =>
              prev.filter((ticket) => ticket.id !== deletedTicket.id)
            )
          }
        )
    } else {
      // Admins listen to all tickets
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            const newTicket = payload.new as TicketRow
            setTickets((prev) => [newTicket, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            const updatedTicket = payload.new as TicketRow
            setTickets((prev) =>
              prev.map((ticket) =>
                ticket.id === updatedTicket.id ? updatedTicket : ticket
              )
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            const deletedTicket = payload.old as TicketRow
            setTickets((prev) =>
              prev.filter((ticket) => ticket.id !== deletedTicket.id)
            )
          }
        )
    }

    channel.subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, userType])

  return { tickets, loading }
}
