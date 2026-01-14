import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Placeholder potje data
const potjes = [
  { id: '1', name: 'Boodschappen', icon: '🛒', budget: 400, spent: 280 },
  { id: '2', name: 'Vrije tijd', icon: '🎉', budget: 100, spent: 45 },
  { id: '3', name: 'Kleding', icon: '👕', budget: 75, spent: 20 },
  { id: '4', name: 'Vervoer', icon: '🚌', budget: 50, spent: 50 },
];

function PotjeCard({ potje }: { potje: typeof potjes[0] }) {
  const percentSpent = (potje.spent / potje.budget) * 100;
  const remaining = potje.budget - potje.spent;

  return (
    <TouchableOpacity
      className="bg-surface border-3 border-black rounded-lg p-4 mb-4"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{potje.icon}</Text>
          <Text className="text-lg font-bold text-text-primary">{potje.name}</Text>
        </View>
        <Text className="text-text-muted">€{remaining} over</Text>
      </View>

      {/* Progress bar */}
      <View className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
        <View
          className={`h-full ${percentSpent > 90 ? 'bg-error' : percentSpent > 70 ? 'bg-warning' : 'bg-success'}`}
          style={{ width: `${Math.min(percentSpent, 100)}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-text-muted">€{potje.spent} gebruikt</Text>
        <Text className="text-text-muted">€{potje.budget} budget</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-text-primary">Hallo Jan! 👋</Text>
            <Text className="text-text-muted">Hier is je overzicht</Text>
          </View>
          <TouchableOpacity className="bg-surface border-2 border-black rounded-full p-2">
            <Ionicons name="notifications-outline" size={24} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className="flex-1 bg-primary border-3 border-black rounded-lg p-4 mr-2"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold mt-2">Nieuwe Keuze</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-accent border-3 border-black rounded-lg p-4 ml-2"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          >
            <Ionicons name="cash" size={24} color="white" />
            <Text className="text-white font-bold mt-2">Geld Vragen</Text>
          </TouchableOpacity>
        </View>

        {/* Potjes Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-text-primary mb-4">Je Potjes</Text>
          {potjes.map((potje) => (
            <PotjeCard key={potje.id} potje={potje} />
          ))}
        </View>

        {/* Pending Items */}
        <View className="mb-20">
          <Text className="text-xl font-bold text-text-primary mb-4">Wachtend</Text>
          <View className="bg-surface border-3 border-black rounded-lg p-4">
            <Text className="text-text-muted text-center">Geen openstaande verzoeken</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
