import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../../lib/useExpenses';
import {
  formatCurrency,
  formatDate,
  filterByPeriod,
  filterByMonth,
  totalAmount,
  groupByCategory,
} from '../../lib/utils';
import { getCategoryMeta } from '../../lib/categories';

export default function HomeScreen() {
  const { expenses, loading, refresh, remove } = useExpenses();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const now = new Date();
  const thisMonth = filterByMonth(expenses, now.getFullYear(), now.getMonth() + 1);
  const today = filterByPeriod(expenses, 0).filter(
    (e) => e.date === now.toISOString().split('T')[0]
  );
  const thisWeek = filterByPeriod(expenses, 7);

  const topCategories = Object.entries(groupByCategory(thisMonth))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const recentExpenses = expenses.slice(0, 8);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.greeting}>Hola 👋</Text>
          <Text style={s.subtitle}>Resumen de gastos</Text>
        </View>

        {/* Summary Cards */}
        <View style={s.cardsRow}>
          <View style={[s.card, s.cardBlue]}>
            <Text style={s.cardLabel}>Hoy</Text>
            <Text style={s.cardAmount}>{formatCurrency(totalAmount(today))}</Text>
          </View>
          <View style={[s.card, s.cardPurple]}>
            <Text style={s.cardLabel}>Esta semana</Text>
            <Text style={s.cardAmount}>{formatCurrency(totalAmount(thisWeek))}</Text>
          </View>
        </View>

        <View style={s.cardFull}>
          <View>
            <Text style={s.cardLabel}>Este mes</Text>
            <Text style={s.cardAmountLarge}>{formatCurrency(totalAmount(thisMonth))}</Text>
          </View>
          <Ionicons name="calendar" size={36} color="#818cf8" />
        </View>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Top categorías del mes</Text>
            {topCategories.map(([name, amount]) => {
              const meta = getCategoryMeta(name);
              return (
                <View key={name} style={s.categoryRow}>
                  <View style={[s.catIcon, { backgroundColor: meta.color + '22' }]}>
                    <Text style={s.catEmoji}>{meta.icon}</Text>
                  </View>
                  <Text style={s.catName}>{name}</Text>
                  <Text style={s.catAmount}>{formatCurrency(amount)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Expenses */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Gastos recientes</Text>
          {loading && <Text style={s.empty}>Cargando...</Text>}
          {!loading && recentExpenses.length === 0 && (
            <Text style={s.empty}>No hay gastos aún. ¡Añade el primero!</Text>
          )}
          {recentExpenses.map((expense) => {
            const meta = getCategoryMeta(expense.category);
            return (
              <View key={expense.id} style={s.expenseRow}>
                <View style={[s.catIcon, { backgroundColor: meta.color + '22' }]}>
                  <Text style={s.catEmoji}>{meta.icon}</Text>
                </View>
                <View style={s.expenseInfo}>
                  <Text style={s.expenseCat}>{expense.category}</Text>
                  {expense.note ? <Text style={s.expenseNote}>{expense.note}</Text> : null}
                  <Text style={s.expenseDate}>{formatDate(expense.date)}</Text>
                </View>
                <View style={s.expenseRight}>
                  <Text style={s.expenseAmount}>-{formatCurrency(expense.amount)}</Text>
                  <TouchableOpacity onPress={() => remove(expense.id)}>
                    <Ionicons name="trash-outline" size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0e2a' },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20, marginTop: 8 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#e2e8f0' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardBlue: { backgroundColor: '#1e3a5f' },
  cardPurple: { backgroundColor: '#2d1b69' },
  cardFull: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  cardLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: '600' },
  cardAmount: { fontSize: 22, fontWeight: '700', color: '#e2e8f0' },
  cardAmountLarge: { fontSize: 32, fontWeight: '700', color: '#818cf8' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginBottom: 12 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catEmoji: { fontSize: 20 },
  catName: { flex: 1, color: '#e2e8f0', fontWeight: '500', fontSize: 15 },
  catAmount: { color: '#818cf8', fontWeight: '700', fontSize: 15 },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  expenseInfo: { flex: 1 },
  expenseCat: { color: '#e2e8f0', fontWeight: '600', fontSize: 14 },
  expenseNote: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  expenseDate: { color: '#64748b', fontSize: 11, marginTop: 2 },
  expenseRight: { alignItems: 'flex-end', gap: 4 },
  expenseAmount: { color: '#f87171', fontWeight: '700', fontSize: 15 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 16 },
});
