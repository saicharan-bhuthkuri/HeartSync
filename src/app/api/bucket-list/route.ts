import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch all bucket list items for the authenticated user
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
      sql: 'SELECT * FROM bucket_list WHERE user_id = ? ORDER BY created_at DESC',
      args: [payload.userId],
    });

    return NextResponse.json({ items: res.rows });
  } catch (error) {
    console.error('Bucket List GET API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred loading bucket list' },
      { status: 500 }
    );
  }
}

// POST: Create a new bucket list item
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
    const { title, category, targetDate } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: `
        INSERT INTO bucket_list (
          id, user_id, title, category, status, target_date
        ) VALUES (?, ?, ?, ?, 'pending', ?)
      `,
      args: [
        id,
        payload.userId,
        title.trim(),
        category,
        targetDate || null,
      ],
    });

    return NextResponse.json({
      item: {
        id,
        user_id: payload.userId,
        title: title.trim(),
        category,
        status: 'pending',
        target_date: targetDate || null,
        completed_at: null,
      },
    });
  } catch (error) {
    console.error('Bucket List POST API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred creating bucket list item' },
      { status: 500 }
    );
  }
}
