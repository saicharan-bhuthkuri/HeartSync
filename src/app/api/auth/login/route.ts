import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { comparePassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await initDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by either email or email_2
    const userRes = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? OR email_2 = ? LIMIT 1',
      args: [cleanEmail, cleanEmail],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const dbUser = userRes.rows[0];
    const passwordHash = dbUser.password_hash as string;

    // Verify password
    const isPasswordValid = await comparePassword(password, passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = dbUser.id as string;

    // Create session JWT (always sign with primary email, but both work for session lookup)
    const token = await signJWT({ userId, email: dbUser.email as string });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: userId,
        email: dbUser.email,
        email2: dbUser.email_2,
        partnerName1: dbUser.partner_name_1,
        partnerName2: dbUser.partner_name_2,
        relationshipStartDate: dbUser.relationship_start_date,
        themePreference: dbUser.theme_preference || 'system',
        avatarUrl1: dbUser.avatar_url_1,
        avatarUrl2: dbUser.avatar_url_2,
      },
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
