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

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
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

// ==================== HEALTH ROUTE ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Feminaflow API is running' });
});

// ==================== USER SCHEMA ====================
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

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PERIOD ROUTES ====================
app.get('/api/periods', async (req, res) => {
  try {
    // This will be implemented with authentication
    res.json({ message: 'Periods endpoint - Add authentication' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== MOOD ROUTES ====================
app.get('/api/moods', async (req, res) => {
  try {
    res.json({ message: 'Moods endpoint - Add authentication' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SYMPTOM ROUTES ====================
app.get('/api/symptoms', async (req, res) => {
  try {
    res.json({ message: 'Symptoms endpoint - Add authentication' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CHAT ROUTES ====================
app.get('/api/chat', async (req, res) => {
  try {
    res.json({ message: 'Chat endpoint - Add authentication' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});