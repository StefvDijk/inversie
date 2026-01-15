import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';
import '../global.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isInitialized, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    // Wait a tick to ensure router is ready
    const timeoutId = setTimeout(() => {
      const currentSegment = segments[0];
      const inAuthGroup = currentSegment === '(tabs)' || currentSegment === '(bewindvoerder)';
      const inLogin = currentSegment === 'login';
      const onIndex = !currentSegment || currentSegment === 'index';

      // Handle initial redirect from index page
      if (onIndex) {
        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
        return;
      }

      // Handle navigation for other pages
      if (!token && inAuthGroup) {
        // User is not authenticated and trying to access protected routes
        router.replace('/login');
      } else if (token && inLogin) {
        // User is authenticated but on login page
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [token, isInitialized, segments, router]);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-3xl font-bold text-primary mb-4">Inversie</Text>
        <ActivityIndicator size="large" color="#d6453a" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <AuthGuard>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F4F0E6',
          },
          headerTintColor: '#111111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#F4F0E6',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
