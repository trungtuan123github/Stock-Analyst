// LSTM Model Configuration
// This file contains all the configuration settings for the LSTM model

export interface ModelConfig {
  // LSTM Model Parameters
  lstm: {
    sequenceLength: number;        // Number of days to look back
    hiddenUnits: number;          // Number of LSTM units
    layers: number;               // Number of LSTM layers
    dropout: number;              // Dropout rate for regularization
    recurrentDropout: number;     // Recurrent dropout rate
  };
  
  // Training Parameters
  training: {
    epochs: number;               // Number of training epochs
    batchSize: number;           // Batch size for training
    learningRate: number;        // Learning rate for optimizer
    validationSplit: number;     // Validation data split
    earlyStopping: {
      patience: number;          // Early stopping patience
      minDelta: number;          // Minimum change to qualify as improvement
    };
  };
  
  // Data Processing
  data: {
    features: string[];          // Features to use for prediction
    targetColumn: string;        // Target column to predict
    scalingMethod: 'minmax' | 'standard' | 'robust';
    testSize: number;           // Test data split ratio
    predictionDays: number;     // Number of days to predict
  };
  
  // FinBERT Configuration
  finbert: {
    model: string;              // FinBERT model name
    maxLength: number;          // Maximum text length
    sentimentThreshold: {
      positive: number;         // Threshold for positive sentiment
      negative: number;         // Threshold for negative sentiment
    };
    weightingStrategy: 'linear' | 'exponential' | 'sigmoid';
  };
  
  // News Processing
  news: {
    maxArticles: number;        // Maximum number of articles to process
    timeWindow: number;         // Time window in hours for news relevance
    sources: string[];          // Preferred news sources
    relevanceThreshold: number; // Minimum relevance score
  };
  
  // API Configuration
  api: {
    yfinanceTimeout: number;    // Timeout for yfinance requests
    newsApiTimeout: number;     // Timeout for news API requests
    retryAttempts: number;      // Number of retry attempts
    cacheTimeout: number;       // Cache timeout in milliseconds
  };
}

export const defaultModelConfig: ModelConfig = {
  lstm: {
    sequenceLength: 60,         // Use 60 days of historical data
    hiddenUnits: 128,          // 128 LSTM units
    layers: 2,                 // 2 LSTM layers
    dropout: 0.2,              // 20% dropout
    recurrentDropout: 0.2      // 20% recurrent dropout
  },
  
  training: {
    epochs: 100,               // Train for 100 epochs
    batchSize: 32,             // Batch size of 32
    learningRate: 0.001,       // Learning rate of 0.001
    validationSplit: 0.2,      // 20% validation split
    earlyStopping: {
      patience: 10,            // Stop if no improvement for 10 epochs
      minDelta: 0.001          // Minimum improvement threshold
    }
  },
  
  data: {
    features: [
      'close',                 // Closing price
      'volume',                // Trading volume
      'high',                  // High price
      'low',                   // Low price
      'open',                  // Opening price
      'sentiment_score',       // FinBERT sentiment score
      'news_volume',           // Number of news articles
      'volatility',            // Price volatility
      'rsi',                   // Relative Strength Index
      'macd',                  // MACD indicator
      'bollinger_upper',       // Bollinger Bands upper
      'bollinger_lower'        // Bollinger Bands lower
    ],
    targetColumn: 'close',
    scalingMethod: 'minmax',
    testSize: 0.2,
    predictionDays: 3
  },
  
  finbert: {
    model: 'ProsusAI/finbert',
    maxLength: 512,
    sentimentThreshold: {
      positive: 0.3,
      negative: -0.3
    },
    weightingStrategy: 'exponential'
  },
  
  news: {
    maxArticles: 50,
    timeWindow: 72,            // 72 hours
    sources: [
      'reuters',
      'bloomberg',
      'cnbc',
      'marketwatch',
      'financial-times',
      'wsj'
    ],
    relevanceThreshold: 0.5
  },
  
  api: {
    yfinanceTimeout: 30000,    // 30 seconds
    newsApiTimeout: 15000,     // 15 seconds
    retryAttempts: 3,
    cacheTimeout: 300000       // 5 minutes
  }
};

// Environment-specific configurations
export const getModelConfig = (environment: 'development' | 'production' | 'testing'): ModelConfig => {
  const config = { ...defaultModelConfig };
  
  switch (environment) {
    case 'development':
      config.training.epochs = 10;        // Faster training for development
      config.lstm.sequenceLength = 30;    // Shorter sequence for faster processing
      config.news.maxArticles = 10;       // Fewer articles for development
      break;
      
    case 'testing':
      config.training.epochs = 5;         // Very fast training for tests
      config.lstm.sequenceLength = 10;    // Minimal sequence length
      config.news.maxArticles = 5;        // Minimal articles
      config.api.cacheTimeout = 1000;     // Short cache for testing
      break;
      
    case 'production':
      // Use default configuration for production
      break;
  }
  
  return config;
};

// Validation function for model configuration
export const validateModelConfig = (config: ModelConfig): string[] => {
  const errors: string[] = [];
  
  // Validate LSTM parameters
  if (config.lstm.sequenceLength < 1) {
    errors.push('LSTM sequence length must be at least 1');
  }
  
  if (config.lstm.hiddenUnits < 1) {
    errors.push('LSTM hidden units must be at least 1');
  }
  
  if (config.lstm.layers < 1) {
    errors.push('LSTM layers must be at least 1');
  }
  
  if (config.lstm.dropout < 0 || config.lstm.dropout >= 1) {
    errors.push('LSTM dropout must be between 0 and 1');
  }
  
  // Validate training parameters
  if (config.training.epochs < 1) {
    errors.push('Training epochs must be at least 1');
  }
  
  if (config.training.batchSize < 1) {
    errors.push('Training batch size must be at least 1');
  }
  
  if (config.training.learningRate <= 0) {
    errors.push('Learning rate must be positive');
  }
  
  if (config.training.validationSplit < 0 || config.training.validationSplit >= 1) {
    errors.push('Validation split must be between 0 and 1');
  }
  
  // Validate data parameters
  if (config.data.features.length === 0) {
    errors.push('At least one feature must be specified');
  }
  
  if (config.data.testSize < 0 || config.data.testSize >= 1) {
    errors.push('Test size must be between 0 and 1');
  }
  
  if (config.data.predictionDays < 1) {
    errors.push('Prediction days must be at least 1');
  }
  
  return errors;
};