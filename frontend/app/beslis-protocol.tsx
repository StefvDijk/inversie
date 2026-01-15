import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  questions: {
    id: string;
    text: string;
    type: 'text' | 'choice' | 'scale';
    options?: string[];
  }[];
}

const protocolSteps: Step[] = [
  {
    id: 1,
    title: 'Wat wil je?',
    subtitle: 'Beschrijf je wens',
    icon: 'bulb',
    questions: [
      { id: 'what', text: 'Wat wil je kopen of doen?', type: 'text' },
      { id: 'why', text: 'Waarom wil je dit?', type: 'text' },
    ],
  },
  {
    id: 2,
    title: 'Is het nodig?',
    subtitle: 'Bepaal de urgentie',
    icon: 'help-circle',
    questions: [
      {
        id: 'urgency',
        text: 'Hoe dringend is dit?',
        type: 'choice',
        options: ['Heel urgent - vandaag nodig', 'Binnenkort nodig (deze week)', 'Kan wachten (deze maand)', 'Niet urgent - kan later'],
      },
      {
        id: 'need_vs_want',
        text: 'Is dit iets dat je nodig hebt of iets dat je wilt?',
        type: 'choice',
        options: ['Ik heb het echt nodig', 'Het zou fijn zijn om te hebben', 'Het is een luxe'],
      },
    ],
  },
  {
    id: 3,
    title: 'Kun je het betalen?',
    subtitle: 'Check je budget',
    icon: 'wallet',
    questions: [
      { id: 'cost', text: 'Hoeveel kost het ongeveer?', type: 'text' },
      {
        id: 'afford',
        text: 'Past dit binnen je budget?',
        type: 'choice',
        options: ['Ja, makkelijk', 'Ja, maar krap', 'Nee, ik moet sparen', 'Ik weet het niet'],
      },
    ],
  },
  {
    id: 4,
    title: 'Alternatieven?',
    subtitle: 'Denk aan opties',
    icon: 'git-branch',
    questions: [
      {
        id: 'alternatives',
        text: 'Heb je gekeken naar goedkopere opties?',
        type: 'choice',
        options: ['Ja, dit is de beste optie', 'Ja, maar ik wil toch deze', 'Nee, nog niet'],
      },
      { id: 'wait', text: 'Kun je wachten op een aanbieding of sale?', type: 'choice', options: ['Nee, ik heb het nu nodig', 'Ja, ik kan wachten'] },
    ],
  },
  {
    id: 5,
    title: 'Beslissing',
    subtitle: 'Maak je keuze',
    icon: 'checkmark-circle',
    questions: [
      {
        id: 'feeling',
        text: 'Hoe voel je je bij deze uitgave?',
        type: 'scale',
        options: ['1', '2', '3', '4', '5'],
      },
      {
        id: 'decision',
        text: 'Wat is je besluit?',
        type: 'choice',
        options: ['Ik ga door met deze aankoop', 'Ik wacht nog even', 'Ik zie ervan af'],
      },
    ],
  },
];

export default function BeslisProtocolScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = protocolSteps[currentStep];
  const isLastStep = currentStep === protocolSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    // Check if all questions for current step are answered
    const unanswered = step.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert('Let op', 'Beantwoord alle vragen voor je doorgaat');
      return;
    }

    if (isLastStep) {
      // Complete the protocol
      const decision = answers['decision'];
      if (decision === 'Ik ga door met deze aankoop') {
        Alert.alert(
          'Doorgaan met Keuze',
          'Wil je nu een keuze aanmaken met deze informatie?',
          [
            { text: 'Later', onPress: () => router.back() },
            { text: 'Ja, maak keuze', onPress: () => router.replace('/(tabs)/decisions') },
          ]
        );
      } else {
        Alert.alert('Goed gedaan!', 'Je hebt het Beslis-Protocol doorlopen. Kom terug als je er opnieuw over wilt nadenken.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      router.back();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderQuestion = (question: Step['questions'][0]) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <TextInput
            key={question.id}
            className="bg-surface border-3 border-black rounded-lg p-4 text-lg"
            placeholder="Type hier je antwoord..."
            value={currentAnswer || ''}
            onChangeText={(text) => handleAnswer(question.id, text)}
            multiline
            numberOfLines={2}
          />
        );

      case 'choice':
        return (
          <View key={question.id}>
            {question.options?.map((option) => (
              <TouchableOpacity
                key={option}
                className={`border-3 border-black rounded-lg p-4 mb-2 ${currentAnswer === option ? 'bg-primary' : 'bg-surface'}`}
                onPress={() => handleAnswer(question.id, option)}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={currentAnswer === option ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={currentAnswer === option ? 'white' : '#111'}
                  />
                  <Text className={`ml-3 text-lg ${currentAnswer === option ? 'text-white font-semibold' : 'text-text-primary'}`}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'scale':
        return (
          <View key={question.id} className="flex-row justify-around py-4">
            {question.options?.map((option) => (
              <TouchableOpacity
                key={option}
                className={`w-14 h-14 rounded-full items-center justify-center border-3 border-black ${
                  currentAnswer === option ? 'bg-primary' : 'bg-surface'
                }`}
                onPress={() => handleAnswer(question.id, option)}
              >
                <Text className={`text-xl font-bold ${currentAnswer === option ? 'text-white' : 'text-text-primary'}`}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Progress Bar */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary flex-1">Beslis-Protocol</Text>
          <Text className="text-text-muted">
            {currentStep + 1}/{protocolSteps.length}
          </Text>
        </View>

        {/* Step Progress */}
        <View className="flex-row mb-6">
          {protocolSteps.map((s, index) => (
            <View
              key={s.id}
              className={`flex-1 h-2 rounded-full mx-0.5 ${index <= currentStep ? 'bg-primary' : 'bg-gray-300'}`}
            />
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Step Header */}
        <View className="bg-surface border-3 border-black rounded-lg p-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mr-4">
              <Ionicons name={step.icon} size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text-primary">{step.title}</Text>
              <Text className="text-text-muted">{step.subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Questions */}
        {step.questions.map((question, index) => (
          <View key={question.id} className="mb-6">
            <Text className="text-lg font-semibold text-text-primary mb-3">{question.text}</Text>
            {renderQuestion(question)}
          </View>
        ))}

        {/* Feeling Scale Labels */}
        {step.questions.some((q) => q.type === 'scale') && (
          <View className="flex-row justify-between px-2 mb-6">
            <Text className="text-text-muted text-sm">Onzeker</Text>
            <Text className="text-text-muted text-sm">Zeker</Text>
          </View>
        )}

        {/* Navigation Buttons */}
        <View className="mb-20">
          <TouchableOpacity
            className="bg-primary border-3 border-black rounded-lg p-4 mb-3"
            style={{ shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowColor: '#000' }}
            onPress={handleNext}
          >
            <Text className="text-white text-center text-lg font-bold">{isLastStep ? 'Afronden' : 'Volgende'}</Text>
          </TouchableOpacity>

          {!isFirstStep && (
            <TouchableOpacity className="bg-surface border-3 border-black rounded-lg p-4" onPress={handleBack}>
              <Text className="text-text-primary text-center text-lg font-bold">Terug</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
