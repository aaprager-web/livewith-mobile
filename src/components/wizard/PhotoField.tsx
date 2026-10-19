import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';

// Stores the picked photo's local file URI in profile_data for now. Actually
// uploading it to Supabase Storage is still "Not built yet" (see CLAUDE.md),
// so this photo only ever shows up on this device until that lands.
export function PhotoField({ value, onChange }: { value: string | undefined; onChange: (uri: string | undefined) => void }) {
  const [error, setError] = useState<string | null>(null);

  async function fromLibrary() {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo library access was declined. You can enable it in your phone\'s settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) onChange(result.assets[0].uri);
  }

  async function fromCamera() {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera access was declined. You can enable it in your phone\'s settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) onChange(result.assets[0].uri);
  }

  return (
    <View style={styles.block}>
      {value ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: value }} style={styles.preview} contentFit="cover" />
          <Pressable onPress={() => onChange(undefined)}>
            <Text style={styles.remove}>Remove photo</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={fromLibrary}>
          <Text style={styles.buttonText}>Choose from library</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={fromCamera}>
          <Text style={styles.buttonText}>Take a photo</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 8 },
  previewRow: { alignItems: 'center', marginBottom: 14, gap: 8 },
  preview: { width: 120, height: 120, borderRadius: 60, backgroundColor: Brand.border },
  remove: { fontSize: 13, color: Brand.errorText, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 13, fontWeight: '700', color: Brand.text, textAlign: 'center' },
  error: { marginTop: 10, fontSize: 13, color: Brand.errorText },
});
