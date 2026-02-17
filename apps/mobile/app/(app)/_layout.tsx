import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuthStore } from '../../stores/auth.store';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Feed: '🎯',
    Matches: '💬',
    Profil: '👤',
    Dashboard: '📊',
    Stellen: '📋',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '•'}
    </Text>
  );
}

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isCompany = user?.role === 'COMPANY';

  if (isCompany) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: { paddingBottom: 4, height: 56 },
        }}
      >
        <Tabs.Screen
          name="(company)/dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="(company)/listings"
          options={{
            title: 'Stellen',
            tabBarIcon: ({ focused }) => <TabIcon label="Stellen" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="(company)/profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ focused }) => <TabIcon label="Profil" focused={focused} />,
          }}
        />
        {/* Hide student tabs */}
        <Tabs.Screen name="(student)/feed" options={{ href: null }} />
        <Tabs.Screen name="(student)/matches" options={{ href: null }} />
        <Tabs.Screen name="(student)/profile" options={{ href: null }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { paddingBottom: 4, height: 56 },
      }}
    >
      <Tabs.Screen
        name="(student)/feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon label="Feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(student)/matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ focused }) => <TabIcon label="Matches" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(student)/profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon label="Profil" focused={focused} />,
        }}
      />
      {/* Hide company tabs */}
      <Tabs.Screen name="(company)/dashboard" options={{ href: null }} />
      <Tabs.Screen name="(company)/listings" options={{ href: null }} />
      <Tabs.Screen name="(company)/profile" options={{ href: null }} />
    </Tabs>
  );
}
