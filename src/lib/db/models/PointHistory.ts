import 'server-only';
import mongoose from 'mongoose';

const pointHistorySchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // This will reference either User or Team
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Team']
  },
  type: {
    type: String,
    required: true,
    enum: ['daily', 'weekly']
  },
  points: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  // For weekly records, this will store the week number (1-52)
  weekId: {
    type: Number,
  },
  // Reference to the game data that generated these points
  gameDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameData'
  },
  // Reference to the team the user belongs to (for User entityType)
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  // Number of guesses taken to complete the game
  guessesTaken: {
    type: Number,
    required: false,
  },
  // Whether the game was won or not
  hasWon: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Compound index to ensure we don't have duplicate entries for the same entity and date
pointHistorySchema.index({ entityId: 1, type: 1, date: 1 }, { unique: true });

export const PointHistory = mongoose.models.PointHistory || mongoose.model('PointHistory', pointHistorySchema); 