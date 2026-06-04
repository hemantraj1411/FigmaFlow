'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Activity, BarChart3, Download, Heart, Brain, Droplet, Moon, Sun, Coffee, Bed, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePeriodTracker } from '@/hooks/usePeriodTracker';
import axios from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define types
interface CycleDataPoint {
  name: string;
  length: number;
}

interface MoodDataPoint {
  name: string;
  value: number;
}

interface SymptomDataPoint {
  name: string;
  value: number;
}

interface Period {
  _id: string;
  startDate: string;
  endDate: string;
  flow: string;
}

interface Mood {
  _id: string;
  mood: string;
  intensity: number;
  date: string;
}

interface Symptom {
  _id: string;
  symptoms: {
    cramps: number;
    headache: number;
    bloating: number;
    backPain: number;
    acne: number;
    breastTenderness: number;
    fatigue: number;
    nausea: number;
  };
  date: string;
}

export default function AnalyticsPage() {
  const { token, user } = useAuth();
  const { prediction } = usePeriodTracker();
  const [cycleData, setCycleData] = useState<CycleDataPoint[]>([]);
  const [moodData, setMoodData] = useState<MoodDataPoint[]>([]);
  const [symptomData, setSymptomData] = useState<SymptomDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalCycles: 0,
    averageCycleLength: 0,
    averagePeriodLength: 0,
    mostCommonMood: '',
    mostCommonSymptom: '',
    healthScore: 0,
    streakDays: 0,
    lastActive: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const [cycles, moods, symptoms] = await Promise.all([
        axios.get<{ periods: Period[] }>(`${API_URL}/periods`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get<{ moods: Mood[] }>(`${API_URL}/moods`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get<{ symptoms: Symptom[] }>(`${API_URL}/symptoms`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      
      // Process cycle data for chart
      const processedCycles: CycleDataPoint[] = cycles.data.periods
        .map((p: Period, idx: number) => ({
          name: `Cycle ${idx + 1}`,
          length: Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 3600 * 24)) + 1
        }))
        .reverse();
      
      // Calculate cycle stats
      const avgCycleLength = processedCycles.length > 0 
        ? processedCycles.reduce((acc, curr) => acc + curr.length, 0) / processedCycles.length 
        : 28;
      
      const avgPeriodLength = cycles.data.periods.length > 0
        ? cycles.data.periods.reduce((acc, curr) => {
            const length = Math.ceil((new Date(curr.endDate).getTime() - new Date(curr.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
            return acc + length;
          }, 0) / cycles.data.periods.length
        : 5;
      
      // Process mood data
      const moodCounts: Record<string, number> = {};
      moods.data.moods.forEach((m: Mood) => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      });
      
      const processedMoods: MoodDataPoint[] = Object.entries(moodCounts).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value
      }));
      
      // Get most common mood
      let topMood = 'Happy';
      let maxCount = 0;
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topMood = mood.charAt(0).toUpperCase() + mood.slice(1);
        }
      });
      
      // Process symptom data
      const symptomAverages: Record<string, number> = {};
      symptoms.data.symptoms.forEach((s: Symptom) => {
        Object.entries(s.symptoms).forEach(([key, value]) => {
          symptomAverages[key] = (symptomAverages[key] || 0) + value;
        });
      });
      
      const symptomCount = symptoms.data.symptoms.length || 1;
      const processedSymptoms: SymptomDataPoint[] = Object.entries(symptomAverages).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
        value: Number((value / symptomCount).toFixed(1))
      }));
      
      // Get most common symptom
      let topSymptom = 'Cramps';
      let maxSymptomValue = 0;
      Object.entries(symptomAverages).forEach(([symptom, value]) => {
        if (value > maxSymptomValue) {
          maxSymptomValue = value;
          topSymptom = symptom.charAt(0).toUpperCase() + symptom.slice(1).replace(/([A-Z])/g, ' $1');
        }
      });
      
      // Calculate health score
      const cycleRegularity = Math.max(0, 100 - Math.abs(avgCycleLength - 28) * 5);
      const trackingConsistency = Math.min(100, (cycles.data.periods.length + moods.data.moods.length + symptoms.data.symptoms.length) * 2);
      const healthScore = Math.floor((cycleRegularity + trackingConsistency) / 2);
      
      setUserStats({
        totalCycles: cycles.data.periods.length,
        averageCycleLength: Math.round(avgCycleLength),
        averagePeriodLength: Math.round(avgPeriodLength),
        mostCommonMood: topMood,
        mostCommonSymptom: topSymptom,
        healthScore: Math.min(100, healthScore),
        streakDays: Math.min(30, cycles.data.periods.length * 2),
        lastActive: new Date().toLocaleDateString()
      });
      
      setCycleData(processedCycles);
      setMoodData(processedMoods);
      setSymptomData(processedSymptoms);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      user: {
        name: user?.name,
        email: user?.email,
        cycleLength: user?.cycleLength,
        periodLength: user?.periodLength
      },
      stats: userStats,
      cycles: cycleData,
      moods: moodData,
      symptoms: symptomData,
      prediction: prediction,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feminaflow-report-${user?.name}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Health report exported successfully!');
  };

  const COLORS = ['#ff6b9d', '#c44569', '#ffa502', '#70a1ff', '#7bed9f', '#eccc68', '#ff7f50', '#2ed573'];

  // Calculate total for percentage
  const totalMoodValue = moodData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip content components
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-700">{label}</p>
          <p className="text-pink-600">
            <span className="font-medium">Cycle Length:</span> {payload[0].value} days
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalMoodValue) * 100).toFixed(0);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-700">{payload[0].name}</p>
          <p className="text-pink-600">
            <span className="font-medium">Frequency:</span> {payload[0].value} times ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-700">{label}</p>
          <p className="text-pink-600">
            <span className="font-medium">Intensity:</span> {payload[0].value.toFixed(1)}/3
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieLabel = (entry: any) => {
    const percentage = ((entry.value / totalMoodValue) * 100).toFixed(0);
    return `${entry.name} ${percentage}%`;
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with proper fit */}
      <div className="fixed inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/img4.jpg"
            alt="Analytics Background"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            quality={100}
          />
          {/* Gradient Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/70 via-purple-900/60 to-rose-900/70"></div>
        </div>
      </div>

      {/* Content with proper scrolling */}
      <div className="relative z-10 min-h-screen overflow-y-auto">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-pink-300" />
                Health Analytics
              </h1>
              <p className="text-white/60 text-sm md:text-base mt-1">Track your patterns and personalized insights</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition text-white border border-white/20 text-sm md:text-base"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </motion.div>

          {/* User Health Summary Cards - Responsive Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-lg md:text-2xl font-bold text-white">{userStats.healthScore}%</div>
              <p className="text-[10px] md:text-xs text-white/60">Health Score</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Droplet className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-lg md:text-2xl font-bold text-white">{userStats.totalCycles}</div>
              <p className="text-[10px] md:text-xs text-white/60">Total Cycles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-lg md:text-2xl font-bold text-white">{userStats.averageCycleLength}</div>
              <p className="text-[10px] md:text-xs text-white/60">Avg Cycle</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-lg md:text-2xl font-bold text-white">{userStats.averagePeriodLength}</div>
              <p className="text-[10px] md:text-xs text-white/60">Avg Period</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-sm md:text-lg font-bold text-white truncate">{userStats.mostCommonMood}</div>
              <p className="text-[10px] md:text-xs text-white/60">Top Mood</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-xs md:text-sm font-bold text-white truncate">{userStats.mostCommonSymptom}</div>
              <p className="text-[10px] md:text-xs text-white/60">Top Symptom</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-pink-300 mb-1 md:mb-2" />
              <div className="text-lg md:text-2xl font-bold text-white">{userStats.streakDays}</div>
              <p className="text-[10px] md:text-xs text-white/60">Day Streak</p>
            </div>
          </motion.div>

          {/* Welcome Message with User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-white/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl md:text-2xl text-white">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-white">Hello, {user?.name}!</h2>
                <p className="text-white/60 text-sm md:text-base">Here's your personalized health analytics summary</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/60 text-xs md:text-sm">
                <div className="flex items-center gap-1">
                  <Bed className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Sleep: 7.5h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Energy: Good</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sun className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Wellness: {userStats.healthScore}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {/* Cycle Length Chart */}
              {cycleData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20"
                >
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-pink-300" />
                    Cycle Length Trend
                  </h2>
                  <div className="w-full h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cycleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} />
                        <YAxis domain={['auto', 'auto']} stroke="#ffffff80" fontSize={12} />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend wrapperStyle={{ color: '#ffffff', fontSize: '12px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="length" 
                          stroke="#ff6b9d" 
                          strokeWidth={2} 
                          dot={{ fill: '#ff6b9d', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Cycle Length"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Mood Distribution */}
                {moodData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20"
                  >
                    <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 text-white">
                      <Activity className="w-5 h-5 text-pink-300" />
                      Mood Distribution
                    </h2>
                    <div className="w-full h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderPieLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {moodData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}

                {/* Symptom Intensity */}
                {symptomData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20"
                  >
                    <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 text-white">
                      <Calendar className="w-5 h-5 text-pink-300" />
                      Average Symptom Intensity
                    </h2>
                    <div className="w-full h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={symptomData} layout="vertical" margin={{ left: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis type="number" domain={[0, 3]} stroke="#ffffff80" fontSize={12} />
                          <YAxis type="category" dataKey="name" width={80} stroke="#ffffff80" fontSize={12} />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="value" fill="#ff6b9d" radius={[0, 4, 4, 0]} name="Intensity">
                            {symptomData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Personalized Insights Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-3 gap-4 md:gap-6"
              >
                <div className="bg-gradient-to-r from-pink-500/80 to-rose-500/80 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 text-white border border-white/20">
                  <h3 className="text-base md:text-lg font-semibold mb-2">💡 Health Insight</h3>
                  <p className="text-sm md:text-base">Your cycle is regular with an average of {userStats.averageCycleLength} days</p>
                  <p className="text-xs md:text-sm mt-3 text-white/70">✨ {userStats.averageCycleLength <= 32 ? "Excellent regularity!" : "Track more for better predictions"}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 text-white border border-white/20">
                  <h3 className="text-base md:text-lg font-semibold mb-2">📊 Mood Analysis</h3>
                  <p className="text-sm md:text-base">{userStats.mostCommonMood} is your most frequent mood</p>
                  <p className="text-xs md:text-sm mt-3 text-white/70">💪 {userStats.mostCommonMood === "Happy" ? "Great job maintaining positive energy!" : "Consider stress management activities"}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 text-white border border-white/20">
                  <h3 className="text-base md:text-lg font-semibold mb-2">⚠️ Recommendation</h3>
                  <p className="text-sm md:text-base">{userStats.mostCommonSymptom} is your most common symptom</p>
                  <p className="text-xs md:text-sm mt-3 text-white/70">💆 Try {userStats.mostCommonSymptom.includes("Cramp") ? "heat therapy and gentle exercise" : "adequate rest and hydration"}</p>
                </div>
              </motion.div>

              {/* No Data Message */}
              {cycleData.length === 0 && moodData.length === 0 && symptomData.length === 0 && (
                <div className="text-center py-8 md:py-12 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20">
                  <Activity className="w-12 h-12 md:w-16 md:h-16 text-white/30 mx-auto mb-3 md:mb-4" />
                  <p className="text-white/60 text-sm md:text-base">No data available yet. Start tracking to see analytics!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}