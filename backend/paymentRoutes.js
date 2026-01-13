/**
 * Payment Routes
 * Handles Stripe payment processing and balance management
 */

import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// In-memory payment storage (use database in production)
const payments = new Map();
const userBalances = new Map();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In production, verify JWT properly
    req.user = { email: 'user@example.com' }; // Placeholder
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Create payment intent
 * POST /api/payments/create-intent
 */
router.post('/create-intent', verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || `Deposit for ${req.user.email}`,
      metadata: {
        userId: req.user.email,
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency
    });
  } catch (error) {
    console.error('❌ Failed to create payment intent:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * Confirm payment
 * POST /api/payments/confirm
 */
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Store payment record
    const paymentId = `pay_${Date.now()}`;
    const payment = {
      id: paymentId,
      userId: req.user.email,
      paymentIntentId,
      amount,
      currency: paymentIntent.currency,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    payments.set(paymentId, payment);

    // Update user balance
    const currentBalance = userBalances.get(req.user.email) || 0;
    userBalances.set(req.user.email, currentBalance + amount);

    res.json({
      success: true,
      paymentId,
      amount,
      newBalance: currentBalance + amount,
      timestamp: payment.timestamp
    });
  } catch (error) {
    console.error('❌ Failed to confirm payment:', error.message);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

/**
 * Get payment history
 * GET /api/payments/history
 */
router.get('/history', verifyToken, (req, res) => {
  try {
    const userPayments = Array.from(payments.values())
      .filter(p => p.userId === req.user.email)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      payments: userPayments,
      total: userPayments.length,
      totalAmount: userPayments.reduce((sum, p) => sum + p.amount, 0)
    });
  } catch (error) {
    console.error('❌ Failed to fetch payment history:', error.message);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

/**
 * Get user balance
 * GET /api/payments/balance
 */
router.get('/balance', verifyToken, (req, res) => {
  try {
    const balance = userBalances.get(req.user.email) || 0;

    res.json({
      userId: req.user.email,
      balance,
      currency: 'usd'
    });
  } catch (error) {
    console.error('❌ Failed to fetch balance:', error.message);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * Update balance
 * POST /api/payments/update-balance
 */
router.post('/update-balance', verifyToken, async (req, res) => {
  try {
    const { amount, type = 'deposit' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const currentBalance = userBalances.get(req.user.email) || 0;
    let newBalance;

    if (type === 'deposit') {
      newBalance = currentBalance + amount;
    } else if (type === 'withdraw') {
      if (currentBalance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      newBalance = currentBalance - amount;
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    userBalances.set(req.user.email, newBalance);

    res.json({
      userId: req.user.email,
      previousBalance: currentBalance,
      amount,
      type,
      newBalance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to update balance:', error.message);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

/**
 * Get payment methods
 * GET /api/payments/methods
 */
router.get('/methods', verifyToken, async (req, res) => {
  try {
    // In production, retrieve from Stripe
    const methods = [
      {
        id: 'card_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025
      }
    ];

    res.json({ methods });
  } catch (error) {
    console.error('❌ Failed to fetch payment methods:', error.message);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

/**
 * Webhook for Stripe events
 * POST /api/payments/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_dummy'
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(400).json({ error: 'Webhook error' });
  }
});

/**
 * Health check
 * GET /api/payments/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

export default router;
