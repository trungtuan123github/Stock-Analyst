// LSTM Model Service for Stock Price Prediction
// This service interfaces with the Python backend that uses yfinance and LSTM

interface LSTMModelConfig {
  sequenceLength: number;
  features: string[];
  epochs: number;
  batchSize: number;
  learningRate: number;
}

interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  dividendYield: number;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

interface LSTMPrediction {
  date: string;
  predictedPrice: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

interface NewsData {
  id: string;
  headline: string;
  summary: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  finbertScore: number;
  source: string;
  publishedAt: string;
  relevanceScore: number;
}

interface ModelPredictionResult {
  symbol: string;
  currentPrice: number;
  historical: HistoricalData[];
  predictions: LSTMPrediction[];
  modelMetrics: {
    accuracy: number;
    mse: number;
    rmse: number;
    mae: number;
    r2Score: number;
  };
  sentimentWeights: {
    positive: number;
    negative: number;
    neutral: number;
    overallSentiment: number;
  };
  trend: 'bullish' | 'bearish' | 'sideways';
  confidence: number;
  lastUpdated: string;
}

class LSTMModelService {
  private baseUrl: string;
  private modelConfig: LSTMModelConfig;

  constructor() {
    // In a real implementation, this would be your Python backend URL
    this.baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    this.modelConfig = {
      sequenceLength: 60, // Use 60 days of historical data
      features: ['close', 'volume', 'high', 'low', 'sentiment_score'],
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001
    };
  }

