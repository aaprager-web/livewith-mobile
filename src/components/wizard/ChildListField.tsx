import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand } from '@/constants/brand';

type Child = { name: string; age: string };

export function ChildListField({
  kids,
  onAdd,
  onRemove,
}: {
  kids: Child[];
  onAdd: (child: Child) => void;
  onRemove: (index: number) => void;
}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  return (
    <View>
      {kids.length ? (
        <View style={{ gap: 8, marginBottom: 14 }}>
          {kids.map((k, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowText}>
                {k.name} · age {k.age}
              </Text>
              <Pressable onPress={() => onRemove(i)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No children added yet.</Text>
      )}
      <View style={styles.form}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Child&apos;s name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Freddie" style={styles.input} />
        </View>
        <View style={{ width: 70 }}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="6"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            if (!name.trim() || !age.trim()) return;
            onAdd({ name: name.trim(), age: age.trim() });
            setName('');
            setAge('');
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: { fontSize: 14, fontWeight: '700', color: Brand.text },
  remove: { fontSize: 13, color: Brand.errorText, fontWeight: '600' },
  empty: { fontSize: 14, color: Brand.textMuted, marginBottom: 14 },
  form: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: Brand.textMuted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addButton: {
    borderWidth: 1,
    borderColor: Brand.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  addButtonText: { fontSize: 14, fontWeight: '700', color: Brand.text },
});
