import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, Gift, Trophy, Zap, Crown, Target } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface LoyaltyData {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  nextTierPoints: number;
  totalSpent: number;
  rewardsAvailable: number;
  streakDays: number;
}

interface LoyaltyRewardsCardProps {
  loyaltyData: LoyaltyData;
  onViewRewards?: () => void;
}

export function LoyaltyRewardsCard({ loyaltyData, onViewRewards }: LoyaltyRewardsCardProps) {
  const { colors } = useTheme();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      case 'Platinum':
        return '#E5E4E2';
      default:
        return colors.primary;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return <Crown size={24} color={colors.white} />;
      case 'Gold':
        return <Trophy size={24} color={colors.white} />;
      default:
        return <Star size={24} color={colors.white} />;
    }
  };

  const progressPercentage = (loyaltyData.points / loyaltyData.nextTierPoints) * 100;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: getTierColor(loyaltyData.tier),
      borderRadius: 20,
      padding: 20,
      marginVertical: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    tierInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tierIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    tierText: {
      color: colors.white,
      fontSize: 20,
      fontWeight: '800',
      fontFamily: 'Inter-ExtraBold',
    },
    pointsContainer: {
      alignItems: 'flex-end',
    },
    pointsValue: {
      color: colors.white,
      fontSize: 28,
      fontWeight: '800',
      fontFamily: 'Inter-ExtraBold',
    },
    pointsLabel: {
      color: colors.white,
      fontSize: 14,
      opacity: 0.9,
      fontFamily: 'Inter-SemiBold',
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
    },
    progressBar: {
      height: 8,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.white,
      borderRadius: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      color: colors.white,
      fontSize: 18,
      fontWeight: '800',
      fontFamily: 'Inter-ExtraBold',
    },
    statLabel: {
      color: colors.white,
      fontSize: 12,
      opacity: 0.9,
      marginTop: 4,
      textAlign: 'center',
      fontFamily: 'Inter-SemiBold',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    primaryActionButton: {
      backgroundColor: colors.white,
    },
    actionButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 6,
      fontFamily: 'Inter-Bold',
    },
    primaryActionButtonText: {
      color: getTierColor(loyaltyData.tier),
    },
    streakBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: colors.error,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    streakText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 4,
      fontFamily: 'Inter-Bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />
      
      {loyaltyData.streakDays > 0 && (
        <View style={styles.streakBadge}>
          <Zap size={16} color={colors.white} />
          <Text style={styles.streakText}>{loyaltyData.streakDays} day streak</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.tierInfo}>
          <View style={styles.tierIcon}>
            {getTierIcon(loyaltyData.tier)}
          </View>
          <Text style={styles.tierText}>{loyaltyData.tier} Member</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{loyaltyData.points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Progress to next tier</Text>
          <Text style={styles.progressText}>
            {loyaltyData.nextTierPoints - loyaltyData.points} points needed
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${loyaltyData.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{loyaltyData.rewardsAvailable}</Text>
          <Text style={styles.statLabel}>Rewards Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.floor(loyaltyData.points / 100)}</Text>
          <Text style={styles.statLabel}>Redeemable</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Target size={16} color={colors.white} />
          <Text style={styles.actionButtonText}>Earn Points</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={onViewRewards}>
          <Gift size={16} color={getTierColor(loyaltyData.tier)} />
          <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
            View Rewards
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}