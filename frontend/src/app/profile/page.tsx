'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Heart, Save, LogOut, Settings, Bell, Shield, Moon, Sun, Droplet, Activity, Sparkles, Crown, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePeriodTracker } from '@/hooks/usePeriodTracker';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const { user, token, logout, updateProfile } = useAuth();
  const { prediction, periods } = usePeriodTracker();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    cycleLength: user?.cycleLength || 28,
    periodLength: user?.periodLength || 5,
    lastPeriodDate: user?.lastPeriodDate ? new Date(user.lastPeriodDate).toISOString().split('T')[0] : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(formData);
    toast.success('Profile updated successfully!');
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  // Calculate stats
  const totalCycles = periods?.length || 0;
  const averageCycleLength = totalCycles > 0 
    ? Math.round(periods.reduce((acc, p) => {
        const days = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
        return acc + days;
      }, 0) / totalCycles)
    : user?.cycleLength || 28;
  
  const nextPeriodDays = prediction?.daysUntilNextPeriod || 0;

  const stats = [
    { icon: <Droplet className="w-5 h-5" />, label: "Total Cycles", value: totalCycles, color: "from-pink-500 to-rose-500" },
    { icon: <Calendar className="w-5 h-5" />, label: "Avg Cycle", value: `${averageCycleLength} days`, color: "from-purple-500 to-pink-500" },
    { icon: <Heart className="w-5 h-5" />, label: "Next Period", value: nextPeriodDays === 0 ? "Today" : `${nextPeriodDays} days`, color: "from-rose-500 to-orange-500" },
    { icon: <Activity className="w-5 h-5" />, label: "Health Score", value: totalCycles > 0 ? "Good" : "New", color: "from-green-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/img7.jpg"
          alt="Profile Background"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-purple-900/50 to-rose-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <User className="w-8 h-8 text-pink-300" />
                My Profile
              </h1>
              <p className="text-white/70 mt-2">Manage your account and cycle settings</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    {stat.icon}
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-1"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                  <div className="w-28 h-28 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-5xl text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
                  <p className="text-white/60 text-sm">{user?.email}</p>
                  
                  {/* Membership Badge */}
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full">
                    <Crown className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs text-yellow-300">Premium Member</span>
                  </div>
                  
                  <div className="border-t border-white/20 mt-6 pt-6 space-y-3 text-left">
                    <div className="flex items-center gap-3 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Cycle: {user?.cycleLength} days</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Period: {user?.periodLength} days</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Droplet className="w-4 h-4" />
                      <span className="text-sm">Cycles tracked: {totalCycles}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-4 border border-white/20">
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/20 rounded-lg transition">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/20 rounded-lg transition">
                      <Shield className="w-4 h-4" />
                      <span>Privacy & Security</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/20 rounded-lg transition">
                      <Settings className="w-4 h-4" />
                      <span>App Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/20 rounded-lg transition">
                      <Moon className="w-4 h-4" />
                      <span>Dark Mode</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:bg-red-500/20 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Health Tip */}
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-4 mt-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <h4 className="text-sm font-semibold text-white">Daily Affirmation</h4>
                  </div>
                  <p className="text-white/70 text-xs">
                    Your body is unique and powerful. Every cycle is a opportunity to understand yourself better.
                  </p>
                </div>
              </motion.div>

              {/* Profile Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-2"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold mb-6 text-white">Personal Information</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-white/50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="email"
                          value={user?.email}
                          disabled
                          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Cycle Length (days)</label>
                        <input
                          type="number"
                          min="21"
                          max="35"
                          value={formData.cycleLength}
                          onChange={(e) => setFormData({ ...formData, cycleLength: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                          required
                        />
                        <p className="text-xs text-white/40 mt-1">Typical: 28 days</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Period Length (days)</label>
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={formData.periodLength}
                          onChange={(e) => setFormData({ ...formData, periodLength: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                          required
                        />
                        <p className="text-xs text-white/40 mt-1">Typical: 3-7 days</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Last Period Date</label>
                      <input
                        type="date"
                        value={formData.lastPeriodDate}
                        onChange={(e) => setFormData({ ...formData, lastPeriodDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                      />
                      <p className="text-xs text-white/40 mt-1">This helps improve predictions</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Account Statistics */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-300" />
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <p className="text-2xl font-bold text-white">{totalCycles}</p>
                      <p className="text-xs text-white/60">Total Cycles Tracked</p>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <p className="text-2xl font-bold text-white">{user?.cycleLength || 28}</p>
                      <p className="text-xs text-white/60">Average Cycle Length</p>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <p className="text-2xl font-bold text-white">{user?.periodLength || 5}</p>
                      <p className="text-xs text-white/60">Average Period Length</p>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <p className="text-2xl font-bold text-white">{new Date().getFullYear()}</p>
                      <p className="text-xs text-white/60">Member Since</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}