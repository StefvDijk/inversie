import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { moneyRequestsApi, MoneyRequest, transactionsApi, Transaction } from '../../api/client';

function MoneyRequestCard({ request }: { request: MoneyRequest }) {
  const statusConfig = {
    PENDING: { bg: 'bg-warning/20', border: 'border-warning', text: 'text-warning', label: 'Wachtend' },
    APPROVED: { bg: 'bg-success/20', border: 'border-success', text: 'text-success', label: 'Goedgekeurd' },
    DENIED: { bg: 'bg-error/20', border: 'border-error', text: 'text-error', label: 'Afgewezen' },
  };
  const status = statusConfig[request.status];

  const categoryIcons: Record<string, string> = {
    groceries: '🛒',
    clothing: '👕',
    entertainment: '🎮',
    transport: '🚌',
    medical: '💊',
    other: '📦',
  };

  return (
    <View
      className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{categoryIcons[request.category] || '📦'}</Text>
          <View className="flex-1">
            <Text className="text-lg font-bold text-text-primary">€{request.amount.toFixed(2)}</Text>
            <Text className="text-text-muted capitalize">{request.category}</Text>
            {request.description && (
              <Text className="text-text-muted text-sm mt-1" numberOfLines={2}>{request.description}</Text>
            )}
          </View>
        </View>
        <View className={`${status.bg} border-2 ${status.border} rounded-full px-3 py-1`}>
          <Text className={`${status.text} font-semibold text-sm`}>{status.label}</Text>
        </View>
      </View>
      {request.bewindvoerderMessage && (
        <View className="mt-3 bg-gray-100 rounded-lg p-3">
          <Text className="text-text-muted text-sm">💬 {request.bewindvoerderMessage}</Text>
        </View>
      )}
    </View>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const isExpense = transaction.amount < 0;
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

  return (
    <View className="flex-row items-center py-3 border-b border-gray-200">
      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Ionicons
          name={isExpense ? 'arrow-up' : 'arrow-down'}
          size={20}
          color={isExpense ? '#d6453a' : '#2A9D8F'}
        />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-text-primary" numberOfLines={1}>{transaction.description}</Text>
        <Text className="text-text-muted text-sm">{formattedDate}</Text>
      </View>
      <Text className={`font-bold ${isExpense ? 'text-error' : 'text-success'}`}>
        {isExpense ? '' : '+'}€{Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </View>
  );
}

export default function MoneyScreen() {
  const { token, logout } = useAuthStore();
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'transactions'>('requests');

  // New request modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction filters
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'week'>('all');

  const categories = [
    { id: 'groceries', label: 'Boodschappen', icon: '🛒' },
    { id: 'clothing', label: 'Kleding', icon: '👕' },
    { id: 'entertainment', label: 'Vrije tijd', icon: '🎮' },
    { id: 'transport', label: 'Vervoer', icon: '🚌' },
    { id: 'medical', label: 'Medisch', icon: '💊' },
    { id: 'other', label: 'Anders', icon: '📦' },
  ];

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const [requestsData, transactionsData] = await Promise.all([
        moneyRequestsApi.getAll(token),
        transactionsApi.getAll(token),
      ]);

      setRequests(requestsData);
      setTransactions(transactionsData);
    } catch (err: any) {
      console.error('Failed to fetch money data:', err);
      setError(err.message || 'Failed to load data');
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

  const handleCreateRequest = async () => {
    if (!token || !newAmount || !newCategory) {
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }

    setIsSubmitting(true);
    try {
      await moneyRequestsApi.create(token, {
        amount: parseFloat(newAmount),
        category: newCategory,
        description: newDescription || undefined,
        photoUrl: 'placeholder.jpg', // In real app, would upload photo first
      });

      // Reset form and close modal
      setNewAmount('');
      setNewCategory('');
      setNewDescription('');
      setShowNewModal(false);

      // Refresh data
      fetchData();
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Kon verzoek niet aanmaken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const completedRequests = requests.filter(r => r.status !== 'PENDING');

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    // Type filter
    if (transactionFilter === 'income' && t.amount < 0) return false;
    if (transactionFilter === 'expense' && t.amount >= 0) return false;

    // Date filter
    const transactionDate = new Date(t.date);
    const now = new Date();
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (transactionDate < weekAgo) return false;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (transactionDate < monthAgo) return false;
    }

    return true;
  });

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
        <Text className="text-2xl font-bold text-text-primary mb-2">Geld</Text>
        <Text className="text-text-muted mb-6">Beheer je verzoeken en bekijk transacties</Text>

        {/* New Request Button */}
        <TouchableOpacity
          className="bg-accent border-3 border-black rounded-lg p-4 mb-6 flex-row items-center justify-center"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={() => setShowNewModal(true)}
        >
          <Ionicons name="cash" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Geld Vragen</Text>
        </TouchableOpacity>

        {/* Error */}
        {error && (
          <View className="bg-error/10 border-2 border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-center">{error}</Text>
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 border-3 border-black rounded-l-lg ${activeTab === 'requests' ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => setActiveTab('requests')}
          >
            <Text className={`text-center font-bold ${activeTab === 'requests' ? 'text-white' : 'text-text-primary'}`}>
              Verzoeken
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 border-3 border-l-0 border-black rounded-r-lg ${activeTab === 'transactions' ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => setActiveTab('transactions')}
          >
            <Text className={`text-center font-bold ${activeTab === 'transactions' ? 'text-white' : 'text-text-primary'}`}>
              Transacties
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'requests' ? (
          <>
            {/* Pending Requests */}
            <Text className="text-xl font-bold text-text-primary mb-4">Wachtend ({pendingRequests.length})</Text>
            {pendingRequests.length === 0 ? (
              <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
                <Text className="text-text-muted text-center">Geen openstaande verzoeken</Text>
              </View>
            ) : (
              <View className="mb-6">
                {pendingRequests.map((request) => (
                  <MoneyRequestCard key={request.id} request={request} />
                ))}
              </View>
            )}

            {/* Completed Requests */}
            <Text className="text-xl font-bold text-text-primary mb-4">Afgehandeld ({completedRequests.length})</Text>
            {completedRequests.length === 0 ? (
              <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
                <Text className="text-text-muted text-center">Geen afgehandelde verzoeken</Text>
              </View>
            ) : (
              <View className="mb-20">
                {completedRequests.map((request) => (
                  <MoneyRequestCard key={request.id} request={request} />
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Transaction Filters */}
            <View className="mb-4">
              {/* Type Filter */}
              <View className="flex-row mb-3">
                {[
                  { id: 'all', label: 'Alles' },
                  { id: 'income', label: 'Inkomsten' },
                  { id: 'expense', label: 'Uitgaven' },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    className={`flex-1 py-2 border-2 border-black ${
                      filter.id === 'all' ? 'rounded-l-lg' : filter.id === 'expense' ? 'rounded-r-lg border-l-0' : 'border-l-0'
                    } ${transactionFilter === filter.id ? 'bg-accent' : 'bg-surface'}`}
                    onPress={() => setTransactionFilter(filter.id as any)}
                  >
                    <Text className={`text-center font-semibold ${transactionFilter === filter.id ? 'text-white' : 'text-text-primary'}`}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Filter */}
              <View className="flex-row">
                {[
                  { id: 'all', label: 'Alle tijd' },
                  { id: 'month', label: 'Deze maand' },
                  { id: 'week', label: 'Deze week' },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    className={`flex-1 py-2 border-2 border-black ${
                      filter.id === 'all' ? 'rounded-l-lg' : filter.id === 'week' ? 'rounded-r-lg border-l-0' : 'border-l-0'
                    } ${dateFilter === filter.id ? 'bg-primary' : 'bg-surface'}`}
                    onPress={() => setDateFilter(filter.id as any)}
                  >
                    <Text className={`text-center font-semibold ${dateFilter === filter.id ? 'text-white' : 'text-text-primary'}`}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transactions */}
            <Text className="text-xl font-bold text-text-primary mb-4">
              Transacties ({filteredTransactions.length})
            </Text>
            {filteredTransactions.length === 0 ? (
              <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
                <Text className="text-text-muted text-center">Geen transacties gevonden</Text>
              </View>
            ) : (
              <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
                {filteredTransactions.slice(0, 20).map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
                {filteredTransactions.length > 20 && (
                  <Text className="text-text-muted text-center mt-4">
                    + {filteredTransactions.length - 20} meer transacties
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* New Request Modal */}
      <Modal visible={showNewModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">Geld Vragen</Text>
              <TouchableOpacity onPress={() => setShowNewModal(false)}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Hoeveel heb je nodig? *</Text>
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

              {/* Category */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Waarvoor? *</Text>
              <View className="flex-row flex-wrap mb-4">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`border-3 border-black rounded-lg p-3 mr-2 mb-2 flex-row items-center ${
                      newCategory === cat.id ? 'bg-accent' : 'bg-surface'
                    }`}
                    onPress={() => setNewCategory(cat.id)}
                  >
                    <Text className="text-lg mr-2">{cat.icon}</Text>
                    <Text className={`font-semibold ${newCategory === cat.id ? 'text-white' : 'text-text-primary'}`}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Toelichting</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
                placeholder="Waar is het geld voor?"
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />

              {/* Photo placeholder */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Foto (optioneel)</Text>
              <TouchableOpacity className="bg-surface border-3 border-black border-dashed rounded-lg p-8 mb-6 items-center">
                <Ionicons name="camera" size={48} color="#888" />
                <Text className="text-text-muted mt-2">Tik om foto toe te voegen</Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                className={`border-3 border-black rounded-lg p-4 mb-8 ${
                  isSubmitting || !newAmount || !newCategory ? 'bg-gray-400' : 'bg-accent'
                }`}
                style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
                onPress={handleCreateRequest}
                disabled={isSubmitting || !newAmount || !newCategory}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-bold">Verzoek Versturen</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
