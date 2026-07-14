import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, read } = body

    // Validate required fields
    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields (id, read)' },
        { status: 400 }
      )
    }

    // Update notification using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error in notification update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
