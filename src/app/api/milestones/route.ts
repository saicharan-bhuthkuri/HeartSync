import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch all milestones for the authenticated user (sorted chronologically by event_date)
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
      sql: 'SELECT * FROM milestones WHERE user_id = ? ORDER BY event_date ASC',
      args: [payload.userId],
    });

    return NextResponse.json({ milestones: res.rows });
  } catch (error) {
    console.error('Milestones GET API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred loading milestones' },
      { status: 500 }
    );
  }
}

// POST: Create a new milestone
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
    const { title, eventType, eventDate, description, photoUrl } = body;

    if (!title || !eventType || !eventDate) {
      return NextResponse.json(
        { error: 'Title, event type, and event date are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: `
        INSERT INTO milestones (
          id, user_id, title, event_type, event_date, description, photo_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        payload.userId,
        title.trim(),
        eventType,
        eventDate,
        description ? description.trim() : null,
        photoUrl ? photoUrl.trim() : null,
      ],
    });

    // Return the newly created milestone
    return NextResponse.json({
      milestone: {
        id,
        user_id: payload.userId,
        title: title.trim(),
        event_type: eventType,
        event_date: eventDate,
        description: description ? description.trim() : null,
        photo_url: photoUrl ? photoUrl.trim() : null,
      },
    });
  } catch (error) {
    console.error('Milestones POST API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred creating the milestone' },
      { status: 500 }
    );
  }
}
