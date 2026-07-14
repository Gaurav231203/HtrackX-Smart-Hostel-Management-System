import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, from_date, to_date, reason, status } = body

    // Validate required fields
    if (!user_id || !from_date || !to_date || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert leave application using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('leave_applications')
      .insert({
        user_id,
        from_date,
        to_date,
        reason,
        status: status || 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating leave application:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in leave application creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
