import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Clock, Phone, Star, Users, Wifi, Car, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  currentVisitors: number;
  maxCapacity: number;
}

interface ShopInfoCardProps {
  shopInfo: ShopInfo;
  onPress?: () => void;
}

export function ShopInfoCard({ shopInfo, onPress }: ShopInfoCardProps) {
  const { colors } = useTheme();

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi size={16} color={colors.primary} />;
      case 'parking':
        return <Car size={16} color={colors.primary} />;
      case 'pharmacy':
        return <ShoppingCart size={16} color={colors.primary} />;
      default:
        return <Star size={16} color={colors.primary} />;
    }
  };

  const occupancyPercentage = (shopInfo.currentVisitors / shopInfo.maxCapacity) * 100;
  const getOccupancyColor = () => {
    if (occupancyPercentage < 50) return colors.secondary;
    if (occupancyPercentage < 80) return colors.accent;
    return colors.error;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      marginVertical: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    shopImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      marginRight: 16,
    },
    shopDetails: {
      flex: 1,
    },
    shopName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
      fontFamily: 'Inter-ExtraBold',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    rating: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 4,
      fontFamily: 'Inter-Bold',
    },
    reviews: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      fontFamily: 'Inter-Regular',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
      fontFamily: 'Inter-Regular',
    },
    occupancyContainer: {
      marginVertical: 16,
    },
    occupancyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    occupancyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    occupancyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Inter-SemiBold',
    },
    occupancyBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    occupancyFill: {
      height: '100%',
      borderRadius: 4,
    },
    amenitiesContainer: {
      marginTop: 16,
    },
    amenitiesTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      fontFamily: 'Inter-Bold',
    },
    amenitiesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    amenityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    amenityText: {
      fontSize: 12,
      color: colors.text,
      marginLeft: 6,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 16,
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Image source={{ uri: shopInfo.image }} style={styles.shopImage} />
        <View style={styles.shopDetails}>
          <Text style={styles.shopName}>{shopInfo.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.accent} fill={colors.accent} />
            <Text style={styles.rating}>{shopInfo.rating}</Text>
            <Text style={styles.reviews}>({shopInfo.reviews} reviews)</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{shopInfo.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{shopInfo.hours}</Text>
          </View>
        </View>
      </View>

      <View style={styles.occupancyContainer}>
        <View style={styles.occupancyHeader}>
          <Text style={styles.occupancyTitle}>Store Occupancy</Text>
          <Text style={styles.occupancyText}>
            {shopInfo.currentVisitors}/{shopInfo.maxCapacity} visitors
          </Text>
        </View>
        <View style={styles.occupancyBar}>
          <View
            style={[
              styles.occupancyFill,
              {
                width: `${occupancyPercentage}%`,
                backgroundColor: getOccupancyColor(),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.amenitiesContainer}>
        <Text style={styles.amenitiesTitle}>Amenities</Text>
        <View style={styles.amenitiesList}>
          {shopInfo.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityChip}>
              {getAmenityIcon(amenity)}
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <Text style={styles.actionButtonText}>View Store Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}