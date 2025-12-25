import React, { useState, useEffect } from 'react';
import { paymentService, SubscriptionPlan, Subscription } from '../services/paymentService';
import { CreditCard, Check, Crown, Zap, TrendingUp, Star, RotateCcw } from 'lucide-react';

interface SubscriptionManagerProps {
  userId: string;
  currentPlan?: SubscriptionPlan;
  onPlanChange: (plan: SubscriptionPlan) => void;
  onClose: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  userId, 
  currentPlan, 
  onPlanChange, 
  onClose 
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPlansAndSubscription();
  }, [userId]);

  const loadPlansAndSubscription = async () => {
    try {
      setLoading(true);
      const availablePlans = paymentService.getPlans();
      setPlans(availablePlans);
      
      const subscription = await paymentService.getUserSubscription(userId);
      setUserSubscription(subscription);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!userId) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      // In a real app, this would redirect to a payment processor
      // For now, we'll simulate the payment process
      const result = await paymentService.processPayment(userId, planId);
      
      setUserSubscription(result.subscription);
      const plan = paymentService.getPlanById(planId);
      if (plan) {
        onPlanChange(plan);
      }
      
      setSuccess(`Successfully subscribed to ${planId} plan!`);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to process subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription) return;
    
    try {
      setProcessing(true);
      await paymentService.cancelSubscription(userSubscription.id);
      setUserSubscription({ ...userSubscription, status: 'cancelled' });
      setSuccess('Subscription cancelled successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md rounded-2xl p-8 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-crypto-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 p-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-crypto-accent to-crypto-secondary rounded-xl">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>
              <p className="text-gray-400 text-sm">Choose the plan that fits your trading needs</p>
            </div>
          </div>
          
          {currentPlan && (
            <div className="mt-4 p-4 bg-crypto-accent/10 border border-crypto-accent/20 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-crypto-accent font-bold">Current Plan:</span>{' '}
                  <span className="text-white font-bold">{currentPlan.name}</span>
                </div>
                {userSubscription?.status === 'active' && (
                  <button 
                    onClick={handleCancelSubscription}
                    disabled={processing}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-3">
            <RotateCcw size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg flex items-center gap-3">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            const isPopular = plan.id === 'pro';
            
            return (
              <div 
                key={plan.id} 
                className={`glass-panel rounded-2xl p-6 border-2 relative overflow-hidden ${
                  isPopular 
                    ? 'border-crypto-accent/50 bg-gradient-to-b from-crypto-accent/5 to-transparent' 
                    : 'border-white/10'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-crypto-accent text-black px-4 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    {plan.id === 'free' && <Star className="text-crypto-accent" size={32} />}
                    {plan.id === 'pro' && <Zap className="text-crypto-accent" size={32} />}
                    {plan.id === 'premium' && <Crown className="text-crypto-accent" size={32} />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold text-white">
                    ${plan.price}
                    {plan.price > 0 && <span className="text-sm font-normal text-gray-400">/mo</span>}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={16} className="text-crypto-success mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrent ? (
                  <button 
                    className="w-full py-3 bg-crypto-success/20 text-crypto-success rounded-lg font-bold cursor-default"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processing}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-crypto-accent to-crypto-secondary text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processing ? 'Processing...' : plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>All subscriptions include a 7-day free trial. Cancel anytime.</p>
          <p className="mt-1">Secure payment processing powered by industry-standard encryption.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;