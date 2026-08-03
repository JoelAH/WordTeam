import 'server-only';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  pointsDaily: {
    type: Number,
    default: 0,
  },
  pointsTotal: {
    type: Number,
    default: 0,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  myWord: {
    word: {
      type: String,
    },
    length: {
      type: Number,
    },
    dateTimeStarted: {
      type: Date,
    },
    dateTimeEnded: {
      type: Date,
    },
    gameDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameData',
    },
    hasWon: {
      type: Boolean,
      default: false,
    },
    guessesLeft: {
      type: Number,
      default: 0,
    },
    clues: {
      type: [String],
      default: [],
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent mongoose from creating the model multiple times
export const User = mongoose.models.User || mongoose.model('User', userSchema); 