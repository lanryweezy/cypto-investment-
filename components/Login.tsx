import React, { useState } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user: UserProfile;

      if (isLoginView) {
        // Login
        user = await authService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        user = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-crypto-dark to-[#0A0F18] p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-crypto-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-crypto-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-crypto-accent/20 blur-md rounded-full"></div>
                <div className="relative z-10 bg-gradient-to-br from-crypto-accent to-crypto-secondary p-3 rounded-xl">
                  <User size={32} className="text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLoginView ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-crypto-muted text-sm">
              {isLoginView 
                ? 'Sign in to access your dashboard' 
                : 'Join NexusAI to start trading'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-crypto-danger/10 border border-crypto-danger/30 text-crypto-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLoginView && (
              <div className="mb-4">
                <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLoginView}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-500" />
                  ) : (
                    <Eye size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {!isLoginView && (
              <div className="mb-6">
                <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLoginView}
                    className="w-full pl-10 pr-12 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-crypto-accent to-crypto-secondary text-white font-bold rounded-lg transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {isLoginView ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : isLoginView ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError(null);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              className="text-crypto-accent text-sm hover:underline"
            >
              {isLoginView
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;