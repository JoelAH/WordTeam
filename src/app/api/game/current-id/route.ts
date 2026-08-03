import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/config';
import { Settings } from '@/lib/db/models/Settings';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Validate session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Get current game ID from settings
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return NextResponse.json({ error: 'No current game found' }, { status: 404 });
    }

    return NextResponse.json({ currentGameId: settings.currentGameDataId });
  } catch (error) {
    console.error('Error in current-id endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch current game ID',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 