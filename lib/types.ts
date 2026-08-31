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
