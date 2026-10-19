import { View, StyleSheet } from 'react-native';
import { SelectField } from './SelectField';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Stores the same 'YYYY-MM-DD' string shape the website's native <input
// type="date"> uses, so a profile saved from either app reads the same way
// in the other. dateMin/dateMax only ever mean "today" (see wizardSteps.ts).
export function DateField({
  value,
  dateMin,
  dateMax,
  onChange,
}: {
  value: string | undefined;
  dateMin?: 'today';
  dateMax?: 'today';
  onChange: (value: string) => void;
}) {
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : undefined;
  const year = parsed?.getFullYear();
  const month = parsed ? parsed.getMonth() : undefined;
  const day = parsed?.getDate();

  const minYear = dateMax === 'today' ? today.getFullYear() - 100 : today.getFullYear();
  const maxYear = dateMin === 'today' ? today.getFullYear() + 5 : today.getFullYear();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i)).reverse();

  function setPart(nextYear?: number, nextMonth?: number, nextDay?: number) {
    const y = nextYear ?? year ?? today.getFullYear();
    const m = nextMonth ?? month ?? today.getMonth();
    let d = nextDay ?? day ?? today.getDate();
    d = Math.min(d, daysInMonth(y, m));
    const iso = `${y.toString().padStart(4, '0')}-${(m + 1).toString().padStart(2, '0')}-${d
      .toString()
      .padStart(2, '0')}`;
    if (dateMax === 'today' && iso > today.toISOString().slice(0, 10)) return;
    if (dateMin === 'today' && iso < today.toISOString().slice(0, 10)) return;
    onChange(iso);
  }

  const dayOptions = Array.from(
    { length: daysInMonth(year ?? today.getFullYear(), month ?? today.getMonth()) },
    (_, i) => String(i + 1)
  );

  return (
    <View style={styles.row}>
      <View style={styles.day}>
        <SelectField
          value={day ? String(day) : undefined}
          options={dayOptions}
          placeholder="Day"
          onChange={(v) => setPart(undefined, undefined, Number(v))}
        />
      </View>
      <View style={styles.month}>
        <SelectField
          value={month !== undefined ? MONTHS[month] : undefined}
          options={MONTHS}
          placeholder="Month"
          onChange={(v) => setPart(undefined, MONTHS.indexOf(v), undefined)}
        />
      </View>
      <View style={styles.year}>
        <SelectField
          value={year ? String(year) : undefined}
          options={years}
          placeholder="Year"
          onChange={(v) => setPart(Number(v), undefined, undefined)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  day: { flex: 2 },
  month: { flex: 3 },
  year: { flex: 2 },
});
