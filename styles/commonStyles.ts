import { StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const colors = {
  primary: '#162456',    // Material Blue
  secondary: '#193cb8',  // Darker Blue
  accent: '#64B5F6',     // Light Blue
  background: '#101824',  // Dark background
  backgroundAlt: '#162133',  // Darker background
  text: '#e3e3e3',       // Light text
  grey: '#90CAF9',       // Light Blue Grey
  card: '#193cb8',       // Dark card background
  success: '#4CAF50',    // Green for positive
  error: '#F44336',      // Red for negative
  warning: '#FF9800',    // Orange for warning
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const layout = {
  screenWidth,
  screenHeight,
  contentMaxWidth: Math.min(screenWidth - 40, 800),
  isSmallScreen: screenWidth < 400,
  isMediumScreen: screenWidth >= 400 && screenWidth < 768,
  isLargeScreen: screenWidth >= 768,
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.contentMaxWidth,
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.contentMaxWidth,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: layout.contentMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: layout.contentMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: layout.isSmallScreen ? 20 : 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: layout.isSmallScreen ? 14 : 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: layout.isSmallScreen ? 20 : 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: "white",
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexOne: {
    flex: 1,
  },
});