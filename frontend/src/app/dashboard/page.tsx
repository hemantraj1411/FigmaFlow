'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePeriodTracker } from '@/hooks/usePeriodTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Activity, Droplet, Brain, TrendingUp, Award, Sparkles, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { prediction, periods, loading, deletePeriod, fetchPeriods } = usePeriodTracker();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch(error => {
        console.log("Background video autoplay failed:", error);
      });
    }
  }, []);

  // Calculate cycle day
  const calculateCycleDay = () => {
    if (!prediction?.nextPeriod) return 1;
    const today = new Date();
    const nextPeriod = new Date(prediction.nextPeriod);
    const daysUntilNext = differenceInDays(nextPeriod, today);
    const cycleLength = user?.cycleLength || 28;
    return Math.max(1, Math.min(cycleLength, cycleLength - daysUntilNext));
  };

  const currentCycleDay = calculateCycleDay();
  const cycleProgress = ((currentCycleDay - 1) / (user?.cycleLength || 28)) * 100;
  const daysUntilNextPeriod = prediction?.daysUntilNextPeriod || 0;

  // Handle delete period
  const handleDeleteClick = (period: any) => {
    setSelectedPeriod(period);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPeriod) return;
    setIsDeleting(true);
    const result = await deletePeriod(selectedPeriod._id);
    if (result.success) {
      toast.success('Period deleted successfully');
      setDeleteModalOpen(false);
      setSelectedPeriod(null);
    }
    setIsDeleting(false);
  };

  const stats = [
    { 
      icon: <Droplet className="w-6 h-6" />, 
      title: "Next Period", 
      value: daysUntilNextPeriod === 0 ? "Today!" : daysUntilNextPeriod === 1 ? "Tomorrow" : `${daysUntilNextPeriod} days`,
      subtext: prediction?.nextPeriod ? format(new Date(prediction.nextPeriod), 'MMM dd, yyyy') : 'Add your first period',
      gradient: "from-pink-500 to-rose-500",
      iconColor: "text-pink-300"
    },
    { 
      icon: <Calendar className="w-6 h-6" />, 
      title: "Cycle Day", 
      value: `Day ${currentCycleDay}`,
      subtext: `of ${user?.cycleLength || 28} day cycle`,
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-300"
    },
    { 
      icon: <Heart className="w-6 h-6" />, 
      title: "Ovulation", 
      value: prediction?.ovulationDate ? format(new Date(prediction.ovulationDate), 'MMM dd') : 'Add period',
      subtext: prediction?.ovulationDate ? "Fertile window soon" : "Track to predict",
      gradient: "from-rose-500 to-orange-500",
      iconColor: "text-rose-300"
    },
    { 
      icon: <Brain className="w-6 h-6" />, 
      title: "Cycles Tracked", 
      value: `${periods?.length || 0}`,
      subtext: periods?.length === 1 ? "Total period" : "Total periods",
      gradient: "from-green-500 to-teal-500",
      iconColor: "text-green-300"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <video
            ref={bgVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/images/img5.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/50 via-purple-900/40 to-rose-900/50"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-white/80">Loading your health data...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/50 via-purple-900/40 to-rose-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
              <span className="text-sm text-white font-medium">Your Health Dashboard</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-white/70 mt-2">
              {periods?.length === 0 
                ? "Start by logging your first period to get personalized predictions" 
                : `Your next period is in ${daysUntilNextPeriod} days`}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3">
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                <h3 className="text-sm text-white/80">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1">{stat.subtext}</p>
              </motion.div>
            ))}
          </div>

          {/* Cycle Progress Bar */}
          {periods?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg mb-8 border border-white/20"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-white/80">Cycle Progress</span>
                <span className="text-sm font-medium text-pink-300">{currentCycleDay} / {user?.cycleLength || 28} days</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cycleProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-white/50">
                <span>🌸 Period</span>
                <span>💕 Ovulation</span>
                <span>✨ Next Period</span>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 bg-pink-500/20 rounded-lg hover:bg-pink-500/30 transition-all group border border-pink-500/30">
                  <span className="text-xl">📝</span>
                  <span className="text-white/90 group-hover:text-white">Log Period</span>
                </Link>
                <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-all group border border-purple-500/30">
                  <span className="text-xl">😊</span>
                  <span className="text-white/90 group-hover:text-white">Track Mood</span>
                </Link>
                <Link href="/chat" className="flex items-center gap-3 px-4 py-3 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all group border border-blue-500/30">
                  <span className="text-xl">💬</span>
                  <span className="text-white/90 group-hover:text-white">AI Assistant</span>
                </Link>
                <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-all group border border-green-500/30">
                  <span className="text-xl">📊</span>
                  <span className="text-white/90 group-hover:text-white">View Analytics</span>
                </Link>
              </div>
            </motion.div>

            {/* Health Tip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-md rounded-xl p-6 shadow-lg text-white border border-white/20"
            >
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Daily Health Tip
              </h2>
              <p className="text-white/90 leading-relaxed">
                {periods?.length === 0 
                  ? "Start tracking your periods to get personalized health insights and predictions!"
                  : daysUntilNextPeriod <= 3 
                    ? "Your period is approaching! Stay hydrated and get plenty of rest. Consider light exercise like walking or yoga."
                    : "Staying hydrated and getting enough sleep can help reduce period symptoms. Aim for 8 glasses of water daily!"}
              </p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-white/80 flex items-center gap-2">
                  <Heart className="w-3 h-3 text-pink-300" />
                  Self-care reminder
                </p>
              </div>
            </motion.div>
          </div>

          {/* Recent Periods with Delete Option */}
          {periods?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-pink-300" />
                  Recent Periods
                </h2>
                <span className="text-xs text-white/50">{periods.length} total cycles</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {periods.slice(0, 5).map((period) => (
                    <motion.div
                      key={period._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="group relative"
                    >
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <Droplet className="w-5 h-5 text-pink-300" />
                          <div>
                            <p className="font-medium text-white">
                              {format(new Date(period.startDate), 'MMM dd')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-white/60 capitalize">Flow: {period.flow}</p>
                          </div>
                        </div>
                        {period.symptoms.length > 0 && (
                          <div className="flex gap-1 flex-wrap max-w-[40%]">
                            {period.symptoms.slice(0, 3).map((symptom, idx) => (
                              <span key={idx} className="text-xs bg-pink-500/20 text-pink-200 px-2 py-1 rounded-full">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteClick(period)}
                          className="ml-3 p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete period"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Award className="w-4 h-4 text-yellow-300" />
              <p className="text-white/70 text-sm">Every day you track is a step toward better health</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && selectedPeriod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-500/30"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Delete Period Record?</h3>
                <p className="text-gray-400 mt-2 text-sm">
                  Are you sure you want to delete the period from{' '}
                  <span className="text-pink-300 font-medium">
                    {format(new Date(selectedPeriod.startDate), 'MMM dd')} - {format(new Date(selectedPeriod.endDate), 'MMM dd, yyyy')}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}