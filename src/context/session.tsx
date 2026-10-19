import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type Role = 'aupair' | 'family';

export type Profile = {
  id: string;
  role: Role;
  display_name: string;
  onboarding_complete: boolean;
  profile_data: Record<string, unknown>;
};

type SessionContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: Role
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Two things have to resolve before we know what to show: whether there
  // is a session at all, and (if there is one) that session's profile row.
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    let cancelled = false;

    async function load() {
      setProfileLoaded(false);
      const next = session ? await fetchProfile(session.user.id) : null;
      if (cancelled) return;
      setProfile(next);
      setProfileLoaded(true);
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [session, sessionLoaded]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      profile,
      isLoading: !sessionLoaded || !profileLoaded,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
      },
      async signUp(email, password, displayName, role) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, display_name: displayName } },
        });
        if (error || !data.user) return { error: error?.message ?? 'Could not create that account.' };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: data.user.id, role, display_name: displayName });
        if (profileError) return { error: profileError.message };

        if (data.session) {
          setProfile(await fetchProfile(data.user.id));
        }
        return { error: null };
      },
      async signOut() {
        await supabase.auth.signOut();
        setProfile(null);
      },
      async refreshProfile() {
        if (!session) return;
        setProfile(await fetchProfile(session.user.id));
      },
    }),
    [session, profile, sessionLoaded, profileLoaded]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
