import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { notify } from '@/services/dialog';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import { Button, ChipGroup, Field } from '@/components/ui';
import { authErrorMessage, register, resetPassword, signIn, signOut } from '@/services/authService';

type Mode = 'login' | 'register';
type Role = 'owner' | 'driver';

export default function LoginScreen() {
  const router = useRouter();
  const { activeTheme: T, user, setUser, profileMissing } = useAppContext();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('owner');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  React.useEffect(() => {
    if (profileMissing) {
      setError("Ce compte n'a pas de profil dans l'application. Contactez l'administrateur ou créez un nouveau compte.");
      signOut().catch(() => {});
    }
  }, [profileMissing]);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Renseignez votre e-mail et votre mot de passe.');
      return;
    }
    if (mode === 'register' && (!name.trim() || !phone.trim())) {
      setError('Renseignez votre nom et votre téléphone.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        setUser(await register({ name, phone, email, password, role }));
      }
      // La redirection se fait dans l'effet ci-dessous, dès que le profil est chargé.
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError('Saisissez d\'abord votre e-mail ci-dessus.');
      return;
    }
    try {
      await resetPassword(email);
      notify('E-mail envoyé', `Un lien de réinitialisation a été envoyé à ${email.trim()}.`);
    } catch (e) {
      setError(authErrorMessage(e));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: T.surface }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <LinearGradient colors={T.gradient} style={StyleSheet.absoluteFill} />
          <View style={[styles.decorCircle, { top: -50, right: -50, width: 220, height: 220, opacity: 0.12 }]} />
          <View style={[styles.decorCircle, { bottom: -80, left: -40, width: 260, height: 260, opacity: 0.08 }]} />
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🚕</Text>
          </View>
          <Text style={[styles.appName, { fontFamily: Fonts.extraBold }]}>Le Transporteur</Text>
          <Text style={[styles.headerSub, { fontFamily: Fonts.sans }]}>
            Gestion de flotte, versements des chauffeurs & papiers du véhicule
          </Text>
        </View>

        <View style={styles.body}>
          <View style={[styles.formCard, { backgroundColor: T.card, borderColor: T.dark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }]}>
            {/* Onglets Connexion / Inscription */}
            <View style={[styles.tabs, { backgroundColor: T.dark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
              {(['login', 'register'] as Mode[]).map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => { setMode(m); setError(null); }}
                  style={[styles.tab, mode === m && { backgroundColor: T.card }]}
                >
                  <Text style={{ color: mode === m ? T.text : T.muted, fontFamily: mode === m ? Fonts.bold : Fonts.semibold, fontSize: 14 }}>
                    {m === 'login' ? 'Connexion' : 'Créer un compte'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mode === 'register' && (
              <>
                <ChipGroup<Role>
                  label="Je suis"
                  value={role}
                  onChange={setRole}
                  options={[
                    { key: 'owner', label: '🧑🏾‍💼 Propriétaire de véhicules' },
                    { key: 'driver', label: '🧑🏾‍✈️ Chauffeur' },
                  ]}
                />
                <Field label="Nom complet" value={name} onChangeText={setName} placeholder="KOUADIO Kouakou" autoCapitalize="words" />
                <Field label="Téléphone (Mobile Money)" value={phone} onChangeText={setPhone} placeholder="+225 07 01 02 03 04" keyboardType="phone-pad" />
              </>
            )}

            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View>
              <Field
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onSubmitEditing={submit}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eye}>
                <Text style={{ color: T.accent, fontFamily: Fonts.semibold, fontSize: 12 }}>{showPassword ? 'Masquer' : 'Afficher'}</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Icon name="alert" size={16} color="#EF4444" />
                <Text style={[styles.errorText, { fontFamily: Fonts.semibold }]}>{error}</Text>
              </View>
            )}

            <Button label={mode === 'login' ? 'Se connecter' : 'Créer mon compte'} onPress={submit} loading={busy} icon="arrow" />

            {mode === 'login' && (
              <TouchableOpacity onPress={forgot} style={{ alignSelf: 'center', marginTop: 16 }}>
                <Text style={{ color: T.accent, fontFamily: Fonts.semibold, fontSize: 13 }}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.trustRow}>
            <Icon name="shield" size={14} color={T.muted} />
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>Vos données sont sécurisées par Firebase</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 64,
    paddingBottom: 64,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  decorCircle: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 32, color: '#fff', letterSpacing: -1 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 20 },
  body: { paddingHorizontal: 20, marginTop: -36, paddingBottom: 40 },
  formCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  tabs: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  eye: { position: 'absolute', right: 14, top: 38 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF444415',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
});
