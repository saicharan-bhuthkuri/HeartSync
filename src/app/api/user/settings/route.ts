import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(request: Request) {
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
    const { email, email2, partnerName1, partnerName2, relationshipStartDate, themePreference, avatarUrl1, avatarUrl2, playlistUrl } = body;

    const emailClean = email !== undefined ? email.toLowerCase().trim() : undefined;
    const email2Clean = email2 !== undefined ? email2.toLowerCase().trim() : undefined;

    // Get current user's emails to avoid false duplicate hits
    const currentUserRes = await db.execute({
      sql: 'SELECT email, email_2 FROM users WHERE id = ? LIMIT 1',
      args: [payload.userId],
    });
    if (currentUserRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const currentEmail = currentUserRes.rows[0].email as string;
    const currentEmail2 = currentUserRes.rows[0].email_2 as string | null;

    const targetEmail = emailClean !== undefined ? emailClean : currentEmail;
    const targetEmail2 = email2Clean !== undefined ? email2Clean : currentEmail2;

    if (emailClean !== undefined && !emailClean) {
      return NextResponse.json({ error: 'Primary email cannot be empty' }, { status: 400 });
    }
    if (email2Clean !== undefined && !email2Clean) {
      return NextResponse.json({ error: 'Partner email cannot be empty' }, { status: 400 });
    }

    if (targetEmail === targetEmail2) {
      return NextResponse.json({ error: 'Primary and partner email must be different' }, { status: 400 });
    }

    // Check if the target emails are already used by another user
    if (emailClean !== undefined && emailClean !== currentEmail) {
      const existingUser = await db.execute({
        sql: 'SELECT id FROM users WHERE (email = ? OR email_2 = ?) AND id != ? LIMIT 1',
        args: [emailClean, emailClean, payload.userId],
      });
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'Primary email is already in use by another account' }, { status: 400 });
      }
    }

    if (email2Clean !== undefined && email2Clean !== currentEmail2) {
      const existingUser = await db.execute({
        sql: 'SELECT id FROM users WHERE (email = ? OR email_2 = ?) AND id != ? LIMIT 1',
        args: [email2Clean, email2Clean, payload.userId],
      });
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'Partner email is already in use by another account' }, { status: 400 });
      }
    }

    // Build dynamic SQL query for updates
    const updates: string[] = [];
    const args: any[] = [];

    if (emailClean !== undefined) {
      updates.push('email = ?');
      args.push(emailClean);
    }
    if (email2Clean !== undefined) {
      updates.push('email_2 = ?');
      args.push(email2Clean);
    }
    if (partnerName1 !== undefined) {
      updates.push('partner_name_1 = ?');
      args.push(partnerName1.trim());
    }
    if (partnerName2 !== undefined) {
      updates.push('partner_name_2 = ?');
      args.push(partnerName2 ? partnerName2.trim() : null);
    }
    if (relationshipStartDate !== undefined) {
      updates.push('relationship_start_date = ?');
      args.push(relationshipStartDate);
    }
    if (themePreference !== undefined) {
      updates.push('theme_preference = ?');
      args.push(themePreference);
    }
    if (avatarUrl1 !== undefined) {
      updates.push('avatar_url_1 = ?');
      args.push(avatarUrl1);
    }
    if (avatarUrl2 !== undefined) {
      updates.push('avatar_url_2 = ?');
      args.push(avatarUrl2);
    }
    if (playlistUrl !== undefined) {
      updates.push('playlist_url = ?');
      args.push(playlistUrl ? playlistUrl.trim() : null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Add user_id to args
    args.push(payload.userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    await db.execute({
      sql: query,
      args,
    });

    // If primary email was updated, issue a new JWT cookie
    if (emailClean !== undefined && emailClean !== currentEmail) {
      const newToken = await signJWT({ userId: payload.userId, email: emailClean });
      const cookieStore = await cookies();
      cookieStore.set('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings API Patch Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating settings' },
      { status: 500 }
    );
  }
}
