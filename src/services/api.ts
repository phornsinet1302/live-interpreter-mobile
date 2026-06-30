import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ApiError } from '@/types';

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? 'https://api.example.com';

export const AUTH_TOKEN_KEY = '@live_interpreter/auth_token';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token to every request when present.
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into a predictable shape.
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string }>) => {
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        'Unexpected network error',
      status: error.response?.status,
      code: error.response?.data?.code,
    };
    return Promise.reject(apiError);
  }
);

export default client;
