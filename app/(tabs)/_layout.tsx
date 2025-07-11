// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, ShoppingCart, MapPin, Tag, Settings } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  const iconSize = 24;

  const tabStyles = StyleSheet.create({
    tabBar: {
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      height: 80,
      paddingVertical: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 6,
    },
    label: {
      fontSize: 12,
      marginTop: 4,
    },
    activeLabel: {
      // You might need to load custom fonts like 'Inter-Bold' if you're using them.
      // For now, let's use a standard fontWeight.
      fontWeight: '700',
      color: colors.primary,
    },
    inactiveLabel: {
      // Similarly for 'Inter-Medium'
      fontWeight: '500',
      color: colors.textTertiary,
    },
  });

  const createTabScreen = (name: string, title: string, Icon: any) => ({
    name,
    options: {
      title,
      tabBarIcon: ({ focused }: any) => (
        <Icon
          size={iconSize}
          color={focused ? colors.primary : colors.textTertiary}
          strokeWidth={focused ? 2.8 : 2}
        />
      ),
      tabBarLabel: ({ focused }: any) => (
        <Text style={[tabStyles.label, focused ? tabStyles.activeLabel : tabStyles.inactiveLabel]}>
          {title}
        </Text>
      ),
    },
  });

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: tabStyles.tabBar }}>
      <Tabs.Screen {...createTabScreen('index', 'Home', Home)} />
      <Tabs.Screen {...createTabScreen('shopping-list', 'Shopping', ShoppingCart)} />
      <Tabs.Screen {...createTabScreen('map', 'Map', MapPin)} />
      <Tabs.Screen {...createTabScreen('offers', 'Offers', Tag)} />
      <Tabs.Screen {...createTabScreen('settings', 'Settings', Settings)} />
    </Tabs>
  );
}