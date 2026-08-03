"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { submitGuess, calculateFinalScore, type GuessStatus, type GameData } from "@/lib/game/gameActions";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import { User } from '@supabase/supabase-js';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Guess {
  word: string;
  status: GuessStatus;
  isCorrect: boolean;
  clue?: string;
}

interface GameClientProps {
  initialGameData: GameData;
}

export default function GameClient({ initialGameData }: GameClientProps) {
  const [gameData, ] = useState<GameData>(initialGameData);
  const [guess, setGuess] = useState("");
  const [winningGuess, setWinningGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWon, setHasWon] = useState(initialGameData.hasWon || false);
  const [isGameOver, setIsGameOver] = useState(
    initialGameData.dateTimeEnded ? true : 
    initialGameData.guessesLeft !== undefined && initialGameData.guessesLeft <= 0
  );
  const [guessesLeft, setGuessesLeft] = useState<number | undefined>(
    initialGameData.guessesLeft
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // If they've already won, calculate their score
  useEffect(() => {
    if (initialGameData.hasWon) {
      setTotalPoints(initialGameData.points || 0);
    } else if (initialGameData.dateTimeEnded || (initialGameData.guessesLeft !== undefined && initialGameData.guessesLeft <= 0)) {
      setTotalPoints(0);
    }
  }, [initialGameData, guesses.length]);

  // Check for new game
  useEffect(() => {
    const checkForNewGame = async () => {
      try {
        const response = await fetch('/api/game/current-id', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch current game ID:', errorData);
          return;
        }
        
        const data = await response.json();
        
        // Get stored game ID from localStorage
        const storedGameId = localStorage.getItem('currentGameId');
        
        // If no stored ID or different from server, show modal
        if (!storedGameId || storedGameId !== data.currentGameId) {
          setShowNewGameModal(true);
          setCurrentGameId(data.currentGameId);
        }
      } catch (error) {
        console.error('Error checking for new game:', error);
      }
    };

    checkForNewGame();
  }, []);

  useEffect(() => {
    // Check if we're returning from the leaderboard page
    const isFromLeaderboard = localStorage.getItem('fromLeaderboard');
    if (isFromLeaderboard === 'true') {
      localStorage.removeItem('fromLeaderboard');
      window.location.reload();
    }
  }, []);

  const handleNewGameClick = async () => {
    if (currentGameId) {
      try {
        // Store the new game ID
        localStorage.setItem('currentGameId', currentGameId);
        
        // Update the game start time
        const response = await fetch('/api/game/update-start-time', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to update game start time');
        }
        
        // Hide the modal
        setShowNewGameModal(false);
      } catch (error) {
        console.error('Error starting new game:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameData || guess.length !== gameData.targetWordLength || isLoading || hasWon || isGameOver) return;

    setIsLoading(true);
    try {
      const response = await submitGuess(guess);
      const newGuess: Guess = {
        word: guess,
        status: response.status,
        isCorrect: response.isCorrect,
        clue: response.clue
      };
      const newGuesses = [newGuess, ...guesses];
      setGuesses(newGuesses);
      setGuessCount(prev => {
        localStorage.setItem('guessCount', (prev + 1).toString());
        return prev + 1;
      });
      const winningGuess = guess;
      setGuess("");
      
      // Update guesses left from the response
      setGuessesLeft(response.guessesLeft);
      
      if (response.isCorrect) {
        setHasWon(true);
        setWinningGuess(winningGuess);
        const score = await calculateFinalScore(newGuesses.length);
        setTotalPoints(score);
      } else if (response.guessesLeft <= 0 || response.isGameOver) {
        setIsGameOver(true);
        setTotalPoints(0);
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
    } finally {
      setIsLoading(false);
      // Focus the input field after submission
      if (inputRef.current && !hasWon && !isGameOver) {
        inputRef.current.focus();
      }
    }
  };

  const getStatusColor = (status: GuessStatus) => {
    switch (status) {
      case "WAY_OFF":
        return styles.wayOff;
      case "NOT_QUITE":
        return styles.notQuite;
      case "GETTING_CLOSER":
        return styles.gettingCloser;
      case "VERY_CLOSE":
        return styles.veryClose;
      default:
        return "";
    }
  };

  const getRemainingGuesses = () => {
    return guessesLeft !== undefined ? guessesLeft : 0;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleLeaderboardClick = () => {
    router.push('/leaderboard');
  };

  return (
    <div className={styles.container}>
      {/* Refresh Button */}
      <IconButton
        className={styles.refreshButton}
        onClick={() => window.location.reload()}
        aria-label="Reload Page"
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          background: 'white',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.9)',
          }
        }}
      >
        <RefreshIcon />
      </IconButton>

      <div className={styles.headerContainer}>
        <h1 className={styles.title}>WordTeam</h1>
        <button 
          className={styles.leaderboardButton}
          onClick={handleLeaderboardClick}
          aria-label="View Leaderboard"
        >
          <EmojiEventsIcon />
          <span>Leaderboard</span>
        </button>
      </div>
      {user && (
        <div className={styles.userGreeting}>
          <span role="img" aria-label="wave">👋</span> Hi, <strong>{initialGameData.userName || user.email?.split('@')[0] || 'Player'}</strong>!
        </div>
      )}
      <div className={styles.themeContainer}>
        <h2 className={styles.theme}>
          Today&apos;s Theme: {gameData.theme} 
          {/* <span role="img" aria-label="theme icon">🐾</span> */}
        </h2>
      </div>

      {hasWon ? (
        <div className={styles.winMessage}>
          <h2>🎉 Congratulations! You&apos;ve won today! 🎉</h2>
          <p>You correctly guessed the word: <strong>{gameData.word || winningGuess}</strong></p>
          <p>Come back tomorrow for another word!</p>
        </div>
      ) : isGameOver || gameData.dateTimeEnded ? (
        <div className={styles.gameOverMessage}>
          <h2>Game Over!</h2>
          <p>You didn&apos;t guess the word for today.</p>
          <p>Try again tomorrow!</p>
        </div>
      ) : (
        <div className={styles.wordDisplay}>
          <div className={styles.wordGrid}>
            {Array.from({ length: gameData.targetWordLength }).map((_, idx) => (
              <span key={idx} className={styles.letter}>
                {guess[idx]?.toUpperCase() || '-'}
              </span>
            ))}
          </div>
          <div className={styles.guessesRemaining}>
            {getRemainingGuesses()} {getRemainingGuesses() === 1 ? 'guess' : 'guesses'} remaining
          </div>
        </div>
      )}

      {!hasWon && !isGameOver && !gameData.dateTimeEnded && (
        <>
          <form onSubmit={handleSubmit} className={styles.guessContainer}>
            <input
              ref={inputRef}
              type="text"
              className={styles.guessInput}
              placeholder={`Enter ${gameData.targetWordLength}-letter word`}
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              maxLength={gameData.targetWordLength}
              disabled={isLoading}
              autoFocus
            />
          </form>

          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={
              guess.length !== gameData.targetWordLength || 
              isLoading
            }
          >
            {isLoading ? "CHECKING..." : "SUBMIT"}
          </button>
        </>
      )}

      <div className={styles.guessList}>
        {/* Clue Container */}
        {guesses.some(guess => guess.clue) && (
          <div className={styles.cluesContainer}>
            <h3 className={styles.cluesTitle}>Your Clues</h3>
            <div className={styles.cluesList}>
              {guesses
                .filter(guess => guess.clue)
                .map((guess, index) => {
                  // Determine which emoji to use based on the clue index
                  const emoji = index === 0 ? "🔍" : index === 1 ? "💡" : "🎯";
                  return (
                    <div key={`clue-${index}`} className={styles.clueItem}>
                      <span className={styles.clueEmoji}>{emoji}</span>
                      <span className={styles.clueText}>{guess.clue}</span>
                    </div>
                  );
                })
                .reverse()} {/* Show newest clues first */}
            </div>
          </div>
        )}

        {/* Guesses List */}
        {guesses.map((guess, index) => (
          <div key={index} className={`${styles.guessRow} ${guess.isCorrect ? styles.correctGuess : ''}`}>
            <span className={styles.guessWord}>{guess.word}</span>
            <div className={styles.guessInfo}>
              <span className={`${styles.guessStatus} ${getStatusColor(guess.status)}`}>
                {guess.status === "YOU_GOT_IT" ? "You Got It!" : guess.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(hasWon || isGameOver || gameData.dateTimeEnded) && totalPoints !== null && (
        <>
          <div className={styles.scoreDisplay}>
            You earned {totalPoints} points for{" "}
            <span className={styles.teamName} style={{ color: gameData.team.color }}>
              {gameData.team.name}
            </span>
          </div>

          <div className={styles.shareSection}>
            <h3>Share your result!</h3>
            <div className={styles.shareButtons}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  hasWon 
                    ? `I guessed my word in ${guessCount || localStorage.getItem('guessCount') || 0} guesses for today's theme: ${gameData.theme}! I won ${totalPoints} points for me and ${gameData.team.name}!`
                    : `I could not get my word for today's theme: ${gameData.theme} - You should give it a try!`
                )}&url=${encodeURIComponent('https://playwordteam.com')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.shareButton} ${styles.twitter}`}
              >
                Share on X/Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://playwordteam.com')}&quote=${encodeURIComponent(
                  hasWon 
                    ? `I guessed my word in ${guessCount || localStorage.getItem('guessCount') || 0} guesses for today's theme: ${gameData.theme}! I won ${totalPoints} points for me and ${gameData.team.name}!`
                    : `I could not get my word for today's theme: ${gameData.theme} - You should give it a try!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.shareButton} ${styles.facebook}`}
              >
                Share on Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  hasWon 
                    ? `I guessed my word in ${guessCount || localStorage.getItem('guessCount') || 0} guesses for today's theme: ${gameData.theme}! I won ${totalPoints} points for me and ${gameData.team.name}! Check it out: https://playwordteam.com`
                    : `I could not get my word for today's theme: ${gameData.theme} - You should give it a try! https://playwordteam.com`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.shareButton} ${styles.whatsapp}`}
              >
                Share on WhatsApp
              </a>
              <button
                onClick={() => {
                  const text = hasWon 
                    ? `I guessed my word in ${guessCount || localStorage.getItem('guessCount') || 0} guesses for today's theme: ${gameData.theme}! I won ${totalPoints} points for me and Team ${gameData.team.name}!`
                    : `I could not get my word for today's theme: ${gameData.theme} - You should give it a try!`;
                  navigator.clipboard.writeText(text + ' ' + 'https://playwordteam.com');
                  // You could add a toast notification here
                }}
                className={`${styles.shareButton} ${styles.copy}`}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </>
      )}

      <div className={styles.teamMessage} style={{ color: gameData.team.color }}>
        Do it for {gameData.team.name}!
      </div>

      <Button
        size="small"
        variant="text"
        className={styles.logoutButton}
        onClick={() => setShowLogoutConfirm(true)}
      >
        Sign Out
      </Button>

      <Dialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          color: 'var(--primary)',
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }}>
          Sign Out
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            Are you sure you want to sign out?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center',
          gap: 2,
          padding: '1rem'
        }}>
          <Button
            onClick={() => setShowLogoutConfirm(false)}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, var(--primary), #ff8e8e)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5252, #ff8e8e)',
              }
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Game Modal */}
      <Dialog
        open={showNewGameModal}
        onClose={() => {}} // Prevent closing by clicking outside
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          color: 'var(--primary)',
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }}>
          New Game Available!
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            A new game is ready to play. Would you like to start now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center',
          gap: 2,
          padding: '1rem'
        }}>
          <Button
            onClick={handleNewGameClick}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, var(--primary), #ff8e8e)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5252, #ff8e8e)',
              }
            }}
          >
            Play Now
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 