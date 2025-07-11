// MapView.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Alert } from 'react-native';
import { MapPin, Navigation, Zap, Users, Clock, ArrowRight, Eye, Tag, Layout, ShoppingBag, DollarSign, Wifi, Info, AlignJustify, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

// Define an enum for traffic types for better type safety
export enum Traffic {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// Ensure this matches your StoreSection definition in MapScreen.tsx
export interface StoreSection {
  id: string;
  name: string;
  aisles: string[];
  color: string; // Base color for the section
  x: number;
  y: number;
  width: number;
  height: number;
  traffic: Traffic;
  estimatedTime: number; // in minutes
  items: string[]; // List of example items found in this section
  floor: number; // New: Floor level for the section
}

interface MapViewProps {
  currentLocation: { x: number; y: number };
  selectedDestination?: string | null;
  onSectionPress: (section: StoreSection) => void;
  navigationPath?: { x: number; y: number }[];
  isNavigating?: boolean;
  peopleLocations?: { id: string; x: number; y: number; floor: number }[]; // Added floor to peopleLocations
  shoppingCartItems?: string[]; // e.g., ['milk', 'bread']
  onStartARNavigation: (destinationSection: StoreSection) => void;
  currentFloor: number; // New prop: current active floor
  storeSections: StoreSection[]; // New prop: Pass all store sections from MapScreen
}

const { width: screenWidth } = Dimensions.get('window');
const mapContainerHeight = 350; // Fixed height for consistency
const mapContainerWidth = screenWidth * 0.95; // Increased width: 95% of screen width

export function MapView({
  currentLocation,
  selectedDestination,
  onSectionPress,
  navigationPath = [],
  isNavigating = false,
  peopleLocations = [],
  shoppingCartItems = [],
  onStartARNavigation,
  currentFloor, // Destructure currentFloor prop
  storeSections, // Destructure storeSections prop
}: MapViewProps) {
  const { colors } = useTheme();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pathAnimation = useRef(new Animated.Value(0)).current;

  // Map view options (now controlled by icon toggles)
  const [showPeople, setShowPeople] = useState(true);
  const [showSectionLabels, setShowSectionLabels] = useState(true);
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(true);
  const [showCartHighlights, setShowCartHighlights] = useState(true);
  const [showAisleNumbers, setShowAisleNumbers] = useState(true);
  const [showProductHotspots, setShowProductHotspots] = useState(false);

  useEffect(() => {
    // Pulsing animation for current location marker and traffic indicators
    const animatePulse = () => {
      pulseAnim.setValue(0);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animatePulse());
    };
    animatePulse();
  }, [pulseAnim]);

  useEffect(() => {
    if (isNavigating && navigationPath.length > 1) {
      pathAnimation.setValue(0);
      Animated.timing(pathAnimation, {
        toValue: 1,
        duration: navigationPath.length * 500, // Longer duration for visible path drawing
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    } else {
      pathAnimation.setValue(0);
    }
  }, [isNavigating, navigationPath, pathAnimation]);

  // Filter sections based on the current floor
  const visibleSections = useMemo(() => {
    return storeSections.filter(section => section.floor === currentFloor);
  }, [storeSections, currentFloor]); // Dependency on currentFloor

  // Filter people locations based on the current floor
  const visiblePeopleLocations = useMemo(() => {
      return peopleLocations.filter(person => person.floor === currentFloor);
  }, [peopleLocations, currentFloor]); // Dependency on currentFloor


  const getTrafficDetails = useCallback((traffic: Traffic) => {
    switch (traffic) {
      case Traffic.High:
        return { icon: <Users size={14} color={colors.white} />, label: 'High Traffic', color: colors.error };
      case Traffic.Medium:
        return { icon: <Clock size={14} color={colors.white} />, label: 'Medium Traffic', color: colors.warning };
      case Traffic.Low:
        return { icon: <Zap size={14} color={colors.white} />, label: 'Low Traffic', color: colors.success };
      default:
        return { icon: null, label: '', color: '' };
    }
  }, [colors]);

  const highlightSectionForCart = useCallback((section: StoreSection) => {
    return shoppingCartItems.some(cartItem =>
      section.items.some(sectionItem => sectionItem.toLowerCase().includes(cartItem.toLowerCase()))
    );
  }, [shoppingCartItems]);

  // Dummy product hotspots for visualization (updated with floor)
  const productHotspots = useMemo(() => ([
    { id: 'hotspot-1', x: 18, y: 25, name: 'Organic Apples', type: 'offer', icon: DollarSign, color: colors.accent, floor: 1 },
    { id: 'hotspot-2', x: 45, y: 20, name: 'Fresh Salmon', type: 'info', icon: Info, color: colors.info, floor: 1 },
    { id: 'hotspot-3', x: 80, y: 20, name: 'Local Milk', type: 'offer', icon: DollarSign, color: colors.accent, floor: 1 },
    { id: 'hotspot-4', x: 20, y: 50, name: 'Artisan Bread', type: 'info', icon: Info, color: colors.info, floor: 1 },
    // Floor 2 hotspots
    { id: 'hotspot-5', x: 25, y: 30, name: 'Summer Collection', type: 'offer', icon: DollarSign, color: colors.accent, floor: 2 },
    { id: 'hotspot-6', x: 50, y: 25, name: 'New Arrivals', type: 'info', icon: Info, color: colors.info, floor: 2 },
    // Floor 3 hotspots
    { id: 'hotspot-7', x: 40, y: 25, name: 'Combo Deals', type: 'offer', icon: DollarSign, color: colors.accent, floor: 3 },
    { id: 'hotspot-8', x: 25, y: 60, name: 'Arcade Specials', type: 'info', icon: Info, color: colors.info, floor: 3 },
    // Floor 4 hotspots
    { id: 'hotspot-9', x: 20, y: 25, name: 'Lost & Found', type: 'info', icon: Info, color: colors.info, floor: 4 },
  ]), [colors]);

  // Filter hotspots based on the current floor
  const visibleProductHotspots = useMemo(() => {
    return productHotspots.filter(hotspot => hotspot.floor === currentFloor);
  }, [productHotspots, currentFloor]);


  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 6,
    },
    mapGrid: {
      width: mapContainerWidth,
      height: mapContainerHeight,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.border,
      alignSelf: 'center',
    },
    storeBoundary: {
      position: 'absolute',
      top: '5%',
      left: '5%',
      width: '90%',
      height: '90%',
      borderWidth: 3,
      borderColor: colors.textTertiary,
      borderRadius: 10,
      borderStyle: 'dashed',
    },
    mainPathway: {
      position: 'absolute',
      backgroundColor: colors.background, // Lighter color for pathways
      borderRadius: 5,
      opacity: 0.8,
    },
    mapSection: {
      position: 'absolute',
      borderRadius: 8,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedSection: {
      borderWidth: 3,
      borderColor: colors.accent,
      transform: [{ scale: 1.05 }],
      shadowColor: colors.accent,
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },
    hoveredSection: {
      transform: [{ scale: 1.02 }],
      opacity: 0.9,
    },
    highlightedSection: {
      borderWidth: 2,
      borderColor: colors.accentLight,
      shadowColor: colors.accentLight,
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    sectionLabel: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    sectionAisles: {
      color: colors.white,
      fontSize: 9,
      textAlign: 'center',
      marginTop: 2,
      opacity: 0.8,
    },
    aisleNumber: {
      position: 'absolute',
      backgroundColor: colors.surface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.textSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      opacity: 0.9,
    },
    trafficIndicator: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    productHotspot: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.white,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    currentLocationMarker: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.white,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 8,
    },
    // Enhanced Person Marker with dynamic movement
    personMarker: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.secondaryLight,
      opacity: 0.7,
      borderWidth: 1,
      borderColor: colors.white,
    },
    navigationPathDot: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primaryLight,
      opacity: 0.8,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
      marginHorizontal: 10,
    },
    legendText: {
      marginLeft: 8,
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    sectionInfo: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionInfoTextContainer: {
      flex: 1,
      marginRight: 10,
    },
    sectionInfoTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    sectionInfoDetails: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    infoButtonsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    goButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    arButton: {
      backgroundColor: colors.secondary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      color: colors.white,
      fontWeight: 'bold',
      marginLeft: 5,
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 10,
      borderRadius: 12,
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    optionItem: {
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 10,
    },
    optionLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 4,
    },
    iconGlow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
    },
    // Styles for elevator/stairs
    floorTransitionArea: {
      position: 'absolute',
      width: '15%',
      height: '25%',
      backgroundColor: colors.accent + '30', // Light accent background
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.8,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
    },
    floorTransitionText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.accent,
      marginTop: 5,
    }
  }), [colors]);

  return (
    <View style={styles.container}>
      {/* Map View Options with Icon Glow */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionItem, showPeople && { backgroundColor: colors.primaryLight + '20' }]}
          onPress={() => setShowPeople(!showPeople)}
        >
          {showPeople ? (
            <Users size={20} color={colors.primary} style={styles.iconGlow} />
          ) : (
            <Users size={20} color={colors.textSecondary} />
          )}
          <Text style={[styles.optionLabel, { color: showPeople ? colors.primary : colors.textSecondary }]}>People</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, showSectionLabels && { backgroundColor: colors.primaryLight + '20' }]}
          onPress={() => setShowSectionLabels(!showSectionLabels)}
        >
          {showSectionLabels ? (
            <Tag size={20} color={colors.primary} style={styles.iconGlow} />
          ) : (
            <Tag size={20} color={colors.textSecondary} />
          )}
          <Text style={[styles.optionLabel, { color: showSectionLabels ? colors.primary : colors.textSecondary }]}>Labels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, showTrafficOverlay && { backgroundColor: colors.primaryLight + '20' }]}
          onPress={() => setShowTrafficOverlay(!showTrafficOverlay)}
        >
          {showTrafficOverlay ? (
            <Layout size={20} color={colors.primary} style={styles.iconGlow} />
          ) : (
            <Layout size={20} color={colors.textSecondary} />
          )}
          <Text style={[styles.optionLabel, { color: showTrafficOverlay ? colors.primary : colors.textSecondary }]}>Traffic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, showCartHighlights && { backgroundColor: colors.primaryLight + '20' }]}
          onPress={() => setShowCartHighlights(!showCartHighlights)}
        >
          {showCartHighlights ? (
            <ShoppingBag size={20} color={colors.primary} style={styles.iconGlow} />
          ) : (
            <ShoppingBag size={20} color={colors.textSecondary} />
          )}
          <Text style={[styles.optionLabel, { color: showCartHighlights ? colors.primary : colors.textSecondary }]}>Cart</Text>
        </TouchableOpacity>

        {/* New Layer: Aisle Numbers */}
        <TouchableOpacity
          style={[styles.optionItem, showAisleNumbers && { backgroundColor: colors.primaryLight + '20' }]}
          onPress={() => setShowAisleNumbers(!showAisleNumbers)}
        >
          {showAisleNumbers ? (
            <Info size={20} color={colors.primary} style={styles.iconGlow} />
          ) : (
            <Info size={20} color={colors.textSecondary} />
          )}
          <Text style={[styles.optionLabel, { color: showAisleNumbers ? colors.primary : colors.textSecondary }]}>Aisles</Text>
        </TouchableOpacity>

        {/* New Layer: Product Hotspots */}
        <TouchableOpacity
          style={[styles.optionItem, showProductHotspots && { backgroundColor: colors.primaryLight + '20' }]}
          onPress={() => setShowProductHotspots(!showProductHotspots)}
        >
          {showProductHotspots ? (
            <DollarSign size={20} color={colors.primary} style={styles.iconGlow} />
          ) : (
            <DollarSign size={20} color={colors.textSecondary} />
          )}
          <Text style={[styles.optionLabel, { color: showProductHotspots ? colors.primary : colors.textSecondary }]}>Deals</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.mapGrid}>
        {/* Store Boundary */}
        <View style={styles.storeBoundary} />

        {/* Main Pathways - Conceptual examples */}
        <View style={[styles.mainPathway, { top: '10%', left: '0%', width: '100%', height: '5%' }]} />
        <View style={[styles.mainPathway, { top: '35%', left: '0%', width: '100%', height: '5%' }]} />
        <View style={[styles.mainPathway, { top: '60%', left: '0%', width: '100%', height: '5%' }]} />
        <View style={[styles.mainPathway, { top: '0%', left: '30%', width: '5%', height: '100%' }]} />
        <View style={[styles.mainPathway, { top: '0%', left: '60%', width: '5%', height: '100%' }]} />

        {/* Elevator/Stairs Area - Conceptual */}
        {/* These areas are shown regardless of currentFloor, but their interaction could be specific */}
        <TouchableOpacity
          style={[styles.floorTransitionArea, { top: '70%', left: '10%' }]}
          onPress={() => Alert.alert('Floor Transition', `This is an elevator/stairwell. Current Floor: ${currentFloor}.`)}
        >
          <ArrowUpCircle size={24} color={colors.accent} />
          <ArrowDownCircle size={24} color={colors.accent} style={{ marginTop: -5 }} />
          <Text style={styles.floorTransitionText}>Elevator/Stairs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floorTransitionArea, { top: '70%', left: '75%' }]}
          onPress={() => Alert.alert('Floor Transition', `This is an escalator. Current Floor: ${currentFloor}.`)}
        >
          <ArrowUpCircle size={24} color={colors.accent} />
          <Text style={styles.floorTransitionText}>Escalator</Text>
        </TouchableOpacity>


        {/* Navigation Path - Animated Drawing */}
        {isNavigating && navigationPath.length > 1 && (
          navigationPath.map((point, index) => {
            // Ensure proper interpolation and no direct JS manipulation
            const interpolatedOpacity = pathAnimation.interpolate({
              inputRange: [0, index / navigationPath.length, (index + 1) / navigationPath.length, 1],
              outputRange: [0, 0, 1, 1],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={`path-${index}`}
                style={[
                  styles.navigationPathDot,
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    opacity: interpolatedOpacity,
                    transform: [{
                        scale: pulseAnim.interpolate({ // Using pulseAnim for a slight pulse on dots
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.8, 1.1, 0.8],
                        })
                    }]
                  }
                ]}
              />
            );
          })
        )}

        {/* Store Sections - Filtered by currentFloor */}
        {visibleSections.map((section) => {
          const trafficDetails = getTrafficDetails(section.traffic);
          const isHighlightedForCart = showCartHighlights && highlightSectionForCart(section);

          return (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.mapSection,
                { backgroundColor: showTrafficOverlay ? trafficDetails.color : section.color },
                {
                  left: `${section.x}%`,
                  top: `${section.y}%`,
                  width: `${section.width}%`,
                  height: `${section.height}%`,
                },
                selectedDestination === section.name && styles.selectedSection,
                hoveredSection === section.id && styles.hoveredSection,
                isHighlightedForCart && styles.highlightedSection,
                {
                  opacity: showTrafficOverlay ? pulseAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1, 0.8],
                  }) : 1, // Only animate opacity if traffic overlay is shown
                }
              ]}
              onPress={() => onSectionPress(section)}
              onPressIn={() => setHoveredSection(section.id)}
              onPressOut={() => setHoveredSection(null)}
              activeOpacity={0.7}
            >
              {showTrafficOverlay && (
                <View style={styles.trafficIndicator}>
                  {trafficDetails.icon}
                </View>
              )}

              {showSectionLabels && (
                <>
                  <Text style={styles.sectionLabel}>{section.name}</Text>
                  {showAisleNumbers && section.aisles.length > 0 && (
                      <Text style={styles.sectionAisles}>{section.aisles.join(', ')}</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Aisle Numbers (Detailed Layer) - Dynamically rendered for current floor */}
        {showAisleNumbers && visibleSections.map(section => (
            section.aisles.length > 0 && (
                <Text
                    key={`aisle-${section.id}`}
                    style={[
                        styles.aisleNumber,
                        {
                            left: `${section.x + section.width / 2 - 10}%`, // Center aisle number
                            top: `${section.y + section.height / 2 + 15}%`, // Below section label
                        }
                    ]}
                >
                    {section.aisles[0]} {/* Just show the first aisle number as an example */}
                </Text>
            )
        ))}


        {/* Product Hotspots (Detailed Layer) - Filtered by currentFloor */}
        {showProductHotspots && visibleProductHotspots.map(hotspot => (
          <TouchableOpacity
            key={hotspot.id}
            style={[styles.productHotspot, {
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              backgroundColor: hotspot.color + '80', // Semi-transparent
              transform: [{
                scale: pulseAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.9, 1.2, 0.9], // More pronounced pulse
                })
              }]
            }]}
            onPress={() => Alert.alert('Hotspot', `Special offer on ${hotspot.name}! Tap for details.`)}
          >
            <hotspot.icon size={16} color={colors.white} />
          </TouchableOpacity>
        ))}

        {/* Real-time People Markers (Conceptual) - Filtered by currentFloor */}
        {showPeople && visiblePeopleLocations.map((person) => (
          <Animated.View
            key={`person-${person.id}`}
            style={[
              styles.personMarker,
              {
                left: `${person.x}%`,
                top: `${person.y}%`,
                opacity: pulseAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 0.8, 0.5],
                }),
                // Add subtle random movement for more realism
                transform: [{
                    translateX: Animated.multiply(pulseAnim, 5).interpolate({
                        inputRange: [0, 1, 2, 3, 4, 5],
                        outputRange: [0, 2, -2, 3, -1, 0] // Random small movements
                    })
                }, {
                    translateY: Animated.multiply(pulseAnim, 5).interpolate({
                        inputRange: [0, 1, 2, 3, 4, 5],
                        outputRange: [0, -3, 1, -1, 2, 0]
                    })
                }]
              }
            ]}
          />
        ))}

        {/* Current Location Marker */}
        <Animated.View style={[
          styles.currentLocationMarker,
          {
            left: `${currentLocation.x}%`,
            top: `${currentLocation.y}%`,
            transform: [{
                scale: pulseAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.9, 1.1, 0.9],
                })
            }]
          }
        ]}>
          <MapPin size={20} color={colors.white} />
        </Animated.View>

        {/* Section Info Overlay (Dynamic & Interactive) */}
        {hoveredSection && (
          <View style={styles.sectionInfo}>
            {(() => {
              const section = storeSections.find(s => s.id === hoveredSection);
              const trafficInfo = section ? getTrafficDetails(section.traffic) : null;
              return section ? (
                <>
                  <View style={styles.sectionInfoTextContainer}>
                    <Text style={styles.sectionInfoTitle}>{section.name}</Text>
                    <Text style={styles.sectionInfoDetails}>
                      Aisles: {section.aisles.join(', ')} • Est. {section.estimatedTime} min walk • {trafficInfo?.label}
                      {section.floor && <Text> • Floor: {section.floor}</Text>}
                    </Text>
                    {showCartHighlights && highlightSectionForCart(section) && (
                        <Text style={[styles.sectionInfoDetails, { color: colors.accentLight, fontWeight: 'bold' }]}>
                            Contains items from your list!
                        </Text>
                    )}
                  </View>
                  <View style={styles.infoButtonsContainer}>
                    <TouchableOpacity
                      style={styles.goButton}
                      onPress={() => onSectionPress(section)}
                    >
                      <Navigation size={16} color={colors.white} />
                      <Text style={styles.buttonText}>Go</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.arButton}
                      onPress={() => onStartARNavigation(section)}
                    >
                      <Eye size={16} color={colors.white} />
                      <Text style={styles.buttonText}>AR</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null;
            })()}
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.legendText}>Your Location</Text>
        </View>
        <View style={styles.legendItem}>
          {getTrafficDetails(Traffic.High).icon}
          <Text style={styles.legendText}>High Traffic</Text>
        </View>
        <View style={styles.legendItem}>
          {getTrafficDetails(Traffic.Low).icon}
          <Text style={styles.legendText}>Quick Access</Text>
        </View>
        {showCartHighlights && shoppingCartItems.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.highlightedSection, { width: 16, height: 16, borderRadius: 4, marginVertical: 0 }]} />
            <Text style={styles.legendText}>Cart Items</Text>
          </View>
        )}
      </View>
    </View>
  );
}