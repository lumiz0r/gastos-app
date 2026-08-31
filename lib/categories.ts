import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from './types';

const KEY = 'gastos_custom_categories';

/** Built-in categories. Always present and not removable. */
export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Comida', icon: '🍔', color: '#f97316' },
  { name: 'Supermercado', icon: '🛒', color: '#10b981' },
  { name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { name: 'Ocio', icon: '🎮', color: '#8b5cf6' },
  { name: 'Salud', icon: '🏥', color: '#ef4444' },
  { name: 'Ropa', icon: '👕', color: '#ec4899' },
  { name: 'Casa', icon: '🏠', color: '#f59e0b' },
  { name: 'Tecnología', icon: '📱', color: '#06b6d4' },
  { name: 'Deporte', icon: '🏋️', color: '#84cc16' },
  { name: 'Viajes', icon: '✈️', color: '#6366f1' },
  { name: 'Educación', icon: '🎓', color: '#0ea5e9' },
  { name: 'Suscripciones', icon: '📺', color: '#a855f7' },
  { name: 'Belleza', icon: '💈', color: '#f43f5e' },
  { name: 'Farmacia', icon: '💊', color: '#14b8a6' },
  { name: 'Otros', icon: '📦', color: '#6b7280' },
];

// Kept in memory so getCategoryMeta() stays synchronous — it is called from
// render paths and from lib/utils.ts, which is not React-aware.
let categories: Category[] = DEFAULT_CATEGORIES;
const listeners = new Set<() => void>();

function setCategories(next: Category[]) {
  categories = next;
  listeners.forEach((notify) => notify());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => categories;
const getServerSnapshot = () => DEFAULT_CATEGORIES;

/** Re-renders the caller whenever the category list changes. */
export function useCategories(): Category[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function isCustom(name: string): boolean {
  return !DEFAULT_CATEGORIES.some((c) => c.name === name);
}

function customOnly(list: Category[]): Category[] {
  return list.filter((c) => isCustom(c.name));
}

/** Loads saved categories. Call once on app start. */
export async function hydrateCategories(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const custom = JSON.parse(raw) as Category[];
    setCategories([...DEFAULT_CATEGORIES, ...custom]);
  } catch {
    // Corrupt or unreadable storage: fall back to the defaults already in place.
  }
}

async function persist(custom: Category[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(custom));
  setCategories([...DEFAULT_CATEGORIES, ...custom]);
}

/** Throws with a user-facing message if the name is empty or already taken. */
export async function addCategory(category: Category): Promise<void> {
  const name = category.name.trim();
  if (!name) throw new Error('Escribe un nombre para la categoría.');
  if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`La categoría "${name}" ya existe.`);
  }
  await persist([...customOnly(categories), { ...category, name }]);
}

/** Only custom categories can be removed; existing expenses keep their name. */
export async function deleteCategory(name: string): Promise<void> {
  if (!isCustom(name)) throw new Error('No puedes eliminar una categoría predefinida.');
  await persist(customOnly(categories).filter((c) => c.name !== name));
}

/** Falls back to "Otros" so expenses in a deleted category still render. */
export function getCategoryMeta(name: string): Category {
  return (
    categories.find((c) => c.name === name) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
  );
}

export const ICON_OPTIONS = [
  '🍔', '🍺', '☕', '🛒', '🚗', '⛽', '🚌', '🎮', '🎬', '🎵',
  '🏥', '💊', '👕', '👟', '🏠', '💡', '📱', '💻', '🏋️', '⚽',
  '✈️', '🏖️', '🎓', '📚', '📺', '🎁', '🐶', '💈', '🔧', '💰',
  '🧾', '📦',
];

export const COLOR_OPTIONS = [
  '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899',
  '#f59e0b', '#06b6d4', '#84cc16', '#6366f1', '#0ea5e9', '#a855f7',
  '#f43f5e', '#14b8a6', '#eab308', '#6b7280',
];
