import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SECURE_STORE_KEY = 'groq_api_key';

export async function saveApiKey(key: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(SECURE_STORE_KEY, key);
  } else {
    await SecureStore.setItemAsync(SECURE_STORE_KEY, key);
  }
}

export async function getApiKey() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SECURE_STORE_KEY);
  } else {
    return await SecureStore.getItemAsync(SECURE_STORE_KEY);
  }
}

export type AIFeature = 'Grammar' | 'Tone' | 'Reply' | 'Paraphrase' | 'Summarize' | 'Enhance';

const SYSTEM_PROMPTS: Record<AIFeature, string> = {
  Grammar: 'You are an expert copyeditor. Fix all grammar and spelling mistakes in the following text. Respond ONLY with the corrected text, nothing else.',
  Tone: 'Rewrite the following text to sound highly professional and business-appropriate. Respond ONLY with the rewritten text.',
  Reply: 'Suggest a concise and appropriate reply to the following message. Respond ONLY with the suggested reply.',
  Paraphrase: 'Paraphrase the following text while keeping the original meaning. Respond ONLY with the paraphrased text.',
  Summarize: 'Summarize the following text in one short sentence. Respond ONLY with the summary.',
  Enhance: 'Enhance the vocabulary and flow of the following text to sound more articulate and native. Respond ONLY with the enhanced text.',
};

export async function runAIFeature(feature: AIFeature, input: string): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing. Please save your Groq API Key first.');
  }

  const systemPrompt = SYSTEM_PROMPTS[feature] || SYSTEM_PROMPTS.Grammar;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Fast and capable model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        temperature: 0.7,
        max_tokens: 512,
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to process AI request');
  }
}
