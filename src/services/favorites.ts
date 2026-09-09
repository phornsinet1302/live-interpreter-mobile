import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@live_interpreter/favorite_history_ids';

export async function getFavoriteIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const current = await getFavoriteIds();
  const next = current.includes(id)
    ? current.filter((existing) => existing !== id)
    : [...current, id];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}
