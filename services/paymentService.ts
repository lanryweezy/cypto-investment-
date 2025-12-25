import { UserProfile } from '../types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in USD
  interval: 'month' | 'year';
  features: string[];
  maxApiCalls?: number;
  maxUsers?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  planId: string;
  createdAt: string;
}

class PaymentService {
  private static instance: PaymentService;
  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      interval: 'month',
      features: [
        'Basic market data',
        '5 API calls per day',
        'Standard indicators',
        'Limited news feed'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Trader',
      price: 29.99,
      interval: 'month',
      features: [
        'Real-time market data',
        'Unlimited API calls',
        'Advanced indicators',
        'AI-powered signals',
        'Premium news feed',
        'Portfolio tracking'
      ]
    },
    {
      id: 'premium',
      name: 'Institutional',
      price: 99.99,
      interval: 'month',
      features: [
        'All Pro features',
        'Custom API endpoints',
        'Priority support',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom integrations'
      ]
    }
  ];

  private subscriptions: Subscription[] = [];
  private paymentIntents: PaymentIntent[] = [];

  private constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private initializeMockData(): void {
    // Create some mock subscriptions
    this.subscriptions = [
      {
        id: 'sub_1',
        userId: 'demo_user',
        planId: 'pro',
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        autoRenew: true
      }
    ];
  }

  public getPlans(): SubscriptionPlan[] {
    return [...this.plans];
  }

  public getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  public async getUserSubscription(userId: string): Promise<Subscription | null> {
    const subscription = this.subscriptions.find(sub => sub.userId === userId);
    return subscription || null;
  }

  public async createSubscription(userId: string, planId: string, autoRenew: boolean = true): Promise<Subscription> {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error(`Plan with id ${planId} not found`);
    }

    // Check if user already has an active subscription
    const existingSub = this.subscriptions.find(sub => sub.userId === userId && sub.status === 'active');
    if (existingSub) {
      // Cancel the existing subscription
      existingSub.status = 'cancelled';
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (plan.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId,
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew
    };

    this.subscriptions.push(newSubscription);
    return newSubscription;
  }

  public async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription with id ${subscriptionId} not found`);
    }

    subscription.status = 'cancelled';
  }

  public async updateSubscription(subscriptionId: string, autoRenew: boolean): Promise<Subscription> {
    const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription with id ${subscriptionId} not found`);
    }

    subscription.autoRenew = autoRenew;
    return subscription;
  }

  public async createPaymentIntent(userId: string, planId: string): Promise<PaymentIntent> {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error(`Plan with id ${planId} not found`);
    }

    const amount = Math.round(plan.price * 100); // Convert to cents

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount,
      currency: 'usd',
      status: 'pending',
      planId,
      createdAt: new Date().toISOString()
    };

    this.paymentIntents.push(paymentIntent);
    return paymentIntent;
  }

  public async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const paymentIntent = this.paymentIntents.find(pi => pi.id === paymentIntentId);
    if (!paymentIntent) {
      throw new Error(`Payment intent with id ${paymentIntentId} not found`);
    }

    paymentIntent.status = 'succeeded';
    return paymentIntent;
  }

  public async processPayment(userId: string, planId: string): Promise<{ subscription: Subscription, paymentIntent: PaymentIntent }> {
    const paymentIntent = await this.createPaymentIntent(userId, planId);
    const confirmedPayment = await this.confirmPayment(paymentIntent.id);
    
    // Create subscription after successful payment
    const subscription = await this.createSubscription(userId, planId);
    
    return { subscription, paymentIntent: confirmedPayment };
  }

  public async isUserSubscribed(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;
    
    // Check if subscription is still valid
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    return subscription.status === 'active' && endDate > now;
  }

  public async getActivePlanForUser(userId: string): Promise<SubscriptionPlan | null> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return null;
    
    const plan = this.getPlanById(subscription.planId);
    return plan || null;
  }

  public async getRemainingTrialDays(userId: string): Promise<number | null> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.trialEndDate) return null;
    
    const trialEnd = new Date(subscription.trialEndDate);
    const now = new Date();
    
    if (trialEnd < now) return 0; // Trial has ended
    
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
  }
}

export const paymentService = PaymentService.getInstance();