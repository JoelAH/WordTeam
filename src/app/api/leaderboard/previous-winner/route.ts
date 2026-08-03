import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/config';
import { Settings } from '@/lib/db/models/Settings';
import { User } from '@/lib/db/models/User';
import { Team } from '@/lib/db/models/Team';
import { PointHistory } from '@/lib/db/models/PointHistory';
import { createClient } from '@/lib/supabase/server';

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get settings to find previous game ID
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings || !settings.previousGameDataId) {
      return NextResponse.json({ error: 'No previous game found' }, { status: 404 });
    }

    // Find the user with the highest points for the previous game
    const pointHistory = await PointHistory.find({
      entityType: 'User',
      gameDataId: settings.previousGameDataId,
      hasWon: true
    }).sort({ points: -1 }).limit(1);

    if (pointHistory.length === 0) {
      return NextResponse.json({ error: 'No winner found for previous game' }, { status: 404 });
    }

    const winnerEntry = pointHistory[0];
    
    // Get user details
    const userDetails = await User.findById(winnerEntry.entityId).select('name teamId');
    if (!userDetails) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get team details if user has a team
    let team = null;
    if (userDetails.teamId) {
      team = await Team.findById(userDetails.teamId).select('name color');
    }

    // Create response with caching headers
    const response = NextResponse.json({
      name: userDetails.name,
      team: team ? { name: team.name, color: team.color } : null,
      points: winnerEntry.points
    });
    
    // Set cache headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
    
    return response;
  } catch (error) {
    console.error('Error fetching previous game winner:', error);
    return NextResponse.json({ error: 'Failed to fetch previous game winner' }, { status: 500 });
  }
} 