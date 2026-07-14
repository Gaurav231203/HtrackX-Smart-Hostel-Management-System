import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']
type AttendanceRow = Database['public']['Tables']['attendance']['Row']

/**
 * Mark attendance for a user
 */
export async function markAttendance(
  userId: string,
  date: string,
  locationLat?: number,
  locationLng?: number
): Promise<AttendanceRow> {
  try {
    // Check if attendance already exists for today
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (existingAttendance) {
      throw new Error('Attendance already marked for today')
    }

    const attendanceData: AttendanceInsert = {
      user_id: userId,
      date,
      status: 'present',
      location_lat: locationLat || null,
      location_lng: locationLng || null,
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert(attendanceData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error marking attendance:', error)
    throw error
  }
}

/**
 * Get attendance for a user on a specific date
 */
export async function getAttendanceByDate(
  userId: string,
  date: string
): Promise<AttendanceRow | null> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error
    return data || null
  } catch (error) {
    console.error('Error fetching attendance:', error)
    throw error
  }
}

/**
 * Get all attendance records for a user
 */
export async function getUserAttendance(userId: string): Promise<AttendanceRow[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user attendance:', error)
    throw error
  }
}

/**
 * Get all attendance records (admin only)
 */
export async function getAllAttendance(): Promise<AttendanceRow[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all attendance:', error)
    throw error
  }
}

/**
 * Get attendance for a specific date (all users)
 */
export async function getAttendanceByDateForAll(date: string): Promise<AttendanceRow[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching attendance for date:', error)
    throw error
  }
}

/**
 * Create attendance rows for all users for a new day (placeholder logic)
 * This function should be called automatically when a new day starts
 * In production, this would be a scheduled job/cron
 */
export async function createDailyAttendanceRows(date: string): Promise<void> {
  try {
    // Get all students (not admins)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('user_type', 'student')

    if (usersError) throw usersError

    if (!users || users.length === 0) return

    // Create attendance rows with 'absent' status for all students
    const attendanceRows: AttendanceInsert[] = users.map((user) => ({
      user_id: user.id,
      date,
      status: 'absent',
      location_lat: null,
      location_lng: null,
    }))

    const { error: insertError } = await supabase
      .from('attendance')
      .insert(attendanceRows)

    if (insertError) throw insertError
  } catch (error) {
    console.error('Error creating daily attendance rows:', error)
    throw error
  }
}

/**
 * Check if attendance rows exist for a date
 */
export async function checkAttendanceRowsExist(date: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('id')
      .eq('date', date)
      .limit(1)

    if (error) throw error
    return (data?.length || 0) > 0
  } catch (error) {
    console.error('Error checking attendance rows:', error)
    return false
  }
}
