import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useAppContext } from '@/context/AppContext';
import { FleetProvider } from '@/context/FleetContext';
import { Icon } from '@/components/Icon';

export default function OwnerTabLayout() {
  const { activeTheme, user } = useAppContext();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'driver') return <Redirect href="/(driver)" />;

  return (
    <FleetProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTheme.tabActive,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: activeTheme.dark ? '#0A0A12' : '#FFFFFF',
            borderTopColor: activeTheme.dark ? 'rgba(255,255,255,0.1)' : '#F0F0F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Supervision',
            tabBarIcon: ({ color }) => <Icon name="barChart" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="fleet"
          options={{
            title: 'Flotte',
            tabBarIcon: ({ color }) => <Icon name="car" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Recettes',
            tabBarIcon: ({ color }) => <Icon name="calendar" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="finances"
          options={{
            title: 'Finances & Param.',
            tabBarIcon: ({ color }) => <Icon name="wallet" size={22} color={color} />,
          }}
        />
      </Tabs>
    </FleetProvider>
  );
}
