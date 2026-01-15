import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('jan@test.nl'); // Pre-filled for testing
  const [pin, setPin] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handlePinSubmit = async () => {
    if (pin.length < 4 || pin.length > 6) {
      return;
    }

    try {
      const user = await login(email, pin);
      // Redirect based on user type
      if (user.type === 'BEWINDVOERDER') {
        router.replace('/(bewindvoerder)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 6) {
      setPin(digits);
      if (error) clearError();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-8">
          {/* Logo */}
          <Text className="text-4xl font-bold text-primary mb-2">Inversie</Text>
          <Text className="text-text-muted mb-12">Jouw financiële overzicht</Text>

          {/* Email Input */}
          <View className="w-full max-w-xs mb-4">
            <Text className="text-lg font-semibold text-text-primary mb-2">
              E-mailadres
            </Text>

            <TextInput
              className="w-full bg-surface border-3 border-black rounded-lg p-4 text-lg"
              style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="naam@voorbeeld.nl"
              placeholderTextColor="#888888"
              editable={!isLoading}
            />
          </View>

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
              editable={!isLoading}
            />

            {error ? (
              <View className="bg-error/10 border-2 border-error rounded-lg p-3 mt-3">
                <Text className="text-error text-center font-medium">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              className={`w-full border-3 border-black rounded-lg p-4 mt-6 ${
                isLoading || pin.length < 4 ? 'bg-gray-400' : 'bg-primary'
              }`}
              style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
              onPress={handlePinSubmit}
              disabled={isLoading || pin.length < 4}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-bold">
                  Inloggen
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Biometric option */}
          <TouchableOpacity className="mt-8" disabled={isLoading}>
            <Text className="text-primary font-semibold">
              Gebruik Face ID / Vingerafdruk
            </Text>
          </TouchableOpacity>

          {/* Test hints */}
          <View className="mt-8 p-4 bg-surface/50 rounded-lg border border-gray-300">
            <Text className="text-text-muted text-center text-sm">
              Cliënt: jan@test.nl / PIN: 1234
            </Text>
            <Text className="text-text-muted text-center text-sm mt-1">
              Bewindvoerder: maria@bewind.nl / PIN: 1234
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
