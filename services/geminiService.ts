import { Coin, Signal } from "../types";

async function generateContent(prompt: string, json = false) {

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, json }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to generate content:", error);
    return null;
  }
}

export const analyzeMarket = async (coins: Coin[]): Promise<string> => {
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

  const result = await generateContent(prompt);
  return result?.text || getSimulatedMarketAnalysis(coins);
};

export const generateFutureProjection = async (coin: Coin): Promise<string> => {
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

  const result = await generateContent(prompt);
  return result?.text || getSimulatedProjection(coin);
};

export const generateTradingSignal = async (coin: Coin): Promise<Signal> => {
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

  const data = await generateContent(prompt, true);

  if (!data) {
    return getSimulatedSignal(coin);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    pair: `${coin.symbol}/USD`,
    timestamp: new Date().toISOString(),
    ...data
  };
};

export const getEducationalContent = async (topic: string): Promise<string> => {
  const prompt = `
    Explain the crypto concept "${topic}" to a beginner trader.
    Use simple analogies, bullet points, and keep it under 150 words.
  `;
  const result = await generateContent(prompt);
  return result?.text || "Simulated Content: Blockchain technology enables decentralized trust...";
}

// --- SIMULATION FALLBACKS ---

const getSimulatedMarketAnalysis = (coins: Coin[]) => {
    const bullish = coins.filter(c => c.change24h > 0).length > coins.length / 2;
    return `**Market Sentiment: ${bullish ? 'Cautiously Bullish' : 'Bearish Consolidation'}**\n\nThe market is currently showing ${bullish ? 'signs of recovery' : 'downward pressure'} with mixed signals across major assets. High volatility suggests traders are reacting to macroeconomic factors.\n\n**Key Movers:**\n${coins[0]?.name || 'Bitcoin'} continues to lead the trend, influencing altcoin performance. Volume analysis indicates steady accumulation in the top tier assets.\n\n**Outlook:**\nExpect continued volatility in the short term. Support levels are being tested, and a breakout could occur within the next 24 hours. (Simulated Analysis due to connection instability)`;
};

const getSimulatedProjection = (coin: Coin) => {
    return `### Future Outlook for ${coin.name} (Simulated)\n\n**End of 2025 Target:** $${(coin.price * 1.5).toLocaleString(undefined, {maximumFractionDigits: 2})}\nBased on current adoption curves and market cycles, a conservative 50% upside is plausible.\n\n**Blue Sky Scenario:** $${(coin.price * 3.5).toLocaleString(undefined, {maximumFractionDigits: 2})}\nIf global adoption accelerates and regulatory clarity improves, we could see a parabolic run.\n\n**Bear Case:** $${(coin.price * 0.6).toLocaleString(undefined, {maximumFractionDigits: 2})}\nMacroeconomic headwinds or regulatory crackdowns could suppress price action significantly.`;
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
