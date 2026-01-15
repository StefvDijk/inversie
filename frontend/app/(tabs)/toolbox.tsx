import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { savingsGoalsApi, SavingsGoal } from '../../api/client';

interface SurveyQuestion {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

const inclusiemeterQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    text: 'Hoe goed kun je zelf beslissingen nemen over geld?',
    options: [
      { value: 1, label: 'Heel moeilijk' },
      { value: 2, label: 'Moeilijk' },
      { value: 3, label: 'Gaat wel' },
      { value: 4, label: 'Goed' },
      { value: 5, label: 'Heel goed' },
    ],
  },
  {
    id: 'q2',
    text: 'Hoe zelfstandig voel je je in je dagelijks leven?',
    options: [
      { value: 1, label: 'Niet zelfstandig' },
      { value: 2, label: 'Beetje zelfstandig' },
      { value: 3, label: 'Gemiddeld' },
      { value: 4, label: 'Vrij zelfstandig' },
      { value: 5, label: 'Heel zelfstandig' },
    ],
  },
  {
    id: 'q3',
    text: 'Hoe tevreden ben je over de hulp die je krijgt?',
    options: [
      { value: 1, label: 'Heel ontevreden' },
      { value: 2, label: 'Ontevreden' },
      { value: 3, label: 'Neutraal' },
      { value: 4, label: 'Tevreden' },
      { value: 5, label: 'Heel tevreden' },
    ],
  },
];

const wellbeingQuestions: SurveyQuestion[] = [
  {
    id: 'w1',
    text: 'Hoe voel je je vandaag?',
    options: [
      { value: 1, label: '😢 Niet goed' },
      { value: 2, label: '😕 Beetje down' },
      { value: 3, label: '😐 Oké' },
      { value: 4, label: '🙂 Goed' },
      { value: 5, label: '😊 Heel goed' },
    ],
  },
  {
    id: 'w2',
    text: 'Heb je vandaag zorgen over geld?',
    options: [
      { value: 1, label: 'Heel veel zorgen' },
      { value: 2, label: 'Veel zorgen' },
      { value: 3, label: 'Een beetje' },
      { value: 4, label: 'Weinig zorgen' },
      { value: 5, label: 'Geen zorgen' },
    ],
  },
];

function SurveyCard({ title, description, icon, color, onPress }: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-surface border-3 border-black rounded-lg p-4 mb-4"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className={`w-14 h-14 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: color }}>
          <Ionicons name={icon} size={28} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-primary">{title}</Text>
          <Text className="text-text-muted">{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#888" />
      </View>
    </TouchableOpacity>
  );
}

