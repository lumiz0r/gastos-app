import { useState, useEffect, useCallback } from 'react';
import { Expense } from './types';
import { loadExpenses, addExpense, deleteExpense } from './storage';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadExpenses();
    setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (expense: Expense) => {
    const updated = await addExpense(expense);
    setExpenses(updated);
  }, []);

  const remove = useCallback(async (id: string) => {
    const updated = await deleteExpense(id);
    setExpenses(updated);
  }, []);

  return { expenses, loading, refresh, add, remove };
}
