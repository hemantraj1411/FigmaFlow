import { Response } from 'express';
import { ChatHistory } from '../models/ChatHistory.js';
import { AuthRequest } from '../middleware/auth.js';

// Simple rule-based responses
const getBotResponse = (message: string): string => {
  const msg = message.toLowerCase();
  
  if (msg.includes('period') && (msg.includes('late') || msg.includes('delay'))) {
    return "Periods can be late due to various reasons like stress, hormonal changes, diet changes, or pregnancy. If you're concerned, consider taking a pregnancy test or consulting a healthcare provider.";
  }
  if (msg.includes('stress') && msg.includes('period')) {
    return "Yes, stress can definitely affect your menstrual cycle! High stress levels can delay ovulation, which in turn can make your period late or even cause you to skip a period entirely.";
  }
  if (msg.includes('ovulation')) {
    return "Ovulation usually occurs about 14 days before your next period. For a 28-day cycle, ovulation typically happens around day 14. Signs include changes in cervical mucus and a slight rise in basal body temperature.";
  }
  if (msg.includes('cramps')) {
    return "Menstrual cramps are caused by contractions in the uterus. To relieve them, try heat therapy (heating pad), gentle exercise, over-the-counter pain relievers like ibuprofen, or magnesium supplements.";
  }
  if (msg.includes('pms')) {
    return "PMS (Premenstrual Syndrome) includes symptoms like mood swings, bloating, fatigue, and breast tenderness. Regular exercise, healthy diet, enough sleep, and stress management can help reduce symptoms.";
  }
  if (msg.includes('pregnant') || msg.includes('pregnancy')) {
    return "If you think you might be pregnant, common early signs include missed period, nausea, breast tenderness, and fatigue. A pregnancy test is the best way to confirm. Please consult a healthcare provider for proper guidance.";
  }
  if (msg.includes('track')) {
    return "Tracking your cycle is super helpful! You can log your period dates, symptoms, and moods. This helps predict future periods, identify patterns, and better understand your body.";
  }
  
  return "Thanks for your question! Remember, I'm here to provide general information about periods, menstrual health, and wellness. For personalized medical advice, please consult a healthcare provider.";
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.user._id, messages: [] });
    }
    
    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Get bot response
    const botResponse = getBotResponse(message);
    
    // Add bot response
    chatHistory.messages.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date()
    });
    
    await chatHistory.save();
    
    res.json({ 
      success: true, 
      response: botResponse,
      messages: chatHistory.messages.slice(-10) // Return last 10 messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.user._id });
    res.json({ 
      success: true, 
      messages: chatHistory?.messages.slice(-50) || [] 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};