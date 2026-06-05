import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB error:', err));

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  cycleLength: { type: Number, default: 28 },
  periodLength: { type: Number, default: 5 },
  lastPeriodDate: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Period Schema
const periodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  flow: { type: String, enum: ['light', 'medium', 'heavy'], required: true },
  symptoms: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

const Period = mongoose.model('Period', periodSchema);

// Mood Schema
const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: { type: String, enum: ['happy', 'sad', 'angry', 'tired', 'energetic', 'anxious', 'calm'], required: true },
  intensity: { type: Number, min: 1, max: 5, required: true },
  notes: { type: String }
}, { timestamps: true });

const Mood = mongoose.model('Mood', moodSchema);

// Symptom Schema
const symptomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  symptoms: {
    cramps: { type: Number, default: 0 },
    headache: { type: Number, default: 0 },
    bloating: { type: Number, default: 0 },
    backPain: { type: Number, default: 0 },
    acne: { type: Number, default: 0 },
    breastTenderness: { type: Number, default: 0 },
    fatigue: { type: Number, default: 0 },
    nausea: { type: Number, default: 0 }
  },
  notes: { type: String }
}, { timestamps: true });

const Symptom = mongoose.model('Symptom', symptomSchema);

// ==================== MIDDLEWARE ====================
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PERIOD ROUTES ====================
app.get('/api/periods', auth, async (req, res) => {
  try {
    const periods = await Period.find({ userId: req.userId }).sort({ startDate: -1 });
    
    // Calculate prediction
    let prediction = null;
    if (periods.length > 0) {
      const lastPeriod = periods[0];
      const user = await User.findById(req.userId);
      const cycleLength = user?.cycleLength || 28;
      const lastStartDate = new Date(lastPeriod.startDate);
      const nextPeriodDate = new Date(lastStartDate);
      nextPeriodDate.setDate(lastStartDate.getDate() + cycleLength);
      const ovulationDate = new Date(nextPeriodDate);
      ovulationDate.setDate(nextPeriodDate.getDate() - 14);
      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(ovulationDate.getDate() - 5);
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(ovulationDate.getDate() + 1);
      prediction = {
        nextPeriod: nextPeriodDate,
        ovulationDate,
        fertileWindow: { start: fertileStart, end: fertileEnd },
        daysUntilNextPeriod: Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      };
    }
    
    res.json({ success: true, periods, prediction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/periods', auth, async (req, res) => {
  try {
    const period = await Period.create({
      userId: req.userId,
      ...req.body
    });
    res.status(201).json({ success: true, period });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/periods/:id', auth, async (req, res) => {
  try {
    const period = await Period.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json({ success: true, period });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/periods/:id', auth, async (req, res) => {
  try {
    await Period.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== MOOD ROUTES ====================
app.get('/api/moods', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, moods });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/moods', auth, async (req, res) => {
  try {
    const mood = await Mood.create({
      userId: req.userId,
      ...req.body
    });
    res.status(201).json({ success: true, mood });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SYMPTOM ROUTES ====================
app.get('/api/symptoms', auth, async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, symptoms });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/symptoms', auth, async (req, res) => {
  try {
    const symptom = await Symptom.create({
      userId: req.userId,
      ...req.body
    });
    res.status(201).json({ success: true, symptom });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== HEALTH ROUTE ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Feminaflow API is running' });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});