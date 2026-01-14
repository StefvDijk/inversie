import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function Login() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePinSubmit = async () => {
    if (pin.length < 4 || pin.length > 6) {
      setError('PIN moet 4-6 cijfers zijn');
      return;
    }

    // TODO: Validate PIN with backend
    // For now, accept any valid PIN format
    router.replace('/(tabs)');
  };

  const handlePinChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 6) {
      setPin(digits);
      setError('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <Text className="text-4xl font-bold text-primary mb-2">Inversie</Text>
        <Text className="text-text-muted mb-12">Jouw financiële overzicht</Text>

        {/* PIN Input */}
        <View className="w-full max-w-xs">
          <Text className="text-lg font-semibold text-text-primary mb-2">
            Voer je PIN in
          </Text>

          <TextInput
            className="w-full bg-surface border-3 border-black rounded-lg p-4 text-2xl text-center tracking-widest"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="••••"
            placeholderTextColor="#888888"
          />

          {error ? (
            <Text className="text-error mt-2 text-center">{error}</Text>
          ) : null}

          <TouchableOpacity
            className="w-full bg-primary border-3 border-black rounded-lg p-4 mt-6"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
            onPress={handlePinSubmit}
          >
            <Text className="text-white text-center text-lg font-bold">
              Inloggen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Biometric option */}
        <TouchableOpacity className="mt-8">
          <Text className="text-primary font-semibold">
            Gebruik Face ID / Vingerafdruk
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
