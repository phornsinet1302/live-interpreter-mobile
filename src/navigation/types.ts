import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  StartJourney: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};
