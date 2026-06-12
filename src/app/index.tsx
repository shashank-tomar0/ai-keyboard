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
  Image,
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveApiKey, getApiKey, runAIFeature, AIFeature } from '../utils/groq';

const FEATURES: { id: AIFeature; color: string; icon: string; title: string; subtitle: string }[] = [
  { id: 'Grammar', color: '#D6F287', icon: '📝', title: 'Grammar', subtitle: 'Fix errors' }, // light green
  { id: 'Tone', color: '#8168FF', icon: '👔', title: 'Tone', subtitle: 'Make professional' }, // purple
  { id: 'Reply', color: '#F87060', icon: '💬', title: 'Reply', subtitle: 'Smart response' }, // coral/red
  { id: 'Paraphrase', color: '#4E9AF1', icon: '🔄', title: 'Rewrite', subtitle: 'Change phrasing' }, // blue
];

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
      if (NativeModules.SharedPrefsModule) {
        NativeModules.SharedPrefsModule.saveApiKey(apiKey.trim());
      }
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
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>⚙️</Text>
              <Text style={styles.logoText}>AI Keyboard</Text>
            </View>
            <View style={styles.topRightIcons}>
              <View style={styles.avatarPlaceholder} />
              <View style={styles.bellIcon}><Text style={styles.bellText}>🔔</Text></View>
            </View>
          </View>

          {/* Header Title */}
          <Text style={styles.mainTitle}>Keyboard{'\n'}Settings</Text>

          {/* Configuration Bento Box (Yellow) */}
          <View style={[styles.bentoBox, { backgroundColor: '#FDE17A' }]}>
            <View style={styles.bentoHeaderRow}>
              <Text style={styles.bentoCategory}>Configuration</Text>
              <Text style={styles.bentoTime}>API Setup</Text>
            </View>
            <Text style={styles.bentoTitle}>Groq API Key</Text>
            <View style={styles.apiInputRow}>
              <TextInput
                style={styles.apiInput}
                placeholder="gsk_..."
                placeholderTextColor="#A18E3F"
                value={apiKey}
                onChangeText={setApiKeyValue}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.bentoFooterRow}>
              <Text style={styles.bentoFooterText}>Required for AI features</Text>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveKey}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveButtonText}>Save Key</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Playground Header */}
          <View style={styles.playgroundHeader}>
            <Text style={styles.playgroundTitle}>AI Playground</Text>
            <Text style={styles.playgroundSubtitle}>Test the features before they go live on your keyboard.</Text>
          </View>

          {/* Input Box (Dark) */}
          <View style={[styles.bentoBox, { backgroundColor: '#2C2C2E' }]}>
            <TextInput
              style={styles.textArea}
              placeholder="Type something to test..."
              placeholderTextColor="#8E8E93"
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Features Bento Grid */}
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureBentoBox,
                  { backgroundColor: feature.color },
                  index % 2 === 0 ? styles.featureBoxLeft : styles.featureBoxRight,
                  activeFeature === feature.id && styles.featureActive
                ]}
                onPress={() => handleTestFeature(feature.id)}
                disabled={isLoading}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureBoxTitle}>{feature.title}</Text>
                <Text style={styles.featureBoxSubtitle}>{feature.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Output Section (Purple Bento) */}
          {(outputText || isLoading) ? (
            <View style={[styles.bentoBox, { backgroundColor: '#8168FF', marginTop: 16 }]}>
              <View style={styles.bentoHeaderRow}>
                <Text style={[styles.bentoCategory, { color: '#FFF' }]}>AI Response</Text>
              </View>
              {isLoading ? (
                <ActivityIndicator color="#FFF" style={styles.loader} size="large" />
              ) : (
                <Text style={styles.outputText}>{outputText}</Text>
              )}
            </View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E', // Very dark background
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 20,
    color: '#FFF',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8A65', // Sample avatar color
  },
  bellIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellText: {
    fontSize: 16,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 32,
  },
  bentoBox: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bentoCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    opacity: 0.6,
  },
  bentoTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    opacity: 0.6,
  },
  bentoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  apiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  apiInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bentoFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoFooterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    opacity: 0.6,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  playgroundHeader: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  playgroundTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  playgroundSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  textArea: {
    height: 100,
    fontSize: 18,
    color: '#FFF',
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureBentoBox: {
    width: '48%',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  featureBoxLeft: {
    marginRight: '2%',
  },
  featureBoxRight: {
    marginLeft: '2%',
  },
  featureActive: {
    opacity: 0.7,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureBoxTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  featureBoxSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    opacity: 0.6,
    marginTop: 4,
  },
  outputText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 28,
    marginTop: 8,
  },
  loader: {
    marginVertical: 24,
  }
});
