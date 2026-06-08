'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Heart, Droplet, Sparkles, Info, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, isBefore, isAfter, getDay } from 'date-fns';
import { usePeriodTracker } from '@/hooks/usePeriodTracker';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [today, setToday] = useState(new Date());
  const { periods, prediction, loading } = usePeriodTracker();
  const { user } = useAuth();

  // Update today's date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get days for calendar starting from Monday
  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysArray = eachDayOfInterval({ start, end });
    
    // Add days from previous month to start from Monday
    const startDayOfWeek = getDay(start);
    // Adjust: Monday = 0, Sunday = 6
    const daysToAdd = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const prevMonthDays = [];
    for (let i = daysToAdd; i > 0; i--) {
      const prevDate = new Date(start);
      prevDate.setDate(start.getDate() - i);
      prevMonthDays.push(prevDate);
    }
    
    // Add days from next month to fill grid
    const remainingDays = 42 - (prevMonthDays.length + daysArray.length);
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(end);
      nextDate.setDate(end.getDate() + i);
      nextMonthDays.push(nextDate);
    }
    
    return [...prevMonthDays, ...daysArray, ...nextMonthDays];
  };

  const days = getMonthDays();

  // Get period status for a date
  const getPeriodStatus = (date: Date) => {
    return periods?.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return date >= start && date <= end;
    });
  };

  // Get prediction status for a date
  const getPredictionStatus = (date: Date) => {
    if (!prediction) return null;
    
    const nextPeriod = new Date(prediction.nextPeriod);
    const ovulation = new Date(prediction.ovulationDate);
    const fertileStart = new Date(prediction.fertileWindow.start);
    const fertileEnd = new Date(prediction.fertileWindow.end);
    
    if (isSameDay(date, ovulation)) {
      return 'ovulation';
    }
    if (isWithinInterval(date, { start: fertileStart, end: fertileEnd })) {
      return 'fertile';
    }
    if (isSameDay(date, nextPeriod)) {
      return 'nextPeriod';
    }
    return null;
  };

  // Get tooltip text for a date
  const getDateTooltip = (date: Date) => {
    const period = getPeriodStatus(date);
    const predictionStatus = getPredictionStatus(date);
    
    if (period) {
      return `Period day (${period.flow} flow)`;
    }
    if (predictionStatus === 'ovulation') {
      return 'Ovulation day - Peak fertility';
    }
    if (predictionStatus === 'fertile') {
      return 'Fertile window - High chance of conception';
    }
    if (predictionStatus === 'nextPeriod') {
      return 'Expected next period date';
    }
    if (isSameDay(date, today)) {
      return 'Today';
    }
    return 'Regular day';
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Check if period is overdue
  const isPeriodOverdue = () => {
    if (!prediction?.nextPeriod) return false;
    const nextPeriod = new Date(prediction.nextPeriod);
    return isBefore(nextPeriod, today) && periods?.length > 0;
  };

  // Check if period is approaching
  const isPeriodApproaching = () => {
    if (!prediction?.daysUntilNextPeriod) return false;
    return prediction.daysUntilNextPeriod <= 3 && prediction.daysUntilNextPeriod > 0;
  };

  const legendItems = [
    { color: 'bg-pink-500', label: 'Period Day', icon: <Droplet className="w-3 h-3" /> },
    { color: 'bg-purple-500', label: 'Ovulation', icon: <Heart className="w-3 h-3" /> },
    { color: 'bg-orange-400', label: 'Fertile Window', icon: <Sparkles className="w-3 h-3" /> },
    { color: 'bg-rose-400', label: 'Expected Period', icon: <CalendarIcon className="w-3 h-3" /> },
    { color: 'bg-green-500', label: 'Today', icon: <div className="w-3 h-3 rounded-full bg-green-500"></div> },
  ];

  // Week days starting from Monday
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/img8.jpg"
          alt="Calendar Background"
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
          {/* Header with Today's Date */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-8 h-8 text-pink-300" />
                  Cycle Calendar
                </h1>
                <p className="text-white/70 mt-2">Track your periods and predict your cycle</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
                <p className="text-white/60 text-xs">Today is</p>
                <p className="text-white font-semibold">{format(today, 'EEEE, MMMM dd, yyyy')}</p>
              </div>
            </div>
          </motion.div>

          {/* Alert for Period Status */}
          {periods?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {isPeriodOverdue() && (
                <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-300 font-medium">Period Overdue</p>
                    <p className="text-yellow-200/80 text-sm">
                      Your period was predicted to start on {prediction && format(new Date(prediction.nextPeriod), 'MMMM dd, yyyy')}. 
                      Please log your period on the Tracker page to update predictions.
                    </p>
                  </div>
                </div>
              )}
              {isPeriodApproaching() && !isPeriodOverdue() && (
                <div className="bg-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-pink-500/30 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-300 flex-shrink-0" />
                  <div>
                    <p className="text-pink-300 font-medium">Period Approaching!</p>
                    <p className="text-pink-200/80 text-sm">
                      Your period is expected in {prediction?.daysUntilNextPeriod} days.
                      Get ready and track your symptoms!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
          >
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/20 rounded-full transition text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-full transition text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 p-4 bg-white/5 border-b border-white/10">
              {legendItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                  <span className="text-xs text-white/80">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Week Days - Starting from Monday */}
            <div className="grid grid-cols-7 gap-1 p-4 bg-white/5">
              {weekDays.map(day => (
                <div key={day} className="text-center font-semibold text-white/80 py-2 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 p-4">
              {days.map((day, idx) => {
                const period = getPeriodStatus(day);
                const predictionStatus = getPredictionStatus(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, today);
                const tooltipText = getDateTooltip(day);
                
                let bgColor = 'bg-white/10';
                let textColor = 'text-white';
                let hoverBg = 'hover:bg-white/20';
                let ringClass = '';
                
                if (period) {
                  bgColor = 'bg-gradient-to-br from-pink-500 to-rose-500';
                  textColor = 'text-white';
                  hoverBg = '';
                } else if (predictionStatus === 'ovulation') {
                  bgColor = 'bg-gradient-to-br from-purple-500 to-pink-500';
                  textColor = 'text-white';
                  hoverBg = '';
                } else if (predictionStatus === 'fertile') {
                  bgColor = 'bg-gradient-to-br from-orange-500 to-rose-500';
                  textColor = 'text-white';
                  hoverBg = '';
                } else if (predictionStatus === 'nextPeriod') {
                  bgColor = 'bg-gradient-to-br from-rose-400 to-red-400';
                  textColor = 'text-white';
                  hoverBg = '';
                } else if (isToday) {
                  ringClass = 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent';
                } else if (!isCurrentMonth) {
                  textColor = 'text-white/30';
                }

                return (
                  <div key={idx} className="relative group">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative w-full aspect-square rounded-xl transition-all
                        ${bgColor} ${textColor} ${hoverBg}
                        hover:shadow-lg
                        ${ringClass}
                        ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-transparent' : ''}
                        flex items-center justify-center
                      `}
                    >
                      <span className={`text-lg font-medium ${isToday ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {period && (
                        <Droplet className="absolute bottom-1 right-1 w-3 h-3 text-white/70" />
                      )}
                      {predictionStatus === 'ovulation' && (
                        <Heart className="absolute bottom-1 right-1 w-3 h-3 text-white/70" />
                      )}
                      {predictionStatus === 'fertile' && (
                        <Sparkles className="absolute bottom-1 right-1 w-3 h-3 text-white/70" />
                      )}
                      {isToday && !period && !predictionStatus && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </motion.button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      {tooltipText}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Selected Date Info */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">
                {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                {isSameDay(selectedDate, today) && (
                  <span className="ml-2 text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Today</span>
                )}
              </h3>
              
              <div className="space-y-3">
                {getPeriodStatus(selectedDate) ? (
                  <div className="flex items-center gap-3 text-pink-300">
                    <Droplet className="w-5 h-5" />
                    <span>🌸 Menstrual period day ({getPeriodStatus(selectedDate)?.flow} flow)</span>
                  </div>
                ) : getPredictionStatus(selectedDate) === 'ovulation' ? (
                  <div className="flex items-center gap-3 text-purple-300">
                    <Heart className="w-5 h-5" />
                    <span>💕 Ovulation day - Peak fertility</span>
                  </div>
                ) : getPredictionStatus(selectedDate) === 'fertile' ? (
                  <div className="flex items-center gap-3 text-orange-300">
                    <Sparkles className="w-5 h-5" />
                    <span>✨ Fertile window - High chance of conception</span>
                  </div>
                ) : getPredictionStatus(selectedDate) === 'nextPeriod' ? (
                  <div className="flex items-center gap-3 text-rose-300">
                    <CalendarIcon className="w-5 h-5" />
                    <span>📅 Expected period start date</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-white/60">
                    <Info className="w-5 h-5" />
                    <span>Regular day in your cycle</span>
                  </div>
                )}
              </div>

              {/* Prediction Info */}
              {prediction && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/70 text-sm">
                    📅 Next period predicted: {format(new Date(prediction.nextPeriod), 'MMMM dd, yyyy')}
                    {isBefore(new Date(prediction.nextPeriod), today) && (
                      <span className="ml-2 text-yellow-300"> (Overdue - Please log your period)</span>
                    )}
                    {isAfter(new Date(prediction.nextPeriod), today) && (
                      <span className="ml-2 text-green-300"> (in {prediction.daysUntilNextPeriod} days)</span>
                    )}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    💕 Ovulation: {format(new Date(prediction.ovulationDate), 'MMMM dd, yyyy')}
                  </p>
                  {isBefore(new Date(prediction.nextPeriod), today) && periods?.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Your period was predicted to start on {format(new Date(prediction.nextPeriod), 'MMMM dd, yyyy')}.
                        Please go to the Tracker page and log your period to update predictions.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* No Data Message */}
          {periods?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <CalendarIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No periods tracked yet</h3>
                <p className="text-white/60">
                  Start tracking your periods to see predictions and insights on your calendar!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}