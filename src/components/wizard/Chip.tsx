import { Pressable, StyleSheet, Text } from 'react-native';
import { Brand } from '@/constants/brand';

export function Chip({
  label,
  on,
  onPress,
  small,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, small && styles.chipSmall, on ? styles.chipOn : styles.chipOff]}
    >
      <Text style={[styles.label, small && styles.labelSmall, on && styles.labelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipOn: {
    backgroundColor: Brand.chipOnBg,
    borderColor: Brand.chipOnBg,
  },
  chipOff: {
    backgroundColor: Brand.chipOffBg,
    borderColor: Brand.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.chipOffText,
  },
  labelSmall: {
    fontSize: 11,
  },
  labelOn: {
    color: Brand.chipOnText,
  },
});
