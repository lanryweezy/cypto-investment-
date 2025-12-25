interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  page?: string;
  userAgent?: string;
  ip?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  userId?: string;
  sessionId?: string;
  apiUrl?: string; // For sending events to a remote analytics service
  debug: boolean;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.config = {
      enabled: true,
      debug: false
    };
    
    // Generate a session ID for this session
    this.sessionId = this.generateId();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public initialize(config?: Partial<AnalyticsConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.userId) {
      this.setUserId(this.config.userId);
    }
    
    if (this.config.sessionId) {
      this.sessionId = this.config.sessionId;
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    this.config.userId = userId;
  }

  public trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      id: this.generateId(),
      userId: this.userId,
      sessionId: this.sessionId,
      event,
      properties,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.events.push(analyticsEvent);

    if (this.config.debug) {
      console.log('Analytics Event:', analyticsEvent);
    }

    // In a real application, you would send this event to an analytics service
    this.sendEventToRemote(analyticsEvent);
  }

  private async sendEventToRemote(event: AnalyticsEvent): Promise<void> {
    // In a real application, you would send the event to a remote analytics service
    // For example: Google Analytics, Mixpanel, etc.
    try {
      if (this.config.apiUrl) {
        // Example implementation:
        // await fetch(this.config.apiUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event)
        // });
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  public trackPageView(page: string, properties?: Record<string, any>): void {
    this.trackEvent('page_view', {
      ...properties,
      page
    });
  }

  public trackUserAction(action: string, properties?: Record<string, any>): void {
    this.trackEvent('user_action', {
      action,
      ...properties
    });
  }

  public trackTrade(tradeData: any): void {
    this.trackEvent('trade_executed', {
      ...tradeData,
      timestamp: Date.now()
    });
  }

  public trackLogin(properties?: Record<string, any>): void {
    this.trackEvent('login', properties);
  }

  public trackLogout(properties?: Record<string, any>): void {
    this.trackEvent('logout', properties);
  }

  public trackSubscriptionChange(plan: string, properties?: Record<string, any>): void {
    this.trackEvent('subscription_change', {
      plan,
      ...properties
    });
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  public getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  public getEventCount(): number {
    return this.events.length;
  }

  public getEventCountByUser(userId: string): number {
    return this.events.filter(event => event.userId === userId).length;
  }

  public getEventCountByType(eventType: string): number {
    return this.events.filter(event => event.event === eventType).length;
  }

  public clearEvents(): void {
    this.events = [];
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserId(): string | undefined {
    return this.userId;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  public getAnalyticsSummary(): {
    totalEvents: number;
    uniqueUsers: number;
    sessions: number;
    pageViews: number;
    userActions: number;
    errors: number;
    trades: number;
  } {
    const allEvents = this.getEvents();
    const uniqueUsers = new Set(allEvents.map(e => e.userId)).size;
    const sessions = new Set(allEvents.map(e => e.sessionId)).size;
    
    return {
      totalEvents: allEvents.length,
      uniqueUsers,
      sessions,
      pageViews: this.getEventCountByType('page_view'),
      userActions: this.getEventCountByType('user_action'),
      errors: this.getEventCountByType('error'),
      trades: this.getEventCountByType('trade_executed')
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();