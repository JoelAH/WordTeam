import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/config';
import { Settings } from '@/lib/db/models/Settings';
import { User } from '@/lib/db/models/User';
import { Team } from '@/lib/db/models/Team';
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
    
    // Get current game ID from settings
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return NextResponse.json({ error: 'No current game found' }, { status: 404 });
    }

    // Get the top 5 users with the highest daily points for the current game
    const topUsers = await User.find({
      'myWord.gameDataId': settings.currentGameDataId
    })
    .sort({ pointsDaily: -1 })
    .limit(5)
    .select('name pointsDaily teamId');

    // Get team information for each user
    const usersWithTeams = await Promise.all(
      topUsers.map(async (user) => {
        const team = user.teamId ? await Team.findById(user.teamId).select('name color') : null;
        return {
          _id: user._id,
          name: user.name,
          points: user.pointsDaily,
          team: team ? { name: team.name, color: team.color } : null
        };
      })
    );

    // Create response with caching headers
    const response = NextResponse.json(usersWithTeams);
    
    // Set cache headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
    
    return response;
  } catch (error) {
    console.error('Error fetching top users:', error);
    return NextResponse.json({ error: 'Failed to fetch top users' }, { status: 500 });
  }
} 