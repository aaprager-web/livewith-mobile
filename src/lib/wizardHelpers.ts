// Shared logic between the wizard screen and its field components, kept in
// one place so the website's and the app's notion of "answered" / "how to
// summarise this value" don't quietly drift apart. Mirrors Wizard.tsx on
// the website.
import type { Step, StepField } from './wizardSteps';

type WizardData = Record<string, any>;

export function formatRangeEndpoint(field: StepField, value: number, end: 'min' | 'max'): string {
  const lo = field.min ?? 0;
  const hi = field.max ?? 60;
  if (end === 'min' && field.underMinLabel !== undefined && value <= lo) return field.underMinLabel;
  if (end === 'max' && field.overMaxLabel !== undefined && value >= hi) return field.overMaxLabel;
  return `${field.unitPrefix ?? ''}${value}${field.unitSuffix ?? ''}`;
}

export function isFieldAnswered(field: StepField, data: WizardData): boolean {
  const val = data[field.key];
  switch (field.type) {
    case 'chipMulti':
    case 'languageLevels':
      return Array.isArray(val) && val.length > 0;
    case 'childList':
      return Array.isArray(data.children) && data.children.length > 0;
    case 'strength':
      return !!val && Object.keys(val).length > 0;
    case 'range':
      return !!val && typeof val.min === 'number';
    default:
      return val !== undefined && val !== null && String(val).trim() !== '';
  }
}

export function missingRequired(step: Step, data: WizardData): StepField[] {
  if (!step.fields) return [];
  return step.fields.filter((f) => f.required && !isFieldAnswered(f, data));
}

export function fieldSummary(field: StepField, data: WizardData): string {
  const val = data[field.key];
  if (field.type === 'chipMulti') return val?.length ? val.join(', ') : 'Not answered yet';
  if (field.type === 'languageLevels') {
    return val?.length
      ? val
          .map((it: { l: string; lvl: string | null; custom?: string }) => {
            const name = it.l === 'Other' ? it.custom || 'Other (unspecified)' : it.l;
            return name + (it.lvl ? ` (${it.lvl})` : ' (level TBC)');
          })
          .join(', ')
      : 'Not answered yet';
  }
  if (field.type === 'strength') {
    const obj = val || {};
    return field.items!.map((it) => `${it.label}: ${obj[it.key] || '—'}`).join(' · ');
  }
  if (field.type === 'childList') {
    const kids = data.children || [];
    return kids.length
      ? kids.map((k: { name: string; age: string }) => `${k.name} (${k.age})`).join(', ')
      : 'No children added yet';
  }
  if (field.type === 'range') {
    const v = val as { min: number; max: number } | undefined;
    return v
      ? `${formatRangeEndpoint(field, v.min, 'min')} - ${formatRangeEndpoint(field, v.max, 'max')}`
      : 'Not answered yet';
  }
  return val || 'Not answered yet';
}
