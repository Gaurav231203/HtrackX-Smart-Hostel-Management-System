"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

type AttendanceRow = Database['public']['Tables']['attendance']['Row']

/**
 * Real-time hook for attendance
 * Listens for INSERT and UPDATE events on the attendance table
 */
export function useRealtimeAttendance(userId: string | null, userType: 'student' | 'admin' | null) {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !userType) {
      setAttendance([])
      setLoading(false)
      return
    }

    let channel: RealtimeChannel

    // Fetch initial attendance
    const fetchAttendance = async () => {
      try {
        let query = supabase
          .from('attendance')
          .select('*')
          .order('date', { ascending: false })

        // Students only see their own attendance
        if (userType === 'student') {
          query = query.eq('user_id', userId)
        }

        const { data, error } = await query

        if (error) throw error
        setAttendance(data || [])
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()

    // Subscribe to real-time changes
    const channelName = userType === 'admin' ? 'attendance:all' : `attendance:${userId}`
    
    channel = supabase.channel(channelName)

    if (userType === 'student') {
      // Students only listen to their own attendance
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendance',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newAttendance = payload.new as AttendanceRow
            setAttendance((prev) => [newAttendance, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'attendance',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const updatedAttendance = payload.new as AttendanceRow
            setAttendance((prev) =>
              prev.map((att) =>
                att.id === updatedAttendance.id ? updatedAttendance : att
              )
            )
          }
        )
    } else {
      // Admins listen to all attendance
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendance',
          },
          (payload) => {
            const newAttendance = payload.new as AttendanceRow
            setAttendance((prev) => [newAttendance, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'attendance',
          },
          (payload) => {
            const updatedAttendance = payload.new as AttendanceRow
            setAttendance((prev) =>
              prev.map((att) =>
                att.id === updatedAttendance.id ? updatedAttendance : att
              )
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

  return { attendance, loading }
}
