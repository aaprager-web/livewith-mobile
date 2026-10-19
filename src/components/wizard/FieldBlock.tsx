import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand } from '@/constants/brand';
import {
  LANGUAGE_LEVELS,
  STRENGTH_LEVELS,
  WORLD_LANGUAGES,
  type StepField,
} from '@/lib/wizardSteps';
import { Chip } from './Chip';
import { SelectField } from './SelectField';
import { DateField } from './DateField';
import { RangeSlider } from './RangeSlider';
import { ChildListField } from './ChildListField';

type WizardData = Record<string, any>;
type LangItem = { l: string; lvl: string | null; custom?: string };

function FieldLabel({ label, required }: { label?: string; required?: boolean }) {
  if (!label) return null;
  return (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={{ color: Brand.errorText }}> *</Text> : null}
    </Text>
  );
}

export function FieldBlock({
  field,
  data,
  setField,
  updateField,
}: {
  field: StepField;
  data: WizardData;
  setField: (key: string, value: unknown) => void;
  updateField: (key: string, updater: (prev: unknown) => unknown) => void;
}) {
  const val = data[field.key];

  switch (field.type) {
    case 'text':
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <TextInput
            value={val || ''}
            placeholder={field.placeholder}
            onChangeText={(t) => setField(field.key, t)}
            style={styles.input}
          />
        </View>
      );

    case 'textarea':
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} />
          <TextInput
            value={val || ''}
            placeholder={field.placeholder}
            onChangeText={(t) => setField(field.key, t)}
            multiline
            numberOfLines={5}
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          />
        </View>
      );

    case 'select':
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <SelectField value={val} options={field.options!} onChange={(v) => setField(field.key, v)} />
        </View>
      );

    case 'date':
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <DateField
            value={val}
            dateMin={field.dateMin}
            dateMax={field.dateMax}
            onChange={(v) => setField(field.key, v)}
          />
        </View>
      );

    case 'chipSingle':
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <View style={styles.wrap}>
            {field.options!.map((o) => (
              <Chip key={o} label={o} on={val === o} onPress={() => setField(field.key, val === o ? undefined : o)} />
            ))}
          </View>
        </View>
      );

    case 'chipMulti': {
      const arr: string[] = val || [];
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <View style={styles.wrap}>
            {field.options!.map((o) => (
              <Chip
                key={o}
                label={o}
                on={arr.includes(o)}
                onPress={() =>
                  updateField(field.key, (prev) => {
                    const cur: string[] = (prev as string[]) || [];
                    return cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o];
                  })
                }
              />
            ))}
          </View>
        </View>
      );
    }

    case 'range': {
      const rangeVal: { min: number; max: number } | undefined = val;
      const lo = field.min ?? 0;
      const hi = field.max ?? 60;
      const curMin = rangeVal?.min ?? lo;
      const curMax = rangeVal?.max ?? hi;
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <View style={styles.rangeBox}>
            <RangeSlider
              field={field}
              curMin={curMin}
              curMax={curMax}
              onChangeMin={(v) => setField(field.key, { min: v, max: curMax })}
              onChangeMax={(v) => setField(field.key, { min: curMin, max: v })}
            />
          </View>
        </View>
      );
    }

    case 'strength': {
      const obj: Record<string, string> = val || {};
      return (
        <View style={{ gap: 14, marginBottom: 8 }}>
          {field.items!.map((it) => (
            <View key={it.key}>
              <Text style={styles.itemLabel}>{it.label}</Text>
              <View style={styles.wrap}>
                {STRENGTH_LEVELS.map((l) => (
                  <Chip
                    key={l}
                    label={l}
                    small
                    on={obj[it.key] === l}
                    onPress={() =>
                      updateField(field.key, (prev) => {
                        const next = { ...((prev as Record<string, string>) || {}) };
                        if (next[it.key] === l) delete next[it.key];
                        else next[it.key] = l;
                        return next;
                      })
                    }
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    }

    case 'languageLevels': {
      const arr: LangItem[] = val || [];
      const chosen = arr.map((x) => x.l);
      return (
        <View style={styles.block}>
          <FieldLabel label={field.label} required={field.required} />
          <View style={styles.wrap}>
            {field.options!.map((o) => (
              <Chip
                key={o}
                label={o}
                on={chosen.includes(o)}
                onPress={() =>
                  updateField(field.key, (prev) => {
                    const cur: LangItem[] = (prev as LangItem[]) || [];
                    const idx = cur.findIndex((x) => x.l === o);
                    return idx > -1 ? cur.filter((_, i) => i !== idx) : [...cur, { l: o, lvl: null }];
                  })
                }
              />
            ))}
          </View>
          {arr.length ? (
            <View style={{ gap: 14, marginTop: 14 }}>
              {arr.map((it) => (
                <View key={it.l}>
                  <Text style={styles.itemLabel}>
                    Level of {it.l === 'Other' ? it.custom || 'this language' : it.l}
                  </Text>
                  {it.l === 'Other' && (
                    <View style={{ marginBottom: 8 }}>
                      <SelectField
                        value={it.custom}
                        options={WORLD_LANGUAGES}
                        placeholder="Search for a language..."
                        onChange={(customVal) =>
                          updateField(field.key, (prev) =>
                            ((prev as LangItem[]) || []).map((x) =>
                              x.l === it.l ? { ...x, custom: customVal } : x
                            )
                          )
                        }
                      />
                    </View>
                  )}
                  <View style={styles.wrap}>
                    {LANGUAGE_LEVELS.map((l) => (
                      <Chip
                        key={l}
                        label={l}
                        small
                        on={it.lvl === l}
                        onPress={() =>
                          updateField(field.key, (prev) =>
                            ((prev as LangItem[]) || []).map((x) => (x.l === it.l ? { ...x, lvl: l } : x))
                          )
                        }
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>Select a language above to set your level.</Text>
          )}
        </View>
      );
    }

    case 'childList': {
      const kids: { name: string; age: string }[] = data.children || [];
      return (
        <ChildListField
          kids={kids}
          onAdd={(child) => updateField('children', (prev) => [...((prev as typeof kids) || []), child])}
          onRemove={(idx) =>
            updateField('children', (prev) => ((prev as typeof kids) || []).filter((_, i) => i !== idx))
          }
        />
      );
    }

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: Brand.textMuted,
    marginBottom: 6,
  },
  itemLabel: { fontSize: 14, fontWeight: '700', color: Brand.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.text,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rangeBox: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    padding: 16,
  },
  hint: { fontSize: 14, color: Brand.textMuted, marginTop: 10 },
});
