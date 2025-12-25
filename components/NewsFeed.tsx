import React, { useState } from 'react';
import { Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');

  const filteredNews = filter === 'all' ? news : news.filter(item => item.sentiment === filter);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp size={14} className="text-crypto-success" />;
      case 'bearish': return <TrendingDown size={14} className="text-crypto-danger" />;
      default: return <Minus size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white tracking-wide">
            Global Data Stream
          </h2>
          <p className="text-crypto-accent text-xs font-mono mt-1 tracking-widest uppercase">Aggregating live sources...</p>
        </div>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
          {(['all', 'bullish', 'bearish', 'neutral'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${
                filter === f 
                  ? 'bg-crypto-accent text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((item) => (
            <div key={item.id} className="glass-panel rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group border-white/5 hover:border-crypto-accent/30 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.sentiment === 'bullish' ? 'from-crypto-success/20' : item.sentiment === 'bearish' ? 'from-crypto-danger/20' : 'from-gray-500/10'} to-transparent opacity-50 blur-2xl -mr-10 -mt-10 group-hover:opacity-80 transition-opacity`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border
                  ${item.sentiment === 'bullish' ? 'bg-crypto-success/10 text-crypto-success border-crypto-success/20' : 
                    item.sentiment === 'bearish' ? 'bg-crypto-danger/10 text-crypto-danger border-crypto-danger/20' : 
                    'bg-white/5 text-gray-400 border-white/10'}`}>
                   {getSentimentIcon(item.sentiment)}
                   {item.sentiment}
                </span>
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                  <Clock size={12} /> {item.time}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-crypto-accent transition-colors line-clamp-2 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed font-light">
                {item.summary}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  {item.source}
                </span>
                <button className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-600">
            <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-mono text-xs tracking-widest uppercase">NO DATA FOUND FOR FILTER</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;