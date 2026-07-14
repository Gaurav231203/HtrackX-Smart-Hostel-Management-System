"use client"

import { useEffect } from 'react'
import { checkAttendanceRowsExist, createDailyAttendanceRows } from '@/lib/api/attendance'

/**
 * Hook to automatically create attendance rows for new days
 * This should be used in a top-level component that's always mounted
 * 
 * NOTE: In production, this logic should be moved to a server-side cron job
 * This is a client-side placeholder implementation
 */
export function useDailyAttendanceCreation() {
  useEffect(() => {
    const checkAndCreateAttendance = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0]
        
        // Check if attendance rows already exist for today
        const rowsExist = await checkAttendanceRowsExist(today)
        
        if (!rowsExist) {
          // Create attendance rows for all students
          await createDailyAttendanceRows(today)
          console.log('Daily attendance rows created for:', today)
        }
      } catch (error) {
        console.error('Error in daily attendance creation:', error)
      }
    }

    // Check immediately on mount
    checkAndCreateAttendance()

    // Check every hour (in production, use a cron job instead)
    const interval = setInterval(checkAndCreateAttendance, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}
