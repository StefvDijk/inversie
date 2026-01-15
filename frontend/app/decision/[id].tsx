import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { decisionsApi, Decision } from '../../api/client';

export default function DecisionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, logout } = useAuthStore();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionRating, setReflectionRating] = useState(0);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDecision();
  }, [id, token]);

  const fetchDecision = async () => {
    if (!token || !id) return;

    try {
      const data = await decisionsApi.getById(token, id);
      setDecision(data);
    } catch (err: any) {
      console.error('Failed to fetch decision:', err);
      if (err.message?.includes('Authentication') || err.message?.includes('Session')) {
        logout();
      } else {
        Alert.alert('Fout', 'Kon keuze niet laden');
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReflection = async () => {
    if (!token || !id || reflectionRating === 0) {
      Alert.alert('Fout', 'Selecteer een beoordeling');
      return;
    }

    setIsSubmitting(true);
    try {
      await decisionsApi.addReflection(token, id, {
        satisfactionRating: reflectionRating,
        notes: reflectionNotes || undefined,
      });

      setShowReflectionModal(false);
      fetchDecision(); // Refresh to show reflection
      Alert.alert('Opgeslagen', 'Je terugblik is toegevoegd');
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Kon terugblik niet opslaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    PENDING: { bg: 'bg-warning', label: 'Wachtend op goedkeuring', icon: 'time' as const },
    APPROVED: { bg: 'bg-success', label: 'Goedgekeurd', icon: 'checkmark-circle' as const },
    DENIED: { bg: 'bg-error', label: 'Afgewezen', icon: 'close-circle' as const },
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#d6453a" />
      </SafeAreaView>
    );
  }

  if (!decision) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-4">
        <Ionicons name="alert-circle" size={64} color="#888" />
        <Text className="text-xl font-bold text-text-primary mt-4">Keuze niet gevonden</Text>
        <TouchableOpacity
          className="bg-primary border-3 border-black rounded-lg px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Terug</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const status = statusConfig[decision.status];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary flex-1">Keuze Details</Text>
        </View>

        {/* Status Banner */}
        <View className={`${status.bg} border-3 border-black rounded-lg p-4 mb-6 flex-row items-center`}>
          <Ionicons name={status.icon} size={28} color="white" />
          <Text className="text-white font-bold text-lg ml-3">{status.label}</Text>
        </View>

        {/* Decision Info */}
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <Text className="text-2xl font-bold text-text-primary mb-2">{decision.title}</Text>

          <View className="flex-row items-center mb-4">
            <Text className="text-3xl font-bold text-primary">€{decision.amount.toFixed(2)}</Text>
            {decision.potje && (
              <View className="bg-gray-100 rounded-lg px-3 py-1 ml-3">
                <Text className="text-text-muted">{decision.potje.name}</Text>
              </View>
            )}
          </View>

          {decision.description && (
            <View className="border-t-2 border-gray-200 pt-4 mt-2">
              <Text className="text-text-muted font-semibold mb-1">Beschrijving</Text>
              <Text className="text-text-primary">{decision.description}</Text>
            </View>
          )}

          {decision.needsHelp && (
            <View className="bg-accent/10 border-2 border-accent rounded-lg p-3 mt-4 flex-row items-center">
              <Ionicons name="help-circle" size={24} color="#5D67CE" />
              <Text className="text-accent ml-2 font-semibold">Hulp gevraagd aan bewindvoerder</Text>
            </View>
          )}

          <View className="border-t-2 border-gray-200 pt-4 mt-4">
            <Text className="text-text-muted text-sm">
              Aangemaakt op {new Date(decision.createdAt).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Bewindvoerder Message */}
        {decision.bewindvoerderMessage && (
          <View className="bg-accent/10 border-3 border-accent rounded-lg p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="chatbubble" size={20} color="#5D67CE" />
              <Text className="text-accent font-bold ml-2">Bericht van bewindvoerder</Text>
            </View>
            <Text className="text-text-primary">{decision.bewindvoerderMessage}</Text>
          </View>
        )}

        {/* Reflection Section */}
        {decision.status === 'APPROVED' && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-text-primary mb-4">Terugblik</Text>

            {decision.reflection ? (
              <View className="bg-surface border-3 border-black rounded-lg p-4">
                <View className="flex-row items-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= decision.reflection!.satisfactionRating ? 'star' : 'star-outline'}
                      size={28}
                      color="#F4A261"
                    />
                  ))}
                </View>
                {decision.reflection.notes && (
                  <Text className="text-text-primary">{decision.reflection.notes}</Text>
                )}
                <Text className="text-text-muted text-sm mt-3">
                  Toegevoegd op {new Date(decision.reflection.createdAt).toLocaleDateString('nl-NL')}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-warning border-3 border-black rounded-lg p-4 flex-row items-center justify-center"
                style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
                onPress={() => setShowReflectionModal(true)}
              >
                <Ionicons name="star" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Terugblik Toevoegen</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          className="bg-surface border-3 border-black rounded-lg p-4 mb-20 flex-row items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
          <Text className="text-text-primary font-bold text-lg ml-2">Terug naar Keuzes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reflection Modal */}
      <Modal visible={showReflectionModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">Terugblik</Text>
              <TouchableOpacity onPress={() => setShowReflectionModal(false)}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            <Text className="text-lg font-semibold text-text-primary mb-4">
              Hoe tevreden ben je met deze keuze?
            </Text>

            {/* Star Rating */}
            <View className="flex-row justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  className="mx-2"
                  onPress={() => setReflectionRating(star)}
                >
                  <Ionicons
                    name={star <= reflectionRating ? 'star' : 'star-outline'}
                    size={48}
                    color="#F4A261"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-lg font-semibold text-text-primary mb-2">
              Opmerkingen (optioneel)
            </Text>
            <TextInput
              className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-6"
              placeholder="Hoe voelde het om deze keuze te maken?"
              value={reflectionNotes}
              onChangeText={setReflectionNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              className={`border-3 border-black rounded-lg p-4 ${
                isSubmitting || reflectionRating === 0 ? 'bg-gray-400' : 'bg-primary'
              }`}
              style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
              onPress={handleAddReflection}
              disabled={isSubmitting || reflectionRating === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-bold">Opslaan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
