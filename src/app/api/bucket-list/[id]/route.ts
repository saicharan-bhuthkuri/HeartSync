import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// PATCH: Update status, targetDate, title, category
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { title, category, status, targetDate } = body;

    const updates: string[] = [];
    const args: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      args.push(title.trim());
    }
    if (category !== undefined) {
      updates.push('category = ?');
      args.push(category);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      args.push(status);
      if (status === 'completed') {
        updates.push('completed_at = ?');
        args.push(new Date().toISOString().split('T')[0]);
      } else {
        updates.push('completed_at = NULL');
      }
    }
    if (targetDate !== undefined) {
      updates.push('target_date = ?');
      args.push(targetDate || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    args.push(id, payload.userId);

    const query = `UPDATE bucket_list SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;

    const res = await db.execute({
      sql: query,
      args,
    });

    if (res.rowsAffected === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bucket List PATCH API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred updating item' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a bucket list item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const res = await db.execute({
      sql: 'DELETE FROM bucket_list WHERE id = ? AND user_id = ?',
      args: [id, payload.userId],
    });

    if (res.rowsAffected === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bucket List DELETE API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred deleting item' },
      { status: 500 }
    );
  }
}
