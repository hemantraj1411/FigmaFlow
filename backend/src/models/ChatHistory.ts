import mongoose from 'mongoose';

export interface IChatHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
}

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);