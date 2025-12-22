import React, { useState } from 'react';
import { getEducationalContent } from '../services/geminiService';
import { Coin } from '../types';
import { GraduationCap, ChevronDown, ChevronUp, Terminal, BookOpen } from 'lucide-react';

interface AcademyProps {
  coins: Coin[];
}

const Academy: React.FC<AcademyProps> = ({ coins }) => {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<Record<string, string>>({});

  const lessons = [
    { id: 'intro', title: 'BLOCKCHAIN FUNDAMENTALS' },
    { id: 'signals', title: 'DECODING TRADING SIGNALS' },
    { id: 'strategies', title: 'ADVANCED MARKET STRATEGIES' },
    { id: 'buy', title: 'ACQUISITION PROTOCOLS' },
    { id: 'sell', title: 'EXIT STRATEGIES & TIMING' },
    { id: 'wallets', title: 'COLD STORAGE DATA' },
    { id: 'security', title: 'CYBER SECURITY OPS' },
    { id: 'defi', title: 'DECENTRALIZED FINANCE (DeFi)' },
  ];

  const toggleLesson = async (id: string) => {
    if (expandedLesson === id) {
        setExpandedLesson(null);
        return;
    }
    setExpandedLesson(id);
    if (!lessonContent[id]) {
        const content = await getEducationalContent(lessons.find(l => l.id === id)?.title || '');
        setLessonContent(prev => ({ ...prev, [id]: content }));
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white tracking-wide">
                    <GraduationCap className="text-crypto-accent" />
                    <span>NEXUS Academy</span>
                </h2>
                <p className="text-gray-400 text-xs font-mono mt-1 tracking-widest uppercase">Encrypted Knowledge Database</p>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono text-gray-400">
                V 2.1.0 // DATABASE ONLINE
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="glass-panel p-1 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-crypto-secondary via-crypto-accent to-crypto-secondary opacity-50"></div>
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                            <Terminal className="text-crypto-accent" size={20} /> 
                            <span className="tracking-widest uppercase text-sm">Modules</span>
                        </h3>
                        
                        <div className="space-y-3">
                            {lessons.map(lesson => (
                                <div key={lesson.id} className="group rounded-xl overflow-hidden border border-white/5 hover:border-crypto-accent/30 bg-black/20 transition-all">
                                    <button 
                                        onClick={() => toggleLesson(lesson.id)}
                                        className={`w-full flex justify-between items-center p-5 text-left transition-colors ${expandedLesson === lesson.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${expandedLesson === lesson.id ? 'bg-crypto-accent text-black' : 'bg-gray-800 text-gray-500 group-hover:text-gray-300'}`}>
                                                {lesson.id.substring(0,2).toUpperCase()}
                                            </div>
                                            <span className={`font-bold transition-colors font-mono tracking-tight ${expandedLesson === lesson.id ? 'text-crypto-accent' : 'text-gray-300 group-hover:text-white'}`}>
                                                {lesson.title}
                                            </span>
                                        </div>
                                        {expandedLesson === lesson.id ? <ChevronUp size={20} className="text-crypto-accent"/> : <ChevronDown size={20} className="text-gray-600"/>}
                                    </button>
                                    
                                    {expandedLesson === lesson.id && (
                                        <div className="p-6 bg-black/40 border-t border-white/5 relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-crypto-accent to-transparent"></div>
                                            <div className="text-sm text-gray-300 leading-relaxed font-light pl-2">
                                                {lessonContent[lesson.id] ? (
                                                    <div className="animate-fade-in">{lessonContent[lesson.id]}</div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-crypto-accent animate-pulse font-mono text-xs">
                                                        <div className="w-1.5 h-1.5 bg-crypto-accent rounded-full"></div> 
                                                        DECRYPTING SECURE CONTENT...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border-crypto-accent/20">
                     <div className="absolute inset-0 bg-gradient-to-tr from-crypto-accent/10 via-transparent to-crypto-secondary/10 opacity-50"></div>
                     <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative z-10">
                        <BookOpen size={40} className="text-crypto-accent" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2 relative z-10 font-mono uppercase">Neural Uplink</h3>
                     <p className="text-gray-400 relative z-10 text-sm font-light leading-relaxed">
                        Access simplified crypto concepts instantly. Our AI translates complex blockchain data into actionable intelligence.
                     </p>
                     <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-crypto-accent/50">
                        View Progress Log
                     </button>
                </div>
                
                <div className="glass-panel rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recommended Reading</h4>
                    <div className="space-y-3">
                        {['Understanding Consensus', 'Layer 2 Scaling', 'Tokenomics 101'].map((topic, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                <div className="text-gray-600 text-xs font-mono">0{i+1}</div>
                                <div className="text-sm font-medium text-gray-300">{topic}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Academy;
