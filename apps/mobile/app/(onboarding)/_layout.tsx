import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="student-profile" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="build-your-day" />
      <Stack.Screen name="fields" />
      <Stack.Screen name="company-profile" />
    </Stack>
  );
}
