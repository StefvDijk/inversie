import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { bewindvoerderApi, Client, Decision, MoneyRequest } from '../../api/client';

interface PendingItem {
  type: 'decision' | 'money';
  id: string;
  clientId: string;
  clientName: string;
  title?: string;
  amount: number;
  category?: string;
  description?: string;
  needsHelp?: boolean;
  createdAt: string;
}

export default function ApprovalsScreen() {
  const { token, logout } = useAuthStore();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'decisions' | 'money'>('all');

  // Response modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [responseAction, setResponseAction] = useState<'approve' | 'deny'>('approve');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const clients = await bewindvoerderApi.getClients(token);
      const items: PendingItem[] = [];

      // For each client, fetch their pending decisions and money requests
      for (const client of clients) {
        try {
          const [decisions, moneyRequests] = await Promise.all([
            bewindvoerderApi.getClientDecisions(token, client.id),
            bewindvoerderApi.getClientMoneyRequests(token, client.id),
          ]);

          decisions
            .filter(d => d.status === 'PENDING')
            .forEach(d => {
              items.push({
                type: 'decision',
                id: d.id,
                clientId: client.id,
                clientName: `${client.firstName} ${client.lastName}`,
                title: d.title,
                amount: d.amount,
                description: d.description || undefined,
                needsHelp: d.needsHelp,
                createdAt: d.createdAt,
              });
            });

          moneyRequests
            .filter(r => r.status === 'PENDING')
            .forEach(r => {
              items.push({
                type: 'money',
                id: r.id,
                clientId: client.id,
                clientName: `${client.firstName} ${client.lastName}`,
                amount: r.amount,
                category: r.category,
                description: r.description || undefined,
                createdAt: r.createdAt,
              });
            });
        } catch (err) {
          console.error(`Failed to fetch data for client ${client.id}:`, err);
        }
      }

      // Sort by creation date (newest first)
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingItems(items);
    } catch (err: any) {
      console.error('Failed to fetch pending items:', err);
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

  const openResponseModal = (item: PendingItem, action: 'approve' | 'deny') => {
    setSelectedItem(item);
    setResponseAction(action);
    setMessage('');
    setShowModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!token || !selectedItem) return;

    if (responseAction === 'deny' && !message.trim()) {
      Alert.alert('Fout', 'Geef een reden voor de afwijzing');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedItem.type === 'decision') {
        if (responseAction === 'approve') {
          await bewindvoerderApi.approveDecision(token, selectedItem.id, message || undefined);
        } else {
          await bewindvoerderApi.denyDecision(token, selectedItem.id, message);
        }
      } else {
        if (responseAction === 'approve') {
          await bewindvoerderApi.approveMoneyRequest(token, selectedItem.id, message || undefined);
        } else {
          await bewindvoerderApi.denyMoneyRequest(token, selectedItem.id, message);
        }
      }

      setShowModal(false);
      Alert.alert(
        'Gelukt',
        responseAction === 'approve' ? 'Item goedgekeurd' : 'Item afgewezen',
        [{ text: 'OK', onPress: () => fetchData() }]
      );
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Kon actie niet uitvoeren');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = pendingItems.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'decisions') return item.type === 'decision';
    return item.type === 'money';
  });

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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5D67CE']} tintColor="#5D67CE" />
        }
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">Goedkeuren</Text>
        <Text className="text-text-muted mb-6">Bekijk en behandel verzoeken</Text>

        {/* Tabs */}
        <View className="flex-row mb-6">
          {[
            { id: 'all', label: 'Alles' },
            { id: 'decisions', label: 'Keuzes' },
            { id: 'money', label: 'Geld' },
          ].map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 py-3 border-3 border-black ${
                index === 0 ? 'rounded-l-lg' : index === 2 ? 'rounded-r-lg border-l-0' : 'border-l-0'
              } ${activeTab === tab.id ? 'bg-accent' : 'bg-surface'}`}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text className={`text-center font-bold ${activeTab === tab.id ? 'text-white' : 'text-text-primary'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-8 items-center mb-20">
            <Ionicons name="checkmark-circle" size={64} color="#2A9D8F" />
            <Text className="text-xl font-bold text-text-primary mt-4">Alles is bijgewerkt!</Text>
            <Text className="text-text-muted text-center mt-2">
              Er zijn geen openstaande verzoeken om te behandelen.
            </Text>
          </View>
        ) : (
          <View className="mb-20">
            {filteredItems.map((item) => (
              <View
                key={`${item.type}-${item.id}`}
                className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
                style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
              >
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      item.type === 'decision' ? 'bg-warning' : 'bg-primary'
                    }`}>
                      <Ionicons
                        name={item.type === 'decision' ? 'bulb' : 'cash'}
                        size={20}
                        color="white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-text-primary">
                        {item.type === 'decision' ? item.title : categoryLabels[item.category || 'other']}
                      </Text>
                      <Text className="text-text-muted">{item.clientName}</Text>
                    </View>
                  </View>
                  <Text className="text-xl font-bold text-primary">€{item.amount.toFixed(2)}</Text>
                </View>

                {/* Description */}
                {item.description && (
                  <View className="bg-gray-100 rounded-lg p-3 mb-3">
                    <Text className="text-text-primary">{item.description}</Text>
                  </View>
                )}

                {/* Help needed badge */}
                {item.needsHelp && (
                  <View className="bg-accent/10 border border-accent rounded-lg p-2 mb-3 flex-row items-center">
                    <Ionicons name="help-circle" size={18} color="#5D67CE" />
                    <Text className="text-accent ml-2 text-sm font-semibold">Hulp gevraagd</Text>
                  </View>
                )}

                {/* Date */}
                <Text className="text-text-muted text-sm mb-3">
                  {new Date(item.createdAt).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                {/* Action buttons */}
                <View className="flex-row">
                  <TouchableOpacity
                    className="flex-1 bg-success border-2 border-black rounded-lg p-3 mr-2 flex-row items-center justify-center"
                    onPress={() => openResponseModal(item, 'approve')}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Goedkeuren</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-error border-2 border-black rounded-lg p-3 ml-2 flex-row items-center justify-center"
                    onPress={() => openResponseModal(item, 'deny')}
                  >
                    <Ionicons name="close" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Afwijzen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Response Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">
                {responseAction === 'approve' ? 'Goedkeuren' : 'Afwijzen'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View className="bg-surface border-2 border-black rounded-lg p-4 mb-6">
                <Text className="text-lg font-bold text-text-primary">
                  {selectedItem.type === 'decision' ? selectedItem.title : categoryLabels[selectedItem.category || 'other']}
                </Text>
                <Text className="text-text-muted">{selectedItem.clientName}</Text>
                <Text className="text-primary font-bold mt-2">€{selectedItem.amount.toFixed(2)}</Text>
              </View>
            )}

            <Text className="text-lg font-semibold text-text-primary mb-2">
              Bericht aan cliënt {responseAction === 'deny' ? '*' : '(optioneel)'}
            </Text>
            <TextInput
              className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-6"
              placeholder={responseAction === 'approve'
                ? 'bijv. Goed bezig!'
                : 'Leg uit waarom je dit afwijst...'
              }
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              className={`border-3 border-black rounded-lg p-4 ${
                isSubmitting || (responseAction === 'deny' && !message.trim())
                  ? 'bg-gray-400'
                  : responseAction === 'approve' ? 'bg-success' : 'bg-error'
              }`}
              style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
              onPress={handleSubmitResponse}
              disabled={isSubmitting || (responseAction === 'deny' && !message.trim())}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-bold">
                  {responseAction === 'approve' ? 'Bevestig Goedkeuring' : 'Bevestig Afwijzing'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
