export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
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

export function getCategoryMeta(name: string): Category {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}
