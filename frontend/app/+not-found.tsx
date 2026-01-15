import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* 404 Illustration */}
        <View className="bg-error/10 w-32 h-32 rounded-full items-center justify-center mb-6">
          <Text className="text-6xl">🤔</Text>
        </View>

        <Text className="text-4xl font-bold text-text-primary mb-2">Oeps!</Text>
        <Text className="text-xl text-text-muted text-center mb-8">
          Deze pagina bestaat niet of is verplaatst.
        </Text>

        {/* Error Code */}
        <View className="bg-surface border-3 border-black rounded-lg px-6 py-3 mb-8">
          <Text className="text-text-muted font-mono">Foutcode: 404</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          className="bg-primary border-3 border-black rounded-lg px-8 py-4 w-full mb-4"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={() => router.replace('/(tabs)')}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="home" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Naar Home</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface border-3 border-black rounded-lg px-8 py-4 w-full"
          onPress={() => router.back()}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#111" />
            <Text className="text-text-primary font-bold text-lg ml-2">Terug</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
