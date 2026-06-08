import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { hashPassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await initDb();
    const { email, password, partnerName1, partnerName2, relationshipStartDate } = await request.json();

    if (!email || !password || !partnerName1 || !relationshipStartDate) {
      return NextResponse.json(
        { error: 'Email, password, partner name 1, and relationship start date are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserRes = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? LIMIT 1',
      args: [email.toLowerCase().trim()],
    });

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Insert user into database
    await db.execute({
      sql: `
        INSERT INTO users (
          id, email, password_hash, partner_name_1, partner_name_2, relationship_start_date, theme_preference
        ) VALUES (?, ?, ?, ?, ?, ?, 'system')
      `,
      args: [
        userId,
        email.toLowerCase().trim(),
        hashedPassword,
        partnerName1.trim(),
        partnerName2 ? partnerName2.trim() : null,
        relationshipStartDate,
      ],
    });

    // Create session JWT
    const token = await signJWT({ userId, email: email.toLowerCase().trim() });

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
        email: email.toLowerCase().trim(),
        partnerName1: partnerName1.trim(),
        partnerName2: partnerName2 ? partnerName2.trim() : null,
        relationshipStartDate,
        themePreference: 'system',
      },
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
