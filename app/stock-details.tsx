import { Text, View, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import PredictionChart from '../components/PredictionChart';
import NewsList from '../components/NewsList';
import { commonStyles, colors, spacing, layout } from '../styles/commonStyles';
import { mockStockService } from '../services/mockStockService';

export default function StockDetailsScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const [stockData, setStockData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [ticker]);

  const loadStockData = async () => {
    if (!ticker) return;
    
    try {
      setLoading(true);
      console.log('Loading data for ticker:', ticker);
      
      // Simulate API calls - replace with your backend
      const [stockInfo, predictionData, newsData] = await Promise.all([
        mockStockService.getStockInfo(ticker),
        mockStockService.getPredictions(ticker),
        mockStockService.getNews(ticker)
      ]);
      
      setStockData(stockInfo);
      setPredictions(predictionData);
      setNews(newsData);
      
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading stock data:', error);
      Alert.alert('Error', 'Failed to load stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStockData();
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.wrapper}>
        <View style={styles.loadingContainer}>
          <Icon name="hourglass" size={layout.isSmallScreen ? 32 : 40} style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Analyzing {ticker}...</Text>
          <Text style={styles.loadingSubtext}>
            Running LSTM model and sentiment analysis
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stockData) {
    return (
      <SafeAreaView style={commonStyles.wrapper}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={layout.isSmallScreen ? 32 : 40} style={styles.errorIcon} />
          <Text style={styles.errorText}>Stock not found</Text>
          <Button
            text="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[commonStyles.contentContainer, styles.contentContainer]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Button
            text="← Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Button
            text="Refresh"
            onPress={handleRefresh}
            style={styles.refreshButton}
          />
        </View>

        <View style={styles.stockHeader}>
          <Text style={styles.stockSymbol}>{stockData.symbol}</Text>
          <Text style={styles.stockName} numberOfLines={2}>{stockData.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${stockData.currentPrice}</Text>
            <Text style={[
              styles.priceChange,
              { color: stockData.change >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
            </Text>
          </View>
          <View style={styles.stockMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Volume</Text>
              <Text style={styles.metricValue}>{stockData.volume?.toLocaleString() || 'N/A'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Market Cap</Text>
              <Text style={styles.metricValue}>{stockData.marketCap || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.predictionSection}>
          <Text style={styles.sectionTitle}>3-Day Price Predictions</Text>
          <PredictionChart data={predictions} />
          {predictions && (
            <View style={styles.predictionSummary}>
              <Text style={styles.predictionText}>
                Predicted trend: <Text style={styles.trendText}>
                  {predictions.trend || 'Neutral'}
                </Text>
              </Text>
              <Text style={styles.confidenceText}>
                Model confidence: {predictions.confidence || '85'}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>News Sentiment Analysis</Text>
          <NewsList news={news} />
        </View>

        <View style={styles.disclaimerSection}>
          <Icon name="information-circle" size={layout.isSmallScreen ? 16 : 20} style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            This is a demonstration app. Predictions are for educational purposes only 
            and should not be used for actual trading decisions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.lg,
    flex: layout.isSmallScreen ? 1 : 0,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    flex: layout.isSmallScreen ? 1 : 0,
  },
  stockHeader: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  stockSymbol: {
    fontSize: layout.isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  stockName: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    color: colors.grey,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  priceContainer: {
    flexDirection: layout.isSmallScreen ? 'column' : 'row',
    alignItems: layout.isSmallScreen ? 'flex-start' : 'center',
    gap: layout.isSmallScreen ? spacing.xs : spacing.lg,
    marginBottom: spacing.lg,
  },
  currentPrice: {
    fontSize: layout.isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceChange: {
    fontSize: layout.isSmallScreen ? 16 : 18,
    fontWeight: '600',
  },
  stockMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  metricItem: {
    flex: 1,
    alignItems: layout.isSmallScreen ? 'flex-start' : 'center',
  },
  metricLabel: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
  },
  predictionSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: layout.isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  predictionSummary: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  predictionText: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  trendText: {
    fontWeight: 'bold',
    color: colors.accent,
  },
  confidenceText: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
  },
  newsSection: {
    marginBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingIcon: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: layout.isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    marginBottom: spacing.lg,
    color: '#F44336',
  },
  errorText: {
    fontSize: layout.isSmallScreen ? 16 : 18,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  disclaimerSection: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.grey,
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    marginRight: spacing.md,
    marginTop: 2,
    color: colors.accent,
  },
  disclaimerText: {
    flex: 1,
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    lineHeight: layout.isSmallScreen ? 16 : 20,
  },
});