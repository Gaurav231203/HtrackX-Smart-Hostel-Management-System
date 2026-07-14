import { createClient } from '@supabase/supabase-js'

// Database Types (defined first so they can be used below)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          user_type: 'student' | 'admin'
          phone: string
          room_no: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          date: string
          status: 'present' | 'absent'
          marked_at: string
          location_lat: number | null
          location_lng: number | null
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'marked_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          room_no: string
          category: string
          description: string
          status: 'pending' | 'in_progress' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>
      }
      leave_applications: {
        Row: {
          id: string
          user_id: string
          from_date: string
          to_date: string
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leave_applications']['Insert']>
      }
      mess_menu: {
        Row: {
          id: string
          day: string
          meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
          items: string[]
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mess_menu']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mess_menu']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'attendance' | 'ticket' | 'leave' | 'announcement' | 'alert'
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      night_alerts: {
        Row: {
          id: number
          user_id: string
          detected_at: string
          location_lat: number
          location_lng: number
          distance_from_campus: number
          status: 'active' | 'acknowledged' | 'resolved'
          acknowledged_by: string | null
          acknowledged_at: string | null
          resolved_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['night_alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['night_alerts']['Insert']>
      }
    }
  }
}

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
    supabaseUrl.startsWith('http')
  )
}

// Create Supabase client for frontend (uses anon key, respects RLS)
export const supabase = isSupabaseConfigured() 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key')

// Create Supabase Admin client with service role key (SERVER-SIDE ONLY)
// WARNING: NEVER use this client on the frontend - it bypasses RLS
// This should ONLY be imported in API routes (src/app/api/*)
export const supabaseAdmin = isSupabaseConfigured() && supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-service-role-key')