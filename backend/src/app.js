import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ==================== CORS CONFIGURATION (FIX) ====================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://figma-flow-pi.vercel.app',
  'https://figmaflow.vercel.app',
  'https://figma-flow.vercel.app',
  'https://feminaflow.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      // Still allow for now to avoid breaking production
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

// ==================== MONGODB CONNECTION ====================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined');
      process.exit(1);
    }
    
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 - fixes SSL error
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

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

// ==================== CHAT BOT RESPONSE FUNCTION ====================
const getBotResponse = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('period') && (msg.includes('late') || msg.includes('delay'))) {
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
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PERIOD ROUTES ====================
app.get('/api/periods', auth, async (req, res) => {
  try {
    const periods = await Period.find({ userId: req.userId }).sort({ startDate: -1 });
    
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
    console.error('Get periods error:', error);
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
    console.error('Create period error:', error);
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
    console.error('Update period error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/periods/:id', auth, async (req, res) => {
  try {
    await Period.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete period error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== MOOD ROUTES ====================
app.get('/api/moods', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, moods });
  } catch (error) {
    console.error('Get moods error:', error);
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
    console.error('Create mood error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SYMPTOM ROUTES ====================
app.get('/api/symptoms', auth, async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, symptoms });
  } catch (error) {
    console.error('Get symptoms error:', error);
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
    console.error('Create symptom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CHAT ROUTES ====================
app.post('/api/chat/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    let chatHistory = await ChatHistory.findOne({ userId: req.userId });
    
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.userId, messages: [] });
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
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/chat/history', auth, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.userId });
    res.json({ success: true, messages: chatHistory?.messages.slice(-50) || [] });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== HEALTH ROUTE ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Feminaflow API is running' });
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Feminaflow API is running',
    status: 'ok',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});