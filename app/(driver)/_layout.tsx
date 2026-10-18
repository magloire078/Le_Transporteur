import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useAppContext } from '@/context/AppContext';
import { DriverProvider } from '@/context/DriverContext';
import { Icon } from '@/components/Icon';

export default function DriverTabLayout() {
  const { activeTheme, user } = useAppContext();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'driver') return <Redirect href="/(owner)" />;

  return (
    <DriverProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTheme.tabActive,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: activeTheme.dark ? '#0A0A12' : '#FFFFFF',
            borderTopColor: activeTheme.dark ? 'rgba(255,255,255,0.1)' : '#F0F0F0',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tableau',
            tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="versements"
          options={{
            title: 'Versements',
            tabBarIcon: ({ color }) => <Icon name="wallet" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="vehicle"
          options={{
            title: 'Véhicule',
            tabBarIcon: ({ color }) => <Icon name="car" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => <Icon name="user" size={24} color={color} />,
          }}
        />
      </Tabs>
    </DriverProvider>
  );
}
