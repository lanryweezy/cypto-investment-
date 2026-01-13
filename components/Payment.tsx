import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, History, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { paymentService } from '../services/paymentService';

interface PaymentProps {
  onPaymentSuccess?: (amount: number) => void;
}

const Payment: React.FC<PaymentProps> = ({ onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // Load balance and history on mount
  useEffect(() => {
    loadBalance();
    loadPaymentHistory();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await paymentService.getBalance();
      setBalance(data.balance);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const data = await paymentService.getPaymentHistory();
      setPaymentHistory(data.payments);
    } catch (err) {
      console.error('Failed to load payment history:', err);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const depositAmount = parseFloat(amount);

    // Validate amount
    if (!paymentService.validateAmount(depositAmount)) {
      setError('Amount must be between $1 and $100,000');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const intent = await paymentService.createPaymentIntent(
        depositAmount,
        'usd',
        `Deposit $${depositAmount}`
      );

      // In production, use Stripe.js to handle payment
      // For now, simulate successful payment
      const confirmation = await paymentService.confirmPayment(
        intent.paymentIntentId,
        depositAmount
      );

      setSuccess(`✓ Deposit of $${depositAmount} successful!`);
      setAmount('');
      setBalance(confirmation.newBalance);

      if (onPaymentSuccess) {
        onPaymentSuccess(depositAmount);
      }

      // Reload history
      loadPaymentHistory();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crypto-dark to-[#0A0F18] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment & Balance</h1>
          <p className="text-crypto-muted">Manage your account balance and deposits</p>
        </div>

        {/* Balance Card */}
        <div className="glass-panel rounded-2xl p-6 mb-8 border border-crypto-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-muted text-sm mb-2">Current Balance</p>
              <h2 className="text-4xl font-bold text-crypto-accent">
                {paymentService.formatCurrency(balance)}
              </h2>
            </div>
            <div className="w-16 h-16 bg-crypto-accent/10 rounded-full flex items-center justify-center">
              <DollarSign size={32} className="text-crypto-accent" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'deposit'
                ? 'bg-crypto-accent text-black'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <CreditCard size={20} className="inline mr-2" />
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-crypto-accent text-black'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <History size={20} className="inline mr-2" />
            History
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="glass-panel rounded-2xl p-6 border border-crypto-accent/20">
            <form onSubmit={handleDeposit}>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-crypto-muted text-sm font-semibold mb-3">
                  Deposit Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-2xl text-crypto-accent">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    max="100000"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-crypto-muted text-sm font-semibold mb-3">Quick amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-semibold transition-all"
                    >
                      ${quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-crypto-danger/10 border border-crypto-danger/30 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-crypto-danger flex-shrink-0 mt-0.5" />
                  <p className="text-crypto-danger text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-crypto-success/10 border border-crypto-success/30 rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-crypto-success flex-shrink-0 mt-0.5" />
                  <p className="text-crypto-success text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full py-3 bg-gradient-to-r from-crypto-accent to-crypto-secondary text-white font-bold rounded-lg transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="inline mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} className="inline mr-2" />
                    Deposit {amount ? `$${parseFloat(amount).toFixed(2)}` : ''}
                  </>
                )}
              </button>

              {/* Info */}
              <p className="text-crypto-muted text-xs text-center mt-4">
                💳 Secure payment powered by Stripe
              </p>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="glass-panel rounded-2xl p-6 border border-crypto-accent/20">
            {paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((payment) => {
                  const status = paymentService.getPaymentStatus(payment.status);
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-crypto-accent/30 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {paymentService.formatCurrency(payment.amount)}
                        </p>
                        <p className="text-crypto-muted text-sm">
                          {new Date(payment.timestamp).toLocaleDateString()} at{' '}
                          {new Date(payment.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${status.color}`}>
                          {status.icon} {status.label}
                        </p>
                        <p className="text-crypto-muted text-xs">{payment.id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <History size={48} className="text-crypto-muted/30 mx-auto mb-4" />
                <p className="text-crypto-muted">No payment history yet</p>
              </div>
            )}
          </div>
        )}

        {/* Security Info */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-crypto-muted text-sm">
            🔒 All payments are processed securely through Stripe. Your financial information is never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
