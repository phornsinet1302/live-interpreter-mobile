import { NavigatorScreenParams } from '@react-navigation/native';
import { HistoryItem, TranscriptEntry } from '@/types';

export type RootStackParamList = {
  Welcome: undefined;
  StartJourney: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  DeleteAccount: undefined;
  NewSession: undefined;
  SessionLive: { title: string };
  Summary: { entries?: TranscriptEntry[]; historyId?: string; title?: string } | undefined;
  HistoryDetail: { item: HistoryItem };
  UniversalTranslate: undefined;
  Analytics: undefined;
  Notifications: undefined;
  NoiseSettings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};
