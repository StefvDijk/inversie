import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { decisionsApi, Decision, potjesApi, Potje } from '../../api/client';

function DecisionCard({ decision, onPress }: { decision: Decision; onPress: () => void }) {
  const statusConfig = {
    PENDING: { bg: 'bg-warning/20', border: 'border-warning', text: 'text-warning', label: 'Wachtend' },
    APPROVED: { bg: 'bg-success/20', border: 'border-success', text: 'text-success', label: 'Goedgekeurd' },
    DENIED: { bg: 'bg-error/20', border: 'border-error', text: 'text-error', label: 'Afgewezen' },
  };
  const status = statusConfig[decision.status];

  return (
    <TouchableOpacity
      className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-text-primary">{decision.title}</Text>
          {decision.description && (
            <Text className="text-text-muted mt-1" numberOfLines={2}>{decision.description}</Text>
          )}
          <View className="flex-row items-center mt-2">
            <Text className="text-primary font-bold">€{decision.amount.toFixed(2)}</Text>
            {decision.potje && (
              <Text className="text-text-muted ml-2">• {decision.potje.name}</Text>
            )}
          </View>
        </View>
        <View className={`${status.bg} border-2 ${status.border} rounded-full px-3 py-1`}>
          <Text className={`${status.text} font-semibold text-sm`}>{status.label}</Text>
        </View>
      </View>
      {decision.needsHelp && (
        <View className="flex-row items-center mt-3 bg-accent/10 rounded-lg p-2">
          <Ionicons name="help-circle" size={18} color="#5D67CE" />
          <Text className="text-accent ml-2 text-sm">Hulp gevraagd aan bewindvoerder</Text>
        </View>
      )}
      {decision.reflection && (
        <View className="flex-row items-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= decision.reflection!.satisfactionRating ? 'star' : 'star-outline'}
              size={16}
              color="#F4A261"
            />
          ))}
          <Text className="text-text-muted ml-2 text-sm">Terugblik toegevoegd</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DecisionsScreen() {
  const { token, logout } = useAuthStore();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [potjes, setPotjes] = useState<Potje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New decision modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedPotje, setSelectedPotje] = useState<string>('');
  const [needsHelp, setNeedsHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const [decisionsData, potjesData] = await Promise.all([
        decisionsApi.getAll(token),
        potjesApi.getAll(token),
      ]);

      setDecisions(decisionsData);
      setPotjes(potjesData);
    } catch (err: any) {
      console.error('Failed to fetch decisions:', err);
      setError(err.message || 'Failed to load decisions');
      if (err.message?.includes('Authentication') || err.message?.includes('Session')) {
        logout();
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCreateDecision = async () => {
    if (!token || !newTitle || !newAmount || !selectedPotje) {
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }

    setIsSubmitting(true);
    try {
      await decisionsApi.create(token, {
        title: newTitle,
        description: newDescription || undefined,
        amount: parseFloat(newAmount),
        potjeId: selectedPotje,
        needsHelp,
      });

      // Reset form and close modal
      setNewTitle('');
      setNewDescription('');
      setNewAmount('');
      setSelectedPotje('');
      setNeedsHelp(false);
      setShowNewModal(false);

      // Refresh data
      fetchData();
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Kon keuze niet aanmaken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingDecisions = decisions.filter(d => d.status === 'PENDING');
  const completedDecisions = decisions.filter(d => d.status !== 'PENDING');

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#d6453a" />
        <Text className="text-text-muted mt-4">Laden...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d6453a']} tintColor="#d6453a" />
        }
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">Keuzes</Text>
        <Text className="text-text-muted mb-6">Maak overwogen beslissingen over je geld</Text>

        {/* New Decision Button */}
        <TouchableOpacity
          className="bg-primary border-3 border-black rounded-lg p-4 mb-6 flex-row items-center justify-center"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={() => setShowNewModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Nieuwe Keuze</Text>
        </TouchableOpacity>

        {/* Error */}
        {error && (
          <View className="bg-error/10 border-2 border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-center">{error}</Text>
          </View>
        )}

        {/* Pending Decisions */}
        <Text className="text-xl font-bold text-text-primary mb-4">In behandeling ({pendingDecisions.length})</Text>
        {pendingDecisions.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
            <Text className="text-text-muted text-center">Geen openstaande keuzes</Text>
          </View>
        ) : (
          <View className="mb-6">
            {pendingDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} onPress={() => router.push(`/decision/${decision.id}`)} />
            ))}
          </View>
        )}

        {/* Decision History */}
        <Text className="text-xl font-bold text-text-primary mb-4">Geschiedenis ({completedDecisions.length})</Text>
        {completedDecisions.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
            <Text className="text-text-muted text-center">Je hebt nog geen afgeronde keuzes</Text>
          </View>
        ) : (
          <View className="mb-20">
            {completedDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} onPress={() => router.push(`/decision/${decision.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Decision Modal */}
      <Modal visible={showNewModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">Nieuwe Keuze</Text>
              <TouchableOpacity onPress={() => setShowNewModal(false)}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Wat wil je doen? *</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
                placeholder="bijv. Nieuwe schoenen kopen"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Description */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Beschrijving</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
                placeholder="Waarom wil je dit?"
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />

              {/* Amount */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Hoeveel kost het? *</Text>
              <View className="flex-row items-center bg-surface border-3 border-black rounded-lg px-4 mb-4">
                <Text className="text-2xl font-bold text-text-primary">€</Text>
                <TextInput
                  className="flex-1 p-4 text-2xl"
                  placeholder="0.00"
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Potje Selection */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Van welk potje? *</Text>
              <View className="flex-row flex-wrap mb-4">
                {potjes.map((potje) => (
                  <TouchableOpacity
                    key={potje.id}
                    className={`border-3 border-black rounded-lg p-3 mr-2 mb-2 ${
                      selectedPotje === potje.id ? 'bg-primary' : 'bg-surface'
                    }`}
                    onPress={() => setSelectedPotje(potje.id)}
                  >
                    <Text className={`font-semibold ${selectedPotje === potje.id ? 'text-white' : 'text-text-primary'}`}>
                      {potje.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Needs Help */}
              <TouchableOpacity
                className={`flex-row items-center border-3 border-black rounded-lg p-4 mb-6 ${
                  needsHelp ? 'bg-accent' : 'bg-surface'
                }`}
                onPress={() => setNeedsHelp(!needsHelp)}
              >
                <Ionicons
                  name={needsHelp ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={needsHelp ? 'white' : '#111'}
                />
                <Text className={`ml-3 font-semibold ${needsHelp ? 'text-white' : 'text-text-primary'}`}>
                  Ik wil hulp van mijn bewindvoerder
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                className={`border-3 border-black rounded-lg p-4 mb-8 ${
                  isSubmitting || !newTitle || !newAmount || !selectedPotje ? 'bg-gray-400' : 'bg-primary'
                }`}
                style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
                onPress={handleCreateDecision}
                disabled={isSubmitting || !newTitle || !newAmount || !selectedPotje}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-bold">Keuze Maken</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
