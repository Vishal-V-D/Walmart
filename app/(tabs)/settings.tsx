import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Volume2, Eye, Shield, CircleHelp as HelpCircle, ChevronRight, Mic, MapPin, Smartphone, Moon, Sun, Monitor, Palette, Globe, CreditCard, Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  type: 'toggle' | 'navigation' | 'action' | 'theme';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    voiceAssistant: true,
    locationServices: true,
    highContrast: false,
    voiceGuidance: true,
    hapticFeedback: true,
    personalizedOffers: true,
    autoNavigation: true,
    smartSuggestions: true,
  });

  const handleToggle = (key: string) => (value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'highContrast') {
      Alert.alert(
        'High Contrast Mode',
        value ? 'High contrast mode enabled for better visibility' : 'High contrast mode disabled',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Profile Settings',
      'Sarah Johnson\n\nEmail: sarah.j@email.com\nMember since: January 2024\nPreferred Store: Walmart Supercenter #1234\nShopping Preferences: Organic, Health-conscious\nTotal Savings: $247.83',
      [{ text: 'OK', onPress: () => {} }]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Help & Support',
      'SmartShop Navigator Help Center\n\n🎤 Voice Commands:\n• "Find [product name]"\n• "Navigate to [section]"\n• "Show me offers"\n• "Add [item] to list"\n\n🗺️ Navigation:\n• Tap any section on the map\n• Follow blue path indicators\n• Voice guidance available\n\n💰 Offers:\n• Location-based deals\n• Personalized recommendations\n• Flash sales notifications\n\n♿ Accessibility:\n• High contrast mode\n• Voice guidance\n• Large text support',
      [{ text: 'Got it!', onPress: () => {} }]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Privacy & Security',
      'Your Privacy Matters\n\n🔒 Data Protection:\n• Location data used only for navigation\n• Shopping patterns for personalization\n• No data sold to third parties\n\n📍 Location Services:\n• Real-time store navigation\n• Proximity-based offers\n• Can be disabled anytime\n\n🛡️ Security:\n• End-to-end encryption\n• Secure payment processing\n• Regular security audits',
      [{ text: 'Understood', onPress: () => {} }]
    );
  };

  const handleThemePress = () => {
    Alert.alert(
      'Theme Settings',
      'Choose your preferred theme:',
      [
        { text: 'Light', onPress: () => setTheme('light') },
        { text: 'Dark', onPress: () => setTheme('dark') },
        { text: 'System', onPress: () => setTheme('system') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Monitor;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      default:
        return 'System Default';
    }
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile & Preferences',
          description: 'Manage your account and shopping preferences',
          icon: User,
          type: 'navigation' as const,
          onPress: handleProfilePress,
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          description: 'Manage cards and payment options',
          icon: CreditCard,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Payment Methods', 'Payment management coming soon!'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: getThemeLabel(),
          description: 'Choose your preferred theme',
          icon: getThemeIcon(),
          type: 'navigation' as const,
          onPress: handleThemePress,
        },
        {
          id: 'highContrast',
          title: 'High Contrast Mode',
          description: 'Improve visibility with enhanced contrast',
          icon: Eye,
          type: 'toggle' as const,
          value: settings.highContrast,
          onToggle: handleToggle('highContrast'),
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          description: 'Offers, navigation updates, and reminders',
          icon: Bell,
          type: 'toggle' as const,
          value: settings.notifications,
          onToggle: handleToggle('notifications'),
        },
        {
          id: 'voiceAssistant',
          title: 'Voice Assistant',
          description: 'Enable voice commands and responses',
          icon: Mic,
          type: 'toggle' as const,
          value: settings.voiceAssistant,
          onToggle: handleToggle('voiceAssistant'),
        },
        {
          id: 'locationServices',
          title: 'Location Services',
          description: 'Allow location access for navigation',
          icon: MapPin,
          type: 'toggle' as const,
          value: settings.locationServices,
          onToggle: handleToggle('locationServices'),
        },
        {
          id: 'personalizedOffers',
          title: 'Personalized Offers',
          description: 'Receive offers based on your preferences',
          icon: Star,
          type: 'toggle' as const,
          value: settings.personalizedOffers,
          onToggle: handleToggle('personalizedOffers'),
        },
        {
          id: 'autoNavigation',
          title: 'Smart Auto-Navigation',
          description: 'Automatically optimize shopping routes',
          icon: MapPin,
          type: 'toggle' as const,
          value: settings.autoNavigation,
          onToggle: handleToggle('autoNavigation'),
        },
      ],
    },
    {
      title: 'Accessibility',
      items: [
        {
          id: 'voiceGuidance',
          title: 'Voice Guidance',
          description: 'Spoken navigation instructions',
          icon: Volume2,
          type: 'toggle' as const,
          value: settings.voiceGuidance,
          onToggle: handleToggle('voiceGuidance'),
        },
        {
          id: 'hapticFeedback',
          title: 'Haptic Feedback',
          description: 'Vibration for touch interactions',
          icon: Smartphone,
          type: 'toggle' as const,
          value: settings.hapticFeedback,
          onToggle: handleToggle('hapticFeedback'),
        },
        {
          id: 'smartSuggestions',
          title: 'Smart Suggestions',
          description: 'AI-powered shopping recommendations',
          icon: Palette,
          type: 'toggle' as const,
          value: settings.smartSuggestions,
          onToggle: handleToggle('smartSuggestions'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          description: 'Get help, tutorials, and tips',
          icon: HelpCircle,
          type: 'navigation' as const,
          onPress: handleHelpPress,
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          description: 'Review privacy settings and policies',
          icon: Shield,
          type: 'navigation' as const,
          onPress: handlePrivacyPress,
        },
        {
          id: 'language',
          title: 'Language & Region',
          description: 'English (US) • United States',
          icon: Globe,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Language Settings', 'Language options coming soon!'),
        },
      ],
    },
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
    content: {
      flex: 1,
    },
    section: {
      marginTop: 32,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontFamily: 'Inter-ExtraBold',
    },
    settingsList: {
      backgroundColor: colors.background,
      borderRadius: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
    settingItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 20,
      fontFamily: 'Inter-Regular',
    },
    settingRight: {
      marginLeft: 12,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Inter-SemiBold',
    },
    version: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 4,
      fontFamily: 'Inter-Regular',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Customize your SmartShop experience
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.settingsList}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index !== section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={item.onPress}
                  disabled={item.type === 'toggle'}
                  activeOpacity={item.type === 'toggle' ? 1 : 0.7}>
                  
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <item.icon size={22} color={colors.text} strokeWidth={2} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.settingDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.settingRight}>
                    {item.type === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ 
                          false: colors.border, 
                          true: colors.primary 
                        }}
                        thumbColor={colors.white}
                        ios_backgroundColor={colors.border}
                      />
                    )}
                    {item.type === 'navigation' && (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartShop Navigator</Text>
          <Text style={styles.version}>Version 2.1.0 • Made for Walmart</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}