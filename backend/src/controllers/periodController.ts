import { Response } from 'express';
import { Period } from '../models/Period.js';
import { AuthRequest } from '../middleware/auth.js';
import { predictNextPeriod } from '../services/periodPrediction.js';

export const addPeriod = async (req: AuthRequest, res: Response) => {
  try {
    const period = await Period.create({
      userId: req.user._id,
      ...req.body
    });
    
    // Update user's lastPeriodDate
    await req.user.updateOne({ lastPeriodDate: req.body.startDate });
    
    res.status(201).json({ success: true, period });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPeriods = async (req: AuthRequest, res: Response) => {
  try {
    const periods = await Period.find({ userId: req.user._id }).sort({ startDate: -1 });
    const prediction = predictNextPeriod(periods, req.user.cycleLength);
    res.json({ success: true, periods, prediction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updatePeriod = async (req: AuthRequest, res: Response) => {
  try {
    const period = await Period.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, period });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePeriod = async (req: AuthRequest, res: Response) => {
  try {
    await Period.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};