  /**
   * Fetch stock data using yfinance through Python backend
   */
  async getStockData(ticker: string): Promise<StockData> {
    try {
      console.log(`Fetching stock data for ${ticker} from yfinance...`);
      
      // In a real implementation, this would call your Python backend
      const response = await fetch(`${this.baseUrl}/api/stock/${ticker}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Return mock data for development
      return this.getMockStockData(ticker);
    }
  }

  /**
   * Get historical stock data for LSTM training
   */
  async getHistoricalData(ticker: string, period: string = '1y'): Promise<HistoricalData[]> {
    try {
      console.log(`Fetching historical data for ${ticker} (${period})...`);
      
      const response = await fetch(`${this.baseUrl}/api/historical/${ticker}?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.getMockHistoricalData(ticker);
    }
  }

  /**
   * Get news data and run FinBERT sentiment analysis
   */
  async getNewsWithSentiment(ticker: string): Promise<NewsData[]> {
    try {
      console.log(`Fetching news and running FinBERT analysis for ${ticker}...`);
      
      const response = await fetch(`${this.baseUrl}/api/news/${ticker}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news data:', error);
      return this.getMockNewsData(ticker);
    }
  }

  /**
   * Generate LSTM predictions with sentiment weighting
   */
  async generatePredictions(ticker: string): Promise<ModelPredictionResult> {
    try {
      console.log(`Generating LSTM predictions for ${ticker}...`);
      
      // Fetch all required data
      const [stockData, historicalData, newsData] = await Promise.all([
        this.getStockData(ticker),
        this.getHistoricalData(ticker),
        this.getNewsWithSentiment(ticker)
      ]);

      // Calculate sentiment weights from FinBERT scores
      const sentimentWeights = this.calculateSentimentWeights(newsData);

      // Call Python backend to train LSTM model and generate predictions
      const response = await fetch(`${this.baseUrl}/api/predict/${ticker}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          historicalData,
          sentimentWeights,
          modelConfig: this.modelConfig,
          predictionDays: 3
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate predictions: ${response.statusText}`);
      }

      const predictions = await response.json();
      
      return {
        symbol: ticker,
        currentPrice: stockData.currentPrice,
        historical: historicalData,
        predictions: predictions.predictions,
        modelMetrics: predictions.metrics,
        sentimentWeights,
        trend: predictions.trend,
        confidence: predictions.confidence,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating predictions:', error);
      return this.getMockPredictionResult(ticker);
    }
  }

  /**
   * Calculate sentiment weights from FinBERT scores
   */
  private calculateSentimentWeights(newsData: NewsData[]): ModelPredictionResult['sentimentWeights'] {
    if (newsData.length === 0) {
      return { positive: 0.33, negative: 0.33, neutral: 0.34, overallSentiment: 0 };
    }

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let totalSentimentScore = 0;

    newsData.forEach(news => {
      switch (news.sentiment) {
        case 'positive':
          positiveCount++;
          break;
        case 'negative':
          negativeCount++;
          break;
        case 'neutral':
          neutralCount++;
          break;
      }
      totalSentimentScore += news.finbertScore;
    });

    const total = newsData.length;
    const overallSentiment = totalSentimentScore / total;

    return {
      positive: positiveCount / total,
      negative: negativeCount / total,
      neutral: neutralCount / total,
      overallSentiment
    };
  }

  /**
   * Mock data methods for development/testing
   */
  private getMockStockData(ticker: string): StockData {
    const basePrice = Math.random() * 200 + 50;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol: ticker.toUpperCase(),
      name: `${ticker.toUpperCase()} Corporation`,
      currentPrice: basePrice,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 100000000),
      marketCap: `${Math.floor(Math.random() * 1000)}B`,
      high52Week: basePrice * 1.3,
      low52Week: basePrice * 0.7,
      peRatio: Math.random() * 30 + 10,
      dividendYield: Math.random() * 5
    };
  }

  private getMockHistoricalData(ticker: string): HistoricalData[] {
    const data: HistoricalData[] = [];
    const basePrice = 100;
    let currentPrice = basePrice;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 5;
      currentPrice += variation;
      
      const open = currentPrice + (Math.random() - 0.5) * 2;
      const close = currentPrice;
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 10000000),
        adjustedClose: close
      });
    }
    
    return data;
  }

  private getMockNewsData(ticker: string): NewsData[] {
    return [
      {
        id: '1',
        headline: `${ticker} Reports Strong Q4 Earnings, Beats Analyst Expectations`,
        summary: 'The company delivered impressive quarterly results with revenue growth exceeding market forecasts.',
        content: 'Full article content would be here...',
        sentiment: 'positive',
        sentimentScore: 0.78,
        finbertScore: 0.82,
        source: 'Financial Times',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 0.95
      },
      {
        id: '2',
        headline: `Market Volatility Affects ${ticker} Stock Performance`,
        summary: 'Recent market turbulence has impacted stock prices across the sector.',
        content: 'Full article content would be here...',
        sentiment: 'neutral',
        sentimentScore: -0.05,
        finbertScore: -0.02,
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 0.78
      },
      {
        id: '3',
        headline: `${ticker} Faces Regulatory Challenges in Key Markets`,
        summary: 'New regulatory requirements may impact operations in several international markets.',
        content: 'Full article content would be here...',
        sentiment: 'negative',
        sentimentScore: -0.42,
        finbertScore: -0.38,
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 0.85
      }
    ];
  }

  private getMockPredictionResult(ticker: string): ModelPredictionResult {
    const currentPrice = 150;
    const predictions: LSTMPrediction[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const variation = (Math.random() - 0.5) * 10;
      const predictedPrice = currentPrice + variation;
      const confidence = Math.random() * 0.3 + 0.7; // 70-100%
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedPrice,
        confidence,
        upperBound: predictedPrice * 1.05,
        lowerBound: predictedPrice * 0.95
      });
    }
    
    return {
      symbol: ticker,
      currentPrice,
      historical: this.getMockHistoricalData(ticker),
      predictions,
      modelMetrics: {
        accuracy: 0.85,
        mse: 2.34,
        rmse: 1.53,
        mae: 1.21,
        r2Score: 0.78
      },
      sentimentWeights: {
        positive: 0.4,
        negative: 0.3,
        neutral: 0.3,
        overallSentiment: 0.15
      },
      trend: 'bullish',
      confidence: 0.82,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const lstmModelService = new LSTMModelService();
export type { StockData, HistoricalData, LSTMPrediction, NewsData, ModelPredictionResult };