import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { bewindvoerderApi, Client } from '../../api/client';

export default function ClientsScreen() {
  const { token, logout } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || client.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
        <Text className="text-2xl font-bold text-text-primary mb-2">Cliënten</Text>
        <Text className="text-text-muted mb-6">Beheer je cliënten</Text>

        {/* Search */}
        <View className="bg-surface border-3 border-black rounded-lg flex-row items-center px-4 mb-6">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 p-4 text-lg"
            placeholder="Zoek op naam of email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
            <Text className="text-text-muted text-center">
              {searchQuery ? 'Geen cliënten gevonden' : 'Je hebt nog geen cliënten'}
            </Text>
          </View>
        ) : (
          <View className="mb-20">
            {filteredClients.map((client) => (
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
                    {client.lastActivity && (
                      <Text className="text-text-muted text-sm">
                        Laatst actief: {new Date(client.lastActivity).toLocaleDateString('nl-NL')}
                      </Text>
                    )}
                  </View>
                  <View className="items-end">
                    {client.pendingDecisions > 0 && (
                      <View className="bg-warning/20 border border-warning rounded-full px-2 py-0.5 mb-1">
                        <Text className="text-warning text-xs">{client.pendingDecisions} keuzes</Text>
                      </View>
                    )}
                    {client.pendingMoneyRequests > 0 && (
                      <View className="bg-primary/20 border border-primary rounded-full px-2 py-0.5">
                        <Text className="text-primary text-xs">{client.pendingMoneyRequests} verzoeken</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
