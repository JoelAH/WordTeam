import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/config';
import { Settings } from '@/lib/db/models/Settings';
import { GameData } from '@/lib/db/models/GameData';

export async function GET() {
  try {
    await connectDB();
    
    // Get current game ID from settings
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return NextResponse.json({ error: 'No current game found' }, { status: 404 });
    }

    // Get the game data
    const gameData = await GameData.findById(settings.currentGameDataId);
    if (!gameData) {
      return NextResponse.json({ error: 'Game data not found' }, { status: 404 });
    }

    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Error fetching current game:', error);
    return NextResponse.json({ error: 'Failed to fetch current game' }, { status: 500 });
  }
} 