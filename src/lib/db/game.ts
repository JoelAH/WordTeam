import 'server-only';
import connectDB from './config';
import { User, Team, GameData, PointHistory, Settings } from './models';
import mongoose from 'mongoose';

// Calculate points based on word length and number of tries used
function calculatePoints(myWord: any, triesUsed: number, maxGuesses: number): number {
  const wordLength = myWord.length;
  if (triesUsed > maxGuesses) return 0; // No points if used all guesses

  // Base points: wordLength * 100
  const basePoints = Math.round(wordLength * 100);
  
  // Bonus multiplier based on how quickly they solved it
  // Earlier guesses get higher multipliers
  const multiplier = Math.round((maxGuesses - triesUsed) / maxGuesses * 100) / 100;
  
  // Additional bonus for solving in first try (50% extra)
  const firstTryBonus = triesUsed === 1 ? Math.round(basePoints * 0.5) : 0;
  
  // Calculate final score and ensure it's a whole number
  const points = Math.round(basePoints * (1 + multiplier) + firstTryBonus);

   // Calculate time bonus points
   const gameStartTime = myWord.dateTimeStarted;
   const gameEndTime = myWord.dateTimeEnded;
   const timeDiffInSeconds = Math.floor((gameEndTime.getTime() - gameStartTime.getTime()) / 1000);
   
   let timeBonus = 0;
   if (timeDiffInSeconds <= 360) { // 5 minutes = 360 seconds
     timeBonus = 360 - timeDiffInSeconds; // 1 point per second under 5 minutes
   }
   
   const totalPoints = points + timeBonus;

   return totalPoints;
}

// Get the current game data
export async function getCurrentGameData() {
  await connectDB();
  
  // Get the settings to find the current game data ID
  const settings = await Settings.findOne();
  
  if (!settings) {
    throw new Error('Settings not found');
  }
  
  // Get the game data using the ID from settings
  const gameData = await GameData.findById(settings.currentGameDataId);
  
  if (!gameData) {
    throw new Error('Game data not found');
  }
  
  return gameData;
}

