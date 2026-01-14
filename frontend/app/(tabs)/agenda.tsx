import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AgendaScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Book Appointment Button */}
        <TouchableOpacity
          className="bg-primary border-3 border-black rounded-lg p-4 mb-6 flex-row items-center justify-center"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Afspraak Maken</Text>
        </TouchableOpacity>

        {/* Upcoming Appointments */}
        <Text className="text-xl font-bold text-text-primary mb-4">Komende Afspraken</Text>
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <Text className="text-text-muted text-center">Geen komende afspraken</Text>
        </View>

        {/* Past Appointments */}
        <Text className="text-xl font-bold text-text-primary mb-4">Vorige Afspraken</Text>
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
          <Text className="text-text-muted text-center">Geen vorige afspraken</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
