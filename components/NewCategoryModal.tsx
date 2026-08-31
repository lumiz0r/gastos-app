import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { addCategory, ICON_OPTIONS, COLOR_OPTIONS } from '../lib/categories';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called with the new category name so the caller can select it. */
  onCreated: (name: string) => void;
}

export default function NewCategoryModal({ visible, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setIcon(ICON_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await addCategory({ name, icon, color });
      const created = name.trim();
      reset();
      onCreated(created);
    } catch (err) {
      Alert.alert('No se pudo crear', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.title}>Nueva categoría</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.label}>Nombre</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej. Gasolina"
                placeholderTextColor="#475569"
                maxLength={24}
                autoFocus
              />

              <Text style={s.label}>Icono</Text>
              <View style={s.iconGrid}>
                {ICON_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.iconBtn, icon === opt && { borderColor: color, backgroundColor: color + '33' }]}
                    onPress={() => setIcon(opt)}
                  >
                    <Text style={s.iconText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Color</Text>
              <View style={s.colorRow}>
                {COLOR_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.swatch, { backgroundColor: opt }, color === opt && s.swatchActive]}
                    onPress={() => setColor(opt)}
                  />
                ))}
              </View>

              <Text style={s.label}>Vista previa</Text>
              <View style={[s.preview, { borderColor: color, backgroundColor: color + '22' }]}>
                <Text style={s.previewIcon}>{icon}</Text>
                <Text style={[s.previewName, { color }]}>{name.trim() || 'Sin nombre'}</Text>
              </View>
            </ScrollView>

            <View style={s.actions}>
              <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={handleClose}>
                <Text style={s.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, s.btnPrimary, saving && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                <Text style={s.btnPrimaryText}>{saving ? 'Creando...' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000099', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0f0e2a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: '#312e81',
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#312e81',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#e2e8f0' },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginTop: 18 },
  input: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  iconText: { fontSize: 20 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: '#e2e8f0' },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  previewIcon: { fontSize: 18 },
  previewName: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  btn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnGhost: { backgroundColor: '#1e1b4b', borderWidth: 1, borderColor: '#312e81' },
  btnGhostText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  btnPrimary: { backgroundColor: '#6366f1' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
