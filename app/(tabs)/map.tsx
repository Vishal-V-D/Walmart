// map.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, MapPin, Users, Zap, Clock, ArrowRight, Compass, Route, Target, Camera, Globe, Accessibility, Store, Info, AlignJustify, LogIn, LogOut } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { MapView, StoreSection, Traffic } from '@/components/MapView'; // Ensure correct import path
import { NavigationCard } from '@/components/NavigationCard';
import { ARNavigationOverlay } from '@/components/ARNavigationOverlay';

interface NavigationStep {
  id: string;
  instruction: string;
  location: string;
  estimatedTime: number; // in seconds for better simulation
  distance?: string;
  direction?: 'straight' | 'left' | 'right' | 'up' | 'down';
  floor?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function MapScreen() {
  const { colors } = useTheme();
  const [currentLocation, setCurrentLocation] = useState({ x: 50, y: 85 });
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navigationPath, setNavigationPath] = useState<{ x: number; y: number }[]>([]);
  const [currentFloor, setCurrentFloor] = useState(1); // Default to Floor 1

  const [language, setLanguage] = useState('English');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const shoppingCartItems = ['milk', 'bread', 'salmon', 'shirts', 'toy car', 'book'];

  const navigationIntervalRef = useRef<number | null>(null);
  const locationUpdateIntervalRef = useRef<number | null>(null);

  // Animated value for floor selector underline
  const floorUnderlineAnim = useRef(new Animated.Value(0)).current;

