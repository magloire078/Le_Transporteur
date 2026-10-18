import * as React from 'react';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { Fonts, THEMES } from '@/constants/theme';
import { signOut, updateUtilisateur } from '@/services/authService';
import { confirm, notify } from '@/services/dialog';
import { Icon } from './Icon';
import { Button, Card, Field, Row, SectionHeader } from './ui';

const THEME_LABELS: Record<keyof typeof THEMES, string> = {
  blue: 'Bleu nuit',
  dark: 'Sombre or',
  green: 'Vert ivoire',
};

const ROLE_LABELS = { owner: 'Propriétaire', driver: 'Chauffeur', admin: 'Administrateur' } as const;

export default function SettingsSection() {
  const { activeTheme: T, themeName, setThemeName, user, refreshUser } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const save = async () => {
    if (!name.trim()) return notify('Nom requis');
    setBusy(true);
    try {
      await updateUtilisateur(user.id, { name: name.trim(), phone: phone.trim() });
      await refreshUser();
      setEditing(false);
    } catch (e) {
      notify('Échec de la mise à jour', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <SectionHeader title="Mon compte" action={editing ? 'Annuler' : 'Modifier'} onAction={() => { setEditing(e => !e); setName(user.name); setPhone(user.phone); }} />
      <Card style={{ marginBottom: 20 }}>
        {editing ? (
          <>
            <Field label="Nom complet" value={name} onChangeText={setName} />
            <Field label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Button label="Enregistrer" onPress={save} loading={busy} />
          </>
        ) : (
          <>
            <Row label="Nom" value={user.name} />
            <Row label="E-mail" value={user.email} />
            <Row label="Téléphone" value={user.phone || '—'} />
            <Row label="Rôle" value={ROLE_LABELS[user.role]} />
          </>
        )}
      </Card>

      <SectionHeader title="Apparence" />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map(k => {
          const th = THEMES[k];
          const active = k === themeName;
          return (
            <TouchableOpacity
              key={k}
              onPress={() => setThemeName(k)}
              style={{
                flex: 1,
                borderRadius: 16,
                padding: 12,
                alignItems: 'center',
                gap: 8,
                backgroundColor: T.card,
                borderWidth: 2,
                borderColor: active ? T.accent : T.dark ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: th.gradient[0] }} />
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: th.accent, marginLeft: -6 }} />
              </View>
              <Text style={{ color: T.text, fontFamily: active ? Fonts.bold : Fonts.semibold, fontSize: 11 }}>{THEME_LABELS[k]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => confirm('Se déconnecter ?', 'Vous devrez saisir à nouveau votre mot de passe.', 'Déconnexion', () => { signOut(); })}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, backgroundColor: '#EF444415' }}
      >
        <Icon name="logout" size={18} color="#EF4444" />
        <Text style={{ color: '#EF4444', fontFamily: Fonts.bold, fontSize: 15 }}>Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 10, textAlign: 'center', marginTop: 16 }}>Le Transporteur · v1.0.0</Text>
    </View>
  );
}
