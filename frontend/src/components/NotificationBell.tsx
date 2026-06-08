'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Heart, Smile, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { notificationService, NotificationData } from '@/services/notificationService';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
    setUnreadCount(allNotifications.filter(n => !n.read).length);
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'period':
        return <Calendar className="w-4 h-4 text-pink-500" />;
      case 'ovulation':
        return <Heart className="w-4 h-4 text-purple-500" />;
      case 'mood':
        return <Smile className="w-4 h-4 text-yellow-500" />;
      case 'health-tip':
        return <Sparkles className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Add sample notification for testing if empty
  useEffect(() => {
    if (notifications.length === 0) {
      const sampleNotif = {
        id: `sample-${Date.now()}`,
        title: '🌸 Welcome to Feminaflow!',
        message: 'You will receive period reminders, ovulation alerts, and health tips here.',
        type: 'health-tip' as const,
        scheduledTime: new Date(),
        read: false
      };
      const existing = JSON.parse(localStorage.getItem('feminaflow_notifications') || '[]');
      if (existing.length === 0) {
        existing.push(sampleNotif);
        localStorage.setItem('feminaflow_notifications', JSON.stringify(existing));
        loadNotifications();
      }
    }
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
              <div>
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-xs text-gray-500">Stay updated with your cycle</p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-400 text-xs">You'll see reminders here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer ${!notification.read ? 'bg-pink-50/30' : ''}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {format(new Date(notification.scheduledTime), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 text-center border-t">
              <p className="text-xs text-gray-400">
                Notifications help you stay on track with your cycle
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}