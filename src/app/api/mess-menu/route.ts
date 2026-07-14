import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const day = searchParams.get('day')

    let query = supabaseAdmin
      .from('mess_menu')
      .select('*')
      .order('meal_type', { ascending: true })

    if (day) {
      query = query.eq('day', day)
    } else {
      // Get today's menu by default
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const today = days[new Date().getDay()]
      query = query.eq('day', today)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching mess menu:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Error in mess menu API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
