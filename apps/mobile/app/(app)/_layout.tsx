import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';

export default function AppLayout() {
  const { accessToken, user, isInitialized } = useAuthStore();

  // Wait for auth state to load
  if (!isInitialized) return null;

  // Redirect to login if not authenticated
  if (!accessToken || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Slot />;
}
