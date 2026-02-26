import { Stack } from 'expo-router';

export default function BerufeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="matches" />
      <Stack.Screen name="[code]" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}
