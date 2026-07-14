import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const alertId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { status, acknowledgedBy, notes } = body;

    // Validate required status field
    if (!status) {
      return NextResponse.json(
        {
          error: 'Status is required',
          code: 'MISSING_REQUIRED_FIELD',
        },
        { status: 400 }
      );
    }

    // Validate status value
    if (status !== 'acknowledged' && status !== 'resolved') {
      return NextResponse.json(
        {
          error: 'Status must be either "acknowledged" or "resolved"',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Check if alert exists
    const { data: existingAlert, error: fetchError } = await supabase
      .from('night_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (fetchError || !existingAlert) {
      return NextResponse.json(
        {
          error: 'Alert not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Prepare update data based on status
    const updateData: {
      status: string;
      acknowledged_by?: string;
      acknowledged_at?: string;
      resolved_at?: string;
      notes?: string;
    } = {
      status,
    };

    if (status === 'acknowledged') {
      updateData.acknowledged_at = new Date().toISOString();
      if (acknowledgedBy) {
        updateData.acknowledged_by = acknowledgedBy.trim();
      }
      if (notes) {
        updateData.notes = notes.trim();
      }
    } else if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
      if (notes) {
        updateData.notes = notes.trim();
      }
    }

    // Update the alert
    const { data: updatedAlert, error: updateError } = await supabase
      .from('night_alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update alert: ' + updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAlert, { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}