interface RateLimitConfig {
  windowMs: number; // Window in milliseconds
  max: number; // Max requests per window
  message: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class SecurityService {
  private static instance: SecurityService;
  private rateLimitStore: RateLimitStore = {};
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivities: Array<{ip: string, action: string, timestamp: number}> = [];
  private config: {
    rateLimits: {
      [endpoint: string]: RateLimitConfig;
    };
    maxSuspiciousActivities: number;
    blockDuration: number; // in milliseconds
  };

  private constructor() {
    // Default configuration
    this.config = {
      rateLimits: {
        '/api/crypto-data': {
          windowMs: 60 * 1000, // 1 minute
          max: 100, // 100 requests per minute
          message: 'Too many requests to crypto data API, please slow down.'
        },
        '/api/gemini': {
          windowMs: 60 * 1000, // 1 minute
          max: 50, // 50 requests per minute
          message: 'Too many requests to AI service, please slow down.'
        },
        '/api/trade': {
          windowMs: 60 * 1000, // 1 minute
          max: 10, // 10 requests per minute (trading is sensitive)
          message: 'Too many trade requests, please slow down.'
        },
        '/api/auth': {
          windowMs: 60 * 1000, // 1 minute
          max: 5, // Only 5 auth attempts per minute to prevent brute force
          message: 'Too many authentication attempts, please try again later.'
        }
      },
      maxSuspiciousActivities: 5, // Block after 5 suspicious activities
      blockDuration: 15 * 60 * 1000 // 15 minutes
    };
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  public async checkRateLimit(ip: string, endpoint: string): Promise<{allowed: boolean, message?: string, resetTime?: number}> {
    const config = this.config.rateLimits[endpoint];
    if (!config) {
      // If no specific config, allow the request
      return { allowed: true };
    }

    // Clean up old entries
    this.cleanupOldEntries();

    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Check if the user is blocked
    if (this.blockedIPs.has(ip)) {
      return { 
        allowed: false, 
        message: 'Your IP has been temporarily blocked due to suspicious activity.' 
      };
    }

    const record = this.rateLimitStore[key];
    
    if (!record || record.resetTime < now) {
      // New record or old record expired
      this.rateLimitStore[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };
      return { allowed: true };
    }

    if (record.count >= config.max) {
      // Rate limit exceeded
      this.logSuspiciousActivity(ip, `Rate limit exceeded for ${endpoint}`);
      return { 
        allowed: false, 
        message: config.message,
        resetTime: record.resetTime 
      };
    }

    // Increment count
    this.rateLimitStore[key].count++;
    return { allowed: true };
  }

  public async validateApiKey(apiKey: string, service: string): Promise<{valid: boolean, message?: string}> {
    if (!apiKey) {
      this.logSuspiciousActivity('unknown', `Attempted to access ${service} without API key`);
      return { valid: false, message: 'API key is required' };
    }

    // Basic validation: check if it looks like a proper API key (this is a simple check)
    if (apiKey.length < 20) {
      this.logSuspiciousActivity('unknown', `Invalid API key format for ${service}`);
      return { valid: false, message: 'Invalid API key format' };
    }

    // In a real application, you would validate against a database of valid keys
    // For now, we'll just return true
    return { valid: true };
  }

  public async validateUserAccess(userId: string, endpoint: string): Promise<{allowed: boolean, message?: string}> {
    // In a real application, this would check user permissions
    // For now, we'll just return true for all users
    return { allowed: true };
  }

  public logSuspiciousActivity(ip: string, action: string): void {
    const activity = {
      ip,
      action,
      timestamp: Date.now()
    };

    this.suspiciousActivities.push(activity);

    // Check if this IP should be blocked
    const recentActivities = this.suspiciousActivities.filter(
      a => a.ip === ip && Date.now() - a.timestamp < this.config.blockDuration
    );

    if (recentActivities.length >= this.config.maxSuspiciousActivities) {
      this.blockIP(ip);
    }

    // Keep only recent activities (within block duration)
    this.suspiciousActivities = this.suspiciousActivities.filter(
      a => Date.now() - a.timestamp < this.config.blockDuration
    );
  }

  private blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    console.warn(`IP ${ip} has been blocked due to suspicious activity`);

    // Automatically unblock after the block duration
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      console.info(`IP ${ip} has been unblocked`);
    }, this.config.blockDuration);
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const key in this.rateLimitStore) {
      if (this.rateLimitStore[key].resetTime < now) {
        delete this.rateLimitStore[key];
      }
    }
  }

  public getSecurityStats(): {
    activeBlocks: number;
    suspiciousActivitiesCount: number;
    rateLimitStoreSize: number;
  } {
    return {
      activeBlocks: this.blockedIPs.size,
      suspiciousActivitiesCount: this.suspiciousActivities.length,
      rateLimitStoreSize: Object.keys(this.rateLimitStore).length
    };
  }

  public async sanitizeInput(input: string): Promise<string> {
    // Basic input sanitization to prevent injection attacks
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  public async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public async validatePassword(password: string): Promise<{valid: boolean, errors: string[]}> {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const securityService = SecurityService.getInstance();