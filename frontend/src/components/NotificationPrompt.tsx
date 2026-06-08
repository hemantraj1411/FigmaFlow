'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '@/services/notificationService';

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if we should show the prompt
    const hasPrompted = localStorage.getItem('notification_prompt_shown');
    const permission = Notification.permission;
    
    setPermissionStatus(permission);
    
    if (!hasPrompted && permission === 'default') {
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleEnable = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermissionStatus('granted');
      localStorage.setItem('notification_prompt_shown', 'true');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification_prompt_shown', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 w-80"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3">
            <div className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">Enable Notifications</span>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-gray-600 text-sm mb-4">
              Get reminders about your period, fertile window, mood tracking, and weekly health tips.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}