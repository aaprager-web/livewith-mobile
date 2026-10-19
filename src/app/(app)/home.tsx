import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { useSession } from '@/context/session';

// Placeholder landing screen. Matching, search, messaging and the rest of
// "Not built yet" (see CLAUDE.md) land here once they exist.
export default function Home() {
  const { profile, signOut } = useSession();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>You&apos;re all set, {profile?.display_name}</Text>
      <Text style={styles.subtitle}>
        Your profile is complete. Matching, search and messaging aren&apos;t built yet, this is just
        confirmation the onboarding flow works end to end.
      </Text>
      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Brand.background },
  title: { fontSize: 24, fontWeight: '700', color: Brand.text, marginBottom: 10 },
  subtitle: { fontSize: 14, color: Brand.textSecondary, marginBottom: 24, lineHeight: 20 },
  button: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '700', color: Brand.text },
});
