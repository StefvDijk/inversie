import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  location?: string;
  notes?: string;
  type: 'bewindvoerder' | 'other';
}

// Mock appointments for demo
const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Gesprek met Maria',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '14:00',
    location: 'Kantoor Bewindvoering',
    type: 'bewindvoerder',
  },
  {
    id: '2',
    title: 'Budgetbespreking',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: '10:30',
    location: 'Online (Teams)',
    type: 'bewindvoerder',
  },
];

const pastAppointments: Appointment[] = [
  {
    id: '3',
    title: 'Intake gesprek',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    time: '11:00',
    location: 'Kantoor Bewindvoering',
    notes: 'Alles besproken, plan opgesteld',
    type: 'bewindvoerder',
  },
];

function AppointmentCard({ appointment, isPast }: { appointment: Appointment; isPast?: boolean }) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('nl-NL', options);
  };

  const daysUntil = Math.ceil((appointment.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <View
      className={`bg-surface border-3 border-black rounded-lg p-4 mb-3 ${isPast ? 'opacity-70' : ''}`}
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
    >
      <View className="flex-row items-start">
        <View className={`w-14 h-14 rounded-lg items-center justify-center mr-4 ${
          appointment.type === 'bewindvoerder' ? 'bg-accent' : 'bg-primary'
        }`}>
          <Ionicons
            name={appointment.type === 'bewindvoerder' ? 'person' : 'calendar'}
            size={28}
            color="white"
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-primary">{appointment.title}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={16} color="#888" />
            <Text className="text-text-muted ml-1">{formatDate(appointment.date)}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={16} color="#888" />
            <Text className="text-text-muted ml-1">{appointment.time}</Text>
          </View>
          {appointment.location && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={16} color="#888" />
              <Text className="text-text-muted ml-1">{appointment.location}</Text>
            </View>
          )}
          {appointment.notes && (
            <View className="mt-2 bg-gray-100 rounded-lg p-2">
              <Text className="text-text-muted text-sm">📝 {appointment.notes}</Text>
            </View>
          )}
        </View>
        {!isPast && daysUntil <= 3 && (
          <View className="bg-warning/20 border-2 border-warning rounded-full px-2 py-1">
            <Text className="text-warning font-semibold text-xs">
              {daysUntil === 0 ? 'Vandaag' : daysUntil === 1 ? 'Morgen' : `${daysUntil} dagen`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function AgendaScreen() {
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [past] = useState<Appointment[]>(pastAppointments);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateAppointment = () => {
    if (!newTitle || !newDate || !newTime) {
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }
    // In real app, would create appointment via API
    Alert.alert('Binnenkort', 'Afspraak aanvragen komt binnenkort!');
    setShowNewModal(false);
  };

  // Get current month calendar days
  const today = new Date();
  const currentMonth = today.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  // Simple calendar view showing days with appointments
  const appointmentDates = appointments.map(a => a.date.getDate());

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">Agenda</Text>
        <Text className="text-text-muted mb-6">Beheer je afspraken</Text>

        {/* Mini Calendar */}
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-text-primary text-center mb-4 capitalize">{currentMonth}</Text>
          <View className="flex-row flex-wrap justify-around">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
              <Text key={day} className="w-10 text-center text-text-muted font-semibold mb-2">{day}</Text>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {/* Generate calendar days - simplified version */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const hasAppointment = appointmentDates.includes(day);
              const isToday = day === today.getDate();
              return (
                <View
                  key={day}
                  className={`w-10 h-10 items-center justify-center m-0.5 rounded-full ${
                    isToday ? 'bg-primary' : hasAppointment ? 'bg-accent/20' : ''
                  }`}
                >
                  <Text className={`${isToday ? 'text-white font-bold' : hasAppointment ? 'text-accent font-semibold' : 'text-text-primary'}`}>
                    {day}
                  </Text>
                  {hasAppointment && !isToday && (
                    <View className="w-1.5 h-1.5 bg-accent rounded-full absolute bottom-1" />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity
          className="bg-primary border-3 border-black rounded-lg p-4 mb-6 flex-row items-center justify-center"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={() => setShowNewModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Afspraak Aanvragen</Text>
        </TouchableOpacity>

        {/* Upcoming Appointments */}
        <Text className="text-xl font-bold text-text-primary mb-4">Komende Afspraken ({appointments.length})</Text>
        {appointments.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
            <Text className="text-text-muted text-center">Geen komende afspraken</Text>
          </View>
        ) : (
          <View className="mb-6">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </View>
        )}

        {/* Past Appointments */}
        <Text className="text-xl font-bold text-text-primary mb-4">Vorige Afspraken ({past.length})</Text>
        {past.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-20">
            <Text className="text-text-muted text-center">Geen vorige afspraken</Text>
          </View>
        ) : (
          <View className="mb-20">
            {past.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast />
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Appointment Modal */}
      <Modal visible={showNewModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">Afspraak Aanvragen</Text>
              <TouchableOpacity onPress={() => setShowNewModal(false)}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type info */}
              <View className="bg-accent/10 border-2 border-accent rounded-lg p-3 mb-4">
                <Text className="text-accent text-center">
                  Je bewindvoerder ontvangt je verzoek en plant de afspraak
                </Text>
              </View>

              {/* Title */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Onderwerp *</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
                placeholder="bijv. Budgetbespreking"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Preferred date */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Voorkeursdatum *</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
                placeholder="bijv. volgende week dinsdag"
                value={newDate}
                onChangeText={setNewDate}
              />

              {/* Preferred time */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Voorkeurstijd *</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
                placeholder="bijv. ochtend of 14:00"
                value={newTime}
                onChangeText={setNewTime}
              />

              {/* Notes */}
              <Text className="text-lg font-semibold text-text-primary mb-2">Opmerkingen</Text>
              <TextInput
                className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-6"
                placeholder="Waar wil je het over hebben?"
                value={newNotes}
                onChangeText={setNewNotes}
                multiline
                numberOfLines={3}
              />

              {/* Submit */}
              <TouchableOpacity
                className={`border-3 border-black rounded-lg p-4 mb-8 ${
                  !newTitle || !newDate || !newTime ? 'bg-gray-400' : 'bg-primary'
                }`}
                style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
                onPress={handleCreateAppointment}
                disabled={!newTitle || !newDate || !newTime}
              >
                <Text className="text-white text-center text-lg font-bold">Verzoek Versturen</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
