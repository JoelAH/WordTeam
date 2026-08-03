import 'server-only';
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  currentGameDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameData',
    required: true,
  },
  previousGameDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameData',
    required: false,
  },
  weekId: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Prevent mongoose from creating the model multiple times
export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 