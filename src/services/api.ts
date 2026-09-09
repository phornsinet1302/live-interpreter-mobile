import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

const BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

/** Bare server origin (no `/api/v1`) — needed to resolve relative paths like avatar URLs. */
export const SERVER_ORIGIN: string = BASE_URL.replace(/\/api\/v\d+\/?$/, '');

/** Resolves a possibly-relative path (e.g. "/uploads/avatars/x.jpg") the backend returns. */
export function resolveServerUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

type TokenGetter = () => Promise<string | null>;

let getAuthToken: TokenGetter | null = null;

/** Called once from AuthContext, wiring Clerk's getToken() into the plain axios module. */
export function setTokenGetter(getter: TokenGetter | null): void {
  getAuthToken = getter;
}

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach a fresh Clerk bearer token to every request when signed in.
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAuthToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface BackendErrorBody {
  error?: {
    message?: string;
    code?: string;
    details?: { path?: string; message?: string }[];
  };
}

// Normalize the backend's { error: { message, code, details } } envelope into ApiError.
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorBody>) => {
    const status = error.response?.status;
    const body = error.response?.data?.error;
    const detailMessages = body?.details?.map((d) => d.message).filter(Boolean).join(', ');
    const fallback =
      status === 429
        ? "You're doing that a bit too fast — please wait a moment and try again."
        : error.message || 'Unexpected network error';
    const apiError: ApiError = {
      message: detailMessages || body?.message || fallback,
      status,
      code: body?.code,
    };
    return Promise.reject(apiError);
  }
);

export default client;
