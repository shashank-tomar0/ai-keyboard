# AI-Powered Keyboard App Implementation Plan

## Goal
Build an AI-powered keyboard app for Android devices that replicates the Gboard design and incorporates advanced AI features (grammar correction, tone changer, reply suggestion, etc.) by allowing the user to provide their own Groq API key.

## User Review Required

> [!WARNING]
> **React Native & Custom Keyboards:** Building a system-wide custom keyboard for Android requires creating an `InputMethodService`. While we can use React Native (Expo) for the app's settings UI, rendering the actual keyboard natively using React Native views inside the `InputMethodService` is highly complex and often suffers from performance issues (lagging).
> **Proposed Approach:** We will use **React Native (Expo)** to build the main app where users can configure settings, input their Groq API key, and test the AI features. However, for the **actual system-wide Android keyboard**, we will need to write custom native Android code (Kotlin/Java) that communicates with our React Native app/settings. Does this approach work for you, or would you prefer a pure native Android (Kotlin/Jetpack Compose) application?

## Open Questions

> [!IMPORTANT]
> 1. **Framework Confirmation:** Are you okay with using Expo's Custom Dev Client (or "bare" React Native) to write the necessary native Android code for the `InputMethodService`? (Standard Expo Go does not support building custom system keyboards).
> 2. **Groq API Integration:** Users will provide their own Groq API keys. Should the key be stored locally and securely on the device using Encrypted Storage?
> 3. **AI Models:** Groq supports multiple models (e.g., Llama 3). Should we allow the user to select which model to use in the settings app?

## Proposed Architecture & Technology Stack

1. **Framework:** React Native with Expo (Development Build / Custom Dev Client)
2. **Keyboard Engine:** Native Android `InputMethodService` (Kotlin) rendering a Gboard-like UI natively to ensure zero lag, while bridging to React Native or executing AI API calls directly natively using the stored Groq API Key.
3. **State Management & Storage:** `expo-secure-store` to safely store the user's Groq API key.
4. **AI Provider:** Groq API (fast inference, perfect for real-time keyboard suggestions).

## Development Roadmap

### Phase 1: Foundation & Settings UI
- Initialize React Native Expo project.
- Create the main App UI (Gboard-like settings interface).
- Implement secure storage for the Groq API key.
- Create a sandbox text area within the app to test AI features before implementing the system keyboard.

### Phase 2: AI Feature Integration (In-App)
- Connect to Groq API using the stored key.
- Implement core features in the test environment:
  - Grammar correction, Paraphrasing, Summarization.
  - Tone changer, Reply suggestions.
  - Make text longer/shorter, Translation.

### Phase 3: System Keyboard Implementation (Native Android)
- Eject or use Expo Config Plugins to access native Android code.
- Create an `InputMethodService` in Kotlin.
- Design the native keyboard UI to exactly match Gboard (colors, fonts, dimensions).
- Bridge the Groq API configuration and AI functions to the native keyboard.

### Phase 4: Refinement & Testing
- Add a custom UI toolbar on the keyboard to access AI tools.
- Optimize API calls and handle loading states on the keyboard.
- Extensive testing on Android Emulator and Physical Devices.

## Verification Plan

### Manual Verification
- Install the app on an Android Emulator.
- Enter a Groq API key in the settings.
- Enable the custom keyboard in Android Settings.
- Open a messaging app, select the new keyboard, and test standard typing and autocorrect.
- Trigger AI features (e.g., Tone Changer) and verify the text is replaced with the AI response quickly.
