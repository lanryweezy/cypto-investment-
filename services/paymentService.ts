/**
 * Payment Service
 * Handles Stripe payment processing and balance management
 */

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface PaymentConfirmation {
  success: boolean;
  paymentId: string;
  amount: number;
  newBalance: number;
  timestamp: string;
}

interface Payment {
  id: string;
  userId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
}

interface PaymentHistory {
  payments: Payment[];
  total: number;
  totalAmount: number;
}

interface UserBalance {
  userId: string;
  balance: number;
  currency: string;
}

class PaymentService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  private stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    description?: string
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({ amount, currency, description })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(
    paymentIntentId: string,
    amount: number
  ): Promise<PaymentConfirmation> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({ paymentIntentId, amount })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm payment');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to confirm payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<PaymentHistory> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/history`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch payment history:', error);
      throw error;
    }
  }

  /**
   * Get user balance
   */
  async getBalance(): Promise<UserBalance> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/balance`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch balance');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      throw error;
    }
  }

  /**
   * Update balance
   */
  async updateBalance(
    amount: number,
    type: 'deposit' | 'withdraw' = 'deposit'
  ): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/update-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({ amount, type })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update balance');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to update balance:', error);
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/methods`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.methods || [];
    } catch (error) {
      console.error('❌ Failed to fetch payment methods:', error);
      throw error;
    }
  }

  /**
   * Get Stripe public key
   */
  getStripePublicKey(): string {
    return this.stripePublicKey;
  }

  /**
   * Check if Stripe is configured
   */
  isStripeConfigured(): boolean {
    return !!this.stripePublicKey;
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  /**
   * Validate amount
   */
  validateAmount(amount: number, minAmount: number = 1, maxAmount: number = 100000): boolean {
    return amount >= minAmount && amount <= maxAmount;
  }

  /**
   * Get payment status
   */
  getPaymentStatus(status: string): {
    label: string;
    color: string;
    icon: string;
  } {
    const statuses: {
      [key: string]: { label: string; color: string; icon: string };
    } = {
      completed: { label: 'Completed', color: 'text-green-500', icon: '✓' },
      pending: { label: 'Pending', color: 'text-yellow-500', icon: '⏳' },
      failed: { label: 'Failed', color: 'text-red-500', icon: '✗' },
      cancelled: { label: 'Cancelled', color: 'text-gray-500', icon: '✗' }
    };

    return statuses[status] || statuses.pending;
  }
}

export const paymentService = new PaymentService();
export type { PaymentIntent, PaymentConfirmation, Payment, PaymentHistory, UserBalance };
