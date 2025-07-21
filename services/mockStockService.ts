// Updated Mock service that interfaces with LSTM Model Service
// This bridges the gap between the UI and the LSTM backend

import { lstmModelService, type StockData, type ModelPredictionResult, type NewsData } from './lstmModelService';

interface StockInfo {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  volume: number;
  marketCap: string;
}

interface PredictionData {
  historical: number[];
  predictions: number[];
  dates: string[];
  trend: string;
  confidence: number;
}

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  source: string;
  publishedAt: string;
}

class MockStockService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getStockInfo(ticker: string): Promise<StockInfo | null> {
    try {
      console.log('Fetching stock info for:', ticker);
      
      // Check cache first
      const cacheKey = `stock_${ticker}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached stock data');
        return cached.data;
      }

      // Fetch from LSTM service
      const stockData: StockData = await lstmModelService.getStockData(ticker);
      
      const stockInfo: StockInfo = {
        symbol: stockData.symbol,
        name: stockData.name,
        currentPrice: stockData.currentPrice,
        change: stockData.change,
        volume: stockData.volume,
        marketCap: stockData.marketCap
      };

      // Cache the result
      this.cache.set(cacheKey, { data: stockInfo, timestamp: Date.now() });
      
      return stockInfo;
    } catch (error) {
      console.error('Error fetching stock info:', error);
      return this.getFallbackStockInfo(ticker);
    }
  }

  async getPredictions(ticker: string): Promise<PredictionData> {
    try {
      console.log('Generating LSTM predictions for:', ticker);
      
      // Check cache first
      const cacheKey = `predictions_${ticker}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached prediction data');
        return cached.data;
      }

      // Get predictions from LSTM service
      const modelResult: ModelPredictionResult = await lstmModelService.generatePredictions(ticker);
      
      // Transform data for UI compatibility
      const historical = modelResult.historical.slice(-4).map(h => h.close);
      const predictions = modelResult.predictions.map(p => p.predictedPrice);
      
      // Generate dates for chart
      const dates = [];
      const today = new Date();
      
      // Historical dates (last 4 days)
      for (let i = 3; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      
      // Prediction dates (next 3 days)
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      const predictionData: PredictionData = {
        historical,
        predictions,
        dates,
        trend: modelResult.trend === 'bullish' ? 'Bullish' : 
               modelResult.trend === 'bearish' ? 'Bearish' : 'Sideways',
        confidence: Math.floor(modelResult.confidence * 100)
      };

      // Cache the result
      this.cache.set(cacheKey, { data: predictionData, timestamp: Date.now() });
      
      return predictionData;
    } catch (error) {
      console.error('Error generating predictions:', error);
      return this.getFallbackPredictions(ticker);
    }
  }

  async getNews(ticker: string): Promise<NewsItem[]> {
    try {
      console.log('Fetching news and running FinBERT analysis for:', ticker);
      
      // Check cache first
      const cacheKey = `news_${ticker}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached news data');
        return cached.data;
      }

      // Get news from LSTM service
      const newsData: NewsData[] = await lstmModelService.getNewsWithSentiment(ticker);
      
      // Transform data for UI compatibility
      const newsItems: NewsItem[] = newsData.map(news => ({
        id: news.id,
        headline: news.headline,
        summary: news.summary,
        sentiment: news.sentiment,
        sentimentScore: news.finbertScore, // Use FinBERT score
        source: news.source,
        publishedAt: news.publishedAt
      }));

      // Cache the result
      this.cache.set(cacheKey, { data: newsItems, timestamp: Date.now() });
      
      return newsItems;
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getFallbackNews(ticker);
    }
  }

  // Fallback methods for when the LSTM service is unavailable
  private getFallbackStockInfo(ticker: string): StockInfo {
    console.log('Using fallback stock data for:', ticker);
    
    const basePrice = Math.random() * 200 + 50;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol: ticker.toUpperCase(),
      name: `${ticker.toUpperCase()} Corporation`,
      currentPrice: basePrice,
      change: change,
      volume: Math.floor(Math.random() * 100000000),
      marketCap: `${Math.floor(Math.random() * 1000)}B`
    };
  }

  private getFallbackPredictions(ticker: string): PredictionData {
    console.log('Using fallback prediction data for:', ticker);
    
    const basePrice = 100;
    
    // Generate mock historical data (last 4 days)
    const historical = [];
    for (let i = 4; i >= 1; i--) {
      const variation = (Math.random() - 0.5) * 10;
      historical.push(basePrice + variation);
    }
    
    // Generate mock predictions (next 3 days)
    const predictions = [];
    let lastPrice = historical[historical.length - 1];
    
    for (let i = 0; i < 3; i++) {
      const trendFactor = Math.random() > 0.5 ? 1.02 : 0.98;
      const noise = (Math.random() - 0.5) * 5;
      lastPrice = lastPrice * trendFactor + noise;
      predictions.push(lastPrice);
    }
    
    // Generate dates
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    const trend = predictions[predictions.length - 1] > predictions[0] ? 'Bullish' : 'Bearish';
    
    return {
      historical,
      predictions,
      dates,
      trend,
      confidence: Math.floor(Math.random() * 20) + 75
    };
  }

  private getFallbackNews(ticker: string): NewsItem[] {
    console.log('Using fallback news data for:', ticker);
    
    return [
      {
        id: '1',
        headline: `${ticker} Reports Strong Q4 Earnings, Beats Analyst Expectations`,
        summary: 'The company delivered impressive quarterly results with revenue growth exceeding market forecasts. Strong performance across all business segments.',
        sentiment: 'positive',
        sentimentScore: 0.78,
        source: 'Financial Times',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        headline: `Market Volatility Affects ${ticker} Stock Performance`,
        summary: 'Recent market turbulence has impacted stock prices across the sector. Analysts remain cautiously optimistic about long-term prospects.',
        sentiment: 'neutral',
        sentimentScore: -0.05,
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        headline: `${ticker} Faces Regulatory Challenges in Key Markets`,
        summary: 'New regulatory requirements may impact operations in several international markets. Company working on compliance strategies.',
        sentiment: 'negative',
        sentimentScore: -0.42,
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const mockStockService = new MockStockService();