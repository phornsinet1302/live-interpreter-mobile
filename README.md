# Live Interpreter Mobile

A React Native (Expo + TypeScript) app for real-time speech interpretation in
meetings: capture speech, transcribe, translate, and review past sessions.

## Stack

- Expo SDK 51 / React Native 0.74
- TypeScript (strict)
- React Navigation (native stack + bottom tabs)
- axios for the API layer
- expo-audio for audio capture
- AsyncStorage for session persistence

## Getting started

```bash
npm install
npm start        # then press i / a, or scan the QR with Expo Go
```

Configure the backend URL in `.env` and `app.json` (`expo.extra.apiBaseUrl`).

## Project structure

```
src/
  screens/      App screens (Welcome, StartJourney, Login, Register, Home, History, Settings)
  components/   Reusable UI (Button, TranscriptBubble)
  navigation/   Navigators + route param types
  services/     API client and feature services (auth, translation, meeting, history)
  hooks/        useAuth, useTranslation
  context/      AuthContext provider
  utils/        theme + formatting helpers
  types/        Shared TypeScript types
  assets/       Icons and images
```

## Notes

All service calls assume a REST backend; endpoints are stubbed in `src/services`
and can be pointed at your own server.
