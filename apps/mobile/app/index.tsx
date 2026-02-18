import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { colors } from '../constants/theme';

export default function Index() {
  const { user, accessToken, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not logged in
  if (!accessToken || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Logged in but no profile yet
  if (!user.hasProfile) {
    if (user.role === 'STUDENT') {
      return <Redirect href="/(onboarding)/student-profile" />;
    }
    return <Redirect href="/(onboarding)/company-profile" />;
  }

  // Student without quiz
  if (user.role === 'STUDENT' && !user.hasCompletedQuiz) {
    return <Redirect href="/(onboarding)/quiz" />;
  }

  // Fully set up - go to main app
  if (user.role === 'COMPANY') {
    return <Redirect href="/(app)/(company)/listings" />;
  }

  return <Redirect href="/(app)/(student)/search" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
