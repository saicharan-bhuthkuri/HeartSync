import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    
    // Auth check for cron execution (prevent arbitrary requests)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'dev_secret';
    
    if (secret !== cronSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users and their milestones
    const usersRes = await db.execute('SELECT id, email, partner_name_1, partner_name_2 FROM users');
    const users = usersRes.rows;

    const notificationsSent: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      const userId = user.id as string;
      const userEmail = user.email as string;
      const partner1 = user.partner_name_1 as string;
      const partner2 = (user.partner_name_2 as string) || '';

      // Fetch all milestones for this user
      const milestonesRes = await db.execute({
        sql: 'SELECT * FROM milestones WHERE user_id = ?',
        args: [userId],
      });
      const milestones = milestonesRes.rows;

      // Fetch user specific custom reminders settings if they exist
      const remindersRes = await db.execute({
        sql: 'SELECT * FROM reminders WHERE user_id = ?',
        args: [userId],
      });
      const customReminders = remindersRes.rows;

      for (const milestone of milestones) {
        const title = milestone.title as string;
        const originalDate = new Date(milestone.event_date as string);
        originalDate.setHours(0, 0, 0, 0);

        // Calculate upcoming anniversary this year or next year
        const anniversary = new Date(originalDate);
        anniversary.setFullYear(today.getFullYear());
        
        if (anniversary.getTime() < today.getTime()) {
          anniversary.setFullYear(today.getFullYear() + 1);
        }

        // Calculate days remaining
        const diffMs = anniversary.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // Check if reminder is due. Standard intervals: 30, 7, 1, 0 days before
        const targetIntervals = [30, 7, 1, 0];
        
        if (targetIntervals.includes(diffDays)) {
          // Verify if user disabled this specific interval
          const milestoneCustomReminders = customReminders.filter(
            (r: any) => r.milestone_id === milestone.id
          );
          
          let shouldNotify = true;
          // If they have customized settings for this milestone, verify if this interval is enabled
          if (milestoneCustomReminders.length > 0) {
            shouldNotify = milestoneCustomReminders.some(
              (r: any) => Number(r.days_before) === diffDays
            );
          }

          if (shouldNotify) {
            const dateStr = anniversary.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const eventDateStr = originalDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            const emailSubject = `HeartSync Reminder: "${title}" is ${
              diffDays === 0 ? 'today!' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}!`
            }`;

            const emailBody = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 12px;">
                <h2 style="color: #e11d48; margin-top: 0;">HeartSync Milestone Alert 🌹</h2>
                <p>Hello <strong>${partner1} ${partner2 ? `& ${partner2}` : ''}</strong>,</p>
                <p>This is a sweet reminder that your milestone <strong>"${title}"</strong> is coming up ${
              diffDays === 0 ? '<strong>today</strong>' : `in <strong>${diffDays} days</strong>`
            } on <strong>${dateStr}</strong>!</p>
                <p style="background-color: #fdf2f8; padding: 12px; border-left: 4px solid #f43f5e; border-radius: 4px; font-style: italic;">
                  "${milestone.description || 'No description provided.'}"
                </p>
                <p style="font-size: 12px; color: #71717a; margin-top: 24px;">
                  Original event date: ${eventDateStr}. This notification is automatically triggered by your HeartSync timeline settings.
                </p>
              </div>
            `;

            // Deliver notification
            console.log(`[REMINDER DISPATCH] To: ${userEmail} | Subject: ${emailSubject}`);
            
            let deliveryMethod = 'Console Log (Dev Mode)';
            
            if (process.env.RESEND_API_KEY) {
              try {
                const resendRes = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    from: 'HeartSync <reminders@heartsync.app>',
                    to: [userEmail],
                    subject: emailSubject,
                    html: emailBody,
                  }),
                });
                
                if (resendRes.ok) {
                  deliveryMethod = 'Resend API';
                } else {
                  const errJson = await resendRes.json();
                  console.error('Resend delivery failed:', errJson);
                  deliveryMethod = 'Resend Failed (Logged to Console)';
                }
              } catch (err) {
                console.error('Error contacting Resend API:', err);
                deliveryMethod = 'API Error (Logged to Console)';
              }
            }

            notificationsSent.push({
              userId,
              email: userEmail,
              milestoneTitle: title,
              daysBefore: diffDays,
              method: deliveryMethod,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      notificationsSentCount: notificationsSent.length,
      notificationsSent,
    });
  } catch (error) {
    console.error('Reminders API GET Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred executing reminders script' },
      { status: 500 }
    );
  }
}
