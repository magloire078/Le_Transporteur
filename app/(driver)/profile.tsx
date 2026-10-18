import * as React from 'react';
import { View, Text } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useDriver } from '@/context/DriverContext';
import { Fonts } from '@/constants/theme';
import SettingsSection from '@/components/SettingsSection';
import { GradientHeader, Screen, styles as ui } from '@/components/ui';
import { CHAUFFEUR_STATUS, initials } from '@/services/labels';

export default function DriverProfileScreen() {
  const { user } = useAppContext();
  const d = useDriver();
  if (!user) return null;
  const st = CHAUFFEUR_STATUS[d.profile?.status ?? 'Available'];

  return (
    <Screen>
      <GradientHeader style={{ alignItems: 'center' }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' }}>
          <Text style={{ color: '#fff', fontFamily: Fonts.extraBold, fontSize: 28 }}>{initials(user.name)}</Text>
        </View>
        <Text style={[ui.headerTitle, { marginTop: 12 }]}>{user.name}</Text>
        <Text style={ui.headerSub}>{user.phone} · <Text style={{ color: st.color }}>● {st.label}</Text></Text>
      </GradientHeader>
      <View style={ui.body}>
        <SettingsSection />
      </View>
    </Screen>
  );
}
