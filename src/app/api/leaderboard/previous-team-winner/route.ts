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
    
    // Get settings to find previous game ID
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings || !settings.previousGameDataId) {
      return NextResponse.json({ error: 'No previous game found' }, { status: 404 });
    }

    // Find the team with the highest points for the previous game
    // const pointHistory = await PointHistory.find({
    //   entityType: 'User',
    //     type: 'daily',
    //     teamId: team._id,
    //   gameDataId: settings.previousGameDataId
    // }).sort({ points: -1 }).limit(1);

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
          gameDataId: settings.previousGameDataId
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

    if (teamsWithPoints.length === 0) {
      return NextResponse.json({ error: 'No team winner found for previous game' }, { status: 404 });
    }

    const winnerEntry = teamsWithPoints.sort((a, b) => b.points - a.points)[0];
    
    // Get team details
    const team = await Team.findById(winnerEntry._id).select('name color');
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Create response with caching headers
    const response = NextResponse.json({
      name: team.name,
      color: team.color,
      points: winnerEntry.points
    });
    
    // Set cache headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
    
    return response;
  } catch (error) {
    console.error('Error fetching previous game team winner:', error);
    return NextResponse.json({ error: 'Failed to fetch previous game team winner' }, { status: 500 });
  }
} 