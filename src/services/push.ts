import client from './api';

// Pass null to unregister this device (notifications turned off, or sign-out).
export async function registerPushToken(token: string | null): Promise<void> {
  await client.patch('/users/me/push-token', { token });
}
