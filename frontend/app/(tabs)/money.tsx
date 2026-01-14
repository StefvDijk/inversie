import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MoneyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Quick Actions */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className="flex-1 bg-accent border-3 border-black rounded-lg p-4 mr-2 flex-row items-center justify-center"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          >
            <Ionicons name="cash" size={24} color="white" />
            <Text className="text-white font-bold ml-2">Geld Vragen</Text>
          </TouchableOpacity>
        </View>

        {/* Money Requests */}
        <Text className="text-xl font-bold text-text-primary mb-4">Geldverzoeken</Text>
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <Text className="text-text-muted text-center">Geen geldverzoeken</Text>
        </View>

        {/* Transactions */}
        <Text className="text-xl font-bold text-text-primary mb-4">Transacties</Text>
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
          <Text className="text-text-muted text-center">Geen transacties gevonden</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
