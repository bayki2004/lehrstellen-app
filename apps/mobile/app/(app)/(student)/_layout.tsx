import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  feed: { active: 'flame', inactive: 'flame-outline' },
  map: { active: 'map', inactive: 'map-outline' },
  search: { active: 'search', inactive: 'search-outline' },
  bewerbungen: { active: 'document-text', inactive: 'document-text-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Hide the tab bar when the focused route sets tabBarStyle display to 'none'
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const tabBarStyle = focusedOptions.tabBarStyle as any;
  if (tabBarStyle?.display === 'none') {
    return null;
  }

  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key].options as any;
    return options.href !== null;
  });

  return (
    <View style={[styles.floatingContainer, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.island}>
        <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
        <View style={styles.overlay} />
        <View style={styles.iconRow}>
          {visibleRoutes.map((route) => {
            const realIndex = state.routes.indexOf(route);
            const isFocused = state.index === realIndex;
            const icons = TAB_ICONS[route.name];
            if (!icons) return null;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              } else if (isFocused) {
                const tabRoute = state.routes[realIndex];
                if (tabRoute.state && tabRoute.state.routes.length > 1) {
                  navigation.dispatch({
                    ...StackActions.popToTop(),
                    target: tabRoute.state.key,
                  });
                }
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                {isFocused && <View style={styles.activeIndicator} />}
                <Ionicons
                  name={isFocused ? icons.active : icons.inactive}
                  size={24}
                  color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function StudentLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Tab order: Entdecken, Karte, Suche, Bewerbungen, Profil */}
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="bewerbungen" />
      <Tabs.Screen name="profile" />
      {/* Hidden routes */}
      <Tabs.Screen name="berufe" options={{ href: null }} />
      <Tabs.Screen name="matches" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  island: {
    flexDirection: 'row',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 4,
  },
  tabButton: {
    width: 52,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
  },
});
