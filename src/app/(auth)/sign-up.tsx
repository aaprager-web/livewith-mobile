import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { useSession, type Role } from '@/context/session';

export default function SignUp() {
  const { signUp } = useSession();
  const [role, setRole] = useState<Role>('aupair');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError('Please fill in every field (password needs at least 6 characters).');
      return;
    }
    setSubmitting(true);
    const result = await signUp(email.trim(), password, displayName.trim(), role);
    setSubmitting(false);
    setError(result.error);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <Text style={styles.title}>Join LiveWith</Text>
      <Text style={styles.subtitle}>Create your account to start your onboarding profile.</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleCard, role === 'aupair' && styles.roleCardSelected]}
          onPress={() => setRole('aupair')}
        >
          <Text style={styles.roleText}>I want to be an au pair</Text>
        </Pressable>
        <Pressable
          style={[styles.roleCard, role === 'family' && styles.roleCardSelected]}
          onPress={() => setRole('family')}
        >
          <Text style={styles.roleText}>We&apos;re a host family</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>{role === 'family' ? 'Family name' : 'Your name'}</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} />

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
        <Text style={styles.buttonText}>{submitting ? 'Creating account...' : 'Create account'}</Text>
      </Pressable>

      <Text style={styles.footer}>
        Already have an account?{' '}
        <Link href="/sign-in" style={styles.link}>
          Log in
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Brand.background },
  title: { fontSize: 28, fontWeight: '700', color: Brand.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Brand.textSecondary, marginBottom: 20 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    padding: 14,
  },
  roleCardSelected: { borderColor: Brand.primary, backgroundColor: Brand.selectedBg },
  roleText: { fontSize: 13, fontWeight: '700', color: Brand.text },
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
