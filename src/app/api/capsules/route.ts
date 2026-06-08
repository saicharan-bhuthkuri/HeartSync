import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch all time capsules for the authenticated user
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
      sql: 'SELECT * FROM time_capsules WHERE user_id = ? ORDER BY unlock_date ASC',
      args: [payload.userId],
    });

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Cheat prevention: Do not expose the content of locked letters in the JSON payload
    const safeCapsules = res.rows.map((row: any) => {
      const isLocked = row.unlock_date > todayStr;
      return {
        id: row.id,
        user_id: row.user_id,
        sender_name: row.sender_name,
        title: row.title,
        unlock_date: row.unlock_date,
        created_at: row.created_at,
        isLocked,
        content: isLocked ? null : row.content,
      };
    });

    return NextResponse.json({ capsules: safeCapsules });
  } catch (error) {
    console.error('Time Capsules GET API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred loading time capsules' },
      { status: 500 }
    );
  }
}

// POST: Create a new time capsule letter
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
    const { title, content, unlockDate, senderName } = body;

    if (!title || !content || !unlockDate || !senderName) {
      return NextResponse.json(
        { error: 'Title, content, unlock date, and sender name are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: `
        INSERT INTO time_capsules (
          id, user_id, sender_name, title, content, unlock_date
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        payload.userId,
        senderName.trim(),
        title.trim(),
        content.trim(),
        unlockDate,
      ],
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const isLocked = unlockDate > todayStr;

    return NextResponse.json({
      capsule: {
        id,
        user_id: payload.userId,
        sender_name: senderName.trim(),
        title: title.trim(),
        unlock_date: unlockDate,
        isLocked,
        content: isLocked ? null : content.trim(),
      },
    });
  } catch (error) {
    console.error('Time Capsules POST API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred creating time capsule' },
      { status: 500 }
    );
  }
}
