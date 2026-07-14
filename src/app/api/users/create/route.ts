import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, email, name, phone, room_no, user_type } = body

    // Validate required fields
    if (!id || !email || !name || !phone || !user_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert user profile using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id,
        email,
        name,
        phone,
        room_no: room_no || null,
        user_type,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in user creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
