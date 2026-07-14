import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type UserInsert = Database['public']['Tables']['users']['Insert']

/**
 * Sign up a new student
 * @param email - Student email
 * @param password - Student password
 * @param name - Student name
 * @param phone - Student phone number
 * @param roomNo - Student room number
 */
export async function signUpStudent(
  email: string,
  password: string,
  name: string,
  phone: string,
  roomNo: string
) {
  try {
    // Step 1: Create auth user using anon client
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    // Step 2: Create user profile via API route (uses service role key server-side)
    const profileResponse = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: authData.user.id,
        email,
        name,
        phone,
        room_no: roomNo,
        user_type: 'student',
      }),
    })

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json()
      // Note: Cannot rollback auth user creation from client-side
      // RLS policies should prevent duplicate profile creation
      throw new Error(errorData.error || 'Failed to create user profile')
    }

    const { data: profile } = await profileResponse.json()

    return { user: authData.user, profile }
  } catch (error) {
    console.error('Error signing up student:', error)
    throw error
  }
}

/**
 * Sign up a new admin with pass key validation
 * @param email - Admin email
 * @param password - Admin password
 * @param name - Admin name
 * @param phone - Admin phone number
 * @param adminPassKey - Admin pass key for validation
 */
export async function signUpAdmin(
  email: string,
  password: string,
  name: string,
  phone: string,
  adminPassKey: string
) {
  try {
    // Validate admin pass key
    const correctPassKey = process.env.NEXT_PUBLIC_ADMIN_PASS_KEY || 'HTRACX_ADMIN_2025_SECURE_KEY'
    
    if (adminPassKey !== correctPassKey) {
      throw new Error('Invalid admin pass key')
    }

    // Step 1: Create auth user using anon client
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    // Step 2: Create admin profile via API route (uses service role key server-side)
    const profileResponse = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: authData.user.id,
        email,
        name,
        phone,
        room_no: null, // Admins don't have room numbers
        user_type: 'admin',
      }),
    })

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json()
      // Note: Cannot rollback auth user creation from client-side
      // RLS policies should prevent duplicate profile creation
      throw new Error(errorData.error || 'Failed to create admin profile')
    }

    const { data: profile } = await profileResponse.json()

    return { user: authData.user, profile }
  } catch (error) {
    console.error('Error signing up admin:', error)
    throw error
  }
}

/**
 * Sign in an existing user (student or admin)
 * @param email - User email
 * @param password - User password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    return { user: data.user, session: data.session, profile }
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Error getting session:', error)
    throw error
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  try {
    const session = await getCurrentSession()
    if (!session?.user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}