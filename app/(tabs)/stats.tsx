import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useExpenses } from '../../lib/useExpenses';
import {
  filterByMonth,
  filterByPeriod,
  totalAmount,
  getPieData,
  getBarData,
  formatCurrency,
  groupByCategory,
} from '../../lib/utils';
import { getCategoryMeta } from '../../lib/types';

const W = Dimensions.get('window').width - 32;

type Period = '7d' | '30d' | 'month';

export default function StatsScreen() {
  const { expenses, refresh } = useExpenses();
  const [period, setPeriod] = useState<Period>('month');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const now = new Date();
  const filtered =
    period === 'month'
      ? filterByMonth(expenses, now.getFullYear(), now.getMonth() + 1)
      : filterByPeriod(expenses, period === '7d' ? 7 : 30);

  const pieData = getPieData(filtered);
  const barData = getBarData(expenses);
  const total = totalAmount(filtered);
  const byCat = Object.entries(groupByCategory(filtered)).sort(([, a], [, b]) => b - a);

  const chartConfig = {
    backgroundGradientFrom: '#1e1b4b',
    backgroundGradientTo: '#1e1b4b',
    color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
    labelColor: () => '#94a3b8',
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: '#312e81' },
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Estadísticas</Text>

        {/* Period Selector */}
        <View style={s.periodRow}>
          {(['7d', '30d', 'month'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, period === p && s.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.periodLabel, period === p && s.periodLabelActive]}>
                {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Este mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total gastado</Text>
          <Text style={s.totalAmount}>{formatCurrency(total)}</Text>
        </View>

        {/* Bar Chart - Last 7 days */}
        <View style={s.chartBox}>
          <Text style={s.chartTitle}>Gastos por día (últimos 7 días)</Text>
          {barData.datasets[0].data.some((v) => v > 0) ? (
            <BarChart
              data={barData}
              width={W}
              height={200}
              chartConfig={chartConfig}
              style={s.chart}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel=""
              yAxisSuffix="€"
            />
          ) : (
            <Text style={s.empty}>Sin datos en este período</Text>
          )}
        </View>

        {/* Pie Chart */}
        {pieData.length > 0 ? (
          <View style={s.chartBox}>
            <Text style={s.chartTitle}>Distribución por categoría</Text>
            <PieChart
              data={pieData}
              width={W}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[0, 0]}
              hasLegend={false}
            />
            {/* Custom Legend */}
            <View style={s.legend}>
              {pieData.map((item) => {
                const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0';
                return (
                  <View key={item.name} style={s.legendRow}>
                    <View style={[s.legendDot, { backgroundColor: item.color }]} />
                    <Text style={s.legendName}>{getCategoryMeta(item.name).icon} {item.name}</Text>
                    <Text style={s.legendPct}>{pct}%</Text>
                    <Text style={s.legendAmt}>{formatCurrency(item.amount)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={s.chartBox}>
            <Text style={s.empty}>Sin gastos en este período</Text>
          </View>
        )}

        {/* Category Breakdown */}
        {byCat.length > 0 && (
          <View style={s.chartBox}>
            <Text style={s.chartTitle}>Desglose por categoría</Text>
            {byCat.map(([name, amount]) => {
              const meta = getCategoryMeta(name);
              const pct = total > 0 ? (amount / total) * 100 : 0;
              return (
                <View key={name} style={s.breakdownRow}>
                  <View style={[s.bIcon, { backgroundColor: meta.color + '22' }]}>
                    <Text style={s.bEmoji}>{meta.icon}</Text>
                  </View>
                  <View style={s.bInfo}>
                    <View style={s.bTopRow}>
                      <Text style={s.bName}>{name}</Text>
                      <Text style={s.bAmt}>{formatCurrency(amount)}</Text>
                    </View>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${pct}%`, backgroundColor: meta.color }]} />
                    </View>
                    <Text style={s.bPct}>{pct.toFixed(1)}% del total</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0e2a' },
  scroll: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', color: '#e2e8f0', marginBottom: 16, marginTop: 8 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  periodBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  periodLabel: { color: '#94a3b8', fontWeight: '600', fontSize: 13 },
  periodLabelActive: { color: '#fff' },
  totalCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#312e81',
    alignItems: 'center',
  },
  totalLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  totalAmount: { color: '#818cf8', fontSize: 36, fontWeight: '700' },
  chartBox: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  chartTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 15, marginBottom: 12 },
  chart: { borderRadius: 12, marginLeft: -16 },
  legend: { marginTop: 12, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, color: '#e2e8f0', fontSize: 13 },
  legendPct: { color: '#94a3b8', fontSize: 12, width: 42, textAlign: 'right' },
  legendAmt: { color: '#818cf8', fontSize: 13, fontWeight: '700', width: 72, textAlign: 'right' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  bIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bEmoji: { fontSize: 20 },
  bInfo: { flex: 1 },
  bTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bName: { color: '#e2e8f0', fontWeight: '600', fontSize: 14 },
  bAmt: { color: '#818cf8', fontWeight: '700', fontSize: 14 },
  barTrack: { height: 6, backgroundColor: '#0f0e2a', borderRadius: 3, marginBottom: 3 },
  barFill: { height: 6, borderRadius: 3 },
  bPct: { color: '#64748b', fontSize: 11 },
  empty: { color: '#64748b', textAlign: 'center', paddingVertical: 24 },
});
