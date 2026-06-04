import { Response } from 'express';
import { Mood } from '../models/Mood.js';
import { AuthRequest } from '../middleware/auth.js';

export const addMood = async (req: AuthRequest, res: Response) => {
  try {
    const mood = await Mood.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, mood });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMoods = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    
    const moods = await Mood.find(query).sort({ date: -1 });
    res.json({ success: true, moods });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};