// Get user data by ID
export async function getUserById(userId: string) {
  await connectDB();
  
  // For now, just return the first user (mock)
  const user = await User.findOne({ supabaseId: userId });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

// Get team data by ID
export async function getTeamById(teamId: mongoose.Types.ObjectId) {
  await connectDB();
  
  const team = await Team.findById(teamId);
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  return team;
}

// Find the word object in game data that matches the user's word
export async function findWordInGameData(word: string) {
  const gameData = await getCurrentGameData();
  
  const wordObj = gameData.targetWords.find((w: { word: string }) => w.word === word);
  
  if (!wordObj) {
    throw new Error('Word not found in game data');
  }
  
  return wordObj;
}

// Assign a random word to a user
export async function assignRandomWordToUser(userId: string) {
  await connectDB();
  
  const gameData = await getCurrentGameData();
  const user = await getUserById(userId);
  
  // Select a random word from the game data
  const randomIndex = Math.floor(Math.random() * gameData.targetWords.length);
  const selectedWord = gameData.targetWords[randomIndex];
  // Update the user with the selected word and game data ID
  user.myWord = {
    word: selectedWord.word,
    length: selectedWord.length,
    dateTimeStarted: new Date(),
    gameDataId: gameData._id,
    hasWon: false,
    guessesLeft: selectedWord.guesses,
    clues: selectedWord.clues
  };
  await user.save();
  
  return user;
}

// Get the user's assigned word
export async function getUserWord(userId: string) {
  const user = await getUserById(userId);
  
  // If the user doesn't have a word assigned, assign one
  if (!user.myWord || !user.myWord.word) {
    return assignRandomWordToUser(userId);
  }
  
  return user;
}

// Get game data for client (without target words)
export async function getClientGameData(userId: string) {
  const gameData = await getCurrentGameData();
  const user = await getUserById(userId);
  const team = await getTeamById(user.teamId);
  // If user has no word or gameDataId doesn't match current game
  if (!user.myWord || !user.myWord.gameDataId || !user.myWord.gameDataId.equals(gameData._id)) {
    // Assign a new word for the current game
    const updatedUser = await assignRandomWordToUser(userId);
    return {
      theme: gameData.theme,
      targetWordLength: updatedUser.myWord.length,
      maxGuesses: gameData.targetWords.find((w: { word: string }) => w.word === updatedUser.myWord.word).guesses,
      team: {
        name: team.name,
        color: team.color
      },
      hasWon: false,
      dateTimeEnded: null,
      guessesLeft: updatedUser.myWord.guessesLeft,
      userName: user.name,
      userEmail: user.email
    };
  }

  // If user has already won, return the word and win status
  if (user.myWord.hasWon) {
    return {
      theme: gameData.theme,
      targetWordLength: user.myWord.length,
      maxGuesses: gameData.targetWords.find((w: { word: string }) => w.word === user.myWord.word).guesses,
      team: {
        name: team.name,
        color: team.color
      },
      hasWon: true,
      word: user.myWord.word,
      points: user.pointsDaily,
      dateTimeEnded: user.myWord.dateTimeEnded,
      guessesLeft: user.myWord.guessesLeft,
      userName: user.name,
      userEmail: user.email
    };
  }

  // Return regular game data without the word
  return {
    theme: gameData.theme,
    targetWordLength: user.myWord.length,
    maxGuesses: gameData.targetWords.find((w: { word: string }) => w.word === user.myWord.word).guesses,
    team: {
      name: team.name,
      color: team.color
    },
    hasWon: false,
    dateTimeEnded: user.myWord.dateTimeEnded,
    guessesLeft: user.myWord.guessesLeft,
    userName: user.name,
    userEmail: user.email
  };
}

// Get target word and max guesses for a specific user
export async function getTargetWord(userId: string) {
  const user = await getUserWord(userId);
  
  if (!user.myWord || !user.myWord.word) {
    throw new Error('No word assigned to user');
  }
  
  const wordObj = await findWordInGameData(user.myWord.word);
  
  return {
    word: user.myWord.word,
    maxGuesses: wordObj.guesses
  };
}

// Get max guesses for a specific user's word
export async function getMaxGuessesForUser(userId: string) {
  const user = await getUserWord(userId);
  
  if (!user.myWord || !user.myWord.word) {
    throw new Error('No word assigned to user');
  }
  
  const wordObj = await findWordInGameData(user.myWord.word);
  return wordObj.guesses;
}

// Mark a user's game as completed
export async function completeUserGame(userId: string, hasWon: boolean = false, triesUsed: number = 0) {
  await connectDB();
  const user = await getUserById(userId);
  
  if (!user.myWord || !user.myWord.word) {
    throw new Error('No word assigned to user');
  }
  
  // Update the user's game as completed
  user.myWord.dateTimeEnded = new Date();
  user.myWord.hasWon = hasWon;
  user.myWord.guessesLeft = 0; // Set guesses left to 0 when game is completed
  user.gamesPlayed += 1;
  
  // Get the game data ID from the user's word
  const gameDataId = user.myWord.gameDataId;
  
  // Calculate points if the user won
  if (hasWon) {
    const { maxGuesses } = await getTargetWord(userId);
    const points = calculatePoints(user.myWord, triesUsed, maxGuesses);
    
    // Update user points
    user.pointsDaily = points;
    user.pointsTotal += points;
    
    // Get the game data to access the weekId
    const gameData = await GameData.findById(gameDataId);
    
    // Create point history entry for user
    await PointHistory.create({
      entityId: user._id,
      entityType: 'User',
      type: 'daily',
      points: points,
      date: new Date(),
      gameDataId: gameDataId,
      weekId: gameData.weekId,
      teamId: user.teamId,
      guessesTaken: triesUsed,
      hasWon: true
    });
    
    // Update team points if user has a team
    if (user.teamId) {
      const team = await getTeamById(user.teamId);
      team.pointsTotal += points;
      await team.save();
    }
  } else {
    // Reset daily points to 0 if user didn't win
    user.pointsDaily = 0;
    
    // Get the game data to access the weekId
    const gameData = await GameData.findById(gameDataId);
    
    // Create point history entry for user with 0 points
    await PointHistory.create({
      entityId: user._id,
      entityType: 'User',
      type: 'daily',
      points: 0,
      date: new Date(),
      gameDataId: gameDataId,
      weekId: gameData.weekId,
      teamId: user.teamId,
      guessesTaken: triesUsed,
      hasWon: false
    });
  }
  
  await user.save();
  
  return user;
}

// Update team members count
export async function updateTeamMembersCount(teamId: mongoose.Types.ObjectId, increment: boolean = true) {
  await connectDB();
  
  const team = await Team.findById(teamId);
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Increment or decrement the membersCount
  team.membersCount = increment ? team.membersCount + 1 : Math.max(0, team.membersCount - 1);
  
  await team.save();
  
  return team;
}

// Create a new user and assign them to the team with the least members
export async function createUserAndAssignTeam(email: string, nickname: string, supabaseId: string) {
  await connectDB();
  
  // Find the team with the least members
  const teamWithLeastMembers = await Team.findOne().sort({ membersCount: 1 });
  
  if (!teamWithLeastMembers) {
    throw new Error('No teams available');
  }
  
  // Create the new user
  const user = await User.create({
    email,
    name: nickname,
    supabaseId,
    teamId: teamWithLeastMembers._id,
    points: {
      daily: 0,
      weekly: 0,
      total: 0,
      lastDailyReset: new Date(),
      lastWeeklyReset: new Date()
    },
    gamesPlayed: 0
  });
  
  // Update the team's membersCount
  await updateTeamMembersCount(teamWithLeastMembers._id, true);
  
  return {
    user,
    team: teamWithLeastMembers
  };
} 