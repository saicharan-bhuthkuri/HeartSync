import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
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
    const { partnerName1, partnerName2, relationshipStartDate, themePreference, avatarUrl1, avatarUrl2 } = body;

    // Build dynamic SQL query for updates
    const updates: string[] = [];
    const args: any[] = [];

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings API Patch Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating settings' },
      { status: 500 }
    );
  }
}
