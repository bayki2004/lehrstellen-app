import { Stack } from 'expo-router';

export default function GradesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="choose-type" />
      <Stack.Screen name="manual-zeugnis" />
      <Stack.Screen name="manual-multicheck" />
    </Stack>
  );
}
