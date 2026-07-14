import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    // Query all alerts for the specific user, ordered by most recent first
    const { data: alerts, error } = await supabase
      .from('night_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch alerts: ' + error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(alerts || [], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}