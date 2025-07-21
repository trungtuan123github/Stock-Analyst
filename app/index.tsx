import { Text, View, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { commonStyles, colors, spacing, layout } from '../styles/commonStyles';
import { StyleSheet } from 'react-native';

export default function MainScreen() {
  const [searchTicker, setSearchTicker] = useState('');
  const [popularStocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$175.43', change: '+2.34%' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$142.56', change: '+1.87%' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$378.85', change: '+0.92%' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$248.42', change: '-1.23%' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$151.94', change: '+3.45%' },
  ]);

  const handleSearch = () => {
    if (!searchTicker.trim()) {
      Alert.alert('Error', 'Please enter a stock ticker symbol');
      return;
    }
    
    console.log('Searching for ticker:', searchTicker);
    router.push({
      pathname: '/stock-details',
      params: { ticker: searchTicker.toUpperCase() }
    });
  };

  const handleStockSelect = (symbol: string) => {
    console.log('Selected stock:', symbol);
    router.push({
      pathname: '/stock-details',
      params: { ticker: symbol }
    });
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[commonStyles.contentContainer, styles.contentContainer]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon name="trending-up" size={layout.isSmallScreen ? 32 : 40} style={styles.headerIcon} />
          <Text style={styles.title}>Stock Predictor</Text>
          <Text style={styles.subtitle}>AI-Powered 3-Day Stock Predictions</Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Stock</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter ticker symbol (e.g., AAPL)"
              placeholderTextColor={colors.grey}
              value={searchTicker}
              onChangeText={setSearchTicker}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Button
              text="Predict"
              onPress={handleSearch}
              style={styles.searchButton}
            />
          </View>
        </View>

        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Stocks</Text>
          {popularStocks.map((stock) => (
            <View key={stock.symbol} style={styles.stockCard}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName} numberOfLines={layout.isSmallScreen ? 1 : 2}>
                  {stock.name}
                </Text>
              </View>
              <View style={styles.stockPrice}>
                <Text style={styles.priceText}>{stock.price}</Text>
                <Text style={[
                  styles.changeText,
                  { color: stock.change.startsWith('+') ? '#4CAF50' : '#F44336' }
                ]}>
                  {stock.change}
                </Text>
              </View>
              <Button
                text="Analyze"
                onPress={() => handleStockSelect(stock.symbol)}
                style={styles.analyzeButton}
              />
            </View>
          ))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureCard}>
            <Icon name="analytics" size={layout.isSmallScreen ? 20 : 24} style={styles.featureIcon} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>LSTM Predictions</Text>
              <Text style={styles.featureDescription}>
                Advanced neural network models for 3-day price forecasting
              </Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Icon name="newspaper" size={layout.isSmallScreen ? 20 : 24} style={styles.featureIcon} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>News Sentiment</Text>
              <Text style={styles.featureDescription}>
                FinBERT analysis of market news for weighted predictions
              </Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Icon name="trending-up" size={layout.isSmallScreen ? 20 : 24} style={styles.featureIcon} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Real-time Data</Text>
              <Text style={styles.featureDescription}>
                Live stock prices and market data integration
              </Text>
            </View>
          </View>
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
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: layout.isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    color: colors.grey,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  searchSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: layout.isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: layout.isSmallScreen ? 'column' : 'row',
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.lg,
    color: colors.text,
    fontSize: layout.isSmallScreen ? 14 : 16,
    borderWidth: 1,
    borderColor: colors.grey,
    minHeight: 50,
  },
  searchButton: {
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    minWidth: layout.isSmallScreen ? '100%' : 120,
  },
  popularSection: {
    marginBottom: spacing.xxxl,
  },
  stockCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: layout.isSmallScreen ? 'column' : 'row',
    alignItems: layout.isSmallScreen ? 'stretch' : 'center',
    borderWidth: 1,
    borderColor: colors.grey,
    gap: spacing.md,
  },
  stockInfo: {
    flex: 1,
    marginBottom: layout.isSmallScreen ? spacing.md : 0,
  },
  stockSymbol: {
    fontSize: layout.isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  stockName: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    marginTop: 2,
  },
  stockPrice: {
    alignItems: layout.isSmallScreen ? 'flex-start' : 'flex-end',
    marginRight: layout.isSmallScreen ? 0 : spacing.lg,
    marginBottom: layout.isSmallScreen ? spacing.md : 0,
  },
  priceText: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
  },
  changeText: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    fontWeight: '500',
    marginTop: 2,
  },
  analyzeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    minWidth: layout.isSmallScreen ? '100%' : 100,
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featureCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    marginRight: spacing.lg,
    marginTop: spacing.xs,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    lineHeight: layout.isSmallScreen ? 16 : 20,
  },
});