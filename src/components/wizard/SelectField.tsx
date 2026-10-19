import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Brand } from '@/constants/brand';

// A plain Modal + searchable list stands in for a native <select>, so this
// works inside Expo Go with no native picker dependency (see AGENTS.md:
// adding a native module means losing Expo Go testing until a dev build).
export function SelectField({
  value,
  options,
  placeholder = 'Select...',
  onChange,
}: {
  value: string | undefined;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>{value || placeholder}</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              style={styles.search}
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onChange(item);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.rowText, item === value && styles.rowTextSelected]}>{item}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  valueText: { fontSize: 15, color: Brand.text },
  placeholderText: { fontSize: 15, color: Brand.textMuted },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Brand.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  search: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  rowText: { fontSize: 15, color: Brand.text },
  rowTextSelected: { fontWeight: '700', color: Brand.primary },
});
