'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Smile, Droplet, Calendar, Save, Loader2, Check, Heart, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { usePeriodTracker } from '@/hooks/usePeriodTracker';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type TabType = 'period' | 'mood' | 'symptom';

export default function TrackerPage() {
  const { token } = useAuth();
  const { addPeriod, fetchPeriods } = usePeriodTracker();
  const [activeTab, setActiveTab] = useState<TabType>('period');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  
  // Period tracking state
  const [periodData, setPeriodData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    flow: 'medium' as 'light' | 'medium' | 'heavy',
    symptoms: [] as string[],
    notes: ''
  });

  // Mood tracking state
  const [moodData, setMoodData] = useState({
    mood: 'happy',
    intensity: 3,
    notes: ''
  });

  // Symptom tracking state
  const [symptomData, setSymptomData] = useState({
    cramps: 0,
    headache: 0,
    bloating: 0,
    backPain: 0,
    acne: 0,
    breastTenderness: 0,
    fatigue: 0,
    nausea: 0,
    notes: ''
  });

  useEffect(() => {
    // Auto-play background video
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch(error => {
        console.log("Background video autoplay failed:", error);
      });
    }
  }, []);

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-500' },
    { value: 'energetic', emoji: '⚡', label: 'Energetic', color: 'bg-green-500' },
    { value: 'calm', emoji: '😌', label: 'Calm', color: 'bg-blue-500' },
    { value: 'tired', emoji: '😴', label: 'Tired', color: 'bg-gray-500' },
    { value: 'sad', emoji: '😢', label: 'Sad', color: 'bg-indigo-500' },
    { value: 'angry', emoji: '😤', label: 'Angry', color: 'bg-red-500' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-purple-500' },
  ];

  const symptomsList = [
    { key: 'cramps' as const, label: 'Cramps', icon: '🔥' },
    { key: 'headache' as const, label: 'Headache', icon: '🤕' },
    { key: 'bloating' as const, label: 'Bloating', icon: '🎈' },
    { key: 'backPain' as const, label: 'Back Pain', icon: '💪' },
    { key: 'acne' as const, label: 'Acne', icon: '😖' },
    { key: 'breastTenderness' as const, label: 'Breast Tenderness', icon: '💝' },
    { key: 'fatigue' as const, label: 'Fatigue', icon: '😴' },
    { key: 'nausea' as const, label: 'Nausea', icon: '🤢' },
  ];

  const periodSymptoms = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Back Pain', 'Nausea', 'Breast Tenderness'];

  const handlePeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await addPeriod(periodData);
    if (result.success) {
      setPeriodData({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        flow: 'medium',
        symptoms: [],
        notes: ''
      });
    }
    setLoading(false);
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/moods`, {
        date: selectedDate,
        mood: moodData.mood,
        intensity: moodData.intensity,
        notes: moodData.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Mood logged successfully! 🌟');
      setMoodData({ mood: 'happy', intensity: 3, notes: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to log mood');
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/symptoms`, {
        date: selectedDate,
        symptoms: symptomData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Symptoms logged successfully! 📝');
      setSymptomData({
        cramps: 0, headache: 0, bloating: 0, backPain: 0,
        acne: 0, breastTenderness: 0, fatigue: 0, nausea: 0,
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to log symptoms');
    } finally {
      setLoading(false);
    }
  };

  const togglePeriodSymptom = (symptom: string) => {
    setPeriodData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const updateSymptomIntensity = (key: keyof typeof symptomData, value: number) => {
    if (key !== 'notes') {
      setSymptomData(prev => ({ ...prev, [key]: value }));
    }
  };

  const tabs = [
    { id: 'period' as TabType, label: 'Period', icon: <Droplet className="w-4 h-4" /> },
    { id: 'mood' as TabType, label: 'Mood', icon: <Smile className="w-4 h-4" /> },
    { id: 'symptom' as TabType, label: 'Symptoms', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Video Animation */}
      <div className="fixed inset-0 z-0">
        <video
          ref={bgVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{ filter: "brightness(0.4) contrast(1.1)" }}
        >
          <source src="/images/img5.mp4" type="video/mp4" />
        </video>
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/50 via-purple-900/40 to-rose-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-4"
            >
              <Sparkles className="w-4 h-4 text-pink-300 mr-2" />
              <span className="text-sm text-white font-medium">Daily Health Tracker</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-white">
              Daily Tracker
            </h1>
            <p className="text-white/70 mt-2">Log your period, mood, and symptoms</p>
          </motion.div>

          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20"
          >
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-300" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2 justify-center"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
                    : 'bg-white/10 backdrop-blur-md text-white/80 hover:bg-white/20 border border-white/20'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Period Tracker Form */}
            {activeTab === 'period' && (
              <motion.div
                key="period"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Droplet className="w-6 h-6 text-pink-300" />
                  <h2 className="text-xl font-semibold text-white">Log Your Period</h2>
                </div>
                <form onSubmit={handlePeriodSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Start Date</label>
                      <input
                        type="date"
                        required
                        value={periodData.startDate}
                        onChange={(e) => setPeriodData({ ...periodData, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">End Date</label>
                      <input
                        type="date"
                        required
                        value={periodData.endDate}
                        onChange={(e) => setPeriodData({ ...periodData, endDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Flow Intensity</label>
                    <div className="flex gap-4">
                      {['light', 'medium', 'heavy'].map(flow => (
                        <label key={flow} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value={flow}
                            checked={periodData.flow === flow}
                            onChange={(e) => setPeriodData({ ...periodData, flow: e.target.value as any })}
                            className="text-pink-500 focus:ring-pink-500"
                          />
                          <span className="capitalize text-white/80">{flow}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Symptoms</label>
                    <div className="flex flex-wrap gap-2">
                      {periodSymptoms.map(symptom => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => togglePeriodSymptom(symptom)}
                          className={`px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${
                            periodData.symptoms.includes(symptom)
                              ? 'bg-pink-500 text-white'
                              : 'bg-white/20 text-white/80 hover:bg-white/30'
                          }`}
                        >
                          {periodData.symptoms.includes(symptom) && <Check className="w-3 h-3" />}
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                    <textarea
                      value={periodData.notes}
                      onChange={(e) => setPeriodData({ ...periodData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-white/50"
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Saving...' : 'Save Period'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Mood Tracker Form */}
            {activeTab === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Smile className="w-6 h-6 text-yellow-300" />
                  <h2 className="text-xl font-semibold text-white">Track Your Mood</h2>
                </div>
                <form onSubmit={handleMoodSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">How are you feeling?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {moods.map(m => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMoodData({ ...moodData, mood: m.value })}
                          className={`
                            p-4 rounded-xl text-center transition-all
                            ${moodData.mood === m.value 
                              ? `${m.color} text-white scale-105 shadow-lg` 
                              : 'bg-white/20 text-white/80 hover:bg-white/30'}
                          `}
                        >
                          <div className="text-3xl mb-1">{m.emoji}</div>
                          <div className="text-sm font-medium">{m.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Intensity (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setMoodData({ ...moodData, intensity: level })}
                          className={`
                            flex-1 py-2 rounded-lg transition-all
                            ${moodData.intensity === level 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                              : 'bg-white/20 text-white/80 hover:bg-white/30'}
                          `}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                    <textarea
                      value={moodData.notes}
                      onChange={(e) => setMoodData({ ...moodData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-white/50"
                      placeholder="What's contributing to your mood?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Saving...' : 'Save Mood'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Symptom Tracker Form */}
            {activeTab === 'symptom' && (
              <motion.div
                key="symptom"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-6 h-6 text-green-300" />
                  <h2 className="text-xl font-semibold text-white">Track Symptoms</h2>
                </div>
                <form onSubmit={handleSymptomSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {symptomsList.map(symptom => (
                      <div key={symptom.key}>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {symptom.icon} {symptom.label}
                        </label>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3].map(level => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => updateSymptomIntensity(symptom.key, level)}
                              className={`
                                flex-1 py-2 rounded-lg text-xs transition-all
                                ${symptomData[symptom.key] === level 
                                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                                  : 'bg-white/20 text-white/80 hover:bg-white/30'}
                              `}
                            >
                              {level === 0 ? 'None' : level === 1 ? 'Mild' : level === 2 ? 'Mod' : 'Sev'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                    <textarea
                      value={symptomData.notes}
                      onChange={(e) => setSymptomData({ ...symptomData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-white/50"
                      placeholder="Additional notes about your symptoms..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Saving...' : 'Save Symptoms'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Heart className="w-4 h-4 text-pink-300" />
              <p className="text-white/70 text-sm">Every day you track is a step toward better health</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}