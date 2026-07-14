import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('type') // 'student' or 'admin'

    let query = supabaseAdmin
      .from('users')
      .select('*')
      .order('name', { ascending: true })

    if (userType) {
      query = query.eq('user_type', userType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Error in users API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