function SavingsGoalCard({ goal, onAddMoney }: { goal: SavingsGoal; onAddMoney: () => void }) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <View
      className="bg-surface border-3 border-black rounded-lg p-4 mb-3"
      style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-text-primary">{goal.name}</Text>
        {goal.isCompleted && (
          <View className="bg-success/20 border-2 border-success rounded-full px-3 py-1">
            <Text className="text-success font-semibold text-sm">Behaald! 🎉</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden mb-2">
        <View
          className={`h-full ${goal.isCompleted ? 'bg-success' : 'bg-accent'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-text-muted">€{goal.currentAmount.toFixed(0)} / €{goal.targetAmount.toFixed(0)}</Text>
        </View>
        {!goal.isCompleted && (
          <TouchableOpacity
            className="bg-success border-2 border-black rounded-lg px-3 py-2"
            onPress={onAddMoney}
          >
            <Text className="text-white font-semibold">+ Toevoegen</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function ToolboxScreen() {
  const { token, logout } = useAuthStore();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Survey modal state
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<'inclusiemeter' | 'wellbeing' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  // New goal modal state
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = activeSurvey === 'inclusiemeter' ? inclusiemeterQuestions : wellbeingQuestions;

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const goals = await savingsGoalsApi.getAll(token);
      setSavingsGoals(goals);
    } catch (err: any) {
      console.error('Failed to fetch savings goals:', err);
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

  const startSurvey = (type: 'inclusiemeter' | 'wellbeing') => {
    setActiveSurvey(type);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setShowSurveyModal(true);
  };

  const handleAnswer = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const getAverageScore = () => {
    const values = Object.values(answers);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const closeSurvey = () => {
    setShowSurveyModal(false);
    setActiveSurvey(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleCreateGoal = async () => {
    if (!token || !newGoalName || !newGoalAmount) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    setIsSubmitting(true);
    try {
      await savingsGoalsApi.create(token, {
        name: newGoalName,
        targetAmount: parseFloat(newGoalAmount),
      });

      setNewGoalName('');
      setNewGoalAmount('');
      setShowNewGoalModal(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Kon doel niet aanmaken');
    } finally {
      setIsSubmitting(false);
    }
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
        <Text className="text-2xl font-bold text-text-primary mb-2">Toolbox</Text>
        <Text className="text-text-muted mb-6">Hulpmiddelen voor jouw welzijn en groei</Text>

        {/* Surveys Section */}
        <Text className="text-xl font-bold text-text-primary mb-4">Check-ins</Text>

        <SurveyCard
          title="Inclusiemeter"
          description="Meet je zelfstandigheid"
          icon="stats-chart"
          color="#5D67CE"
          onPress={() => startSurvey('inclusiemeter')}
        />

        <SurveyCard
          title="Hoe gaat het?"
          description="Dagelijkse welzijnscheck"
          icon="heart"
          color="#d6453a"
          onPress={() => startSurvey('wellbeing')}
        />

        {/* Beslis-Protocol */}
        <SurveyCard
          title="Beslis-Protocol"
          description="Hulp bij uitgave beslissingen"
          icon="bulb"
          color="#2A9D8F"
          onPress={() => router.push('/beslis-protocol')}
        />

        {/* Lees Simpel */}
        <SurveyCard
          title="Lees Simpel"
          description="Maak een foto van een brief"
          icon="document-text"
          color="#F4A261"
          onPress={() => Alert.alert('Binnenkort', 'Deze functie komt binnenkort!')}
        />

        {/* Savings Goals Section */}
        <Text className="text-xl font-bold text-text-primary mb-4 mt-6">Spaardoelen</Text>

        {savingsGoals.length === 0 ? (
          <View className="bg-surface border-3 border-black rounded-lg p-4 mb-4">
            <Text className="text-text-muted text-center">Nog geen spaardoelen</Text>
          </View>
        ) : (
          savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onAddMoney={() => Alert.alert('Binnenkort', 'Geld toevoegen komt binnenkort!')}
            />
          ))
        )}

        <TouchableOpacity
          className="bg-success border-3 border-black rounded-lg p-4 mb-20 flex-row items-center justify-center"
          style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
          onPress={() => setShowNewGoalModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Nieuw Spaardoel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Survey Modal */}
      <Modal visible={showSurveyModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">
                {activeSurvey === 'inclusiemeter' ? 'Inclusiemeter' : 'Hoe gaat het?'}
              </Text>
              <TouchableOpacity onPress={closeSurvey}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            {!showResult ? (
              <>
                {/* Progress */}
                <View className="flex-row mb-6">
                  {questions.map((_, idx) => (
                    <View
                      key={idx}
                      className={`flex-1 h-2 rounded-full mx-1 ${
                        idx <= currentQuestion ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </View>

                {/* Question */}
                <Text className="text-xl font-semibold text-text-primary mb-6">
                  {questions[currentQuestion]?.text}
                </Text>

                {/* Options */}
                <View>
                  {questions[currentQuestion]?.options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      className={`border-3 border-black rounded-lg p-4 mb-3 ${
                        answers[questions[currentQuestion]?.id] === option.value
                          ? 'bg-primary'
                          : 'bg-surface'
                      }`}
                      onPress={() => handleAnswer(questions[currentQuestion]?.id, option.value)}
                    >
                      <Text
                        className={`text-lg font-semibold text-center ${
                          answers[questions[currentQuestion]?.id] === option.value
                            ? 'text-white'
                            : 'text-text-primary'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <View className="items-center py-8">
                <Text className="text-6xl mb-4">
                  {getAverageScore() >= 4 ? '🎉' : getAverageScore() >= 3 ? '👍' : '💪'}
                </Text>
                <Text className="text-2xl font-bold text-text-primary mb-2">Bedankt!</Text>
                <Text className="text-text-muted text-center mb-6">
                  Je score: {getAverageScore().toFixed(1)} / 5
                </Text>

                <View className="w-full bg-surface border-3 border-black rounded-lg p-4 mb-6">
                  <Text className="text-text-primary text-center">
                    {getAverageScore() >= 4
                      ? 'Geweldig! Je doet het heel goed!'
                      : getAverageScore() >= 3
                      ? 'Goed bezig! Er is altijd ruimte voor groei.'
                      : 'Samen werken we aan verbetering. Je bewindvoerder kan helpen.'}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-primary border-3 border-black rounded-lg p-4 w-full"
                  style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
                  onPress={closeSurvey}
                >
                  <Text className="text-white text-center text-lg font-bold">Sluiten</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* New Goal Modal */}
      <Modal visible={showNewGoalModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-text-primary">Nieuw Spaardoel</Text>
              <TouchableOpacity onPress={() => setShowNewGoalModal(false)}>
                <Ionicons name="close-circle" size={32} color="#888" />
              </TouchableOpacity>
            </View>

            <Text className="text-lg font-semibold text-text-primary mb-2">Waar spaar je voor?</Text>
            <TextInput
              className="bg-surface border-3 border-black rounded-lg p-4 text-lg mb-4"
              placeholder="bijv. Nieuwe fiets"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />

            <Text className="text-lg font-semibold text-text-primary mb-2">Hoeveel wil je sparen?</Text>
            <View className="flex-row items-center bg-surface border-3 border-black rounded-lg px-4 mb-6">
              <Text className="text-2xl font-bold text-text-primary">€</Text>
              <TextInput
                className="flex-1 p-4 text-2xl"
                placeholder="0"
                value={newGoalAmount}
                onChangeText={setNewGoalAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              className={`border-3 border-black rounded-lg p-4 ${
                isSubmitting || !newGoalName || !newGoalAmount ? 'bg-gray-400' : 'bg-success'
              }`}
              style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
              onPress={handleCreateGoal}
              disabled={isSubmitting || !newGoalName || !newGoalAmount}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-bold">Doel Aanmaken</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