  const allStoreSections: StoreSection[] = [
    // Floor 1: Groceries, Essentials
    { id: '1', name: 'Produce', aisles: ['A15', 'A16'], color: colors.success, x: 10, y: 15, width: 25, height: 20, traffic: Traffic.Medium, estimatedTime: 5, items: ['Apples', 'Bananas', 'Spinach'], floor: 1 },
    { id: '2', name: 'Meat & Seafood', 'aisles': ['A6', 'A7'], color: colors.error, x: 40, y: 15, width: 25, height: 20, traffic: Traffic.High, estimatedTime: 7, items: ['Chicken', 'Salmon'], floor: 1 },
    { id: '3', name: 'Dairy', aisles: ['A12', 'A13'], color: colors.info, x: 70, y: 15, width: 25, height: 20, traffic: Traffic.Low, estimatedTime: 3, items: ['Milk', 'Cheese'], floor: 1 },
    { id: '4', name: 'Bakery', aisles: ['A8', 'A9'], color: colors.warning, x: 10, y: 40, width: 25, height: 20, traffic: Traffic.Medium, estimatedTime: 4, items: ['Bread', 'Cakes'], floor: 1 },
    { id: '5', 'name': 'Frozen Foods', aisles: ['A10', 'A11'], color: colors.primaryDark, x: 40, y: 40, width: 25, height: 20, traffic: Traffic.Low, estimatedTime: 4, items: ['Ice Cream', 'Pizza'], floor: 1 },
    { id: '6', name: 'Pantry & Canned', aisles: ['A1-A5'], color: colors.textSecondary, x: 70, y: 40, width: 25, height: 20, traffic: Traffic.High, estimatedTime: 10, items: ['Pasta', 'Rice'], floor: 1 },
    { id: '7', name: 'Pharmacy', aisles: ['PH1'], color: colors.error, x: 10, y: 70, width: 20, height: 15, traffic: Traffic.Low, estimatedTime: 2, items: ['Medicine'], floor: 1 },
    { id: '8', name: 'Electronics', aisles: ['E1', 'E2'], color: colors.black, x: 35, y: 70, width: 25, height: 15, traffic: Traffic.Medium, estimatedTime: 6, items: ['Headphones'], floor: 1 },
    { id: '9', name: 'Checkout', aisles: ['CH1-CH8'], color: colors.secondary, x: 65, y: 70, width: 30, height: 15, traffic: Traffic.High, estimatedTime: 15, items: [], floor: 1 },

    // Floor 2: Apparel, Home Goods, Books, Toys
    { id: '10', name: 'Apparel', aisles: ['CL1-CL5'], color: colors.info, x: 10, y: 15, width: 25, height: 20, traffic: Traffic.Medium, estimatedTime: 8, items: ['Shirts', 'Pants', 'Dresses'], floor: 2 },
    { id: '11', name: 'Home Goods', aisles: ['HG1-HG4'], color: colors.warning, x: 40, y: 15, width: 25, height: 20, traffic: Traffic.Low, estimatedTime: 12, items: ['Cookware', 'Bedding'], floor: 2 },
    { id: '12', name: 'Books & Media', aisles: ['BM1-BM3'], color: colors.success, x: 70, y: 15, width: 25, height: 20, traffic: Traffic.Low, estimatedTime: 6, items: ['Novels', 'DVDs'], floor: 2 },
    { id: '13', name: 'Toys', aisles: ['TY1-TY2'], color: colors.error, x: 10, y: 40, width: 25, height: 20, traffic: Traffic.High, estimatedTime: 9, items: ['Action Figures', 'Board Games', 'toy car'], floor: 2 },
    { id: '14', name: 'Sporting Goods', aisles: ['SP1-SP3'], color: colors.primaryDark, x: 40, y: 40, width: 25, height: 20, traffic: Traffic.Medium, estimatedTime: 7, items: ['Bikes', 'Weights'], floor: 2 },
    { id: '15', name: 'Pet Supplies', aisles: ['PT1-PT2'], color: colors.textSecondary, x: 70, y: 40, width: 25, height: 20, traffic: Traffic.Low, estimatedTime: 5, items: ['Dog Food', 'Cat Toys'], floor: 2 },

    // Floor 3: Food Court, Entertainment
    { id: '16', name: 'Food Court', aisles: ['FC1-FC5'], color: colors.accent, x: 10, y: 15, width: 80, height: 30, traffic: Traffic.High, estimatedTime: 15, items: ['Pizza', 'Burgers', 'Sushi'], floor: 3 },
    { id: '17', name: 'Arcade', aisles: ['AR1-AR3'], color: colors.info, x: 10, y: 50, width: 40, height: 25, traffic: Traffic.Medium, estimatedTime: 20, items: ['Games', 'Prizes'], floor: 3 },
    { id: '18', name: 'Cinema', aisles: ['CM1-CM2'], color: colors.error, x: 55, y: 50, width: 35, height: 25, traffic: Traffic.High, estimatedTime: 30, items: ['Movies', 'Popcorn'], floor: 3 },

    // Floor 4: Services, Offices
    { id: '19', name: 'Customer Service', aisles: ['CS1'], color: colors.success, x: 10, y: 15, width: 30, height: 20, traffic: Traffic.Low, estimatedTime: 5, items: [], floor: 4 },
    { id: '20', name: 'Mall Management', aisles: ['MM1'], color: colors.warning, x: 50, y: 15, width: 30, height: 20, traffic: Traffic.Low, estimatedTime: 5, items: [], floor: 4 },
    { id: '21', name: 'Restrooms', aisles: ['RS1'], color: colors.textSecondary, x: 10, y: 40, width: 20, height: 15, traffic: Traffic.Medium, estimatedTime: 2, items: [], floor: 4 },
  ];

  // Dummy people locations (filtered by floor)
  const allPeopleLocations = [
    { id: 'p1', x: 20, y: 25, floor: 1 },
    { id: 'p2', x: 55, y: 30, floor: 1 },
    { id: 'p3', x: 80, y: 60, floor: 1 },
    { id: 'p4', x: 15, y: 50, floor: 2 },
    { id: 'p5', x: 45, y: 20, floor: 2 },
    { id: 'p6', x: 70, y: 40, floor: 3 },
    { id: 'p7', x: 30, y: 25, floor: 4 },
  ];

  const availableFloors = Array.from(new Set(allStoreSections.map(section => section.floor))).sort((a, b) => a - b);

