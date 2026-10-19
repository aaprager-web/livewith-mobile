import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { useSession } from '@/context/session';

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    setError(result.error);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to continue with LiveWith.</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Logging in...' : 'Log in'}</Text>
      </Pressable>

      <Text style={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" style={styles.link}>
          Join LiveWith
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Brand.background },
  title: { fontSize: 28, fontWeight: '700', color: Brand.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Brand.textSecondary, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: Brand.textMuted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Brand.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: Brand.textSecondary },
  link: { color: Brand.primary, fontWeight: '700' },
  errorBox: { backgroundColor: Brand.errorBg, borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: Brand.errorText, fontSize: 13 },
});
