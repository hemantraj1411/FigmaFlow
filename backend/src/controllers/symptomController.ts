import { Response } from 'express';
import { Symptom } from '../models/Symptom.js';
import { AuthRequest } from '../middleware/auth.js';

export const addSymptom = async (req: AuthRequest, res: Response) => {
  try {
    const symptom = await Symptom.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, symptom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSymptoms = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    
    const symptoms = await Symptom.find(query).sort({ date: -1 });
    res.json({ success: true, symptoms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};