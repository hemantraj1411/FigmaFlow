import mongoose from 'mongoose';

export interface IPeriod extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes?: string;
}

const periodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  flow: { type: String, enum: ['light', 'medium', 'heavy'], required: true },
  symptoms: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

export const Period = mongoose.model<IPeriod>('Period', periodSchema);