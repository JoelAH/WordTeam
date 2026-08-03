import 'server-only';
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    required: true,
  },
  membersCount: {
    type: Number,
    default: 0,
  },
  pointsDaily: {
    type: Number,
    default: 0,
  },
  pointsTotal: {
    type: Number,
    default: 0,
  },
});

// Prevent mongoose from creating the model multiple times
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema); 