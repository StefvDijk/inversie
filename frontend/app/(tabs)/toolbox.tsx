import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const tools = [
  {
    id: 'lees-simpel',
    title: 'Lees Simpel',
    description: 'Maak een foto van een brief en lees hem in eenvoudige taal',
    icon: 'document-text',
    color: '#d6453a',
  },
  {
    id: 'surveys',
    title: 'Vragenlijsten',
    description: 'Vul vragenlijsten in over je financiële situatie',
    icon: 'clipboard',
    color: '#f76a0c',
  },
  {
    id: 'savings',
    title: 'Spaardoelen',
    description: 'Stel doelen en volg je voortgang',
    icon: 'trophy',
    color: '#22c55e',
  },
];

export default function ToolboxScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-text-primary mb-6">Toolbox</Text>

        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            className="bg-surface border-3 border-black rounded-lg p-4 mb-4 flex-row items-center"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          >
            <View
              className="w-14 h-14 rounded-lg items-center justify-center border-2 border-black mr-4"
              style={{ backgroundColor: tool.color }}
            >
              <Ionicons name={tool.icon as any} size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text-primary">{tool.title}</Text>
              <Text className="text-text-muted">{tool.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888888" />
          </TouchableOpacity>
        ))}

        {/* Saved Documents */}
        <Text className="text-xl font-bold text-text-primary mt-6 mb-4">Opgeslagen Documenten</Text>
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
          <Text className="text-text-muted text-center">Geen opgeslagen documenten</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
