import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, layout } from '../styles/commonStyles';

interface PredictionChartProps {
  data: {
    historical: number[];
    predictions: number[];
    dates: string[];
  } | null;
}

export default function PredictionChart({ data }: PredictionChartProps) {
  // Calculate chart width based on container padding and margins
  const chartWidth = Math.min(layout.screenWidth - (spacing.lg * 4), layout.contentMaxWidth - (spacing.lg * 2));
  const chartHeight = layout.isSmallScreen ? 180 : 220;

  console.log('Chart dimensions:', { chartWidth, chartHeight, screenWidth: layout.screenWidth });

  if (!data) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No prediction data available</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.dates.slice(-7), // Show last 7 days
    datasets: [
      {
        data: [...data.historical.slice(-4), ...data.predictions],
        color: (opacity = 1) => `rgba(100, 181, 246, ${opacity})`, // Blue for predictions
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.backgroundAlt,
    backgroundGradientFrom: colors.backgroundAlt,
    backgroundGradientTo: colors.backgroundAlt,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(227, 227, 227, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(144, 202, 249, ${opacity})`,
    style: {
      borderRadius: spacing.md,
    },
    propsForDots: {
      r: layout.isSmallScreen ? '4' : '6',
      strokeWidth: '2',
      stroke: colors.accent,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.grey,
      strokeOpacity: 0.3,
    },
    formatYLabel: (value) => {
      const num = parseFloat(value);
      return num >= 1000 ? `$${(num / 1000).toFixed(1)}k` : `$${num.toFixed(0)}`;
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
        />
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>Historical + Predicted Prices</Text>
        </View>
      </View>
      
      <View style={styles.predictionDetails}>
        <Text style={styles.detailsTitle}>Prediction Details:</Text>
        <View style={styles.predictionGrid}>
          {data.predictions.map((price, index) => (
            <View key={index} style={styles.predictionRow}>
              <Text style={styles.dayText}>Day {index + 1}:</Text>
              <Text style={styles.priceText}>${price.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
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
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  chart: {
    borderRadius: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
    flexShrink: 1,
  },
  predictionDetails: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  detailsTitle: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  predictionGrid: {
    flexDirection: layout.isSmallScreen ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    minWidth: layout.isSmallScreen ? '100%' : '48%',
    paddingHorizontal: spacing.sm,
  },
  dayText: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    color: colors.grey,
  },
  priceText: {
    fontSize: layout.isSmallScreen ? 12 : 14,
    fontWeight: '600',
    color: colors.text,
  },
  noDataContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey,
    width: '100%',
  },
  noDataText: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    color: colors.grey,
    textAlign: 'center',
  },
});