interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
}

class ErrorService {
  private static instance: ErrorService;
  private logs: ErrorLog[] = [];
  private maxLogs = 1000; // Keep only the last 1000 logs
  private enabled = true;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public enableLogging(enabled: boolean): void {
    this.enabled = enabled;
  }

  public logError(message: string, error?: any, context?: Record<string, any>): void {
    if (!this.enabled) return;

    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error?.stack,
      userId: this.getCurrentUserId()
    };

    this.addLog(log);
    this.outputToConsole(log);

    // In a real application, you would send this to an error tracking service
    this.sendToRemoteService(log);
  }

  public logWarning(message: string, context?: Record<string, any>): void {
    if (!this.enabled) return;

    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      userId: this.getCurrentUserId()
    };

    this.addLog(log);
    this.outputToConsole(log);
  }

  public logInfo(message: string, context?: Record<string, any>): void {
    if (!this.enabled) return;

    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      userId: this.getCurrentUserId()
    };

    this.addLog(log);
    this.outputToConsole(log);
  }

  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private outputToConsole(log: ErrorLog): void {
    const output = `[${log.level.toUpperCase()}] ${log.message}`;
    
    switch (log.level) {
      case 'error':
        console.error(output, log.context, log.stack ? { stack: log.stack } : {});
        break;
      case 'warn':
        console.warn(output, log.context);
        break;
      case 'info':
        console.info(output, log.context);
        break;
    }
  }

  private getCurrentUserId(): string | undefined {
    // In a real app, this would get the current user ID from auth service
    try {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      // Ignore errors
    }
    return undefined;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async sendToRemoteService(log: ErrorLog): Promise<void> {
    // In a real application, you would send the error to a remote service like Sentry, LogRocket, etc.
    // For now, we'll just simulate the call
    try {
      // Example: await fetch('https://your-error-tracking-service.com/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(log)
      // });
    } catch (e) {
      // Don't log the error to avoid infinite loop
    }
  }

  public getLogs(): ErrorLog[] {
    return [...this.logs]; // Return a copy
  }

  public getLogsByLevel(level: 'error' | 'warn' | 'info'): ErrorLog[] {
    return this.logs.filter(log => log.level === level);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getErrorCount(): number {
    return this.logs.filter(log => log.level === 'error').length;
  }

  public getWarningCount(): number {
    return this.logs.filter(log => log.level === 'warn').length;
  }

  public getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.logs
      .filter(log => log.level === 'error')
      .slice(-limit)
      .reverse(); // Most recent first
  }
}

export const errorService = ErrorService.getInstance();
export type { ErrorLog };