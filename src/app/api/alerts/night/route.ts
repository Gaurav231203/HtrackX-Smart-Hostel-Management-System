import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, locationLat, locationLng, distanceFromCampus } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { error: 'userId is required and must be a non-empty string', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (locationLat === undefined || locationLat === null || typeof locationLat !== 'number') {
      return NextResponse.json(
        { error: 'locationLat is required and must be a valid number', code: 'INVALID_LOCATION_LAT' },
        { status: 400 }
      );
    }

    if (locationLng === undefined || locationLng === null || typeof locationLng !== 'number') {
      return NextResponse.json(
        { error: 'locationLng is required and must be a valid number', code: 'INVALID_LOCATION_LNG' },
        { status: 400 }
      );
    }

    if (!distanceFromCampus || typeof distanceFromCampus !== 'number' || distanceFromCampus <= 0 || !Number.isInteger(distanceFromCampus)) {
      return NextResponse.json(
        { error: 'distanceFromCampus is required and must be a positive integer', code: 'INVALID_DISTANCE' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data: newAlert, error } = await supabase
      .from('night_alerts')
      .insert({
        user_id: userId.trim(),
        detected_at: new Date().toISOString(),
        location_lat: locationLat,
        location_lng: locationLng,
        distance_from_campus: distanceFromCampus,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create alert: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Validate status if provided
    if (status && !['active', 'acknowledged', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, acknowledged, resolved', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('night_alerts')
      .select('*')
      .order('detected_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(alerts || [], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}