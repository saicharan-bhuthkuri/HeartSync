import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH: Update a specific milestone
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
    const { title, eventType, eventDate, description, photoUrl } = body;

    // Verify ownership first
    const milestoneRes = await db.execute({
      sql: 'SELECT user_id FROM milestones WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (milestoneRes.rows.length === 0) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestoneRes.rows[0].user_id !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update fields dynamically
    const updates: string[] = [];
    const args: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      args.push(title.trim());
    }
    if (eventType !== undefined) {
      updates.push('event_type = ?');
      args.push(eventType);
    }
    if (eventDate !== undefined) {
      updates.push('event_date = ?');
      args.push(eventDate);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      args.push(description ? description.trim() : null);
    }
    if (photoUrl !== undefined) {
      updates.push('photo_url = ?');
      args.push(photoUrl ? photoUrl.trim() : null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add dynamic query arguments
    args.push(id); // for milestone ID
    args.push(payload.userId); // for safety verification

    const query = `UPDATE milestones SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;

    await db.execute({
      sql: query,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Milestone PATCH API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred updating the milestone' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a specific milestone
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
    const milestoneRes = await db.execute({
      sql: 'SELECT user_id FROM milestones WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (milestoneRes.rows.length === 0) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestoneRes.rows[0].user_id !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.execute({
      sql: 'DELETE FROM milestones WHERE id = ? AND user_id = ?',
      args: [id, payload.userId],
    });

    return NextResponse.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Milestone DELETE API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred deleting the milestone' },
      { status: 500 }
    );
  }
}