  // --- Floor Selector Animation Logic ---
  const floorButtonWidth = (screenWidth * 0.95 - 16) / availableFloors.length; // Adjusted for padding in floorSelector
  useEffect(() => {
    const floorIndex = availableFloors.indexOf(currentFloor);
    Animated.timing(floorUnderlineAnim, {
      toValue: floorIndex * floorButtonWidth,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [currentFloor, availableFloors, floorButtonWidth, floorUnderlineAnim]);


  // --- Navigation Logic ---
  const generateNavigation = (destination: string, section: StoreSection) => {
    const startPoint = currentLocation;
    const endPoint = { x: section.x + section.width / 2, y: section.y + section.height / 2 };

    const path: { x: number; y: number }[] = [];
    const steps: NavigationStep[] = [];

    path.push(startPoint);
    steps.push({
      id: '0',
      instruction: 'Starting navigation from your current location.',
      location: `Current Spot (Floor ${currentFloor})`,
      estimatedTime: 2,
      distance: '0 feet',
      direction: 'straight',
      floor: currentFloor,
    });

    // Handle multi-floor transition
    if (currentFloor !== section.floor) {
      // Path to nearest elevator/escalator on current floor
      const transitionPointCurrentFloor = { x: 15, y: 75 }; // Example elevator location on any floor
      path.push(transitionPointCurrentFloor);
      steps.push({
        id: 'floor-transition-start',
        instruction: `Proceed to the elevator/escalator for Floor ${section.floor}.`,
        location: `Elevator/Escalator (Floor ${currentFloor})`,
        estimatedTime: 10,
        distance: '50 feet',
        direction: (currentFloor < section.floor) ? 'up' : 'down',
        floor: currentFloor,
      });

      // It's crucial to update the currentFloor state *before* the next path segment starts
      // to ensure MapView renders the correct floor.
      setCurrentFloor(section.floor); // <--- Floor change happens here during navigation!
      setCurrentLocation({ x: 15, y: 75 }); // User is now at elevator on the new floor


      // Path from elevator/escalator on new floor
      const transitionPointNewFloor = { x: 15, y: 75 }; // Elevator location on the new floor
      path.push(transitionPointNewFloor);
      steps.push({
        id: 'floor-transition-end',
        instruction: `You are now on Floor ${section.floor}. Exit the elevator/escalator.`,
        location: `Elevator/Escalator (Floor ${section.floor})`,
        estimatedTime: 5,
        distance: '10 feet',
        direction: 'straight',
        floor: section.floor,
      });
    }

    // Path segments on the target floor (more dynamic simulation)
    const lastPathPoint = path[path.length - 1];
    path.push(
      { x: lastPathPoint.x, y: endPoint.y - 10 }, // Move vertically towards target row, slightly before
      { x: endPoint.x - 10, y: endPoint.y - 10 }, // Move horizontally, slightly before
      { x: endPoint.x, y: endPoint.y }            // Arrive at the destination
    );

    steps.push(
      {
        id: '1',
        instruction: accessibilityMode
          ? `Audio guidance: Navigate through the main corridor.`
          : 'Navigate through the main corridor',
        location: `Main Corridor (Floor ${section.floor})`,
        estimatedTime: 5,
        distance: '50 feet',
        direction: 'straight',
        floor: section.floor,
      },
      {
        id: '2',
        instruction: accessibilityMode
          ? `Audio guidance: Turn ${endPoint.x > lastPathPoint.x ? 'right' : 'left'} into the aisle towards ${destination} section.`
          : `Turn ${endPoint.x > lastPathPoint.x ? 'right' : 'left'} into the aisle towards ${destination} section`,
        location: `Aisle Intersection (Floor ${section.floor})`,
        estimatedTime: 7,
        distance: '75 feet',
        direction: endPoint.x > lastPathPoint.x ? 'right' : 'left',
        floor: section.floor,
      },
      {
        id: '3',
        instruction: accessibilityMode
          ? `Audio guidance: Continue straight to ${destination}.`
          : `Continue straight to ${destination}`,
        location: `Aisle ${section.aisles[0]} Area (Floor ${section.floor})`,
        estimatedTime: 4,
        distance: '40 feet',
        direction: 'straight',
        floor: section.floor,
      },
      {
        id: '4',
        instruction: accessibilityMode
          ? `Audio guidance: You have arrived at ${destination}.`
          : `You've arrived at ${destination}`,
        location: destination,
        estimatedTime: 0,
        distance: '0 feet',
        direction: 'straight',
        floor: section.floor,
      },
    );


    setNavigationSteps(steps);
    setNavigationPath(path);
    setIsNavigating(true);
    setCurrentStepIndex(0);

    // Clear any existing intervals
    if (navigationIntervalRef.current) clearInterval(navigationIntervalRef.current);
    if (locationUpdateIntervalRef.current) clearInterval(locationUpdateIntervalRef.current);


    let currentPathIndex = 0;
    const totalPathSegments = path.length - 1;
    const segmentDuration = 2000; // Time to traverse one segment for simulation (in ms)

    // Simulate location updates along the path
    locationUpdateIntervalRef.current = setInterval(() => {
        if (currentPathIndex < totalPathSegments) {
            const start = path[currentPathIndex];
            const end = path[currentPathIndex + 1];

            const startTime = Date.now();
            const animateLocation = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / segmentDuration, 1);

                setCurrentLocation({
                    x: start.x + (end.x - start.x) * progress,
                    y: start.y + (end.y - start.y) * progress,
                });

                if (progress < 1) {
                    requestAnimationFrame(animateLocation);
                } else {
                    currentPathIndex++;
                    if (currentPathIndex === totalPathSegments) {
                        if (locationUpdateIntervalRef.current) {
                            clearInterval(locationUpdateIntervalRef.current);
                            locationUpdateIntervalRef.current = null;
                        }
                        setCurrentLocation(endPoint); // Ensure final location is exact
                    }
                }
            };
            requestAnimationFrame(animateLocation);
        } else {
            // Once all path segments are traversed, then check if navigation steps are also complete
            if (currentStepIndex >= steps.length -1) { // Check if steps are also done
                stopNavigation(); // End navigation only when both path and steps are complete
            }
        }
    }, segmentDuration);

    // Simulate step progression for NavigationCard
    navigationIntervalRef.current = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          if (navigationIntervalRef.current) {
            clearInterval(navigationIntervalRef.current);
            navigationIntervalRef.current = null;
          }
          // If steps are finished, and location update is also done, stop navigation
          if (locationUpdateIntervalRef.current === null) {
              stopNavigation();
          }
          return prev;
        }
      });
    }, 3000);
  };

  const handleSectionPress = (section: StoreSection) => {
    setSelectedDestination(section.name);

    const trafficText = accessibilityMode
      ? `Traffic level is ${section.traffic}. This means ${section.traffic === Traffic.High ? 'many people are in this area' : section.traffic === Traffic.Medium ? 'moderate crowd levels' : 'few people in this area'}.`
      : `Traffic level: ${section.traffic}`;

    Alert.alert(
      'Navigate to Section',
      `Start smart navigation to ${section.name} on Floor ${section.floor}?\n\nEstimated time: ${section.estimatedTime} minutes\n${trafficText}\nAisles: ${section.aisles.join(', ')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Navigation',
          onPress: () => generateNavigation(section.name, section),
          style: 'default'
        },
        {
          text: 'AR Navigation',
          onPress: () => {
            generateNavigation(section.name, section);
            setIsARActive(true);
          },
          style: 'default'
        },
      ]
    );
  };

  const stopNavigation = () => {
    if (navigationIntervalRef.current) {
      clearInterval(navigationIntervalRef.current);
      navigationIntervalRef.current = null;
    }
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
      locationUpdateIntervalRef.current = null;
    }
    setIsNavigating(false);
    setIsARActive(false);
    setNavigationSteps([]);
    setSelectedDestination(null);
    setCurrentStepIndex(0);
    setNavigationPath([]);
    // Reset location and floor to a default entry point after navigation stops
    setCurrentLocation({ x: 50, y: 85 });
    // setCurrentFloor(1); // Optional: if you want to always reset to floor 1 after navigation
  };

  const toggleLanguage = () => {
    const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
    Alert.alert('Language Changed', `Interface language changed to ${languages[nextIndex]}`);
  };

  const toggleAccessibility = () => {
    setAccessibilityMode(!accessibilityMode);
    Alert.alert(
      'Accessibility Mode',
      accessibilityMode
        ? 'Accessibility mode disabled'
        : 'Accessibility mode enabled. Enhanced voice guidance and audio descriptions are now active.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    return () => {
      if (navigationIntervalRef.current) {
        clearInterval(navigationIntervalRef.current);
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, []);

  const totalTime = navigationSteps.reduce((sum, step) => sum + step.estimatedTime, 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 24,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: Platform.OS === 'android' ? 40 : 24,
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
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    accessibilityButton: {
      backgroundColor: accessibilityMode ? colors.secondary : colors.surfaceVariant,
      borderWidth: 1,
      borderColor: accessibilityMode ? colors.secondary : colors.border,
    },
    languageButton: {
      backgroundColor: colors.accent,
    },
    recenterButton: {
      backgroundColor: colors.primary,
    },
    headerButtonText: {
      color: colors.white,
      fontWeight: '700',
      marginLeft: 6,
    },
    accessibilityButtonText: {
      color: accessibilityMode ? colors.white : colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    mapContainer: {
      marginBottom: 20,
      marginHorizontal: screenWidth * 0.025,
    },
    quickNavigation: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    quickNavTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    quickNavGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    quickNavItem: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      flexBasis: '48%',
      justifyContent: 'center',
    },
    quickNavText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    storeInfo: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    storeInfoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    infoCard: {
      width: '48%',
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      textAlign: 'center',
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    arToggleButton: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      marginBottom: 20,
      alignSelf: 'center',
      width: '80%',
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    arToggleText: {
      color: colors.white,
      fontWeight: '700',
      marginLeft: 10,
      fontSize: 16,
    },
    floorSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 15,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 2,
      position: 'relative',
      overflow: 'hidden',
    },
    floorButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: 'transparent', // Make background transparent for underline effect
      borderWidth: 0, // No border on the button itself
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    floorButtonActive: {
      // The active visual is now handled by the Animated.View underline
    },
    floorButtonText: {
      color: colors.textSecondary, // Default text color
      fontWeight: '600',
      fontSize: 15,
      zIndex: 2, // Ensure text is above underline
    },
    floorButtonTextActive: {
      color: colors.primary, // Active text color
    },
    floorUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 4,
      backgroundColor: colors.primary,
      borderRadius: 2,
      // width will be set dynamically via floorButtonWidth
      zIndex: 1,
    }
  });

  const quickNavItems = [
    { name: 'Produce', icon: AlignJustify, sectionId: '1' },
    { name: 'Dairy', icon: AlignJustify, sectionId: '3' },
    { name: 'Meat & Seafood', icon: AlignJustify, sectionId: '2' },
    { name: 'Checkout', icon: AlignJustify, sectionId: '9' },
    { name: 'Apparel', icon: AlignJustify, sectionId: '10' },
    { name: 'Home Goods', icon: AlignJustify, sectionId: '11' },
    { name: 'Food Court', icon: AlignJustify, sectionId: '16' },
    { name: 'Cinema', icon: AlignJustify, sectionId: '18' },
    { name: 'Customer Service', icon: AlignJustify, sectionId: '19' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>AR Store Map</Text>
            <Text style={styles.subtitle}>Interactive Navigation System</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, styles.accessibilityButton]}
              onPress={toggleAccessibility}>
              <Accessibility size={16} color={accessibilityMode ? colors.white : colors.text} />
              <Text style={styles.headerButtonText}>A11y</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerButton, styles.languageButton]}
              onPress={toggleLanguage}>
              <Globe size={16} color={colors.white} />
              <Text style={styles.headerButtonText}>{language.slice(0, 2)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.headerButton, styles.recenterButton]} onPress={() => setCurrentLocation({ x: 50, y: 85 })}>
              <Compass size={16} color={colors.white} />
              <Text style={styles.headerButtonText}>Recenter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <NavigationCard
          isActive={isNavigating}
          destination={selectedDestination || ''}
          steps={navigationSteps}
          currentStep={currentStepIndex}
          onStop={stopNavigation}
          totalTime={totalTime}
          totalDistance="~165 feet"
        />

        {/* Floor Selector - Enhanced UI with Animated Underline */}
        <View style={styles.floorSelector}>
          <Animated.View style={[styles.floorUnderline, { width: floorButtonWidth, transform: [{ translateX: floorUnderlineAnim }] }]} />
          {availableFloors.map((floorNum) => (
            <TouchableOpacity
              key={`floor-${floorNum}`}
              style={styles.floorButton} // No active background on button itself
              onPress={() => {
                setCurrentFloor(floorNum);
                setCurrentLocation({ x: 50, y: 85 }); // Reset location to default entry for new floor
                stopNavigation(); // Stop any active navigation when changing floors
              }}
            >
              <Text style={[
                styles.floorButtonText,
                currentFloor === floorNum && styles.floorButtonTextActive,
              ]}>
                Floor {floorNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mapContainer}>
          <MapView
            currentLocation={currentLocation}
            selectedDestination={selectedDestination}
            onSectionPress={handleSectionPress}
            navigationPath={navigationPath}
            isNavigating={isNavigating}
            shoppingCartItems={shoppingCartItems}
            onStartARNavigation={(section) => {
                generateNavigation(section.name, section);
                setIsARActive(true);
            }}
            currentFloor={currentFloor} // Pass the current floor to MapView
            storeSections={allStoreSections} // Pass the complete sections data
            peopleLocations={allPeopleLocations} // Pass all people locations
          />
        </View>

        <TouchableOpacity
          style={styles.arToggleButton}
          onPress={() => setIsARActive(!isARActive)}>
          <Camera size={20} color={colors.white} />
          <Text style={styles.arToggleText}>
            {isARActive ? 'Exit AR Mode' : 'Enable AR Navigation'}
          </Text>
        </TouchableOpacity>

        <View style={styles.quickNavigation}>
          <Text style={styles.quickNavTitle}>Quick Navigation</Text>
          <View style={styles.quickNavGrid}>
            {quickNavItems.map((item) => {
              const section = allStoreSections.find(s => s.id === item.sectionId);
              if (!section) return null;

              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.quickNavItem}
                  onPress={() => handleSectionPress(section)}
                >
                  <item.icon size={16} color={colors.primary} />
                  <Text style={styles.quickNavText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.storeInfo}>
          <Text style={styles.storeInfoTitle}>Store Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Store size={20} color={colors.white} />
              </View>
              <Text style={styles.infoLabel}>Store Size</Text>
              <Text style={styles.infoValue}>180,000 sq ft</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Route size={20} color={colors.white} />
              </View>
              <Text style={styles.infoLabel}>Total Aisles</Text>
              <Text style={styles.infoValue}>16 Aisles</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <AlignJustify size={20} color={colors.white} />
              </View>
              <Text style={styles.infoLabel}>Departments</Text>
              <Text style={styles.infoValue}>9 Sections</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Users size={20} color={colors.white} />
              </View>
              <Text style={styles.infoLabel}>Checkout Lanes</Text>
              <Text style={styles.infoValue}>8 Active</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {isARActive && (
        <ARNavigationOverlay
          isActive={isARActive}
          destination={selectedDestination || "Your Destination"}
          distance={navigationSteps[currentStepIndex]?.distance || "N/A"}
          direction={navigationSteps[currentStepIndex]?.direction || "straight"}
          onToggleAR={() => setIsARActive(false)}
          currentInstruction={navigationSteps[currentStepIndex]?.instruction || "Follow the path."}
        />
      )}
    </SafeAreaView>
  );
}