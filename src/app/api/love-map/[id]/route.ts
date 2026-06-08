import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

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
      sql: 'DELETE FROM love_map_pins WHERE id = ? AND user_id = ?',
      args: [id, payload.userId],
    });

    if (res.rowsAffected === 0) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Love Map DELETE API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred deleting pin' },
      { status: 500 }
    );
  }
}
