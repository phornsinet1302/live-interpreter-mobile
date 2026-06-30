import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { AUTH_TOKEN_KEY } from './api';
import { AuthSession, LoginCredentials, User } from '@/types';

const SESSION_KEY = '@live_interpreter/session';

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const { data } = await client.post<AuthSession>('/auth/login', credentials);
  await persistSession(data);
  return data;
}

export async function register(
  payload: LoginCredentials & { name: string }
): Promise<AuthSession> {
  const { data } = await client.post<AuthSession>('/auth/register', payload);
  await persistSession(data);
  return data;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, SESSION_KEY]);
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await client.get<User>('/auth/me');
  return data;
}

export async function restoreSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      await logout();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

async function persistSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
