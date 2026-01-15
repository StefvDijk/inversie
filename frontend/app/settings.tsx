import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const languages = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

const textSizes = [
  { value: 'small', label: 'Klein', sample: 'Aa' },
  { value: 'medium', label: 'Normaal', sample: 'Aa' },
  { value: 'large', label: 'Groot', sample: 'Aa' },
];

export default function SettingsScreen() {
  const { user, token, logout } = useAuthStore();
  const [language, setLanguage] = useState(user?.language || 'nl');
  const [textSize, setTextSize] = useState(user?.textSize || 'medium');
  const [highContrast, setHighContrast] = useState(user?.highContrast || false);
  const [biometrics, setBiometrics] = useState(user?.biometricsEnabled || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In real app, would call API to save settings
      Alert.alert('Opgeslagen', 'Je instellingen zijn opgeslagen');
    } catch (error) {
      Alert.alert('Fout', 'Kon instellingen niet opslaan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary">Instellingen</Text>
        </View>

        {/* Profile Section */}
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mr-4">
              <Text className="text-2xl text-white font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-text-primary">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-text-muted">{user?.email}</Text>
              <View className="bg-accent/20 rounded-full px-2 py-1 self-start mt-1">
                <Text className="text-accent text-sm font-semibold">
                  {user?.type === 'CLIENT' ? 'Cliënt' : 'Bewindvoerder'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Language Selection */}
        <Text className="text-lg font-bold text-text-primary mb-3">Taal</Text>
        <View className="flex-row flex-wrap mb-6">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              className={`border-3 border-black rounded-lg p-3 mr-2 mb-2 flex-row items-center ${
                language === lang.code ? 'bg-primary' : 'bg-surface'
              }`}
              onPress={() => setLanguage(lang.code)}
            >
              <Text className="text-lg mr-2">{lang.flag}</Text>
              <Text className={`font-semibold ${language === lang.code ? 'text-white' : 'text-text-primary'}`}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text Size */}
        <Text className="text-lg font-bold text-text-primary mb-3">Tekstgrootte</Text>
        <View className="flex-row mb-6">
          {textSizes.map((size) => (
            <TouchableOpacity
              key={size.value}
              className={`flex-1 border-3 border-black rounded-lg p-4 mr-2 items-center ${
                textSize === size.value ? 'bg-primary' : 'bg-surface'
              }`}
              onPress={() => setTextSize(size.value)}
            >
              <Text
                className={`font-bold mb-1 ${textSize === size.value ? 'text-white' : 'text-text-primary'}`}
                style={{ fontSize: size.value === 'small' ? 14 : size.value === 'large' ? 22 : 18 }}
              >
                {size.sample}
              </Text>
              <Text className={`text-sm ${textSize === size.value ? 'text-white' : 'text-text-muted'}`}>
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accessibility Options */}
        <Text className="text-lg font-bold text-text-primary mb-3">Toegankelijkheid</Text>
        <View className="bg-surface border-3 border-black rounded-lg mb-6">
          <View className="flex-row items-center justify-between p-4 border-b-2 border-gray-200">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3">
                <Ionicons name="contrast" size={20} color="white" />
              </View>
              <View>
                <Text className="font-semibold text-text-primary">Hoog contrast</Text>
                <Text className="text-text-muted text-sm">Meer contrast voor leesbaarheid</Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#ccc', true: '#d6453a' }}
            />
          </View>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-accent items-center justify-center mr-3">
                <Ionicons name="finger-print" size={20} color="white" />
              </View>
              <View>
                <Text className="font-semibold text-text-primary">Face ID / Vingerafdruk</Text>
                <Text className="text-text-muted text-sm">Log snel in met biometrie</Text>
              </View>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: '#ccc', true: '#d6453a' }}
            />
          </View>
        </View>

        {/* Security */}
        <Text className="text-lg font-bold text-text-primary mb-3">Beveiliging</Text>
        <TouchableOpacity
          className="bg-surface border-3 border-black rounded-lg p-4 mb-6 flex-row items-center"
          onPress={() => router.push('/change-pin')}
        >
          <View className="w-10 h-10 rounded-full bg-warning items-center justify-center mr-3">
            <Ionicons name="key" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-text-primary">PIN wijzigen</Text>
            <Text className="text-text-muted text-sm">Verander je inlogcode</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>

        {/* Help */}
        <Text className="text-lg font-bold text-text-primary mb-3">Hulp</Text>
        <View className="bg-surface border-3 border-black rounded-lg mb-6">
          <TouchableOpacity className="flex-row items-center p-4 border-b-2 border-gray-200">
            <Ionicons name="help-circle" size={24} color="#5D67CE" />
            <Text className="font-semibold text-text-primary ml-3 flex-1">Veelgestelde vragen</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b-2 border-gray-200">
            <Ionicons name="chatbubble" size={24} color="#2A9D8F" />
            <Text className="font-semibold text-text-primary ml-3 flex-1">Contact opnemen</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4">
            <Ionicons name="information-circle" size={24} color="#F4A261" />
            <Text className="font-semibold text-text-primary ml-3 flex-1">Over Inversie</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-primary border-3 border-black rounded-lg p-4 mb-4"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">Opslaan</Text>
          )}
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-error border-3 border-black rounded-lg p-4 mb-20"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={handleLogout}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out" size={24} color="white" />
            <Text className="text-white text-center text-lg font-bold ml-2">Uitloggen</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
