import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Navigation, Clock, ArrowRight, X, MapPin } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface NavigationStep {
  id: string;
  instruction: string;
  location: string;
  estimatedTime: number;
  distance?: string;
  direction?: 'straight' | 'left' | 'right' | 'up' | 'down'; // Corrected: Added 'up' and 'down'
}

interface NavigationCardProps {
  isActive: boolean;
  destination: string;
  steps: NavigationStep[];
  currentStep: number;
  onStop: () => void;
  totalTime: number;
  totalDistance: string;
}

export function NavigationCard({
  isActive,
  destination,
  steps,
  currentStep,
  onStop,
  totalTime,
  totalDistance,
}: NavigationCardProps) {
  const { colors } = useTheme();

  if (!isActive) return null;

  const currentStepData = steps[currentStep];
  const remainingSteps = steps.slice(currentStep + 1);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    navigationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    stopButton: {
      backgroundColor: colors.error,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    stopButtonText: {
      color: colors.white,
      fontWeight: '700',
      marginLeft: 4,
    },
    currentStep: {
      backgroundColor: colors.primaryLight,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    currentStepInstruction: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.white,
      marginBottom: 8,
    },
    currentStepLocation: {
      fontSize: 16,
      color: colors.white,
      opacity: 0.9,
      marginBottom: 8,
    },
    currentStepMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currentStepTime: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 12,
    },
    currentStepTimeText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    currentStepDistance: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.9,
    },
    upcomingSteps: {
      marginTop: 8,
    },
    upcomingTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    upcomingStep: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    stepNumberText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    stepContent: {
      flex: 1,
    },
    stepInstruction: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    stepLocation: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 16,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
    },
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.navigationIcon}>
            <Navigation size={20} color={colors.white} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Navigating to {destination}</Text>
            <Text style={styles.subtitle}>
              {totalDistance} • {Math.ceil(totalTime / 60)} min remaining
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.stopButton} onPress={onStop}>
          <X size={16} color={colors.white} />
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {currentStepData && (
        <View style={styles.currentStep}>
          <Text style={styles.currentStepInstruction}>
            {currentStepData.instruction}
          </Text>
          <Text style={styles.currentStepLocation}>
            {currentStepData.location}
          </Text>
          <View style={styles.currentStepMeta}>
            <View style={styles.currentStepTime}>
              <Clock size={14} color={colors.white} />
              <Text style={styles.currentStepTimeText}>
                {currentStepData.estimatedTime}s
              </Text>
            </View>
            {currentStepData.distance && (
              <Text style={styles.currentStepDistance}>
                {currentStepData.distance}
              </Text>
            )}
          </View>
        </View>
      )}

      {remainingSteps.length > 0 && (
        <View style={styles.upcomingSteps}>
          <Text style={styles.upcomingTitle}>Upcoming Steps</Text>
          {remainingSteps.slice(0, 3).map((step, index) => (
            <View key={step.id} style={styles.upcomingStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{currentStep + index + 2}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
                <Text style={styles.stepLocation}>{step.location}</Text>
              </View>
              <ArrowRight size={16} color={colors.textSecondary} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );
}
