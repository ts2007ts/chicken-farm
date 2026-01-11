import { ar } from '../translations/ar';
import { en } from '../translations/en';

export const EXPENSE_CATEGORIES = (t) => [
  { id: 'feed', name: t.categories?.feed || 'أعلاف', icon: '🌾' },
  { id: 'medicine', name: t.categories?.medicine || 'أدوية', icon: '💊' },
  { id: 'electricity', name: t.categories?.electricity || 'كهرباء', icon: '⚡' },
  { id: 'water', name: t.categories?.water || 'ماء', icon: '💧' },
  { id: 'labor', name: t.categories?.labor || 'عمالة', icon: '👷' },
  { id: 'maintenance', name: t.categories?.maintenance || 'صيانة', icon: '🔧' },
  { id: 'other', name: t.categories?.other || 'أخرى', icon: '📦' },
];

export const INITIAL_INVESTORS = []

export const FAMILIES = (t) => [
  { id: 'family1', name: t.eggs?.family1 || 'عائلة 1', icon: '👨‍👩‍👧‍👦' },
  { id: 'family2', name: t.eggs?.family2 || 'عائلة 2', icon: '👨‍👩‍👧‍👦' },
  { id: 'family3', name: t.eggs?.family3 || 'عائلة 3', icon: '👨‍👩‍👧‍👦' },
]
