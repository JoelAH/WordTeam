'use server';

import { getClientGameData, getTargetWord, completeUserGame, getUserById, findWordInGameData } from '@/lib/db/game';
import { createClient } from '@/lib/supabase/server';

export type GuessStatus = "WAY_OFF" | "NOT_QUITE" | "GETTING_CLOSER" | "VERY_CLOSE" | "YOU_GOT_IT";

export interface GameData {
  theme: string;
  targetWordLength: number;
  maxGuesses: number;
  team: {
    name: string;
    color: string;
  };
  hasWon?: boolean;
  word?: string;
  dateTimeEnded?: Date | null;
  guessesLeft?: number;
  points?: number;
  userName?: string;
  userEmail?: string;
}

export interface GuessResponse {
  status: GuessStatus;
  isCorrect: boolean;
  guessesLeft: number;
  isGameOver?: boolean;
  clue?: string;
}

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

// Helper function to calculate word similarity (0 to 1)
function calculateSimilarity(word1: string, word2: string): number {
  const len = Math.max(word1.length, word2.length);
  let matches = 0;

  // Compare characters at same positions
  for (let i = 0; i < len; i++) {
    if (word1[i] === word2[i]) matches += 2;
  }

  // Check for characters that exist in both words but different positions
  const chars1 = word1.split('');
  const chars2 = word2.split('');
  for (const char of chars1) {
    if (chars2.includes(char)) {
      matches += 1;
      chars2.splice(chars2.indexOf(char), 1);
    }
  }

  return matches / (len * 3); // Normalize to 0-1 range
}

export async function getGameData(): Promise<GameData> {
  // Get the Supabase client
  const supabase = await createClient();
  
  // Get the current user from the session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User not found');
  }
  
  // Get game data from the database
  return getClientGameData(user.id);
}

export async function submitGuess(guess: string): Promise<GuessResponse> {
  const supabase = await createClient();
  
  // Get the current user from the session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User not found');
  }

  // Get the target word and max guesses from the database
  const { word: targetWord, maxGuesses } = await getTargetWord(user.id);
  
  // Get the user to check guesses left
  const foundUser = await getUserById(user.id);
  
  // Check if user has guesses left
  if (foundUser.myWord.guessesLeft <= 0) {
    return {
      status: "NOT_QUITE",
      isCorrect: false,
      guessesLeft: 0,
      isGameOver: true
    };
  }
  
  // Decrement guesses left
  foundUser.myWord.guessesLeft -= 1;
  await foundUser.save();
  
  const normalizedGuess = guess.toUpperCase();
  const similarity = calculateSimilarity(normalizedGuess, targetWord);
  
  let status: GuessStatus;
  const isCorrect = normalizedGuess === targetWord;
  
  // Calculate total guesses made (including this one)
  const totalGuessesMade = maxGuesses - foundUser.myWord.guessesLeft;
  
  // Get the word object to access clues
  const wordObj = await findWordInGameData(targetWord);
  let clue: string | undefined;
  
  // Return clues based on guess count
  if (totalGuessesMade === 2) {
    clue = wordObj.clues[1]; // Second clue after 2 guesses
  } else if (totalGuessesMade === 3) {
    clue = wordObj.clues[0]; // First clue after 3 guesses
  } else if (totalGuessesMade === 4) {
    clue = wordObj.clues[2]; // Third clue after 4 guesses
  }
  
  if (isCorrect) {
    // Mark the game as completed with hasWon = true
    await completeUserGame(user.id, true, totalGuessesMade);
    status = "YOU_GOT_IT";
  } else if (similarity >= 0.8) {
    status = "VERY_CLOSE";
  } else if (similarity >= 0.6) {
    status = "GETTING_CLOSER";
  } else if (similarity >= 0.3) {
    status = "NOT_QUITE";
  } else {
    status = "WAY_OFF";
  }
  
  // Check if exceeded max guesses AFTER determining if the guess was correct
  if (!isCorrect && foundUser.myWord.guessesLeft <= 0) {
    // Mark the game as completed with hasWon = false
    await completeUserGame(user.id, false, totalGuessesMade);
    return {
      status: "NOT_QUITE",
      isCorrect: false,
      guessesLeft: 0,
      isGameOver: true,
      clue
    };
  }
  
  return { 
    status,
    isCorrect,
    guessesLeft: foundUser.myWord.guessesLeft,
    clue
  };
}

export async function calculateFinalScore(triesUsed: number): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User not found');
  }

  const foundUser = await getUserById(user.id);

  // Get the target word and max guesses from the database
  const { maxGuesses } = await getTargetWord(user.id);
  return calculatePoints(
    foundUser.myWord,
    triesUsed,
    maxGuesses
  );
} 