import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tag, Clock, MapPin, Star, ChevronRight, Gift, Zap, TrendingUp, Filter } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  location: string;
  expiry: string;
  category: string;
  type: 'location' | 'personalized' | 'general' | 'flash';
  claimed: boolean;
  image?: string;
  originalPrice?: number;
  discountedPrice?: number;
  popularity?: number;
}

export default function OffersScreen() {
  const { colors } = useTheme();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filter, setFilter] = useState<'all' | 'location' | 'personalized' | 'flash'>('all');

  useEffect(() => {
    const sampleOffers: Offer[] = [
      {
        id: '1',
        title: '25% Off Fresh Organic Produce',
        description: 'Get 25% off all fresh organic fruits and vegetables. Limited time offer!',
        discount: '25% OFF',
        location: 'Produce Section (A15)',
        expiry: '2 hours',
        category: 'Produce',
        type: 'location',
        claimed: false,
        image: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=2',
        originalPrice: 12.99,
        discountedPrice: 9.74,
        popularity: 95,
      },
      {
        id: '2',
        title: 'Buy 2 Get 1 Free Premium Milk',
        description: 'Based on your purchase history - your favorite organic milk brand',
        discount: 'BOGO+1',
        location: 'Dairy Section (A12)',
        expiry: '4 hours',
        category: 'Dairy',
        type: 'personalized',
        claimed: false,
        image: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=2',
        originalPrice: 4.98,
        discountedPrice: 3.32,
        popularity: 87,
      },
      {
        id: '3',
        title: 'Flash Sale: $8 Off Premium Meat',
        description: 'Limited time flash sale on premium cuts. Only 50 available!',
        discount: '$8 OFF',
        location: 'Meat & Seafood (A6)',
        expiry: '45 minutes',
        category: 'Meat',
        type: 'flash',
        claimed: false,
        image: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=2',
        originalPrice: 24.99,
        discountedPrice: 16.99,
        popularity: 92,
      },
      {
        id: '4',
        title: 'Free Artisan Bakery Item',
        description: 'You\'re near the bakery! Claim your complimentary fresh-baked item',
        discount: 'FREE',
        location: 'Bakery (A8)',
        expiry: '1 hour',
        category: 'Bakery',
        type: 'location',
        claimed: false,
        image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=2',
        originalPrice: 3.99,
        discountedPrice: 0,
        popularity: 78,
      },
      {
        id: '5',
        title: '20% Off Electronics Bundle',
        description: 'Personalized offer based on your tech interests and browsing history',
        discount: '20% OFF',
        location: 'Electronics (E1)',
        expiry: '24 hours',
        category: 'Electronics',
        type: 'personalized',
        claimed: false,
        image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=2',
        originalPrice: 199.99,
        discountedPrice: 159.99,
        popularity: 84,
      },
      {
        id: '6',
        title: 'Flash Deal: 30% Off Frozen Foods',
        description: 'Lightning deal on premium frozen meals and ice cream. Hurry!',
        discount: '30% OFF',
        location: 'Frozen Foods (A10)',
        expiry: '20 minutes',
        category: 'Frozen',
        type: 'flash',
        claimed: false,
        image: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=2',
        originalPrice: 8.99,
        discountedPrice: 6.29,
        popularity: 89,
      },
    ];
    setOffers(sampleOffers);
  }, []);

  const claimOffer = (offerId: string) => {
    setOffers(prevOffers =>
      prevOffers.map(offer =>
        offer.id === offerId ? { ...offer, claimed: true } : offer
      )
    );
    Alert.alert(
      'Offer Claimed Successfully! 🎉',
      'Your offer has been applied to your account. Show this confirmation at checkout or the discount will be automatically applied.',
      [{ text: 'Awesome!', onPress: () => {} }]
    );
  };

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPin size={16} color={colors.primary} strokeWidth={2.5} />;
      case 'personalized':
        return <Star size={16} color={colors.accent} strokeWidth={2.5} />;
      case 'flash':
        return <Zap size={16} color={colors.error} strokeWidth={2.5} />;
      default:
        return <Gift size={16} color={colors.secondary} strokeWidth={2.5} />;
    }
  };

  const getOfferTypeLabel = (type: string) => {
    switch (type) {
      case 'location':
        return 'Location-Based';
      case 'personalized':
        return 'Personalized';
      case 'flash':
        return 'Flash Sale';
      default:
        return 'General';
    }
  };

  const getOfferTypeColor = (type: string) => {
    switch (type) {
      case 'location':
        return colors.primary;
      case 'personalized':
        return colors.accent;
      case 'flash':
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.type === filter;
  }).sort((a, b) => {
    // Sort by type priority and popularity
    const typePriority = { flash: 4, location: 3, personalized: 2, general: 1 };
    const aPriority = typePriority[a.type as keyof typeof typePriority] || 1;
    const bPriority = typePriority[b.type as keyof typeof typePriority] || 1;
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return (b.popularity || 0) - (a.popularity || 0);
  });

  const filters = [
    { key: 'all', label: 'All Offers', count: offers.length },
    { key: 'flash', label: 'Flash Sales', count: offers.filter(o => o.type === 'flash').length },
    { key: 'location', label: 'Location-Based', count: offers.filter(o => o.type === 'location').length },
    { key: 'personalized', label: 'Personalized', count: offers.filter(o => o.type === 'personalized').length },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      padding: 24,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      fontFamily: 'Inter-ExtraBold',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'Inter-Regular',
    },
    headerButton: {
      backgroundColor: colors.surface,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterContainer: {
      backgroundColor: colors.background,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterScroll: {
      paddingHorizontal: 20,
    },
    filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderRadius: 24,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    filterChipTextActive: {
      color: colors.white,
    },
    filterCount: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textSecondary,
      marginLeft: 6,
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      fontFamily: 'Inter-ExtraBold',
    },
    filterCountActive: {
      color: colors.primary,
      backgroundColor: colors.white,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    offerCard: {
      backgroundColor: colors.background,
      borderRadius: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    flashOfferCard: {
      borderWidth: 2,
      borderColor: colors.error,
    },
    offerImage: {
      width: '100%',
      height: 120,
      backgroundColor: colors.surface,
    },
    offerContent: {
      padding: 20,
    },
    offerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    offerType: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    offerTypeText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 6,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
    discountBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
    },
    discountText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.white,
      fontFamily: 'Inter-ExtraBold',
    },
    offerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      fontFamily: 'Inter-ExtraBold',
    },
    offerDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
      fontFamily: 'Inter-Regular',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    originalPrice: {
      fontSize: 16,
      color: colors.textTertiary,
      textDecorationLine: 'line-through',
      marginRight: 8,
      fontFamily: 'Inter-SemiBold',
    },
    discountedPrice: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.secondary,
      fontFamily: 'Inter-ExtraBold',
    },
    savings: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: 8,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
    offerDetails: {
      gap: 8,
      marginBottom: 16,
    },
    offerDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    offerDetailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      fontFamily: 'Inter-SemiBold',
    },
    popularityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    popularityBar: {
      flex: 1,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginLeft: 8,
      overflow: 'hidden',
    },
    popularityFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 2,
    },
    popularityText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
      fontFamily: 'Inter-SemiBold',
    },
    claimButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      borderRadius: 12,
    },
    claimedButton: {
      backgroundColor: colors.secondary,
    },
    flashClaimButton: {
      backgroundColor: colors.error,
    },
    claimButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '800',
      marginRight: 8,
      fontFamily: 'Inter-ExtraBold',
    },
    claimedButtonText: {
      marginRight: 0,
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
      fontFamily: 'Inter-Bold',
    },
    emptyStateDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      fontFamily: 'Inter-Regular',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Offers & Deals</Text>
            <Text style={styles.subtitle}>
              {filteredOffers.length} personalized offers available
            </Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterChip,
                filter === filterOption.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(filterOption.key as any)}>
              <Text style={[
                styles.filterChipText,
                filter === filterOption.key && styles.filterChipTextActive,
              ]}>
                {filterOption.label}
              </Text>
              <Text style={[
                styles.filterCount,
                filter === filterOption.key && styles.filterCountActive,
              ]}>
                {filterOption.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredOffers.map((offer) => (
          <View key={offer.id} style={[
            styles.offerCard,
            offer.type === 'flash' && styles.flashOfferCard
          ]}>
            <Image source={{ uri: offer.image }} style={styles.offerImage} />
            
            <View style={styles.offerContent}>
              <View style={styles.offerHeader}>
                <View style={styles.offerType}>
                  {getOfferIcon(offer.type)}
                  <Text style={styles.offerTypeText}>
                    {getOfferTypeLabel(offer.type)}
                  </Text>
                </View>
                <View style={[
                  styles.discountBadge,
                  { backgroundColor: getOfferTypeColor(offer.type) }
                ]}>
                  <Text style={styles.discountText}>{offer.discount}</Text>
                </View>
              </View>
              
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerDescription}>{offer.description}</Text>
              
              {offer.originalPrice && offer.discountedPrice !== undefined && (
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>${offer.originalPrice.toFixed(2)}</Text>
                  <Text style={styles.discountedPrice}>
                    {offer.discountedPrice === 0 ? 'FREE' : `$${offer.discountedPrice.toFixed(2)}`}
                  </Text>
                  {offer.discountedPrice > 0 && (
                    <Text style={styles.savings}>
                      Save ${(offer.originalPrice - offer.discountedPrice).toFixed(2)}
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.offerDetails}>
                <View style={styles.offerDetailRow}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.offerDetailText}>{offer.location}</Text>
                </View>
                <View style={styles.offerDetailRow}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={styles.offerDetailText}>Expires in {offer.expiry}</Text>
                </View>
              </View>

              {offer.popularity && (
                <View style={styles.popularityContainer}>
                  <TrendingUp size={16} color={colors.textSecondary} />
                  <View style={styles.popularityBar}>
                    <View style={[
                      styles.popularityFill,
                      { width: `${offer.popularity}%` }
                    ]} />
                  </View>
                  <Text style={styles.popularityText}>{offer.popularity}% claimed</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  offer.claimed && styles.claimedButton,
                  offer.type === 'flash' && !offer.claimed && styles.flashClaimButton,
                ]}
                onPress={() => claimOffer(offer.id)}
                disabled={offer.claimed}>
                <Text style={[
                  styles.claimButtonText,
                  offer.claimed && styles.claimedButtonText
                ]}>
                  {offer.claimed ? 'Claimed ✓' : 'Claim Offer'}
                </Text>
                {!offer.claimed && <ChevronRight size={20} color={colors.white} />}
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {filteredOffers.length === 0 && (
          <View style={styles.emptyState}>
            <Tag size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Offers Available</Text>
            <Text style={styles.emptyStateDescription}>
              Check back later for more personalized offers and exclusive deals tailored just for you!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}