import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Check for existing session and redirect accordingly
    const checkAuth = async () => {
      // TODO: Check secure store for session token
      // For now, always redirect to login
      setTimeout(() => {
        router.replace('/login');
      }, 1000);
    };

    checkAuth();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-primary mb-4">Inversie</Text>
      <ActivityIndicator size="large" color="#d6453a" />
    </View>
  );
}
