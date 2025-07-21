import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from './Icon';
import { colors, spacing, layout } from '../styles/commonStyles';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  source: string;
  publishedAt: string;
}

interface NewsListProps {
  news: NewsItem[];
}

export default function NewsList({ news }: NewsListProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#F44336';
      default:
        return colors.grey;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'trending-up';
      case 'negative':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!news || news.length === 0) {
    return (
      <View style={styles.noNewsContainer}>
        <Icon name="newspaper-outline" size={40} style={styles.noNewsIcon} />
        <Text style={styles.noNewsText}>No recent news available</Text>
      </View>
    );
  }

  const overallSentiment = news.reduce((acc, item) => acc + item.sentimentScore, 0) / news.length;
  const sentimentLabel = overallSentiment > 0.1 ? 'Positive' : overallSentiment < -0.1 ? 'Negative' : 'Neutral';

  console.log('News list rendering with', news.length, 'items');

  return (
    <View style={styles.container}>
      <View style={styles.sentimentOverview}>
        <Text style={styles.overviewTitle}>Overall News Sentiment</Text>
        <View style={styles.sentimentRow}>
          <Icon 
            name={getSentimentIcon(sentimentLabel.toLowerCase())} 
            size={layout.isSmallScreen ? 20 : 24} 
            style={[styles.sentimentIcon, { color: getSentimentColor(sentimentLabel.toLowerCase()) }]} 
          />
          <Text style={[styles.sentimentText, { color: getSentimentColor(sentimentLabel.toLowerCase()) }]}>
            {sentimentLabel}
          </Text>
          <Text style={styles.sentimentScore}>
            ({overallSentiment > 0 ? '+' : ''}{overallSentiment.toFixed(3)})
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.newsList} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {news.map((item) => (
          <View key={item.id} style={styles.newsItem}>
            <View style={styles.newsHeader}>
              <View style={styles.sourceInfo}>
                <Text style={styles.source} numberOfLines={1}>{item.source}</Text>
                <Text style={styles.publishedAt}>{formatDate(item.publishedAt)}</Text>
              </View>
              <View style={styles.sentimentBadge}>
                <Icon 
                  name={getSentimentIcon(item.sentiment)} 
                  size={layout.isSmallScreen ? 12 : 16} 
                  style={[styles.badgeIcon, { color: getSentimentColor(item.sentiment) }]} 
                />
                <Text style={[styles.badgeText, { color: getSentimentColor(item.sentiment) }]}>
                  {item.sentimentScore > 0 ? '+' : ''}{item.sentimentScore.toFixed(2)}
                </Text>
              </View>
            </View>
            <Text style={styles.headline} numberOfLines={layout.isSmallScreen ? 2 : 3}>
              {item.headline}
            </Text>
            <Text style={styles.summary} numberOfLines={layout.isSmallScreen ? 3 : 4}>
              {item.summary}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.grey,
    width: '100%',
    maxHeight: layout.isSmallScreen ? 350 : 450,
  },
  sentimentOverview: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  overviewTitle: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sentimentIcon: {
    marginRight: spacing.sm,
  },
  sentimentText: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    marginRight: spacing.sm,
    flexShrink: 1,
  },
  sentimentScore: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
  },
  newsList: {
    flex: 1,
  },
  newsItem: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    flexWrap: layout.isSmallScreen ? 'wrap' : 'nowrap',
  },
  sourceInfo: {
    flex: 1,
    marginRight: spacing.sm,
    minWidth: layout.isSmallScreen ? '100%' : 'auto',
    marginBottom: layout.isSmallScreen ? spacing.xs : 0,
  },
  source: {
    fontSize: layout.isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  publishedAt: {
    fontSize: layout.isSmallScreen ? 10 : 12,
    color: colors.grey,
    marginTop: 2,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    alignSelf: layout.isSmallScreen ? 'flex-start' : 'center',
  },
  badgeIcon: {
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: layout.isSmallScreen ? 10 : 12,
    fontWeight: '600',
  },
  headline: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: layout.isSmallScreen ? 18 : 22,
  },
  summary: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    lineHeight: layout.isSmallScreen ? 16 : 20,
  },
  noNewsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey,
    width: '100%',
  },
  noNewsIcon: {
    marginBottom: spacing.lg,
    color: colors.grey,
  },
  noNewsText: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    color: colors.grey,
    textAlign: 'center',
  },
});