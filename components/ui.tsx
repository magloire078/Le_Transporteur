import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TextInputProps,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import { Icon, IconName } from './Icon';

export const HEADER_TOP = Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 20) + 16;

/** En-tête dégradé arrondi avec cercles décoratifs (style Lavage Pro). */
export function GradientHeader({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { activeTheme: T } = useAppContext();
  return (
    <LinearGradient colors={T.gradient} style={[styles.header, { paddingTop: HEADER_TOP }, style]}>
      <View style={styles.headerDecor1} />
      <View style={styles.headerDecor2} />
      {children}
    </LinearGradient>
  );
}

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={{ flex: 1, backgroundColor: T.surface }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {children}
        </ScrollView>
      ) : children}
    </View>
  );
}

export function Loading() {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={{ flex: 1, backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={T.accent} />
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { activeTheme: T } = useAppContext();
  const base = [styles.card, { backgroundColor: T.card, borderColor: T.dark ? 'rgba(255,255,255,0.06)' : '#E5E7EB' }, style];
  if (onPress) {
    return <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={base}>{children}</TouchableOpacity>;
  }
  return <View style={base}>{children}</View>;
}

export function SectionHeader({ title, action, onAction, live }: { title: string; action?: string; onAction?: () => void; live?: boolean }) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        {live && <View style={styles.liveDot} />}
        <Text style={[styles.sectionTitle, { color: T.text }]}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.seeAll, { color: T.accent }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function IconBubble({ name, color, size = 40 }: { name: IconName; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.45} color={color} />
    </View>
  );
}

export function EmptyState({ icon, title, body, action, onAction }: { icon: IconName; title: string; body?: string; action?: string; onAction?: () => void }) {
  const { activeTheme: T } = useAppContext();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
      <IconBubble name={icon} color={T.accent} size={52} />
      <Text style={{ color: T.text, fontFamily: Fonts.bold, fontSize: 15, marginTop: 12, textAlign: 'center' }}>{title}</Text>
      {body && <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12, marginTop: 4, textAlign: 'center' }}>{body}</Text>}
      {action && <Button label={action} onPress={onAction} style={{ marginTop: 16, alignSelf: 'stretch' }} />}
    </Card>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const { activeTheme: T } = useAppContext();
  const bg = variant === 'primary' ? T.accent : variant === 'danger' ? '#EF4444' : 'transparent';
  const fg = variant === 'secondary' ? T.text : '#FFFFFF';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: T.dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB' },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <>
          {icon && <Icon name={icon} size={18} color={fg} />}
          <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.fieldLabel, { color: T.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={T.muted}
        {...props}
        style={[
          styles.input,
          {
            backgroundColor: T.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            borderColor: T.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            color: T.text,
          },
          props.style,
        ]}
      />
    </View>
  );
}

export function ChipGroup<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { key: K; label: string }[];
  value: K | null;
  onChange: (k: K) => void;
}) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={[styles.fieldLabel, { color: T.muted }]}>{label}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => {
          const active = o.key === value;
          return (
            <TouchableOpacity
              key={o.key}
              onPress={() => onChange(o.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? T.accent + '20' : T.dark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                  borderColor: active ? T.accent : 'transparent',
                },
              ]}
            >
              <Text style={{ color: active ? T.accentText : T.text, fontFamily: active ? Fonts.bold : Fonts.semibold, fontSize: 12 }}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** Feuille modale glissant depuis le bas (style des modales Lavage Pro). */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { activeTheme: T } = useAppContext();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: T.card }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: T.text }]} numberOfLines={1}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={[styles.sheetClose, { backgroundColor: T.dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
              <Icon name="x" size={18} color={T.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={styles.row}>
      <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: valueColor ?? T.text, fontFamily: Fonts.bold, fontSize: 13 }}>{value}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerKicker: { fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5, fontFamily: Fonts.semibold },
  headerTitle: { fontSize: 24, color: '#fff', letterSpacing: -0.4, fontFamily: Fonts.bold },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.sans, marginTop: 4 },
  glass: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  body: { padding: 20 },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontFamily: Fonts.bold },
  seeAll: { fontSize: 13, fontFamily: Fonts.semibold },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontFamily: Fonts.bold },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 16 },
  buttonText: { fontSize: 15, fontFamily: Fonts.bold },
  fieldLabel: { fontSize: 12, fontFamily: Fonts.semibold, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: Fonts.semibold },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.35)', alignSelf: 'center', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  sheetTitle: { fontSize: 19, fontFamily: Fonts.bold, flex: 1 },
  sheetClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
});
