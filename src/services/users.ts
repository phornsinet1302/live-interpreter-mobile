import client from './api';
import { ThemePreference } from '@/types';

export interface BackendUser {
  id?: string;
  _id?: string;
  name?: string;
  preferredLanguage?: string;
  theme?: ThemePreference;
  avatarUrl?: string;
  avatar?: string;
}

export async function getMe(): Promise<BackendUser> {
  const { data } = await client.get<BackendUser>('/users/me');
  return data;
}

export async function updateMe(payload: {
  name?: string;
  preferredLanguage?: string;
  theme?: ThemePreference;
}): Promise<BackendUser> {
  const { data } = await client.put<BackendUser>('/users/me', payload);
  return data;
}

export async function deleteMe(): Promise<void> {
  await client.delete('/users/me');
}

export async function uploadAvatar(uri: string): Promise<BackendUser> {
  const form = new FormData();
  form.append('avatar', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const { data } = await client.patch<BackendUser>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
