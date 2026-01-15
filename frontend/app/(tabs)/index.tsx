import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { potjesApi, Potje, decisionsApi, Decision } from '../../api/client';

// Map icon names to emojis
const iconMap: Record<string, string> = {
  'cart': '🛒',
  'game-controller': '🎮',
  'shirt': '👕',
  'bus': '🚌',
  'default': '💰',
};

function PotjeCard({ potje }: { potje: Potje }) {
  const percentSpent = potje.monthlyBudget > 0 ? (potje.currentSpent / potje.monthlyBudget) * 100 : 0;
  const remaining = potje.monthlyBudget - potje.currentSpent;
  const icon = iconMap[potje.icon || ''] || iconMap['default'];

  return (
    <TouchableOpacity
      className="bg-surface border-3 border-black rounded-lg p-4 mb-4"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{icon}</Text>
          <Text className="text-lg font-bold text-text-primary">{potje.name}</Text>
        </View>
        <Text className="text-text-muted">€{remaining.toFixed(0)} over</Text>
      </View>

      {/* Progress bar */}
      <View className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
        <View
          className={`h-full ${percentSpent > 90 ? 'bg-error' : percentSpent > 70 ? 'bg-warning' : 'bg-success'}`}
          style={{ width: `${Math.min(percentSpent, 100)}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-text-muted">€{potje.currentSpent.toFixed(0)} gebruikt</Text>
        <Text className="text-text-muted">€{potje.monthlyBudget.toFixed(0)} budget</Text>
      </View>
    </TouchableOpacity>
  );
}

function PendingDecisionCard({ decision, onPress }: { decision: Decision; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-primary">{decision.title}</Text>
          <Text className="text-text-muted">€{decision.amount.toFixed(2)}</Text>
        </View>
        <View className="bg-warning/20 border-2 border-warning rounded-full px-3 py-1">
          <Text className="text-warning font-semibold text-sm">Wachtend</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { token, user, logout } = useAuthStore();
  const [potjes, setPotjes] = useState<Potje[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const [potjesData, decisionsData] = await Promise.all([
        potjesApi.getAll(token),
        decisionsApi.getAll(token),
      ]);

      setPotjes(potjesData);
      setPendingDecisions(decisionsData.filter(d => d.status === 'PENDING'));
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');

      // If unauthorized, log out
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

  const navigateToDecision = (id: string) => {
    router.push(`/decision/${id}`);
  };

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#d6453a']}
            tintColor="#d6453a"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-text-primary">
              Hallo {user?.firstName || 'daar'}! 👋
            </Text>
            <Text className="text-text-muted">Hier is je overzicht</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="bg-surface border-2 border-black rounded-full p-2 mr-2"
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-surface border-2 border-black rounded-full p-2"
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View className="bg-error/10 border-2 border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-center">{error}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className="flex-1 bg-primary border-3 border-black rounded-lg p-4 mr-2"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
            onPress={() => router.push('/(tabs)/decisions')}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold mt-2">Nieuwe Keuze</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-accent border-3 border-black rounded-lg p-4 ml-2"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
            onPress={() => router.push('/(tabs)/money')}
          >
            <Ionicons name="cash" size={24} color="white" />
            <Text className="text-white font-bold mt-2">Geld Vragen</Text>
          </TouchableOpacity>
        </View>

        {/* Potjes Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-text-primary mb-4">Je Potjes</Text>
          {potjes.length === 0 ? (
            <View className="bg-surface border-3 border-black rounded-lg p-4">
              <Text className="text-text-muted text-center">Geen potjes gevonden</Text>
            </View>
          ) : (
            potjes.map((potje) => (
              <PotjeCard key={potje.id} potje={potje} />
            ))
          )}
        </View>

        {/* Pending Items */}
        <View className="mb-20">
          <Text className="text-xl font-bold text-text-primary mb-4">Wachtend</Text>
          {pendingDecisions.length === 0 ? (
            <View className="bg-surface border-3 border-black rounded-lg p-4">
              <Text className="text-text-muted text-center">Geen openstaande verzoeken</Text>
            </View>
          ) : (
            pendingDecisions.map((decision) => (
              <PendingDecisionCard key={decision.id} decision={decision} onPress={() => navigateToDecision(decision.id)} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
