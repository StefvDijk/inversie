import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { token, isInitialized } = useAuthStore();

  // Show loading screen - navigation will be handled by AuthGuard in _layout.tsx
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-primary mb-4">Inversie</Text>
      <ActivityIndicator size="large" color="#d6453a" />
    </View>
  );
}
