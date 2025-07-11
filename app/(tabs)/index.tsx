import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, Mic, MicOff, MapPin, Clock, Star, Zap, TrendingUp, Users, ShoppingBag, Camera, Globe, Gamepad2, Search, Bell, Heart, Settings, ShoppingCart, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { MovingBanner } from '@/components/MovingBanner';
import { ShopInfoCard } from '@/components/ShopInfoCard';
import { ARNavigationOverlay } from '@/components/ARNavigationOverlay'; // Corrected import
import { LoyaltyRewardsCard } from '@/components/LoyaltyRewardsCard';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  description: string;
}

interface StoreStats {
  totalVisitors: number;
  avgWaitTime: number;
  popularSection: string;
  currentOffers: number;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Main Entrance - Zone A');
  const [storeStats, setStoreStats] = useState<StoreStats>({
    totalVisitors: 1247,
    avgWaitTime: 3,
    popularSection: 'Produce',
    currentOffers: 12,
  });
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [overlaySearchVisible, setOverlaySearchVisible] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<ProductItem[]>([]);

  // Simulated data for personalized recommendations and recently viewed
  const allProducts: ProductItem[] = [
    { id: 'prod1', name: 'Organic Bananas', category: 'Produce', price: '$0.79/lb', image: 'https://images.pexels.com/photos/236682/pexels-photo-236682.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod2', name: 'Almond Milk (Unsweetened)', category: 'Dairy & Alternatives', price: '$3.49', image: 'https://images.pexels.com/photos/1035987/pexels-photo-1035987.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod3', name: 'Whole Wheat Bread', category: 'Bakery', price: '$2.99', image: 'https://images.pexels.com/photos/1013444/pexels-photo-1013444.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod4', name: 'Bluetooth Headphones', category: 'Electronics', price: '$49.99', image: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod5', name: 'Fresh Salmon Fillet', category: 'Seafood', price: '$9.99/lb', image: 'https://images.pexels.com/photos/361184/pexels-photo-361184.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod6', name: 'Avocados', category: 'Produce', price: '$1.50 ea', image: 'https://images.pexels.com/photos/40994/pexels-photo-40994.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod7', name: 'Organic Eggs (Dozen)', category: 'Dairy', price: '$4.29', image: 'https://images.pexels.com/photos/162712/eggs-kitchen-food-cook-162712.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod8', name: 'Stainless Steel Water Bottle', category: 'Kitchenware', price: '$15.99', image: 'https://images.pexels.com/photos/3573679/pexels-photo-3573679.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod9', name: 'Ground Beef (Lean)', category: 'Meat', price: '$5.99/lb', image: 'https://images.pexels.com/photos/6517595/pexels-photo-6517595.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod10', name: 'Chicken Breast', category: 'Meat', price: '$4.50/lb', image: 'https://images.pexels.com/photos/6102432/pexels-photo-6102432.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod11', name: 'Bell Peppers (Mixed)', category: 'Produce', price: '$3.20', image: 'https://images.pexels.com/photos/13936906/pexels-photo-13936906.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
    { id: 'prod12', name: 'Cheddar Cheese Block', category: 'Dairy', price: '$6.79', image: 'https://images.pexels.com/photos/1086701/pexels-photo-1086701.jpeg?auto=compress&cs=tinysrgb&w=160&h=100&dpr=2' },
  ];

  const personalizedRecommendations = [allProducts[0], allProducts[1], allProducts[2], allProducts[4]];
  const recentlyViewedItems = [allProducts[5], allProducts[6], allProducts[7]];


  // Simulate real-time updates for store stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStoreStats(prevStats => ({
        totalVisitors: prevStats.totalVisitors + Math.floor(Math.random() * 5) - 2,
        avgWaitTime: Math.max(1, prevStats.avgWaitTime + Math.floor(Math.random() * 2) - 1),
        popularSection: ['Produce', 'Bakery', 'Dairy', 'Electronics'][Math.floor(Math.random() * 4)],
        currentOffers: prevStats.currentOffers + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live search results
  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setLiveSearchResults(filtered);
    } else {
      setLiveSearchResults([]);
    }
  }, [searchQuery]);

  const bannerItems = [
    {
      id: '1',
      type: 'offer' as const,
      title: 'Flash Sale: 50% Off Electronics',
      subtitle: 'Limited time offer on premium gadgets',
      color: colors.error,
      icon: Zap,
      action: () => Alert.alert('Offer Detail', 'Navigating to Electronics Flash Sale!'),
    },
    {
      id: '2',
      type: 'promotion' as const,
      title: 'AR Navigation Now Live!',
      subtitle: 'Experience next-gen shopping navigation',
      color: colors.primary,
      icon: Camera,
      action: () => toggleARNavigation(),
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Multilingual Support Available',
      subtitle: 'Shop in your preferred language',
      color: colors.secondary,
      icon: Globe,
      action: () => Alert.alert('Feature Info', 'Multilingual support can be enabled in Settings.'),
    },
    {
      id: '4',
      type: 'ad' as const,
      title: 'Gamified Shopping Rewards',
      subtitle: 'Earn points and unlock achievements',
      color: colors.accent,
      icon: Gamepad2,
      action: () => Alert.alert('Feature Info', 'Explore gamified challenges and rewards in the Loyalty section!'),
    },
  ];

  const shopInfo = {
    name: 'Walmart Supercenter #1234',
    address: '123 Main Street, Downtown District',
    phone: '+1 (555) 123-4567',
    hours: 'Open 24/7',
    rating: 4.6,
    reviews: 2847,
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    amenities: ['WiFi', 'Parking', 'Pharmacy', 'Grocery Pickup', 'Photo Center'],
    currentVisitors: 342,
    maxCapacity: 500,
  };

  const loyaltyData = {
    points: 2847,
    tier: 'Gold' as const,
    nextTierPoints: 5000,
    totalSpent: 1247.83,
    rewardsAvailable: 8,
    streakDays: 12,
  };

  const toggleVoiceAssistant = () => {
    setIsVoiceActive(prev => !prev);
    if (!isVoiceActive) {
      Alert.alert(
        'Voice Assistant Activated',
        'Voice assistant is now listening. Try saying:\n\n• "Find organic milk"\n• "Navigate to produce section"\n• "Show me today\'s offers"\n• "Add bread to my list"\n• "Start AR navigation"',
        [{ text: 'Got it!', onPress: () => {} }]
      );
    } else {
        Alert.alert('Voice Assistant Deactivated', 'Voice assistant is now off.');
    }
  };

  const toggleARNavigation = () => {
    setIsARActive(prev => !prev);
    if (!isARActive) {
      Alert.alert(
        'AR Navigation Activated',
        'Point your camera around the store to see interactive navigation overlays and product information in real-time!',
        [{ text: 'Amazing!', onPress: () => {} }]
      );
    } else {
        Alert.alert('AR Navigation Deactivated', 'AR navigation is now off.');
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      Alert.alert('Search Result', `Searching for: "${query.trim()}"`);
      setSearchQuery(''); // Clear search query after simulating search
      setOverlaySearchVisible(false); // Close the search overlay
      // In a real app, this would navigate to a search results page:
      // router.push(`/search-results?query=${query.trim()}`);
    } else {
      Alert.alert('Search', 'Please enter a search term.');
    }
  };

  const handleNotificationPress = () => {
    setHasNewNotifications(false);
    Alert.alert('Notifications', 'Navigating to your notifications!');
    // router.push('/notifications');
  };

  const handleCartPress = () => {
    Alert.alert('Shopping Cart', 'Navigating to your shopping cart with items ready for checkout!');
    // router.push('/cart');
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Start Shopping',
      description: 'Build your list & navigate',
      icon: ShoppingBag,
      color: colors.primary, // Google Blue
      action: () => Alert.alert('Shopping List', 'Taking you to your shopping list!'),
    },
    {
      id: '2',
      title: 'AR Navigation',
      description: 'Real-time in-store guidance',
      icon: Camera,
      color: colors.secondary, // Google Green
      action: toggleARNavigation,
    },
    {
      id: '3',
      title: 'Voice Assistant',
      description: isVoiceActive ? 'Voice is listening' : 'Activate voice commands',
      icon: isVoiceActive ? Mic : MicOff,
      color: isVoiceActive ? colors.error : colors.textSecondary, // Google Red or neutral
      action: toggleVoiceAssistant,
    },
    {
      id: '4',
      title: 'Today\'s Offers',
      description: `${storeStats.currentOffers} personalized deals`,
      icon: Star,
      color: colors.accent, // A distinct accent color, perhaps a Google Yellow/Orange
      action: () => Alert.alert('Offers', 'Showing you the best deals and personalized promotions!'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingVertical: 15,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    welcomeImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 10,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    welcomeText: {
      // No flex: 1 here
    },
    welcome: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
      fontFamily: 'Inter-ExtraBold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.error,
        borderRadius: 5,
        width: 10,
        height: 10,
        borderWidth: 1,
        borderColor: colors.background,
    },
    // Search Overlay Styles
    searchOverlay: {
        flex: 1,
        backgroundColor: colors.surface, // Background for the overlay
    },
    searchOverlayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    searchOverlayInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 2,
        marginRight: 10,
    },
    searchOverlayInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        marginLeft: 10,
        fontFamily: 'Inter-Regular',
        paddingVertical: 0,
    },
    closeButton: {
        padding: 8,
    },
    searchOverlayContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    searchSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 15,
        fontFamily: 'Inter-Bold',
    },
    recommendationChipContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingRight: 10, // Add some padding to the right for better scrolling
    },
    recommendationChip: {
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    recommendationChipText: {
        fontSize: 14,
        color: colors.text,
        fontFamily: 'Inter-Regular',
    },
    productCard: {
        width: 150, // Fixed width for horizontal scroll items
        marginRight: 15,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        paddingBottom: 10, // Padding at bottom for text
    },
    productImage: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        resizeMode: 'cover',
        marginBottom: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        fontFamily: 'Inter-SemiBold',
        paddingHorizontal: 10,
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 11,
        color: colors.textSecondary,
        fontFamily: 'Inter-Regular',
        paddingHorizontal: 10,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primary,
        fontFamily: 'Inter-Bold',
        paddingHorizontal: 10,
    },
    liveSearchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        paddingHorizontal: 10,
    },
    liveSearchResultImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 15,
        resizeMode: 'cover',
    },
    liveSearchResultTextContainer: {
        flex: 1,
    },
    liveSearchResultName: {
        fontSize: 16,
        color: colors.text,
        fontFamily: 'Inter-SemiBold',
    },
    liveSearchResultCategory: {
        fontSize: 13,
        color: colors.textSecondary,
        fontFamily: 'Inter-Regular',
    },
    locationCard: {
      backgroundColor: colors.background,
      marginHorizontal: 24,
      marginBottom: 24,
      padding: 24,
      borderRadius: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    locationTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 10,
      fontFamily: 'Inter-Bold',
    },
    locationText: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
      fontFamily: 'Inter-ExtraBold',
    },
    locationSubtext: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 5,
      fontFamily: 'Inter-Regular',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      paddingTop: 18,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: 5,
    },
    statValue: {
      fontSize: 19,
      fontWeight: '800',
      color: colors.text,
      fontFamily: 'Inter-ExtraBold',
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 3,
      textAlign: 'center',
      fontFamily: 'Inter-SemiBold',
    },
    section: {
      paddingHorizontal: 24,
      paddingVertical: 18,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 18,
      fontFamily: 'Inter-ExtraBold',
      textAlign: 'left',
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 14,
    },
    quickActionCard: {
      width: (width - 48 - 14) / 2,
      backgroundColor: colors.background,
      padding: 18,
      borderRadius: 18,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderColor: colors.border,
    },
    quickActionIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      backgroundColor: colors.primary + '10', // Subtle primary color background for icon
    },
    quickActionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 5,
      fontFamily: 'Inter-Bold',
    },
    quickActionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Inter-Regular',
      lineHeight: 18,
    },
    howItWorks: {
      gap: 16,
    },
    stepCard: {
      backgroundColor: colors.background,
      padding: 22,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    stepNumber: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
    },
    stepNumberText: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.white,
      fontFamily: 'Inter-ExtraBold',
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 5,
      fontFamily: 'Inter-Bold',
    },
    stepDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
      fontFamily: 'Inter-Regular',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 24,
        marginVertical: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=2' }}
              style={styles.welcomeImage}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcome}>Hello,</Text>
              <Text style={styles.title}>Sarah!</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setOverlaySearchVisible(true)} activeOpacity={0.7}>
                <Search size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress} activeOpacity={0.7}>
                <Bell size={24} color={colors.text} />
                {hasNewNotifications && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Moving Banner */}
        <MovingBanner items={bannerItems} autoPlay={true} duration={5000} />

        {/* Location Card */}
        <TouchableOpacity style={styles.locationCard} onPress={() => Alert.alert('Store Map', 'Opening interactive store map and current capacity details.')} activeOpacity={0.9}>
          <View style={styles.locationHeader}>
            <MapPin size={24} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.locationTitle}>Your Current Location</Text>
          </View>
          <Text style={styles.locationText}>{currentLocation}</Text>
          <Text style={styles.locationSubtext}>Walmart Supercenter - Store #1234</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TrendingUp size={18} color={colors.success} style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{storeStats.totalVisitors}</Text>
              <Text style={styles.statLabel}>Visitors Today</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={18} color={colors.warning} style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{storeStats.avgWaitTime}m</Text>
              <Text style={styles.statLabel}>Avg Wait Time</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={18} color={colors.info} style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{storeStats.popularSection}</Text>
              <Text style={styles.statLabel}>Popular Section</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        {/* For You, Sarah Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For You, Sarah</Text>
          {/* Recommended Deals */}
          <Text style={styles.searchSectionTitle}>Recommended Deals</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationChipContainer}>
            {personalizedRecommendations.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => Alert.alert('Product Detail', `Navigating to ${item.name} product page.`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recently Viewed Items */}
          <Text style={styles.searchSectionTitle}>Your Recently Viewed</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationChipContainer}>
            {recentlyViewedItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => Alert.alert('Product Detail', `Navigating to ${item.name} product page.`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.sectionDivider} />

        {/* Loyalty & Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Loyalty & Rewards</Text>
          <LoyaltyRewardsCard
            loyaltyData={loyaltyData}
            onViewRewards={() => Alert.alert('Loyalty Rewards', 'Accessing your detailed rewards dashboard.')}
          />
        </View>
        
        <View style={styles.sectionDivider} />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { borderColor: action.color + '30' }]}
                onPress={action.action}
                activeOpacity={0.8}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '10' }]}>
                  <action.icon size={30} color={action.color} strokeWidth={2.5} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* Store Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Store</Text>
          <ShopInfoCard
            shopInfo={shopInfo}
            onPress={() => Alert.alert('Store Details', 'Viewing comprehensive store information and services.')}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How This App Works</Text>
          <View style={styles.howItWorks}>
            <TouchableOpacity style={styles.stepCard} onPress={() => Alert.alert('Step 1 Info', 'Learn more about building and optimizing your shopping list.')} activeOpacity={0.8}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Build Your Shopping List</Text>
                <Text style={styles.stepDescription}>
                  Search and add products with smart suggestions and voice commands
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepCard} onPress={() => Alert.alert('Step 2 Info', 'Discover the power of Augmented Reality for in-store navigation.')} activeOpacity={0.8}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Experience AR Navigation</Text>
                <Text style={styles.stepDescription}>
                  Follow AR overlays and real-time directions with voice guidance
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepCard} onPress={() => Alert.alert('Step 3 Info', 'Maximize your savings and earn points with every purchase.')} activeOpacity={0.8}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Earn Rewards & Save</Text>
                <Text style={styles.stepDescription}>
                  Get personalized offers and earn loyalty points with gamified shopping
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* AR Navigation Overlay - Remains unchanged */}
      {isARActive && (
        <ARNavigationOverlay
          isActive={isARActive}
          destination="Produce Section"
          distance="45 feet"
          direction="straight"
          onToggleAR={toggleARNavigation}
          currentInstruction="Follow the path to fresh produce. Turn left at aisle 5."
        />
      )}

      {/* Search Modal/Overlay */}
      <Modal
        animationType="slide"
        transparent={true} // Make true for slide up effect
        visible={overlaySearchVisible}
        onRequestClose={() => setOverlaySearchVisible(false)}
      >
        <SafeAreaView style={styles.searchOverlay}>
          <View style={styles.searchOverlayHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setOverlaySearchVisible(false)}>
              <X size={28} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.searchOverlayInputContainer}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchOverlayInput}
                placeholder="What are you looking for today?"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearchSubmit(searchQuery)}
                returnKeyType="search"
                autoFocus={true} // Automatically focus on opening
              />
              <TouchableOpacity onPress={handleCartPress} activeOpacity={0.7}>
                <ShoppingCart size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleSearchSubmit(searchQuery)} activeOpacity={0.7}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600', fontFamily: 'Inter-SemiBold' }}>
                Search
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.searchOverlayContent}>
            {liveSearchResults.length > 0 && searchQuery.length > 1 ? (
              <View>
                <Text style={styles.searchSectionTitle}>Live Search Results</Text>
                {liveSearchResults.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.liveSearchResultItem}
                    onPress={() => handleSearchSubmit(item.name)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.image }} style={styles.liveSearchResultImage} />
                    <View style={styles.liveSearchResultTextContainer}>
                      <Text style={styles.liveSearchResultName}>{item.name}</Text>
                      <Text style={styles.liveSearchResultCategory}>{item.category} - {item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <>
                <Text style={styles.searchSectionTitle}>Personalized Recommendations</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationChipContainer}>
                  {personalizedRecommendations.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recommendationChip}
                      onPress={() => handleSearchSubmit(item.name)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recommendationChipText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.searchSectionTitle}>Popular Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationChipContainer}>
                  {['Produce', 'Dairy', 'Bakery', 'Electronics', 'Home Goods', 'Apparel', 'Meat', 'Seafood'].map((category, index) => (
                    <TouchableOpacity
                      key={index.toString()}
                      style={styles.recommendationChip}
                      onPress={() => handleSearchSubmit(category)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recommendationChipText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.searchSectionTitle}>Recent Searches</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationChipContainer}>
                  {/* You might want to manage actual recent searches in state */}
                  {['Organic Milk', 'Sourdough Bread', 'Fresh Bananas', 'Ground Beef', 'Bell Peppers'].map((recentSearch, index) => (
                    <TouchableOpacity
                      key={index.toString()}
                      style={styles.recommendationChip}
                      onPress={() => handleSearchSubmit(recentSearch)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recommendationChipText}>{recentSearch}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            <View style={{ height: 50 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}