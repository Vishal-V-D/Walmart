import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, Gift, Zap, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface BannerItem {
  id: string;
  type: 'offer' | 'ad' | 'info' | 'promotion';
  title: string;
  subtitle: string;
  image?: string;
  color: string; // This will now be the solid background color
  icon: React.ComponentType<any>;
  action?: () => void;
}

interface MovingBannerProps {
  items: BannerItem[];
  autoPlay?: boolean;
  duration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export function MovingBanner({ items, autoPlay = true, duration = 4000 }: MovingBannerProps) {
  const { colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    if (autoPlay && items.length > 1) {
      const interval = setInterval(() => {
        currentIndex.current = (currentIndex.current + 1) % items.length;
        scrollViewRef.current?.scrollTo({
          x: currentIndex.current * (screenWidth - 32),
          animated: true,
        });
      }, duration);

      return () => clearInterval(interval);
    }
  }, [autoPlay, duration, items.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const styles = StyleSheet.create({
    container: {
      height: 200, // Increased container height
      marginVertical: 12,
    },
    scrollView: {
      height: 160, // Increased scroll view height
      paddingHorizontal: 16,
    },
    bannerItem: {
      width: screenWidth - 30,
      height: 170, // Increased banner item height
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      overflow: 'hidden',
      marginRight: 16,
      paddingVertical: 16, // Added vertical padding for content
    },
    bannerContent: {
      flex: 1,
      marginLeft: 16,
      paddingRight: 16,
    },
    bannerTitle: {
      fontSize: 19, // Slightly increased font size for title
      fontWeight: '700',
      color: colors.white,
      marginBottom: 6, // Increased margin for title
      fontFamily: 'Inter-Bold',
    },
    bannerSubtitle: {
      fontSize: 14, // Slightly increased font size for subtitle
      color: colors.white,
      opacity: 0.9,
      fontFamily: 'Inter-Medium',
      lineHeight: 20, // Improved line height for readability
    },
    bannerIcon: {
      width: 64, // Increased icon size
      height: 64,
      borderRadius: 32, // Adjusted border radius for new size
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 16,
    },
    bannerImage: {
      width: 74, // Increased image size
      height: 74,
      borderRadius: 32, // Adjusted border radius for new size
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    paginationDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      marginHorizontal: 3,
      backgroundColor: colors.border,
      opacity: 0.6,
    },
    paginationDotActive: {
      backgroundColor: colors.primary,
      width: 20,
      borderRadius: 3.5,
      opacity: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollView}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.bannerItem, { backgroundColor: item.color }]}
            onPress={item.action}
            activeOpacity={0.9}>

            <View style={styles.bannerIcon}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.bannerImage} />
              ) : (
                <item.icon size={30} color={colors.white} strokeWidth={2.5} /> 
              )}
            </View>

            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {items.map((_, index) => {
          const isActive = Animated.divide(scrollX, screenWidth - 32).interpolate({
            inputRange: [index - 0.5, index, index + 0.5],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          const dotWidth = isActive.interpolate({
            inputRange: [0, 1],
            outputRange: [7, 20],
          });

          const dotOpacity = isActive.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}