import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { bewindvoerderApi, Decision, MoneyRequest, Client } from '../../api/client';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, logout } = useAuthStore();
  const [client, setClient] = useState<Client | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'decisions' | 'money'>('decisions');

  const fetchData = useCallback(async () => {
    if (!token || !id) return;

    try {
      const [clientsData, decisionsData, moneyData] = await Promise.all([
        bewindvoerderApi.getClients(token),
        bewindvoerderApi.getClientDecisions(token, id),
        bewindvoerderApi.getClientMoneyRequests(token, id),
      ]);

      const clientInfo = clientsData.find(c => c.id === id);
      setClient(clientInfo || null);
      setDecisions(decisionsData);
      setMoneyRequests(moneyData);
    } catch (err: any) {
      console.error('Failed to fetch client data:', err);
      if (err.message?.includes('Authentication')) {
        logout();
      } else {
        Alert.alert('Fout', 'Kon gegevens niet laden');
        router.back();
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, id, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const statusConfig = {
    PENDING: { bg: 'bg-warning/20', border: 'border-warning', text: 'text-warning', label: 'Wachtend' },
    APPROVED: { bg: 'bg-success/20', border: 'border-success', text: 'text-success', label: 'Goedgekeurd' },
    DENIED: { bg: 'bg-error/20', border: 'border-error', text: 'text-error', label: 'Afgewezen' },
  };

  const categoryLabels: Record<string, string> = {
    groceries: 'Boodschappen',
    clothing: 'Kleding',
    entertainment: 'Vrije tijd',
    transport: 'Vervoer',
    medical: 'Medisch',
    other: 'Anders',
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#5D67CE" />
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-4">
        <Ionicons name="alert-circle" size={64} color="#888" />
        <Text className="text-xl font-bold text-text-primary mt-4">Cliënt niet gevonden</Text>
        <TouchableOpacity
          className="bg-accent border-3 border-black rounded-lg px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Terug</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pendingDecisions = decisions.filter(d => d.status === 'PENDING');
  const pendingMoney = moneyRequests.filter(r => r.status === 'PENDING');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5D67CE']} tintColor="#5D67CE" />
        }
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary flex-1">Cliënt Details</Text>
        </View>

        {/* Client Info Card */}
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-accent items-center justify-center mr-4">
              <Text className="text-2xl text-white font-bold">
                {client.firstName[0]}{client.lastName[0]}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-text-primary">
                {client.firstName} {client.lastName}
              </Text>
              <Text className="text-text-muted">{client.email}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mb-6">
          <View className="flex-1 bg-warning/20 border-2 border-warning rounded-lg p-3 mr-2">
            <Text className="text-warning text-2xl font-bold">{pendingDecisions.length}</Text>
            <Text className="text-warning text-sm">Wachtende keuzes</Text>
          </View>
          <View className="flex-1 bg-primary/20 border-2 border-primary rounded-lg p-3 ml-2">
            <Text className="text-primary text-2xl font-bold">{pendingMoney.length}</Text>
            <Text className="text-primary text-sm">Wachtende verzoeken</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 border-3 border-black rounded-l-lg ${activeTab === 'decisions' ? 'bg-accent' : 'bg-surface'}`}
            onPress={() => setActiveTab('decisions')}
          >
            <Text className={`text-center font-bold ${activeTab === 'decisions' ? 'text-white' : 'text-text-primary'}`}>
              Keuzes ({decisions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 border-3 border-l-0 border-black rounded-r-lg ${activeTab === 'money' ? 'bg-accent' : 'bg-surface'}`}
            onPress={() => setActiveTab('money')}
          >
            <Text className={`text-center font-bold ${activeTab === 'money' ? 'text-white' : 'text-text-primary'}`}>
              Geldverzoeken ({moneyRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'decisions' ? (
          <View className="mb-20">
            {decisions.length === 0 ? (
              <View className="bg-surface border-3 border-black rounded-lg p-4">
                <Text className="text-text-muted text-center">Geen keuzes gevonden</Text>
              </View>
            ) : (
              decisions.map((decision) => {
                const status = statusConfig[decision.status];
                return (
                  <View
                    key={decision.id}
                    className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-lg font-bold text-text-primary flex-1">{decision.title}</Text>
                      <View className={`${status.bg} border-2 ${status.border} rounded-full px-3 py-1`}>
                        <Text className={`${status.text} font-semibold text-sm`}>{status.label}</Text>
                      </View>
                    </View>
                    {decision.description && (
                      <Text className="text-text-muted mb-2">{decision.description}</Text>
                    )}
                    <Text className="text-primary font-bold">€{decision.amount.toFixed(2)}</Text>
                    <Text className="text-text-muted text-sm mt-2">
                      {new Date(decision.createdAt).toLocaleDateString('nl-NL')}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <View className="mb-20">
            {moneyRequests.length === 0 ? (
              <View className="bg-surface border-3 border-black rounded-lg p-4">
                <Text className="text-text-muted text-center">Geen geldverzoeken gevonden</Text>
              </View>
            ) : (
              moneyRequests.map((request) => {
                const status = statusConfig[request.status];
                return (
                  <View
                    key={request.id}
                    className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-lg font-bold text-text-primary flex-1">
                        {categoryLabels[request.category] || request.category}
                      </Text>
                      <View className={`${status.bg} border-2 ${status.border} rounded-full px-3 py-1`}>
                        <Text className={`${status.text} font-semibold text-sm`}>{status.label}</Text>
                      </View>
                    </View>
                    {request.description && (
                      <Text className="text-text-muted mb-2">{request.description}</Text>
                    )}
                    <Text className="text-primary font-bold">€{request.amount.toFixed(2)}</Text>
                    <Text className="text-text-muted text-sm mt-2">
                      {new Date(request.createdAt).toLocaleDateString('nl-NL')}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
