import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const userId = searchParams.get('userId')

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          room_no
        )
      `)
      .order('marked_at', { ascending: false })

    if (date) {
      query = query.eq('date', date)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Filter out records where user doesn't exist (orphaned records)
    const validData = (data || []).filter(item => item.users !== null)

    return NextResponse.json({ data: validData }, { status: 200 })
  } catch (error) {
    console.error('Error in attendance API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}