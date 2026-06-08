import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// Calculate detailed duration between two dates
function getDetailedDuration(startDateStr: string) {
  const start = new Date(startDateStr);
  const end = new Date();
  
  // Set times to midnight to calculate pure days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    // Get days in the previous month
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate total days
  const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  return { years, months, days, totalDays };
}

export async function GET() {
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

    const userId = payload.userId;

    // 1. Get user profile
    const userRes = await db.execute({
      sql: 'SELECT partner_name_1, partner_name_2, relationship_start_date FROM users WHERE id = ? LIMIT 1',
      args: [userId],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRes.rows[0];
    const relStartDateStr = user.relationship_start_date as string;
    const duration = getDetailedDuration(relStartDateStr);

    // 2. Fetch all milestones to find the next upcoming one
    const milestonesRes = await db.execute({
      sql: 'SELECT * FROM milestones WHERE user_id = ?',
      args: [userId],
    });

    const milestones = milestonesRes.rows;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextUpcomingMilestone: any = null;
    let nextUpcomingDate: Date | null = null;
    let minDiffMs = Infinity;

    // We need to look at both original dates AND their recurring yearly anniversary dates
    milestones.forEach((milestone: any) => {
      const originalDate = new Date(milestone.event_date as string);
      originalDate.setHours(0, 0, 0, 0);

      // Anniversary date for this year
      const anniversaryThisYear = new Date(originalDate);
      anniversaryThisYear.setFullYear(today.getFullYear());

      // If anniversary has already passed this year, look at next year
      if (anniversaryThisYear.getTime() < today.getTime()) {
        anniversaryThisYear.setFullYear(today.getFullYear() + 1);
      }

      // Check if it's closer than the current selection
      const diffMs = anniversaryThisYear.getTime() - today.getTime();
      if (diffMs < minDiffMs && diffMs >= 0) {
        minDiffMs = diffMs;
        nextUpcomingDate = anniversaryThisYear;
        nextUpcomingMilestone = {
          ...milestone,
          upcomingDate: anniversaryThisYear.toISOString().split('T')[0],
          daysRemaining: Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
        };
      }
    });

    // 3. "On This Day" calculations
    // We want to fetch memories and milestones from the same month and day in previous years (with ±3 days fallback)
    const targetDates: string[] = [];
    const dateOffsets = [-3, -2, -1, 0, 1, 2, 3];
    
    dateOffsets.forEach((offset) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      targetDates.push(`${m}-${day}`); // Format: MM-DD
    });

    // Fetch all milestones to filter in memory (SQLite lacks strftime in some node packages depending on versions, so in-memory is safer and cleaner for smaller user data datasets)
    const allMilestonesRes = await db.execute({
      sql: 'SELECT * FROM milestones WHERE user_id = ?',
      args: [userId],
    });

    const allMemoriesRes = await db.execute({
      sql: 'SELECT m.*, mil.title as milestone_title FROM memories m LEFT JOIN milestones mil ON m.milestone_id = mil.id WHERE m.user_id = ?',
      args: [userId],
    });

    const currentYear = today.getFullYear();
    const onThisDayMilestones: any[] = [];
    const onThisDayMemories: any[] = [];

    // Filter milestones
    allMilestonesRes.rows.forEach((row: any) => {
      const date = new Date(row.event_date as string);
      const mmDd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const year = date.getFullYear();

      if (targetDates.includes(mmDd) && year < currentYear) {
        onThisDayMilestones.push({
          ...row,
          yearsAgo: currentYear - year,
          isExact: mmDd === targetDates[3], // index 3 is offset 0 (today)
        });
      }
    });

    // Filter memories
    allMemoriesRes.rows.forEach((row: any) => {
      const date = new Date(row.memory_date as string);
      const mmDd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const year = date.getFullYear();

      if (targetDates.includes(mmDd) && year < currentYear) {
        onThisDayMemories.push({
          ...row,
          yearsAgo: currentYear - year,
          isExact: mmDd === targetDates[3],
        });
      }
    });

    // Sort On This Day elements so exact matches appear first, then sorted by yearsAgo desc
    const sortFn = (a: any, b: any) => {
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      return b.yearsAgo - a.yearsAgo;
    };

    onThisDayMilestones.sort(sortFn);
    onThisDayMemories.sort(sortFn);

    // 4. Quick stats
    const totalMilestones = milestones.length;
    const totalMemories = allMemoriesRes.rows.length;

    return NextResponse.json({
      stats: {
        duration,
        totalMilestones,
        totalMemories,
      },
      nextEvent: nextUpcomingMilestone,
      onThisDay: {
        milestones: onThisDayMilestones,
        memories: onThisDayMemories,
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred loading the dashboard' },
      { status: 500 }
    );
  }
}
