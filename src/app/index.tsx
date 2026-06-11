import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveApiKey, getApiKey, runAIFeature, AIFeature } from '../utils/groq';

const FEATURES: AIFeature[] = ['Grammar', 'Tone', 'Reply', 'Paraphrase', 'Summarize', 'Enhance'];

export default function AppSettings() {
  const [apiKey, setApiKeyValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    try {
      const key = await getApiKey();
      if (key) setApiKeyValue(key);
    } catch (e) {
      console.error('Failed to load key', e);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'API Key cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await saveApiKey(apiKey.trim());
      Alert.alert('Success', 'Groq API Key saved securely!');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestFeature = async (feature: AIFeature) => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to test.');
      return;
    }
    setActiveFeature(feature);
    setIsLoading(true);
    try {
      const result = await runAIFeature(feature, inputText);
      setOutputText(result);
    } catch (e: any) {
      Alert.alert('AI Error', e.message);
    } finally {
      setIsLoading(false);
      setActiveFeature(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Keyboard</Text>
            <Text style={styles.subtitle}>Supercharge your typing with Groq AI</Text>
          </View>

          {/* API Key Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configuration</Text>
            <Text style={styles.label}>Groq API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="gsk_..."
              placeholderTextColor="#64748B"
              value={apiKey}
              onChangeText={setApiKeyValue}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleSaveKey}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Save API Key</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sandbox Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Playground</Text>
            <Text style={styles.description}>Test the AI features before they go to your keyboard.</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type something to test..."
              placeholderTextColor="#64748B"
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.featuresGrid}>
              {FEATURES.map((feature) => (
                <TouchableOpacity
                  key={feature}
                  style={[
                    styles.featureButton,
                    activeFeature === feature && styles.featureButtonActive
                  ]}
                  onPress={() => handleTestFeature(feature)}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.featureText,
                    activeFeature === feature && styles.featureTextActive
                  ]}>
                    {feature}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Output Section */}
            {(outputText || isLoading) ? (
              <View style={styles.outputContainer}>
                {isLoading ? (
                  <ActivityIndicator color="#38BDF8" style={styles.loader} />
                ) : (
                  <>
                    <Text style={styles.outputLabel}>AI Response:</Text>
                    <Text style={styles.outputText}>{outputText}</Text>
                  </>
                )}
              </View>
            ) : null}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#0284C7', // Sky 600
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  featureButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#475569',
  },
  featureButtonActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  featureTextActive: {
    color: '#FFFFFF',
  },
  outputContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#38BDF8', // Glow effect
  },
  outputLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#38BDF8',
    fontWeight: '700',
    marginBottom: 8,
  },
  outputText: {
    fontSize: 16,
    color: '#F8FAFC',
    lineHeight: 24,
  },
  loader: {
    marginVertical: 20,
  }
});
