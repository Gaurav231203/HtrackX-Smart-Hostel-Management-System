import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, date, status, location_lat, location_lng } = body

    // Validate required fields
    if (!user_id || !date || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert attendance using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        user_id,
        date,
        status,
        location_lat: location_lat || null,
        location_lng: location_lng || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating attendance:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in attendance creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
