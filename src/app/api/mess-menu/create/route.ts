import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { day, meal_type, items, description, image_url } = body

    // Validate required fields
    if (!day || !meal_type || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate meal_type
    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(meal_type)) {
      return NextResponse.json(
        { error: 'Invalid meal_type' },
        { status: 400 }
      )
    }

    // Insert mess menu using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('mess_menu')
      .insert({
        day,
        meal_type,
        items,
        description: description || null,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating mess menu:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in mess menu creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
