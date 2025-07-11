// ARNavigationOverlay.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Camera, Navigation, Target, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lightbulb, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface ARNavigationProps {
  isActive: boolean;
  destination: string;
  distance: string;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down';
  onToggleAR: () => void;
  currentInstruction: string; // New prop for dynamic instruction
}

export function ARNavigationOverlay({
  isActive,
  destination,
  distance,
  direction,
  onToggleAR,
  currentInstruction, // Destructure new prop
}: ARNavigationProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current; // For direction icon
  const instructionFadeAnim = useRef(new Animated.Value(0)).current; // For instruction fade-in/out
  const arObjectFloatAnim = useRef(new Animated.Value(0)).current; // For floating AR elements
  const distancePulseAnim = useRef(new Animated.Value(1)).current; // For distance text pulse

  useEffect(() => {
    if (isActive) {
      // Pulse animation for direction icon
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Fade in the instruction
      Animated.timing(instructionFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Floating animation for AR object
      const float = Animated.loop(
        Animated.sequence([
          Animated.timing(arObjectFloatAnim, {
            toValue: 1,
            duration: 4000, // Slower float
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(arObjectFloatAnim, {
            toValue: 0,
            duration: 4000, // Slower float
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      float.start();

      // Distance text pulse
      const distancePulse = Animated.loop(
        Animated.sequence([
          Animated.timing(distancePulseAnim, {
            toValue: 1.05,
            duration: 700,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(distancePulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      distancePulse.start();

      return () => {
        pulse.stop();
        float.stop();
        distancePulse.stop();
        instructionFadeAnim.setValue(0); // Reset fade anim on unmount/deactivation
        pulseAnim.setValue(1);
        arObjectFloatAnim.setValue(0);
        distancePulseAnim.setValue(1);
      };
    } else {
      // If AR is no longer active, fade out the instruction
      Animated.timing(instructionFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, pulseAnim, instructionFadeAnim, arObjectFloatAnim, distancePulseAnim]);

  const getDirectionIcon = () => {
    switch (direction) {
      case 'left':
        return <ArrowLeft size={38} color={colors.white} strokeWidth={3} />;
      case 'right':
        return <ArrowRight size={38} color={colors.white} strokeWidth={3} />;
      case 'up': // For multi-floor navigation (e.g., escalator/elevator)
        return <ArrowUp size={38} color={colors.white} strokeWidth={3} />;
      case 'down': // For multi-floor navigation (e.g., escalator/elevator)
        return <ArrowDown size={38} color={colors.white} strokeWidth={3} />;
      default: // 'straight' or unhandled
        return <ArrowUp size={38} color={colors.white} strokeWidth={3} />;
    }
  };

  const getEnhancedInstruction = () => {
    let prefix = '';
    let suffix = '';

    switch (direction) {
      case 'left':
        prefix = 'Turn left ahead: ';
        break;
      case 'right':
        prefix = 'Turn right ahead: ';
        break;
      case 'up':
        prefix = 'Go up to the next floor: ';
        break;
      case 'down':
        prefix = 'Go down to the floor below: ';
        break;
      case 'straight':
      default:
        prefix = 'Continue straight: ';
        break;
    }

    // Add a slight emphasis on distance if close
    if (parseFloat(distance) < 20 && !isNaN(parseFloat(distance))) {
      suffix = ' - You are almost there!';
    } else if (parseFloat(distance) < 50 && !isNaN(parseFloat(distance))) {
      suffix = ' - Stay on track!';
    }
    
    return `${prefix}${currentInstruction}${suffix}`;
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', // Slightly darker for more contrast
      justifyContent: 'center',
      alignItems: 'center',
      // Conceptual: In a real AR app, this background would be the live camera feed.
      // You'd use a library like 'expo-camera' or 'react-native-camera' to display it.
    },
    arOverlay: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
      width: '100%', // Ensure it takes full width
    },
    topControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    arButton: { // This button is conceptually for toggling AR *from* the map, not within the AR overlay
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
    },
    arButtonText: {
      color: colors.white,
      fontWeight: '700',
      marginLeft: 8,
    },
    closeButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 12,
      borderRadius: 20,
    },
    centerNavigation: {
      alignItems: 'center',
      flex: 1, // Allow it to take available vertical space
      justifyContent: 'center', // Center content vertically
    },
    directionIndicator: {
      width: 140, // Slightly larger
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 25, // More space
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 }, // More pronounced shadow
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 3, // Add a border for extra visual
      borderColor: colors.primaryLight,
    },
    destinationInfo: {
      backgroundColor: 'rgba(0,0,0,0.8)', // Darker background
      paddingHorizontal: 28, // Larger padding
      paddingVertical: 18,
      borderRadius: 25, // More rounded
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.primary, // Glow effect
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 8,
    },
    destinationText: {
      color: colors.white,
      fontSize: 22, // Larger font
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 10, // More space
    },
    distanceText: {
      color: colors.white,
      fontSize: 18, // Larger font
      opacity: 0.9,
    },
    currentInstructionText: {
      color: colors.white,
      fontSize: 20, // Larger and bolder
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 30, // More space
      paddingHorizontal: 20,
      lineHeight: 28, // Better readability
      textShadowColor: 'rgba(0,0,0,0.5)', // Text shadow for depth
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    bottomControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    controlButton: {
      backgroundColor: 'rgba(255,255,255,0.15)', // Lighter background
      padding: 18, // Larger padding
      borderRadius: 25, // More rounded
      alignItems: 'center',
      minWidth: 90, // Wider buttons
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    controlButtonText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 6, // More space
    },
    arIndicator: {
      position: 'absolute',
      top: 100,
      right: 20,
      backgroundColor: colors.error,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5,
    },
    arIndicatorText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
    // New: Floating AR elements for visual flair
    arFloatingElement: {
      position: 'absolute', // Keep position absolute for initial placement
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent + '60', // Semi-transparent accent
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accentLight,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 10,
      elevation: 6,
    }
  });

  if (!isActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.arOverlay}>
        <View style={styles.topControls}>
          <View style={styles.arIndicator}>
            <Text style={styles.arIndicatorText}>AR LIVE</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onToggleAR}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerNavigation}>
          <Animated.View
            style={[
              styles.directionIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}>
            {getDirectionIcon()}
          </Animated.View>

          <View style={styles.destinationInfo}>
            <Text style={styles.destinationText}>{destination}</Text>
            <Animated.Text style={[styles.distanceText, { transform: [{ scale: distancePulseAnim }] }]}>
              {distance} away
            </Animated.Text>
          </View>

          <Animated.Text style={[styles.currentInstructionText, { opacity: instructionFadeAnim }]}>
            {getEnhancedInstruction()}
          </Animated.Text>
        </View>

        {/* New: Animated Floating AR Elements */}
        <Animated.View
          style={[
            styles.arFloatingElement,
            {
              // Using initial positioning
              top: '15%',
              left: '5%',
              // Animating transforms instead of position properties
              transform: [
                {
                  translateY: arObjectFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 30], // Float up and down by 30px
                  }),
                },
                {
                  translateX: arObjectFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20], // Float side to side by 20px
                  }),
                },
                {
                  rotate: arObjectFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'], // Spin
                  }),
                },
              ],
              opacity: arObjectFloatAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.6, 1, 0.6], // Fade in and out
              }),
            },
          ]}
        >
          <Lightbulb size={24} color={colors.white} />
        </Animated.View>
        <Animated.View
          style={[
            styles.arFloatingElement,
            {
              // Using initial positioning
              bottom: '10%',
              right: '8%',
              width: 30, // Smaller element
              height: 30,
              borderRadius: 15,
              backgroundColor: colors.info + '60',
              // Animating transforms instead of position properties
              transform: [
                {
                  translateY: arObjectFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -25], // Float up and down by -25px (opposite direction)
                  }),
                },
                {
                  translateX: arObjectFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -15], // Float side to side by -15px
                  }),
                },
                {
                  rotate: arObjectFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['360deg', '0deg'], // Spin reverse
                  }),
                },
              ],
              opacity: arObjectFloatAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 0.9, 0.5],
              }),
            },
          ]}
        >
          <TrendingUp size={18} color={colors.white} />
        </Animated.View>


        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Target size={26} color={colors.white} />
            <Text style={styles.controlButtonText}>Recenter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Zap size={26} color={colors.white} />
            <Text style={styles.controlButtonText}>Quick Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={onToggleAR}>
            <Navigation size={26} color={colors.white} />
            <Text style={styles.controlButtonText}>Map View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}