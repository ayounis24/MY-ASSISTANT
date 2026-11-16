import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { formatDate, formatTime } from '../lib/dates';
import { useTheme } from '../lib/theme';

/** Right-to-left text that follows the current theme. */
export function Txt({
  muted,
  size = 16,
  weight,
  style,
  ...props
}: TextProps & { muted?: boolean; size?: number; weight?: '400' | '600' | '700' }) {
  const t = useTheme();
  return (
    <Text
      {...props}
      style={[
        styles.rtl,
        { color: muted ? t.muted : t.text, fontSize: size, fontWeight: weight },
        style,
      ]}
    />
  );
}

/** A horizontal row laid out right-to-left. */
export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, style]}>
      {children}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  const t = useTheme();
  const bg = active ? (color ?? t.primary) : t.chip;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, { backgroundColor: bg }]}
    >
      <Txt size={14} weight="600" style={{ color: active ? '#fff' : t.text }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.muted}
      {...props}
      style={[
        styles.rtl,
        styles.input,
        { color: t.text, backgroundColor: t.card, borderColor: t.border },
        props.multiline && { minHeight: 120, textAlignVertical: 'top' },
        props.style,
      ]}
    />
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
}) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : variant === 'danger' ? t.danger : 'transparent';
  const fg = variant === 'ghost' ? t.primary : variant === 'primary' ? t.primaryText : '#fff';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: pressed ? 0.8 : 1 }]}
    >
      <Txt weight="700" style={{ color: fg, textAlign: 'center' }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Fab({ onPress, label }: { onPress: () => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: t.primary, transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <Text style={{ color: t.primaryText, fontSize: 30, lineHeight: 32 }}>+</Text>
    </Pressable>
  );
}

export function Empty({ emoji, title, hint }: { emoji: string; title: string; hint: string }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Txt size={18} weight="700" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      <Txt muted style={{ textAlign: 'center' }}>
        {hint}
      </Txt>
    </View>
  );
}

/** Date + time picker that works on both Android (dialogs) and iOS (inline). */
export function DateTimeField({ value, onChange }: { value: number; onChange: (ts: number) => void }) {
  const t = useTheme();
  const [iosMode, setIosMode] = useState<'date' | 'time' | null>(null);
  const date = new Date(value);

  const open = (mode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode,
        is24Hour: false,
        onValueChange: (_e, picked) => onChange(merge(date, picked, mode)),
      });
    } else {
      setIosMode((m) => (m === mode ? null : mode));
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Row style={{ gap: 8 }}>
        <Pressable style={[styles.pickerBtn, { borderColor: t.border, backgroundColor: t.card }]} onPress={() => open('date')}>
          <Txt>📅 {formatDate(value)}</Txt>
        </Pressable>
        <Pressable style={[styles.pickerBtn, { borderColor: t.border, backgroundColor: t.card }]} onPress={() => open('time')}>
          <Txt>🕐 {formatTime(value)}</Txt>
        </Pressable>
      </Row>
      {Platform.OS === 'ios' && iosMode && (
        <DateTimePicker
          value={date}
          mode={iosMode}
          display={iosMode === 'date' ? 'inline' : 'spinner'}
          locale="ar-EG"
          onValueChange={(_e, picked) => onChange(merge(date, picked, iosMode))}
        />
      )}
    </View>
  );
}

function merge(base: Date, picked: Date, mode: 'date' | 'time'): number {
  const out = new Date(base);
  if (mode === 'date') out.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  else out.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return out.getTime();
}

const styles = StyleSheet.create({
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60, paddingHorizontal: 32 },
  pickerBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12 },
});
