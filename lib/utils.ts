import { Expense } from './types';
import { getCategoryMeta } from './categories';

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
}

export function groupByDate(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.amount;
    return acc;
  }, {});
}

export function filterByMonth(expenses: Expense[], year: number, month: number): Expense[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return expenses.filter((e) => e.date.startsWith(prefix));
}

export function filterByPeriod(expenses: Expense[], days: number): Expense[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = toISODate(cutoff);
  return expenses.filter((e) => e.date >= cutoffStr);
}

export function totalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getPieData(expenses: Expense[]) {
  const grouped = groupByCategory(expenses);
  return Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({
      name,
      amount,
      color: getCategoryMeta(name).color,
      legendFontColor: '#64748b',
      legendFontSize: 12,
    }));
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  return days;
}

export function getBarData(expenses: Expense[]) {
  const days = getLast7Days();
  const grouped = groupByDate(expenses);
  return {
    labels: days.map((d) => {
      const [, , day] = d.split('-');
      return day;
    }),
    datasets: [{ data: days.map((d) => grouped[d] ?? 0) }],
  };
}
