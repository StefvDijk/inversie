import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { notificationsApi, Notification } from '../api/client';

function NotificationCard({ notification, onMarkRead }: { notification: Notification; onMarkRead: () => void }) {
  const typeConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    decision_approved: { icon: 'checkmark-circle', color: '#2A9D8F' },
    decision_denied: { icon: 'close-circle', color: '#d6453a' },
    money_approved: { icon: 'cash', color: '#2A9D8F' },
    money_denied: { icon: 'cash', color: '#d6453a' },
    appointment: { icon: 'calendar', color: '#5D67CE' },
    reminder: { icon: 'alarm', color: '#F4A261' },
    survey: { icon: 'clipboard', color: '#f76a0c' },
    default: { icon: 'notifications', color: '#888' },
  };

  const config = typeConfig[notification.type] || typeConfig.default;
  const date = new Date(notification.createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <TouchableOpacity
      className={`bg-surface border-3 border-black rounded-lg p-4 mb-3 ${!notification.isRead ? 'border-l-8 border-l-primary' : ''}`}
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
      onPress={onMarkRead}
    >
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: config.color + '20' }}
        >
          <Ionicons name={config.icon} size={24} color={config.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg ${!notification.isRead ? 'font-bold' : 'font-semibold'} text-text-primary`}>
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View className="w-3 h-3 rounded-full bg-primary" />
            )}
          </View>
          <Text className="text-text-muted mt-1">{notification.message}</Text>
          <Text className="text-text-muted text-sm mt-2">{timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Zojuist';
  if (diffMins < 60) return `${diffMins} minuten geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return 'Gisteren';
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'decision_approved',
    title: 'Keuze goedgekeurd',
    message: 'Je keuze "Nieuwe schoenen" is goedgekeurd door Maria.',
    data: null,
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  },
  {
    id: '2',
    userId: '1',
    type: 'appointment',
    title: 'Afspraak herinnering',
    message: 'Je hebt morgen om 14:00 een afspraak met Maria.',
    data: null,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    userId: '1',
    type: 'survey',
    title: 'Tijd voor een check-in',
    message: 'Het is weer tijd om de Inclusiemeter in te vullen.',
    data: null,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '4',
    userId: '1',
    type: 'money_approved',
    title: 'Geldverzoek goedgekeurd',
    message: '€45,00 voor boodschappen is overgeboekt.',
    data: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

export default function NotificationsScreen() {
  const { token, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      // In real app, would fetch from API
      // const data = await notificationsApi.getAll(token);
      // setNotifications(data);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      if (err.message?.includes('Authentication') || err.message?.includes('Session')) {
        logout();
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, logout]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#d6453a" />
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
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} color="#111" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-text-primary">Meldingen</Text>
              {unreadCount > 0 && (
                <Text className="text-text-muted">{unreadCount} ongelezen</Text>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              className="bg-surface border-2 border-black rounded-lg px-3 py-2"
              onPress={handleMarkAllRead}
            >
              <Text className="text-text-primary font-semibold">Alles gelezen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-8 items-center">
            <Ionicons name="notifications-off" size={48} color="#888" />
            <Text className="text-text-muted mt-4 text-center">Geen meldingen</Text>
          </View>
        ) : (
          <View className="mb-20">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={() => handleMarkRead(notification.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
