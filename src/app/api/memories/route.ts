import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch memories for the authenticated user, supporting search and milestone filters
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const milestoneId = searchParams.get('milestoneId');

    const sqlConditions: string[] = ['m.user_id = ?'];
    const args: any[] = [payload.userId];

    if (milestoneId) {
      sqlConditions.push('m.milestone_id = ?');
      args.push(milestoneId);
    }

    if (q) {
      sqlConditions.push('(m.title LIKE ? OR m.notes LIKE ?)');
      const searchPattern = `%${q}%`;
      args.push(searchPattern, searchPattern);
    }

    const query = `
      SELECT m.*, mil.title as milestone_title 
      FROM memories m 
      LEFT JOIN milestones mil ON m.milestone_id = mil.id 
      WHERE ${sqlConditions.join(' AND ')} 
      ORDER BY m.memory_date DESC, m.created_at DESC
    `;

    const res = await db.execute({
      sql: query,
      args,
    });

    return NextResponse.json({ memories: res.rows });
  } catch (error) {
    console.error('Memories GET API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred loading memories' },
      { status: 500 }
    );
  }
}

// POST: Add a new memory entry
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
    const { title, notes, imageUrl, memoryDate, milestoneId } = body;

    if (!title || !notes || !memoryDate) {
      return NextResponse.json(
        { error: 'Title, notes, and memory date are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.execute({
      sql: `
        INSERT INTO memories (
          id, user_id, milestone_id, title, notes, image_url, memory_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        payload.userId,
        milestoneId || null,
        title.trim(),
        notes.trim(),
        imageUrl ? imageUrl.trim() : null,
        memoryDate,
      ],
    });

    return NextResponse.json({
      memory: {
        id,
        user_id: payload.userId,
        milestone_id: milestoneId || null,
        title: title.trim(),
        notes: notes.trim(),
        image_url: imageUrl ? imageUrl.trim() : null,
        memory_date: memoryDate,
      },
    });
  } catch (error) {
    console.error('Memories POST API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred saving memory' },
      { status: 500 }
    );
  }
}
