import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationRow = Database['public']['Tables']['notifications']['Row']

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'attendance' | 'ticket' | 'leave' | 'announcement' | 'alert'
): Promise<NotificationRow> {
  try {
    const notificationData: NotificationInsert = {
      user_id: userId,
      title,
      message,
      type,
      read: false,
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<NotificationRow[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw error
  }
}

/**
 * Get unread notifications count for a user
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error fetching unread notifications count:', error)
    throw error
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

/**
 * Create broadcast notification to all students
 */
export async function createBroadcastNotification(
  title: string,
  message: string,
  type: 'announcement' | 'alert'
): Promise<void> {
  try {
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id')
      .eq('user_type', 'student')

    if (studentsError) throw studentsError

    if (!students || students.length === 0) return

    // Create notifications for all students
    const notifications: NotificationInsert[] = students.map((student) => ({
      user_id: student.id,
      title,
      message,
      type,
      read: false,
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) throw error
  } catch (error) {
    console.error('Error creating broadcast notification:', error)
    throw error
  }
}
