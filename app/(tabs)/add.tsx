import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useExpenses } from '../../lib/useExpenses';
import {
  getCategoryMeta,
  useCategories,
  isCustom,
  deleteCategory,
} from '../../lib/categories';
import NewCategoryModal from '../../components/NewCategoryModal';
import { toISODate } from '../../lib/utils';

export default function AddScreen() {
  const { add } = useExpenses();
  const categories = useCategories();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [saving, setSaving] = useState(false);

  const handleRemoveCategory = (name: string) => {
    if (!isCustom(name)) return;
    Alert.alert(
      'Eliminar categoría',
      `¿Eliminar "${name}"? Los gastos ya guardados se mantienen.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(name);
              if (category === name) setCategory('');
            } catch (err) {
              Alert.alert('No se pudo eliminar', (err as Error).message);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) {
      Alert.alert('Error', 'Introduce un importe válido.');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Selecciona una categoría.');
      return;
    }
    setSaving(true);
    await add({
      id: Date.now().toString(),
      amount: parsed,
      category,
      note: note.trim(),
      date,
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
    setAmount('');
    setCategory('');
    setNote('');
    setDate(toISODate(new Date()));
    router.push('/');
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>Nuevo Gasto</Text>

          {/* Amount */}
          <Text style={s.label}>Importe (€)</Text>
          <TextInput
            style={s.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor="#475569"
            keyboardType="decimal-pad"
            returnKeyType="done"
          />

          {/* Date */}
          <Text style={s.label}>Fecha</Text>
          <TextInput
            style={s.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#475569"
          />

          {/* Category */}
          <Text style={s.label}>Categoría</Text>
          <View style={s.categoryGrid}>
            {categories.map((cat) => {
              const selected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    s.catBtn,
                    selected && { backgroundColor: cat.color + '33', borderColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.name)}
                  onLongPress={() => handleRemoveCategory(cat.name)}
                >
                  <Text style={s.catEmoji}>{cat.icon}</Text>
                  <Text style={[s.catLabel, selected && { color: cat.color }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[s.catBtn, s.catBtnNew]} onPress={() => setShowNewCategory(true)}>
              <Text style={s.catNewIcon}>+</Text>
              <Text style={s.catNewLabel}>Nueva</Text>
            </TouchableOpacity>
          </View>
          {categories.some((c) => isCustom(c.name)) && (
            <Text style={s.hint}>Mantén pulsada una categoría propia para eliminarla.</Text>
          )}

          {/* Note */}
          <Text style={s.label}>Nota (opcional)</Text>
          <TextInput
            style={s.input}
            value={note}
            onChangeText={setNote}
            placeholder="Descripción del gasto..."
            placeholderTextColor="#475569"
            multiline
          />

          {/* Preview */}
          {amount && category && (
            <View style={s.preview}>
              <Text style={s.previewEmoji}>{getCategoryMeta(category).icon}</Text>
              <View>
                <Text style={s.previewAmount}>
                  {parseFloat(amount.replace(',', '.') || '0').toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </Text>
                <Text style={s.previewCat}>{category}</Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={s.saveBtnText}>{saving ? 'Guardando...' : 'Guardar gasto'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <NewCategoryModal
        visible={showNewCategory}
        onClose={() => setShowNewCategory(false)}
        onCreated={(name) => {
          setCategory(name);
          setShowNewCategory(false);
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0e2a' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#e2e8f0', marginBottom: 24, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  amountInput: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    fontSize: 36,
    fontWeight: '700',
    color: '#818cf8',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  input: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e1b4b',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  catBtnNew: { borderStyle: 'dashed', borderColor: '#4f46e5' },
  catNewIcon: { fontSize: 16, color: '#818cf8', fontWeight: '700' },
  catNewLabel: { fontSize: 13, color: '#818cf8', fontWeight: '600' },
  hint: { fontSize: 12, color: '#64748b', marginTop: 10 },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  previewEmoji: { fontSize: 36 },
  previewAmount: { fontSize: 24, fontWeight: '700', color: '#818cf8' },
  previewCat: { color: '#94a3b8', fontSize: 14, marginTop: 2 },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
