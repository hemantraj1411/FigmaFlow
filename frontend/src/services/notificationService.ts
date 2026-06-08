// Notification Service for Feminaflow
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'period' | 'ovulation' | 'mood' | 'health-tip';
  scheduledTime: Date;
  read: boolean;
}

class NotificationService {
  private permissionGranted: boolean = false;
  private notifications: NotificationData[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permissionGranted = permission === 'granted';
    return this.permissionGranted;
  }

  // Show a notification (without vibrate property)
  showNotification(title: string, body: string, icon?: string) {
    if (!this.permissionGranted) return;

    const notification = new Notification(title, {
      body: body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  }

  // Schedule period reminder (3 days before period)
  schedulePeriodReminder(nextPeriodDate: Date, userName: string) {
    const reminderDate = new Date(nextPeriodDate);
    reminderDate.setDate(reminderDate.getDate() - 3);
    
    const daysUntilReminder = Math.ceil((reminderDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const daysUntilPeriod = Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilReminder <= 0 && daysUntilPeriod > 0) {
      // Period is very soon, remind immediately
      this.showNotification(
        '🌸 Period Approaching!',
        `Your period is expected in ${daysUntilPeriod} days. Get prepared!`
      );
    } else if (daysUntilReminder > 0 && daysUntilReminder <= 7) {
      // Schedule for the reminder date
      setTimeout(() => {
        this.showNotification(
          '🌸 Period Reminder',
          `Hi ${userName}! Your period is expected in 3 days. Time to get ready!`
        );
      }, reminderDate.getTime() - new Date().getTime());
    }
    
    // Store notification
    this.addNotification({
      id: `period-${Date.now()}`,
      title: '🌸 Period Reminder',
      message: `Your period is expected on ${nextPeriodDate.toLocaleDateString()}`,
      type: 'period',
      scheduledTime: reminderDate,
      read: false
    });
  }

  // Schedule ovulation alert (fertile window)
  scheduleOvulationAlert(ovulationDate: Date, fertileStart: Date, fertileEnd: Date, userName: string) {
    const today = new Date();
    const daysUntilOvulation = Math.ceil((ovulationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilOvulation <= 5 && daysUntilOvulation > 0) {
      setTimeout(() => {
        this.showNotification(
          '💕 Fertile Window Alert',
          `Hi ${userName}! Your fertile window starts in ${daysUntilOvulation} days (${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}).`
        );
      }, 1000);
    }
    
    if (daysUntilOvulation === 0) {
      this.showNotification(
        '💕 Ovulation Day!',
        `Today is your ovulation day! This is your peak fertility time.`
      );
    }
    
    this.addNotification({
      id: `ovulation-${Date.now()}`,
      title: '💕 Fertile Window',
      message: `Your fertile window is ${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}`,
      type: 'ovulation',
      scheduledTime: ovulationDate,
      read: false
    });
  }

  // Schedule mood tracking reminder (daily at 8 PM)
  scheduleMoodReminder(userName: string) {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0); // 8:00 PM
    
    let timeUntilReminder = reminderTime.getTime() - now.getTime();
    if (timeUntilReminder < 0) {
      // If already past 8 PM, schedule for tomorrow
      reminderTime.setDate(reminderTime.getDate() + 1);
      timeUntilReminder = reminderTime.getTime() - now.getTime();
    }
    
    // Store timeout ID for cleanup if needed
    const timeoutId = setTimeout(() => {
      this.showNotification(
        '😊 Daily Mood Check-in',
        `Hey ${userName}! How are you feeling today? Take a moment to log your mood.`
      );
      
      // Reschedule for next day
      this.scheduleMoodReminder(userName);
    }, timeUntilReminder);
    
    this.addNotification({
      id: `mood-${Date.now()}`,
      title: '😊 Mood Check-in',
      message: `Don't forget to log your mood today!`,
      type: 'mood',
      scheduledTime: reminderTime,
      read: false
    });
  }

  // Schedule weekly health tip (every Monday at 9 AM)
  scheduleWeeklyHealthTip(userName: string) {
    const healthTips = [
      {
        title: '💧 Stay Hydrated',
        message: 'Drinking enough water can help reduce bloating and cramps. Aim for 8 glasses daily!'
      },
      {
        title: '😴 Sleep Matters',
        message: 'Getting 7-8 hours of sleep helps regulate your menstrual cycle and reduces stress.'
      },
      {
        title: '🥗 Eat Iron-Rich Foods',
        message: 'During your period, eat spinach, lentils, and lean meat to maintain energy levels.'
      },
      {
        title: '🧘 Exercise Benefits',
        message: 'Light exercise like yoga or walking can help reduce period pain and improve mood.'
      },
      {
        title: '🌿 Herbal Tea',
        message: 'Chamomile or ginger tea can help soothe cramps and reduce inflammation.'
      },
      {
        title: '📊 Track Your Cycle',
        message: 'Regular tracking helps you understand your body patterns and predict symptoms.'
      },
      {
        title: '💪 Self-Care Sunday',
        message: 'Take time for yourself today. Relax, meditate, and listen to your body.'
      }
    ];
    
    const getRandomTip = () => {
      const randomIndex = Math.floor(Math.random() * healthTips.length);
      return healthTips[randomIndex];
    };
    
    const now = new Date();
    const nextMonday = new Date();
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);
    
    const timeUntilMonday = nextMonday.getTime() - now.getTime();
    
    if (timeUntilMonday > 0) {
      setTimeout(() => {
        const tip = getRandomTip();
        this.showNotification(
          tip.title,
          `${tip.message}\n\n- Feminaflow Health Team`
        );
        
        // Reschedule for next Monday
        this.scheduleWeeklyHealthTip(userName);
      }, timeUntilMonday);
    }
    
    this.addNotification({
      id: `health-tip-${Date.now()}`,
      title: '💡 Weekly Health Tip',
      message: `New health tip available! Check your notifications.`,
      type: 'health-tip',
      scheduledTime: nextMonday,
      read: false
    });
  }

  // Add notification to storage
  private addNotification(notification: NotificationData) {
    this.notifications.unshift(notification);
    // Store in localStorage
    const stored = localStorage.getItem('feminaflow_notifications');
    const existing = stored ? JSON.parse(stored) : [];
    existing.unshift(notification);
    // Keep only last 50 notifications
    localStorage.setItem('feminaflow_notifications', JSON.stringify(existing.slice(0, 50)));
  }

  // Get all notifications
  getNotifications(): NotificationData[] {
    const stored = localStorage.getItem('feminaflow_notifications');
    return stored ? JSON.parse(stored) : [];
  }

  // Get unread count
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notifications = this.getNotifications();
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    localStorage.setItem('feminaflow_notifications', JSON.stringify(updated));
  }

  // Mark all as read
  markAllAsRead() {
    const notifications = this.getNotifications();
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    localStorage.setItem('feminaflow_notifications', JSON.stringify(updated));
  }

  // Clear all notifications
  clearAllNotifications() {
    localStorage.setItem('feminaflow_notifications', JSON.stringify([]));
    this.notifications = [];
  }

  // Initialize all reminders
  initializeReminders(prediction: any, userName: string) {
    if (!prediction) return;
    
    // Clear any existing reminders (optional)
    // This prevents duplicate reminders on page refresh
    
    // Schedule period reminder
    if (prediction.nextPeriod) {
      this.schedulePeriodReminder(new Date(prediction.nextPeriod), userName);
    }
    
    // Schedule ovulation alert
    if (prediction.ovulationDate && prediction.fertileWindow) {
      this.scheduleOvulationAlert(
        new Date(prediction.ovulationDate),
        new Date(prediction.fertileWindow.start),
        new Date(prediction.fertileWindow.end),
        userName
      );
    }
    
    // Schedule daily mood reminder
    this.scheduleMoodReminder(userName);
    
    // Schedule weekly health tip
    this.scheduleWeeklyHealthTip(userName);
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();