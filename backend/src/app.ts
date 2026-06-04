import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      process.exit(1);
    }
    
    console.log('📡 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// ==================== INTERFACES ====================

interface IUser {
  name: string;
  email: string;
  password: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodDate?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ==================== MODELS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cycleLength: { type: Number, default: 28 },
  periodLength: { type: Number, default: 5 },
  lastPeriodDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
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

// Chat History Schema
const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// ==================== MIDDLEWARE ====================

const protect = async (req: any, res: any, next: any) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret') as { id: string };
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// ==================== PREDICTION FUNCTION ====================

const calculatePrediction = (periods: any[], cycleLength: number = 28) => {
  if (!periods || periods.length === 0) {
    return null;
  }
  
  const lastPeriod = periods[0];
  const lastStartDate = new Date(lastPeriod.startDate);
  const nextPeriodDate = new Date(lastStartDate);
  nextPeriodDate.setDate(lastStartDate.getDate() + cycleLength);
  
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14);
  
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(ovulationDate.getDate() - 5);
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(ovulationDate.getDate() + 1);
  
  return {
    nextPeriod: nextPeriodDate,
    ovulationDate,
    fertileWindow: { start: fertileStart, end: fertileEnd },
    daysUntilNextPeriod: Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
  };
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '30d' });
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cycleLength: user.cycleLength,
        periodLength: user.periodLength,
        lastPeriodDate: user.lastPeriodDate
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordMatch = await (user as any).comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '30d' });
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cycleLength: user.cycleLength,
        periodLength: user.periodLength,
        lastPeriodDate: user.lastPeriodDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/profile', protect, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/auth/profile', protect, async (req: any, res: any) => {
  try {
    const { name, cycleLength, periodLength, lastPeriodDate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, cycleLength, periodLength, lastPeriodDate },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== PERIOD ROUTES ====================

app.post('/api/periods', protect, async (req: any, res: any) => {
  try {
    const period = await Period.create({
      userId: req.user._id,
      ...req.body
    });
    await User.findByIdAndUpdate(req.user._id, { lastPeriodDate: req.body.startDate });
    
    const allPeriods = await Period.find({ userId: req.user._id }).sort({ startDate: -1 });
    const prediction = calculatePrediction(allPeriods, req.user.cycleLength);
    
    res.status(201).json({ success: true, period, prediction });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/periods', protect, async (req: any, res: any) => {
  try {
    const periods = await Period.find({ userId: req.user._id }).sort({ startDate: -1 });
    const prediction = calculatePrediction(periods, req.user.cycleLength);
    res.json({ success: true, periods, prediction });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/periods/:id', protect, async (req: any, res: any) => {
  try {
    const period = await Period.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    const allPeriods = await Period.find({ userId: req.user._id }).sort({ startDate: -1 });
    const prediction = calculatePrediction(allPeriods, req.user.cycleLength);
    res.json({ success: true, period, prediction });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/periods/:id', protect, async (req: any, res: any) => {
  try {
    await Period.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    const allPeriods = await Period.find({ userId: req.user._id }).sort({ startDate: -1 });
    const prediction = calculatePrediction(allPeriods, req.user.cycleLength);
    res.json({ success: true, prediction });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== MOOD ROUTES ====================

app.post('/api/moods', protect, async (req: any, res: any) => {
  try {
    const mood = await Mood.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, mood });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/moods', protect, async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    const moods = await Mood.find(query).sort({ date: -1 });
    res.json({ success: true, moods });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== SYMPTOM ROUTES ====================

app.post('/api/symptoms', protect, async (req: any, res: any) => {
  try {
    const symptom = await Symptom.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, symptom });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/symptoms', protect, async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    const symptoms = await Symptom.find(query).sort({ date: -1 });
    res.json({ success: true, symptoms });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== CHAT ROUTES ====================

const getBotResponse = (message: string): string => {
  const msg = message.toLowerCase();
  if (msg.includes('period') && msg.includes('late')) {
    return "Periods can be late due to various reasons like stress, hormonal changes, diet changes, or pregnancy. If you're concerned, consider taking a pregnancy test or consulting a healthcare provider.";
  }
  if (msg.includes('stress') && msg.includes('period')) {
    return "Yes, stress can definitely affect your menstrual cycle! High stress levels can delay ovulation, which in turn can make your period late.";
  }
  if (msg.includes('ovulation')) {
    return "Ovulation usually occurs about 14 days before your next period. Signs include changes in cervical mucus and a slight rise in basal body temperature.";
  }
  if (msg.includes('cramps')) {
    return "To relieve cramps, try heat therapy (heating pad), gentle exercise, over-the-counter pain relievers like ibuprofen, or magnesium supplements.";
  }
  if (msg.includes('pms')) {
    return "PMS symptoms can be managed with regular exercise, healthy diet, enough sleep, and stress management techniques.";
  }
  if (msg.includes('pregnancy') || msg.includes('pregnant')) {
    return "If you think you might be pregnant, common early signs include missed period, nausea, breast tenderness, and fatigue. A pregnancy test is the best way to confirm. Please consult a healthcare provider for proper guidance.";
  }
  return "Thanks for your question! I'm here to provide general information about periods, menstrual health, and wellness. For personalized medical advice, please consult a healthcare provider.";
};

app.post('/api/chat/message', protect, async (req: any, res: any) => {
  try {
    const { message } = req.body;
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.user._id, messages: [] });
    }
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    const botResponse = getBotResponse(message);
    chatHistory.messages.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date()
    });
    await chatHistory.save();
    res.json({ success: true, response: botResponse, messages: chatHistory.messages.slice(-10) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/chat/history', protect, async (req: any, res: any) => {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    res.json({ success: true, messages: chatHistory?.messages.slice(-50) || [] });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'ok', message: 'Feminaflow API is running' });
});

// ==================== ROOT ROUTE ====================

app.get('/', (req: any, res: any) => {
  res.json({ 
    message: 'Feminaflow API is running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      periods: '/api/periods',
      moods: '/api/moods',
      symptoms: '/api/symptoms',
      chat: '/api/chat'
    }
  });
});

// ==================== START SERVER ====================
// FIXED: Proper port handling with numeric value
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 API URL: http://localhost:${PORT}/api\n`);
});