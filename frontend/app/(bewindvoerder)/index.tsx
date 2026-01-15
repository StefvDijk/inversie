import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { bewindvoerderApi, Client } from '../../api/client';

export default function BewindvoerderDashboard() {
  const { token, user, logout } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const data = await bewindvoerderApi.getClients(token);
      setClients(data);
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      if (err.message?.includes('Authentication')) {
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

  const totalPendingDecisions = clients.reduce((sum, c) => sum + c.pendingDecisions, 0);
  const totalPendingMoneyRequests = clients.reduce((sum, c) => sum + c.pendingMoneyRequests, 0);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#5D67CE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5D67CE']} tintColor="#5D67CE" />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-text-primary">
              Hallo {user?.firstName}! 👋
            </Text>
            <Text className="text-text-muted">Bewindvoerder Dashboard</Text>
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

        {/* Quick Stats */}
        <View className="flex-row mb-6">
          <View className="flex-1 bg-accent border-3 border-black rounded-lg p-4 mr-2">
            <Text className="text-white text-3xl font-bold">{clients.length}</Text>
            <Text className="text-white/80">Cliënten</Text>
          </View>
          <View className="flex-1 bg-warning border-3 border-black rounded-lg p-4 mx-2">
            <Text className="text-white text-3xl font-bold">{totalPendingDecisions}</Text>
            <Text className="text-white/80">Keuzes</Text>
          </View>
          <View className="flex-1 bg-primary border-3 border-black rounded-lg p-4 ml-2">
            <Text className="text-white text-3xl font-bold">{totalPendingMoneyRequests}</Text>
            <Text className="text-white/80">Verzoeken</Text>
          </View>
        </View>

        {/* Action Required Section */}
        {(totalPendingDecisions > 0 || totalPendingMoneyRequests > 0) && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-text-primary mb-4">Actie Vereist</Text>
            <TouchableOpacity
              className="bg-warning/10 border-3 border-warning rounded-lg p-4 mb-3 flex-row items-center"
              onPress={() => router.push('/(bewindvoerder)/approvals')}
            >
              <View className="w-12 h-12 rounded-full bg-warning items-center justify-center mr-4">
                <Ionicons name="time" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-text-primary">
                  {totalPendingDecisions + totalPendingMoneyRequests} wachtende items
                </Text>
                <Text className="text-text-muted">Tik om te bekijken en goed te keuren</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        {/* Clients Overview */}
        <Text className="text-xl font-bold text-text-primary mb-4">Je Cliënten</Text>
        {clients.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
            <Text className="text-text-muted text-center">Geen cliënten gevonden</Text>
          </View>
        ) : (
          <View className="mb-20">
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
                style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
                onPress={() => router.push(`/client/${client.id}`)}
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-full bg-accent items-center justify-center mr-4">
                    <Text className="text-xl text-white font-bold">
                      {client.firstName[0]}{client.lastName[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-text-primary">
                      {client.firstName} {client.lastName}
                    </Text>
                    <Text className="text-text-muted">{client.email}</Text>
                  </View>
                  {(client.pendingDecisions > 0 || client.pendingMoneyRequests > 0) && (
                    <View className="bg-warning rounded-full w-6 h-6 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {client.pendingDecisions + client.pendingMoneyRequests}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
