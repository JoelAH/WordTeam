import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/config';
import { User } from '@/lib/db/models/User';
import { Settings } from '@/lib/db/models/Settings';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
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

    // Find the user by their Supabase ID and current game ID
    const foundUser = await User.findOne({ 
      supabaseId: session.user.id,
      'myWord.gameDataId': settings.currentGameDataId
    });
    
    if (!foundUser) {
      return NextResponse.json({ error: 'User not found or not assigned to current game' }, { status: 404 });
    }

    // Update the dateTimeStarted for the current game
    foundUser.myWord.dateTimeStarted = new Date();
    await foundUser.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game start time:', error);
    return NextResponse.json({ error: 'Failed to update game start time' }, { status: 500 });
  }
} 