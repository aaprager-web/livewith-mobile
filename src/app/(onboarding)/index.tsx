import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { useSession } from '@/context/session';
import { supabase } from '@/lib/supabase';
import { AP_STEPS, FAM_STEPS, type Step } from '@/lib/wizardSteps';
import { fieldSummary, isFieldAnswered, missingRequired } from '@/lib/wizardHelpers';
import { FieldBlock } from '@/components/wizard/FieldBlock';

type WizardData = Record<string, any>;

export default function Onboarding() {
  const { session, profile, refreshProfile } = useSession();
  const role = profile?.role ?? 'aupair';
  const steps: Step[] = role === 'family' ? FAM_STEPS : AP_STEPS;

  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<WizardData>(profile?.profile_data || {});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [requiredError, setRequiredError] = useState<string | null>(null);

  const step = steps[stepIdx];
  const isReview = step.type === 'review';

  function setField(key: string, value: unknown) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function updateField(key: string, updater: (prev: unknown) => unknown) {
    setData((d) => ({ ...d, [key]: updater(d[key]) }));
  }

  async function persist(next: WizardData, complete: boolean): Promise<boolean> {
    if (!session) return false;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, role, profile_data: next, onboarding_complete: complete });
    setSaving(false);
    setSaveError(error?.message ?? null);
    return !error;
  }

  async function goNext() {
    const missing = missingRequired(step, data);
    if (missing.length > 0) {
      setRequiredError(`Please answer before continuing: ${missing.map((f) => f.label || step.title).join(', ')}.`);
      return;
    }
    setRequiredError(null);
    const ok = await persist(data, false);
    if (ok) setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setRequiredError(null);
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function jumpTo(i: number) {
    setRequiredError(null);
    setStepIdx(i);
  }

  async function finish() {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.type === 'review') continue;
      const missing = missingRequired(s, data);
      if (missing.length > 0) {
        setStepIdx(i);
        setRequiredError(`Please answer before continuing: ${missing.map((f) => f.label || s.title).join(', ')}.`);
        return;
      }
    }
    setRequiredError(null);
    const ok = await persist(data, true);
    if (ok) await refreshProfile();
  }

  const pct = Math.round(((stepIdx + 1) / steps.length) * 100);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.progressRow}>
        {stepIdx > 0 ? (
          <Pressable onPress={goBack}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Text style={styles.stepCount}>
          Step {stepIdx + 1} of {steps.length}
        </Text>
      </View>

      {!isReview ? (
        <>
          <Text style={styles.title}>{step.title}</Text>
          {step.sub ? <Text style={styles.sub}>{step.sub}</Text> : null}

          {step.fields!.map((f) => (
            <FieldBlock key={f.key} field={f} data={data} setField={setField} updateField={updateField} />
          ))}

          {requiredError && <Text style={styles.errorText}>{requiredError}</Text>}
          {saveError && <Text style={styles.errorText}>{saveError}</Text>}

          <Pressable style={styles.primaryButton} onPress={goNext} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Continue'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.title}>Review your profile</Text>
          <Text style={styles.sub}>Tap any row to jump back and change it. You can update this anytime after you finish.</Text>

          <View style={styles.reviewBox}>
            {steps.flatMap((s, i) =>
              s.type === 'review'
                ? []
                : s.fields!.map((f) => {
                    const answered = isFieldAnswered(f, data);
                    return (
                      <Pressable
                        key={f.key}
                        onPress={() => jumpTo(i)}
                        style={[styles.reviewRow, !answered && styles.reviewRowSkipped]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reviewLabel}>
                            {f.label || s.title}
                            {!answered && <Text style={styles.skippedBadge}>  SKIPPED</Text>}
                          </Text>
                          <Text style={styles.reviewValue}>{fieldSummary(f, data)}</Text>
                        </View>
                        <Text style={styles.editLink}>Edit</Text>
                      </Pressable>
                    );
                  })
            )}
          </View>

          {requiredError && <Text style={styles.errorText}>{requiredError}</Text>}
          {saveError && <Text style={styles.errorText}>{saveError}</Text>}

          <Pressable style={styles.finishButton} onPress={finish} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : "I'm done"}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { paddingHorizontal: 20, paddingVertical: 24 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#EDF3EF', overflow: 'hidden', marginBottom: 20 },
  progressFill: { height: '100%', backgroundColor: Brand.primary },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backLink: { fontSize: 14, fontWeight: '600', color: Brand.textSecondary },
  stepCount: { fontSize: 14, color: Brand.textMuted },
  title: { fontSize: 22, fontWeight: '700', color: Brand.text, marginBottom: 4 },
  sub: { fontSize: 14, color: Brand.textSecondary, marginBottom: 20 },
  primaryButton: {
    backgroundColor: Brand.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  finishButton: {
    backgroundColor: Brand.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorText: { color: Brand.errorText, fontSize: 13, marginBottom: 10 },
  reviewBox: { borderWidth: 1, borderColor: Brand.border, borderRadius: 16, marginBottom: 20 },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  reviewRowSkipped: { backgroundColor: Brand.warningBg },
  reviewLabel: { fontSize: 14, fontWeight: '700', color: Brand.text, marginBottom: 2 },
  reviewValue: { fontSize: 13, color: Brand.textSecondary },
  skippedBadge: { fontSize: 10, fontWeight: '700', color: Brand.warningText },
  editLink: { fontSize: 13, fontWeight: '700', color: Brand.primary, marginLeft: 10 },
});
