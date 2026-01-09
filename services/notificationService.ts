/**
 * Notification Service
 * Manages in-app notifications and alerts
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  duration?: number; // Auto-dismiss after ms (0 = manual dismiss)
  action?: {
    label: string;
    callback: () => void;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private maxNotifications = 10;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  /**
   * Add notification
   */
  private addNotification(notification: Notification): void {
    this.notifications.push(notification);

    // Keep only the last maxNotifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(-this.maxNotifications);
    }

    this.notifyListeners();

    // Auto-dismiss if duration specified
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Remove notification
   */
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Show success notification
   */
  success(title: string, message: string, duration: number = 3000): string {
    const id = this.generateId();
    this.addNotification({
      id,
      type: 'success',
      title,
      message,
      timestamp: new Date().toISOString(),
      duration,
    });
    console.log(`✅ ${title}: ${message}`);
    return id;
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, duration: number = 5000): string {
    const id = this.generateId();
    this.addNotification({
      id,
      type: 'error',
      title,
      message,
      timestamp: new Date().toISOString(),
      duration,
    });
    console.error(`❌ ${title}: ${message}`);
    return id;
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, duration: number = 4000): string {
    const id = this.generateId();
    this.addNotification({
      id,
      type: 'warning',
      title,
      message,
      timestamp: new Date().toISOString(),
      duration,
    });
    console.warn(`⚠️ ${title}: ${message}`);
    return id;
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, duration: number = 3000): string {
    const id = this.generateId();
    this.addNotification({
      id,
      type: 'info',
      title,
      message,
      timestamp: new Date().toISOString(),
      duration,
    });
    console.info(`ℹ️ ${title}: ${message}`);
    return id;
  }

  /**
   * Show notification with action
   */
  withAction(
    type: NotificationType,
    title: string,
    message: string,
    actionLabel: string,
    actionCallback: () => void,
    duration: number = 0
  ): string {
    const id = this.generateId();
    this.addNotification({
      id,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      duration,
      action: {
        label: actionLabel,
        callback: actionCallback,
      },
    });
    return id;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const notificationService = NotificationService.getInstance();
