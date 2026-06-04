import mongoose from 'mongoose';

export interface IMood extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mood: 'happy' | 'sad' | 'angry' | 'tired' | 'energetic' | 'anxious' | 'calm';
  intensity: number;
  notes?: string;
}

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: { type: String, enum: ['happy', 'sad', 'angry', 'tired', 'energetic', 'anxious', 'calm'], required: true },
  intensity: { type: Number, min: 1, max: 5, required: true },
  notes: { type: String }
}, { timestamps: true });

export const Mood = mongoose.model<IMood>('Mood', moodSchema);