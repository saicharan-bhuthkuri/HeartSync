import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { hashPassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await initDb();
    const { email, email2, password, partnerName1, partnerName2, relationshipStartDate } = await request.json();

    if (!email || !email2 || !password || !partnerName1 || !relationshipStartDate) {
      return NextResponse.json(
        { error: 'Both partner emails, password, partner name 1, and relationship start date are required' },
        { status: 400 }
      );
    }

    const email1Clean = email.toLowerCase().trim();
    const email2Clean = email2.toLowerCase().trim();

    // Check if either email is already registered on any account (main or partner email)
    const existingUserRes = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? OR email_2 = ? OR email = ? OR email_2 = ? LIMIT 1',
      args: [email1Clean, email1Clean, email2Clean, email2Clean],
    });

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with one of these emails already exists' },
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
          id, email, email_2, password_hash, partner_name_1, partner_name_2, relationship_start_date, theme_preference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'system')
      `,
      args: [
        userId,
        email1Clean,
        email2Clean,
        hashedPassword,
        partnerName1.trim(),
        partnerName2 ? partnerName2.trim() : null,
        relationshipStartDate,
      ],
    });

    // Create session JWT
    const token = await signJWT({ userId, email: email1Clean });

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
        email: email1Clean,
        email2: email2Clean,
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
