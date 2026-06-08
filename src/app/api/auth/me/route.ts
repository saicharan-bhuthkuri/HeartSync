import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await initDb();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      // Invalid session token, clean up the cookie
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.delete('token');
      return res;
    }

    // Get user details from database
    const userRes = await db.execute({
      sql: 'SELECT id, email, email_2, partner_name_1, partner_name_2, relationship_start_date, theme_preference, avatar_url_1, avatar_url_2, playlist_url FROM users WHERE id = ? LIMIT 1',
      args: [payload.userId],
    });

    if (userRes.rows.length === 0) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.delete('token');
      return res;
    }

    const dbUser = userRes.rows[0];

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        email2: dbUser.email_2,
        partnerName1: dbUser.partner_name_1,
        partnerName2: dbUser.partner_name_2,
        relationshipStartDate: dbUser.relationship_start_date,
        themePreference: dbUser.theme_preference || 'system',
        avatarUrl1: dbUser.avatar_url_1,
        avatarUrl2: dbUser.avatar_url_2,
        playlistUrl: dbUser.playlist_url,
      },
    });
  } catch (error) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred fetching session' },
      { status: 500 }
    );
  }
}
