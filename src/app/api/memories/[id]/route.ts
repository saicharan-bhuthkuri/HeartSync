import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH: Update a specific memory
export async function PATCH(request: Request, context: RouteContext) {
  try {
    await initDb();
    const { id } = await context.params;

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

    // Verify ownership
    const memoryRes = await db.execute({
      sql: 'SELECT user_id FROM memories WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (memoryRes.rows.length === 0) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    if (memoryRes.rows[0].user_id !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update dynamically
    const updates: string[] = [];
    const args: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      args.push(title.trim());
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      args.push(notes.trim());
    }
    if (imageUrl !== undefined) {
      updates.push('image_url = ?');
      args.push(imageUrl ? imageUrl.trim() : null);
    }
    if (memoryDate !== undefined) {
      updates.push('memory_date = ?');
      args.push(memoryDate);
    }
    if (milestoneId !== undefined) {
      updates.push('milestone_id = ?');
      args.push(milestoneId || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add dynamic query arguments
    args.push(id);
    args.push(payload.userId);

    const query = `UPDATE memories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;

    await db.execute({
      sql: query,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Memory PATCH API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred updating the memory' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a specific memory
export async function DELETE(request: Request, context: RouteContext) {
  try {
    await initDb();
    const { id } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const memoryRes = await db.execute({
      sql: 'SELECT user_id FROM memories WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (memoryRes.rows.length === 0) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    if (memoryRes.rows[0].user_id !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.execute({
      sql: 'DELETE FROM memories WHERE id = ? AND user_id = ?',
      args: [id, payload.userId],
    });

    return NextResponse.json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Memory DELETE API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred deleting the memory' },
      { status: 500 }
    );
  }
}
