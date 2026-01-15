import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/client';

export default function ChangePinScreen() {
  const { token } = useAuthStore();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePinChange = (setter: (value: string) => void) => (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 6) {
      setter(digits);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;

    // Validation
    if (currentPin.length < 4) {
      setError('Huidige PIN moet minimaal 4 cijfers zijn');
      return;
    }
    if (newPin.length < 4) {
      setError('Nieuwe PIN moet minimaal 4 cijfers zijn');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Nieuwe PINs komen niet overeen');
      return;
    }
    if (currentPin === newPin) {
      setError('Nieuwe PIN moet anders zijn dan huidige PIN');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.changePin(token, currentPin, newPin);
      Alert.alert('Gelukt!', 'Je PIN is gewijzigd', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setError(err.message || 'Kon PIN niet wijzigen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary">PIN Wijzigen</Text>
        </View>

        {/* Info */}
        <View className="bg-accent/10 border-2 border-accent rounded-lg p-4 mb-6">
          <Text className="text-accent text-center">
            Je PIN moet minimaal 4 en maximaal 6 cijfers zijn
          </Text>
        </View>

        {/* Current PIN */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-2">Huidige PIN</Text>
          <TextInput
            className="bg-surface border-3 border-black rounded-lg p-4 text-2xl text-center tracking-widest"
            value={currentPin}
            onChangeText={handlePinChange(setCurrentPin)}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="••••"
            placeholderTextColor="#888"
          />
        </View>

        {/* New PIN */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-2">Nieuwe PIN</Text>
          <TextInput
            className="bg-surface border-3 border-black rounded-lg p-4 text-2xl text-center tracking-widest"
            value={newPin}
            onChangeText={handlePinChange(setNewPin)}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="••••"
            placeholderTextColor="#888"
          />
        </View>

        {/* Confirm PIN */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-2">Bevestig Nieuwe PIN</Text>
          <TextInput
            className="bg-surface border-3 border-black rounded-lg p-4 text-2xl text-center tracking-widest"
            value={confirmPin}
            onChangeText={handlePinChange(setConfirmPin)}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="••••"
            placeholderTextColor="#888"
          />
        </View>

        {/* Error */}
        {error && (
          <View className="bg-error/10 border-2 border-error rounded-lg p-3 mb-6">
            <Text className="text-error text-center">{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          className={`border-3 border-black rounded-lg p-4 ${
            isSubmitting || currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4
              ? 'bg-gray-400'
              : 'bg-primary'
          }`}
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={handleSubmit}
          disabled={isSubmitting || currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">PIN Wijzigen</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
