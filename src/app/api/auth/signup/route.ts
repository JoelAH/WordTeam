import { NextResponse } from 'next/server';
import { createUserAndAssignTeam } from '@/lib/db/game';
import { isAppropriateNickname } from '@/lib/utils/validation';

const EMAIL_URL = process.env["EMAIL_ALERT_URL"] || "";
const EMAIL_API_KEY = process.env["EMAIL_API_KEY"];
const NOTIFICATION_EMAIL = process.env["NOTIFICATION_EMAIL"] || "";

export async function POST(request: Request) {
  try {
    const { email, nickname, supabaseId } = await request.json();

    if (!email || !nickname || !supabaseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate nickname for inappropriate content
    if (!isAppropriateNickname(nickname)) {
      return NextResponse.json(
        { success: false, error: 'Nickname contains inappropriate content' },
        { status: 400 }
      );
    }

    const result = await createUserAndAssignTeam(email, nickname, supabaseId);

    try {
      await fetch(EMAIL_URL, {
        method: "POST",
        body: JSON.stringify({
          to: NOTIFICATION_EMAIL,
          subject: "WordTeam - New Profile",
          message: `A new user signed up: ${email}`,
          from: {
            name: "Wimeki",
            email: "admin@wimeki.com",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": EMAIL_API_KEY || '',
        },
      });
    }
    catch (error) {
      console.log(error);
      console.log('Fail to send alert email');
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in signup API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 