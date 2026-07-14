import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']
type AttendanceRow = Database['public']['Tables']['attendance']['Row']
type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketRow = Database['public']['Tables']['tickets']['Row']
type LeaveInsert = Database['public']['Tables']['leave_applications']['Insert']
type LeaveRow = Database['public']['Tables']['leave_applications']['Row']
type MessMenuInsert = Database['public']['Tables']['mess_menu']['Insert']
type MessMenuRow = Database['public']['Tables']['mess_menu']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationRow = Database['public']['Tables']['notifications']['Row']

// ==================== ATTENDANCE ====================

/**
 * Mark attendance for a student via API route
 */
export async function markAttendance(
  userId: string,
  date: string,
  locationLat?: number,
  locationLng?: number
) {
  try {
    const response = await fetch('/api/attendance/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        date,
        status: 'present',
        location_lat: locationLat || null,
        location_lng: locationLng || null
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to mark attendance')
    }

    return result.data
  } catch (error) {
    console.error('Error marking attendance:', error)
    throw error
  }
}

/**
 * Get attendance records for a user
 */
export async function getUserAttendance(userId: string, limit = 30) {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching attendance:', error)
    throw error
  }
}

/**
 * Get today's attendance for a user
 */
export async function getTodayAttendance(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  } catch (error) {
    console.error('Error fetching today attendance:', error)
    throw error
  }
}

/**
 * Get all attendance records (admin) via API
 */
export async function getAllAttendance(date?: string) {
  try {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    
    const response = await fetch(`/api/attendance?${params.toString()}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch attendance')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching all attendance:', error)
    throw error
  }
}

// ==================== TICKETS ====================

/**
 * Create a new ticket via API route
 */
export async function createTicket(
  userId: string,
  roomNo: string,
  category: string,
  description: string
) {
  try {
    const response = await fetch('/api/tickets/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        room_no: roomNo,
        category,
        description,
        status: 'pending'
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create ticket')
    }

    return result.data
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

/**
 * Get tickets for a user via API
 */
export async function getUserTickets(userId: string) {
  try {
    const response = await fetch(`/api/tickets?userId=${userId}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch tickets')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    throw error
  }
}

/**
 * Get all tickets (admin) via API
 */
export async function getAllTickets(status?: string) {
  try {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const response = await fetch(`/api/tickets?${params.toString()}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch tickets')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching all tickets:', error)
    throw error
  }
}

/**
 * Update ticket status (admin) via API
 */
export async function updateTicketStatus(ticketId: string, status: 'pending' | 'in_progress' | 'resolved') {
  try {
    const response = await fetch('/api/tickets/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ticketId, status })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update ticket')
    }

    return result.data
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}

// ==================== LEAVE APPLICATIONS ====================

/**
 * Create a leave application via API route
 */
export async function createLeaveApplication(
  userId: string,
  fromDate: string,
  toDate: string,
  reason: string
) {
  try {
    const response = await fetch('/api/leave/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        from_date: fromDate,
        to_date: toDate,
        reason,
        status: 'pending'
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create leave application')
    }

    return result.data
  } catch (error) {
    console.error('Error creating leave application:', error)
    throw error
  }
}

/**
 * Get leave applications for a user via API
 */
export async function getUserLeaveApplications(userId: string) {
  try {
    const response = await fetch(`/api/leave?userId=${userId}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch leave applications')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching user leave applications:', error)
    throw error
  }
}

/**
 * Get all leave applications (admin) via API
 */
export async function getAllLeaveApplications(status?: string) {
  try {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const response = await fetch(`/api/leave?${params.toString()}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch leave applications')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching all leave applications:', error)
    throw error
  }
}

/**
 * Update leave application status (admin) via API
 */
export async function updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected') {
  try {
    const response = await fetch('/api/leave/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leaveId, status })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update leave status')
    }

    return result.data
  } catch (error) {
    console.error('Error updating leave status:', error)
    throw error
  }
}

// ==================== MESS MENU ====================

/**
 * Get mess menu for a specific day via API
 */
export async function getMessMenu(day: string) {
  try {
    const response = await fetch(`/api/mess-menu?day=${day}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch mess menu')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching mess menu:', error)
    throw error
  }
}

/**
 * Get today's mess menu via API
 */
export async function getTodayMessMenu() {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = days[new Date().getDay()]
    
    return await getMessMenu(today)
  } catch (error) {
    console.error('Error fetching today mess menu:', error)
    throw error
  }
}

/**
 * Create or update mess menu item (admin) via API
 */
export async function upsertMessMenuItem(
  day: string,
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
  items: string[],
  description?: string,
  imageUrl?: string
) {
  try {
    const response = await fetch('/api/mess-menu/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day,
        meal_type: mealType,
        items,
        description: description || null,
        image_url: imageUrl || null
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update mess menu')
    }

    return result.data
  } catch (error) {
    console.error('Error upserting mess menu item:', error)
    throw error
  }
}

// ==================== NOTIFICATIONS ====================

/**
 * Create a notification via API
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'attendance' | 'ticket' | 'leave' | 'announcement' | 'alert'
) {
  try {
    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        title,
        message,
        type,
        read: false
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create notification')
    }

    return result.data
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Get notifications for a user via API
 */
export async function getUserNotifications(userId: string, limit = 50) {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}&limit=${limit}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch notifications')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

/**
 * Mark notification as read via API
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await fetch('/api/notifications/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notificationId, read: true })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to mark notification as read')
    }

    return result.data
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Broadcast announcement to all students (admin)
 */
export async function broadcastAnnouncement(title: string, message: string) {
  try {
    // Get all student users
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id')
      .eq('user_type', 'student')

    if (studentsError) throw studentsError

    // Create notification for each student via API
    const notifications = await Promise.all(
      students.map(student => 
        createNotification(student.id, title, message, 'announcement')
      )
    )

    return notifications
  } catch (error) {
    console.error('Error broadcasting announcement:', error)
    throw error
  }
}

// ==================== REAL-TIME SUBSCRIPTIONS ====================

/**
 * Subscribe to ticket updates
 */
export function subscribeToTickets(callback: (payload: any) => void) {
  return supabase
    .channel('tickets-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets'
      },
      callback
    )
    .subscribe()
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

/**
 * Subscribe to attendance updates
 */
export function subscribeToAttendance(callback: (payload: any) => void) {
  return supabase
    .channel('attendance-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendance'
      },
      callback
    )
    .subscribe()
}