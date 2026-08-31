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
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
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
import { getCategoryMeta } from '../../lib/categories';

const W = Dimensions.get('window').width - 64;

type Period = '7d' | '30d' | 'month';

// Simple SVG pie chart
function PieChart({ data }: { data: { name: string; amount: number; color: string }[] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const innerR = 40;

  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return null;

  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const start = angle;
    const sweep = (d.amount / total) * 2 * Math.PI;
    angle += sweep;
    return { ...d, start, sweep };
  });

  const describeArc = (startA: number, sweepA: number) => {
    if (sweepA >= 2 * Math.PI) sweepA = 2 * Math.PI - 0.001;
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(startA + sweepA);
    const y2 = cy + r * Math.sin(startA + sweepA);
    const ix1 = cx + innerR * Math.cos(startA);
    const iy1 = cy + innerR * Math.sin(startA);
    const ix2 = cx + innerR * Math.cos(startA + sweepA);
    const iy2 = cy + innerR * Math.sin(startA + sweepA);
    const large = sweepA > Math.PI ? 1 : 0;
    return `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
  };

  return (
    <Svg width={size} height={size}>
      {slices.map((s) => (
        <Path key={s.name} d={describeArc(s.start, s.sweep)} fill={s.color} />
      ))}
      <Circle cx={cx} cy={cy} r={innerR - 2} fill="#0f0e2a" />
    </Svg>
  );
}

// Simple bar chart using Views
function BarChart({ data }: { data: { labels: string[]; datasets: { data: number[] }[] } }) {
  const values = data.datasets[0].data;
  const max = Math.max(...values, 0.01);
  const barH = 140;

  return (
    <View style={bc.container}>
      {/* Bars */}
      <View style={bc.barsRow}>
        {values.map((v, i) => (
          <View key={i} style={bc.barCol}>
            <Text style={bc.value}>{v > 0 ? `${v.toFixed(0)}€` : ''}</Text>
            <View style={[bc.barTrack, { height: barH }]}>
              <View
                style={[
                  bc.barFill,
                  { height: (v / max) * barH, backgroundColor: v === max ? '#818cf8' : '#4f46e5' },
                ]}
              />
            </View>
            <Text style={bc.label}>{data.labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const bc = StyleSheet.create({
  container: { paddingTop: 8 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  value: { color: '#94a3b8', fontSize: 9, textAlign: 'center' },
  barTrack: { width: '70%', justifyContent: 'flex-end', borderRadius: 4 },
  barFill: { width: '100%', borderRadius: 4, minHeight: 3 },
  label: { color: '#64748b', fontSize: 11, marginTop: 4 },
});

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
          <BarChart data={barData} />
        </View>

        {/* Pie Chart + Legend */}
        {pieData.length > 0 ? (
          <View style={s.chartBox}>
            <Text style={s.chartTitle}>Distribución por categoría</Text>
            <View style={s.pieRow}>
              <PieChart data={pieData} />
              <View style={s.legend}>
                {pieData.slice(0, 6).map((item) => {
                  const pct = total > 0 ? ((item.amount / total) * 100).toFixed(0) : '0';
                  return (
                    <View key={item.name} style={s.legendRow}>
                      <View style={[s.legendDot, { backgroundColor: item.color }]} />
                      <Text style={s.legendName} numberOfLines={1}>
                        {getCategoryMeta(item.name).icon} {item.name}
                      </Text>
                      <Text style={s.legendPct}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          <View style={s.chartBox}>
            <Text style={s.empty}>Sin gastos en este período</Text>
          </View>
        )}

        {/* Category Breakdown with progress bars */}
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
                      <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: meta.color }]} />
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
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendName: { flex: 1, color: '#e2e8f0', fontSize: 12 },
  legendPct: { color: '#818cf8', fontSize: 12, fontWeight: '700' },
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
