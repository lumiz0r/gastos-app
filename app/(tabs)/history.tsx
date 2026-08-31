import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../../lib/useExpenses';
import { formatCurrency, formatDate, totalAmount } from '../../lib/utils';
import { Expense } from '../../lib/types';
import { getCategoryMeta, useCategories } from '../../lib/categories';

export default function HistoryScreen() {
  const { expenses, loading, refresh, remove } = useExpenses();
  const categories = useCategories();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filtered = useMemo(() => {
    let list = expenses;
    if (filterCat) list = list.filter((e) => e.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.category.toLowerCase().includes(q) ||
          e.note.toLowerCase().includes(q) ||
          e.date.includes(q)
      );
    }
    return list;
  }, [expenses, filterCat, search]);

  const total = totalAmount(filtered);

  const confirmDelete = (expense: Expense) => {
    Alert.alert(
      'Eliminar gasto',
      `¿Eliminar ${formatCurrency(expense.amount)} en ${expense.category}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => remove(expense.id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Expense }) => {
    const meta = getCategoryMeta(item.category);
    return (
      <View style={s.row}>
        <View style={[s.icon, { backgroundColor: meta.color + '22' }]}>
          <Text style={s.emoji}>{meta.icon}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.cat}>{item.category}</Text>
          {item.note ? <Text style={s.note}>{item.note}</Text> : null}
          <Text style={s.date}>{formatDate(item.date)}</Text>
        </View>
        <View style={s.right}>
          <Text style={s.amount}>-{formatCurrency(item.amount)}</Text>
          <TouchableOpacity onPress={() => confirmDelete(item)}>
            <Ionicons name="trash-outline" size={16} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Historial</Text>
        <Text style={s.totalText}>Total: {formatCurrency(total)}</Text>
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color="#64748b" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar gastos..."
          placeholderTextColor="#475569"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#64748b" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter */}
      <View style={s.filterRow}>
        <TouchableOpacity
          style={[s.filterBtn, !filterCat && s.filterBtnActive]}
          onPress={() => setFilterCat('')}
        >
          <Text style={[s.filterLabel, !filterCat && s.filterLabelActive]}>Todas</Text>
        </TouchableOpacity>
        {categories.filter((c) => expenses.some((e) => e.category === c.name)).map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[s.filterBtn, filterCat === cat.name && { borderColor: cat.color, backgroundColor: cat.color + '22' }]}
            onPress={() => setFilterCat(filterCat === cat.name ? '' : cat.name)}
          >
            <Text style={s.filterEmoji}>{cat.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      <Text style={s.count}>{filtered.length} gasto{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          <Text style={s.empty}>
            {loading ? 'Cargando...' : 'No se encontraron gastos'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0e2a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#e2e8f0' },
  totalText: { color: '#818cf8', fontWeight: '700', fontSize: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#e2e8f0', fontSize: 15, paddingVertical: 12 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  filterBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  filterLabelActive: { color: '#fff' },
  filterEmoji: { fontSize: 16 },
  count: { color: '#64748b', fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  icon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  emoji: { fontSize: 20 },
  info: { flex: 1 },
  cat: { color: '#e2e8f0', fontWeight: '600', fontSize: 14 },
  note: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  date: { color: '#64748b', fontSize: 11, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { color: '#f87171', fontWeight: '700', fontSize: 15 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
