import 'server-only';
import mongoose from 'mongoose';

const gameDataSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
  },
  targetWords: [{
    word: {
      type: String,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    guesses: {
      type: Number,
      required: true,
    },
    clues: {
      type: [String],
      required: true,
    }
  }],
  weekId: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  past: {
    type: Boolean,
    default: false,
  }
});

// Prevent mongoose from creating the model multiple times
export const GameData = mongoose.models.GameData || mongoose.model('GameData', gameDataSchema); 