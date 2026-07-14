import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Accept both PUT and PATCH for compatibility
export async function PUT(req: NextRequest) {
  return handleUpdate(req)
}

export async function PATCH(req: NextRequest) {
  return handleUpdate(req)
}

async function handleUpdate(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields (id, status)' },
        { status: 400 }
      )
    }

    // Update ticket using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error in ticket update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}