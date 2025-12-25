import React, { useState } from 'react';
import { Bell, Shield, Moon, Globe, HelpCircle, Save, Check, AlertCircle, Key } from 'lucide-react';
import ApiSettings from './ApiSettings';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [showToast, setShowToast] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);

  const handleSave = () => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {showToast && (
          <div className="fixed bottom-6 right-6 p-4 bg-crypto-success/10 border border-crypto-success/20 rounded-xl flex items-center gap-3 text-crypto-success shadow-2xl animate-bounce-in z-50">
              <Check size={20} />
              <span className="font-bold text-sm">Configuration Saved Successfully</span>
          </div>
      )}

      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">System Config</h2>
          <p className="text-gray-400 text-xs font-mono mt-1">Customize your terminal interface.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-crypto-accent/10 rounded-lg text-crypto-accent">
               <Bell size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Alert Protocols</h3>
          </div>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-gray-200 font-medium text-sm">Real-time Signals</div>
                   <div className="text-xs text-gray-500">Push notifications for market triggers</div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-all relative border ${notifications ? 'bg-crypto-accent/20 border-crypto-accent' : 'bg-gray-800 border-gray-700'}`}
                >
                   <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${notifications ? 'translate-x-6 bg-crypto-accent shadow-[0_0_8px_#00F0FF]' : 'translate-x-0'}`}></div>
                </button>
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-gray-200 font-medium text-sm">Daily Intelligence Brief</div>
                   <div className="text-xs text-gray-500">AI summarized email report</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-crypto-success font-bold uppercase tracking-wider">
                    <Check size={12} /> Active
                </div>
             </div>
          </div>
        </div>

        {/* Display */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-crypto-secondary/10 rounded-lg text-crypto-secondary">
               <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Interface</h3>
          </div>
          
          <div className="space-y-6">
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Base Currency</label>
                <div className="relative">
                    <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-crypto-secondary outline-none appearance-none"
                    >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                </div>
             </div>
             <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Moon size={16} /> Theme Mode
                </div>
                <span className="text-[10px] text-crypto-accent font-bold uppercase tracking-wider bg-crypto-accent/10 px-2 py-1 rounded">Dark Matter</span>
             </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-crypto-success/10 rounded-lg text-crypto-success">
               <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Security Layer</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-crypto-success/30 transition-colors">
                <div className="font-bold text-white text-sm mb-2">2FA Authentication</div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Hardware key or authenticator app required for high-value transfers.</p>
                <button className="text-xs bg-crypto-success/10 text-crypto-success hover:bg-crypto-success/20 px-4 py-2 rounded-lg transition-colors border border-crypto-success/20 font-bold uppercase tracking-wider">Configure</button>
             </div>
             <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                <div className="font-bold text-white text-sm mb-2">Session Management</div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">2 active devices detected on your network.</p>
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider">Terminate Others</button>
             </div>
             <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-crypto-secondary/30 transition-colors">
                <div className="font-bold text-white text-sm mb-2">API Keys</div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Manage your third-party service credentials.</p>
                <button 
                  onClick={() => setShowApiSettings(true)}
                  className="text-xs bg-crypto-secondary/10 text-crypto-secondary hover:bg-crypto-secondary/20 px-4 py-2 rounded-lg transition-colors border border-crypto-secondary/20 font-bold uppercase tracking-wider"
                >
                  Configure
                </button>
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-6">
         <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-crypto-accent text-black rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold tracking-wide text-sm"
         >
            <Save size={18} /> SAVE CONFIG
         </button>
      </div>
      
      {showApiSettings && (
        <ApiSettings onClose={() => setShowApiSettings(false)} />
      )}
    </div>
  );
};

export default Settings;