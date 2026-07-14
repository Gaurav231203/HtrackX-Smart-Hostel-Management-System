import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type LeaveInsert = Database['public']['Tables']['leave_applications']['Insert']
type LeaveUpdate = Database['public']['Tables']['leave_applications']['Update']
type LeaveRow = Database['public']['Tables']['leave_applications']['Row']

/**
 * Create a new leave application
 */
export async function createLeaveApplication(
  userId: string,
  fromDate: string,
  toDate: string,
  reason: string
): Promise<LeaveRow> {
  try {
    const leaveData: LeaveInsert = {
      user_id: userId,
      from_date: fromDate,
      to_date: toDate,
      reason,
      status: 'pending',
    }

    const { data, error } = await supabase
      .from('leave_applications')
      .insert(leaveData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating leave application:', error)
    throw error
  }
}

/**
 * Get all leave applications for a user
 */
export async function getUserLeaveApplications(userId: string): Promise<LeaveRow[]> {
  try {
    const { data, error } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user leave applications:', error)
    throw error
  }
}

/**
 * Get all leave applications (admin only)
 */
export async function getAllLeaveApplications(): Promise<LeaveRow[]> {
  try {
    const { data, error } = await supabase
      .from('leave_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all leave applications:', error)
    throw error
  }
}

/**
 * Update leave application status
 */
export async function updateLeaveStatus(
  leaveId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<LeaveRow> {
  try {
    const { data, error } = await supabase
      .from('leave_applications')
      .update({ status })
      .eq('id', leaveId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating leave status:', error)
    throw error
  }
}

/**
 * Delete a leave application
 */
export async function deleteLeaveApplication(leaveId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('leave_applications')
      .delete()
      .eq('id', leaveId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting leave application:', error)
    throw error
  }
}

/**
 * Get leave application by ID
 */
export async function getLeaveById(leaveId: string): Promise<LeaveRow | null> {
  try {
    const { data, error } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('id', leaveId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching leave application:', error)
    throw error
  }
}
