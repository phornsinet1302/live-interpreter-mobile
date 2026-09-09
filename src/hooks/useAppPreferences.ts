import { useContext } from 'react';
import { AppPreferencesContext } from '@/context/AppPreferencesContext';

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error('useAppPreferences must be used within an AppPreferencesProvider');
  }
  return ctx;
}
