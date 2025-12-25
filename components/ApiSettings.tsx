import React, { useState, useEffect } from 'react';
import { configService, ApiConfig } from '../services/configService';
import { Key, Shield, Save, AlertCircle } from 'lucide-react';

interface ApiSettingsProps {
  onClose: () => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ onClose }) => {
  const [apiKeys, setApiKeys] = useState<ApiConfig>({
    geminiApiKey: '',
    coinGeckoApiKey: '',
    cryptoCompareApiKey: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Load current API keys (masked for security)
    const geminiKey = configService.getApiKey('geminiApiKey');
    const coinGeckoKey = configService.getApiKey('coinGeckoApiKey');
    const cryptoCompareKey = configService.getApiKey('cryptoCompareApiKey');

    setApiKeys({
      geminiApiKey: geminiKey ? maskKey(geminiKey) : '',
      coinGeckoApiKey: coinGeckoKey ? maskKey(coinGeckoKey) : '',
      cryptoCompareApiKey: cryptoCompareKey ? maskKey(cryptoCompareKey) : ''
    });
  }, []);

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const handleChange = (service: keyof ApiConfig, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save the API keys
      configService.saveConfig(apiKeys);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all API keys?')) {
      configService.clearConfig();
      setApiKeys({
        geminiApiKey: '',
        coinGeckoApiKey: '',
        cryptoCompareApiKey: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 relative">
        <div className="absolute top-0 right-0 p-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-crypto-secondary/10 rounded-xl">
              <Key className="text-crypto-secondary" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">API Keys</h2>
              <p className="text-gray-400 text-sm">Manage your third-party service credentials</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-400 text-sm">
              API keys are stored locally in your browser and never sent to our servers. 
              For production use, keys should be managed server-side.
            </p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm flex items-center gap-2">
            <Shield size={16} />
            API keys saved successfully!
          </div>
        )}

        {showError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            Failed to save API keys. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKeys.geminiApiKey}
              onChange={(e) => handleChange('geminiApiKey', e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
              placeholder="Enter your Gemini API key"
            />
            <p className="text-gray-500 text-xs mt-2">
              Used for AI-powered market analysis and trading signals
            </p>
          </div>

          <div>
            <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
              CoinGecko API Key
            </label>
            <input
              type="password"
              value={apiKeys.coinGeckoApiKey}
              onChange={(e) => handleChange('coinGeckoApiKey', e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
              placeholder="Enter your CoinGecko API key"
            />
            <p className="text-gray-500 text-xs mt-2">
              Improves rate limits for cryptocurrency market data
            </p>
          </div>

          <div>
            <label className="block text-crypto-muted text-xs font-bold uppercase tracking-wider mb-2">
              CryptoCompare API Key
            </label>
            <input
              type="password"
              value={apiKeys.cryptoCompareApiKey}
              onChange={(e) => handleChange('cryptoCompareApiKey', e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-accent/50 focus:border-crypto-accent/50"
              placeholder="Enter your CryptoCompare API key"
            />
            <p className="text-gray-500 text-xs mt-2">
              Enhances news feed quality and reduces rate limiting
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-crypto-accent to-crypto-secondary text-white font-bold rounded-lg transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save API Keys
            </button>
            
            <button
              type="button"
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiSettings;