import { useColorScheme } from 'react-native';
import type { Priority } from './types';

const light = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#4F46E5',
  primaryText: '#FFFFFF',
  danger: '#DC2626',
  success: '#16A34A',
  chip: '#EEF2FF',
};

const dark: typeof light = {
  bg: '#0B0F19',
  card: '#151A27',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  border: '#262C3B',
  primary: '#818CF8',
  primaryText: '#0B0F19',
  danger: '#F87171',
  success: '#4ADE80',
  chip: '#1E2340',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};
