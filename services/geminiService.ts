import { GoogleGenAI, Type } from "@google/genai";
import { Coin, Signal } from "../types";
import { configService } from "./configService";
import { errorService } from "./errorService";

// Safely access API key
const apiKey = configService.getApiKey('geminiApiKey') || '';

// Conditionally create the client. If no key is present, we will rely on fallbacks.
// This prevents the "API key not found" error from crashing the app at startup.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to reliably parse errors and decide if we should fallback
const handleGeminiError = (error: any): string | null => {
  errorService.logWarning("Gemini API Request Failed. Switching to simulation mode.", { error });

  let msg = '';
  if (typeof error === 'string') {
      msg = error;
  } else if (error?.error?.message) {
      msg = error.error.message;
  } else if (error?.message) {
      msg = error.message;
  } else {
      msg = JSON.stringify(error);
  }

  // Network, RPC, and 500 errors should trigger a fallback (return null)
  if (
      msg.includes('Rpc failed') || 
      msg.includes('xhr error') || 
      msg.includes('500') || 
      msg.includes('Failed to fetch') || 
      msg.includes('NetworkError') || 
      msg.includes('Load failed')
  ) {
    return null; // Return null to signal that we should use a fallback
  }

  // Quota errors we might want to show to the user
  if (msg.includes('429') || msg.includes('Quota') || (error?.status === 429)) {
    return "⚠️ AI Quota Exceeded. Please try again later.";
  }
  
  return null; 
};

export const analyzeMarket = async (coins: Coin[]): Promise<string> => {
  if (!ai) return getSimulatedMarketAnalysis(coins);

  try {
    const marketSnapshot = coins.map(c => `${c.name} ($${c.price}, ${c.change24h}%)`).join(', ');
    const prompt = `
      Act as a senior crypto market analyst. 
      Here is a snapshot of the top cryptocurrencies right now: ${marketSnapshot}.
      
      Provide a concise 3-paragraph analysis:
      1. Overall market sentiment (Bullish/Bearish/Neutral) and why.
      2. Key movers and what it implies for the broader market.
      3. A short-term outlook for the next 24-48 hours.
      
      Keep it professional and data-driven.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error: any) {
    const errorMsg = handleGeminiError(error);
    if (errorMsg) return errorMsg;
    errorService.logWarning("Market analysis failed, using simulated data", { error: error.message, stack: error.stack });
    return getSimulatedMarketAnalysis(coins);
  }
};

export const generateFutureProjection = async (coin: Coin): Promise<string> => {
  if (!ai) return getSimulatedProjection(coin);

  try {
    const prompt = `
      Perform a speculative future growth projection for ${coin.name} (${coin.symbol}).
      Current Price: $${coin.price}
      Market Cap: $${coin.marketCap}
      
      Provide:
      1. A realistic price target for end of 2025 based on current adoption trends.
      2. A "Blue Sky" (Bull Case) scenario.
      3. A "Bear Case" (Risk) scenario.
      
      Format with clear headings. Disclaimer: This is simulated analysis, not financial advice.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Projection unavailable.";
  } catch (error: any) {
    const errorMsg = handleGeminiError(error);
    if (errorMsg) return errorMsg;
    errorService.logWarning("Future projection failed, using simulated data", { coinId: coin.id, error: error.message, stack: error.stack });
    return getSimulatedProjection(coin);
  }
};

export const generateTradingSignal = async (coin: Coin): Promise<Signal> => {
  if (!ai) return getSimulatedSignal(coin);

  try {
    const prompt = `
      Generate a simulated trading signal for ${coin.name} (${coin.symbol}) based on standard technical analysis patterns (RSI, MACD, Moving Averages).
      Current Price: ${coin.price}.
      
      Return the response in JSON format conforming to this schema:
      {
        "type": "BUY" or "SELL",
        "entry": number,
        "target": number,
        "stopLoss": number,
        "reasoning": "short string explaining the setup",
        "confidence": number (integer between 0 and 100 representing confidence percentage)
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["BUY", "SELL"] },
            entry: { type: Type.NUMBER },
            target: { type: Type.NUMBER },
            stopLoss: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      pair: `${coin.symbol}/USD`,
      timestamp: new Date().toISOString(),
      ...data
    };
  } catch (error: any) {
    const errorMsg = handleGeminiError(error);
    return getSimulatedSignal(coin, errorMsg);
  }
};

export const getEducationalContent = async (topic: string): Promise<string> => {
   if (!ai) return "Simulated Content: Blockchain technology enables decentralized trust...";

   try {
    const prompt = `
      Explain the crypto concept "${topic}" to a beginner trader. 
      Use simple analogies, bullet points, and keep it under 150 words.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Content unavailable.";
  } catch (error: any) {
    const errorMsg = handleGeminiError(error);
    errorService.logWarning("Educational content failed, using simulated data", { topic, error: error.message, stack: error.stack });
    return errorMsg || `### ${topic}\n\nThis is simulated educational content. **${topic}** is a fundamental concept in cryptocurrency that refers to... (Simulated due to network status)`;
  }
}

// --- SIMULATION FALLBACKS ---

const getSimulatedMarketAnalysis = (coins: Coin[]) => {
    const bullish = coins.filter(c => c.change24h > 0).length > coins.length / 2;
    return `**Market Sentiment: ${bullish ? 'Cautiously Bullish' : 'Bearish Consolidation'}**

The market is currently showing ${bullish ? 'signs of recovery' : 'downward pressure'} with mixed signals across major assets. High volatility suggests traders are reacting to macroeconomic factors.

**Key Movers:**
${coins[0]?.name || 'Bitcoin'} continues to lead the trend, influencing altcoin performance. Volume analysis indicates steady accumulation in the top tier assets.

**Outlook:**
Expect continued volatility in the short term. Support levels are being tested, and a breakout could occur within the next 24 hours. (Simulated Analysis due to connection instability)`;
};

const getSimulatedProjection = (coin: Coin) => {
    return `### Future Outlook for ${coin.name} (Simulated)

**End of 2025 Target:** $${(coin.price * 1.5).toLocaleString(undefined, {maximumFractionDigits: 2})}
Based on current adoption curves and market cycles, a conservative 50% upside is plausible.

**Blue Sky Scenario:** $${(coin.price * 3.5).toLocaleString(undefined, {maximumFractionDigits: 2})}
If global adoption accelerates and regulatory clarity improves, we could see a parabolic run.

**Bear Case:** $${(coin.price * 0.6).toLocaleString(undefined, {maximumFractionDigits: 2})}
Macroeconomic headwinds or regulatory crackdowns could suppress price action significantly.`;
};

const getSimulatedSignal = (coin: Coin, errorMsg?: string | null): Signal => {
    return {
      id: 'sim-' + Math.random().toString(36).substr(2,9),
      pair: `${coin.symbol}/USD`,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      entry: coin.price,
      target: coin.price * 1.05,
      stopLoss: coin.price * 0.95,
      reasoning: errorMsg ? errorMsg : 'AI Connection Unstable. Showing simulated fallback signal based on generic momentum.',
      timestamp: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 20) + 75 // Mock confidence 75-95
    };
};