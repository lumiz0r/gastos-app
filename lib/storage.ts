import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from './types';

const KEY = 'gastos_expenses';

export async function loadExpenses(): Promise<Expense[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Expense[];
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(expenses));
}

export async function addExpense(expense: Expense): Promise<Expense[]> {
  const all = await loadExpenses();
  const updated = [expense, ...all];
  await saveExpenses(updated);
  return updated;
}

export async function deleteExpense(id: string): Promise<Expense[]> {
  const all = await loadExpenses();
  const updated = all.filter((e) => e.id !== id);
  await saveExpenses(updated);
  return updated;
}
