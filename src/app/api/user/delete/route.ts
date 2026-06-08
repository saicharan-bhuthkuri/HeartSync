import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE() {
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

    // Delete the user from the database (cascades to all associated tables)
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [payload.userId],
    });

    // Clean up the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('token');
    return response;
  } catch (error) {
    console.error('Account DELETE API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred deleting account' },
      { status: 500 }
    );
  }
}
