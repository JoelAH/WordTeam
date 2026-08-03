import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/config';
import { Settings } from '@/lib/db/models/Settings';
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
    
    // Get current game ID from settings
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return NextResponse.json({ error: 'No current game found' }, { status: 404 });
    }

    // Get all teams
    const teams = await Team.find().select('_id name color');
    
    // Get point history for each team for the current game
    const teamsWithPoints = await Promise.all(
      teams.map(async (team) => {
        // Find point history entries for this team and current game
        const pointHistory = await PointHistory.find({
          entityType: 'User',
          type: 'daily',
          teamId: team._id,
          gameDataId: settings.currentGameDataId
        });
        
        // Calculate total points
        const totalPoints = pointHistory.reduce((sum, entry) => sum + entry.points, 0);
        
        return {
          _id: team._id,
          name: team.name,
          color: team.color,
          points: totalPoints
        };
      })
    );
    
    // Sort teams by points in descending order
    const sortedTeams = teamsWithPoints.sort((a, b) => b.points - a.points);

    // Create response with caching headers
    const response = NextResponse.json(sortedTeams);
    
    // Set cache headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
    
    return response;
  } catch (error) {
    console.error('Error fetching team leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch team leaderboard' }, { status: 500 });
  }
} 