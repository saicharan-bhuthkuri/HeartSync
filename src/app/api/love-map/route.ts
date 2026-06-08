import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch all love map pins for the authenticated user
export async function GET() {
  try {
    await initDb();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await db.execute({
      sql: 'SELECT * FROM love_map_pins WHERE user_id = ? ORDER BY visit_date ASC',
      args: [payload.userId],
    });

    return NextResponse.json({ pins: res.rows });
  } catch (error) {
    console.error('Love Map GET API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred loading love map pins' },
      { status: 500 }
    );
  }
}

// POST: Add a new love map pin
export async function POST(request: Request) {
  try {
    await initDb();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, lat, lng, visitDate } = body;

    if (!title || lat === undefined || lng === undefined || !visitDate) {
      return NextResponse.json(
        { error: 'Title, coordinates (lat, lng), and visit date are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: `
        INSERT INTO love_map_pins (
          id, user_id, title, description, lat, lng, visit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        payload.userId,
        title.trim(),
        description ? description.trim() : null,
        parseFloat(lat),
        parseFloat(lng),
        visitDate,
      ],
    });

    return NextResponse.json({
      pin: {
        id,
        user_id: payload.userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        visit_date: visitDate,
      },
    });
  } catch (error) {
    console.error('Love Map POST API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred saving pin' },
      { status: 500 }
    );
  }
}
