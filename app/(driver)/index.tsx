import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useDriver } from '@/context/DriverContext';
import { Icon } from '@/components/Icon';
import { Fonts } from '@/constants/theme';
import { Card, EmptyState, GradientHeader, IconBubble, Loading, Screen, SectionHeader, styles as ui } from '@/components/ui';
import { PAYMENT_METHODS, VEHICLE_STATUS, VEHICLE_TYPES, formatDate, formatFCFA } from '@/services/labels';

export default function DriverDashboard() {
  const { activeTheme: T, user } = useAppContext();
  const d = useDriver();

  if (d.loading || !user) return <Loading />;

  const paidPct = Math.round(d.progress * 100);
  const done = d.paidToday >= d.dailyTarget;

  return (
    <Screen>
      <GradientHeader>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.modeBadge}>
              <Text style={styles.modeText}>ESPACE CHAUFFEUR 🚕</Text>
            </View>
            <Text style={styles.title}>Salut, {user.name.split(' ')[0]}</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{(d.profile?.rating ?? 5).toFixed(1)} · {d.monthCount} versement{d.monthCount > 1 ? 's' : ''} ce mois</Text>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={d.toggleDuty} style={[styles.toggle, { backgroundColor: d.isOnDuty ? '#10B981' : 'rgba(255,255,255,0.2)' }]}>
              <View style={[styles.knob, { left: d.isOnDuty ? 25 : 3 }]}>
                {d.isOnDuty && <View style={styles.pulse} />}
              </View>
            </Pressable>
            <Text style={styles.toggleLabel}>{d.isOnDuty ? 'En service' : 'Au repos'}</Text>
          </View>
        </View>

        <View style={[ui.glass, { marginBottom: 20 }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Versement du jour</Text>
            <Text style={styles.progressValue}>{formatFCFA(d.paidToday)} / {formatFCFA(d.dailyTarget)}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${paidPct}%`, backgroundColor: done ? '#10B981' : '#fff' }]} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {[
            { l: 'Auj.', v: formatFCFA(d.paidToday), s: done ? 'Objectif atteint' : `${paidPct}% de l'objectif` },
            { l: 'Ce mois', v: formatFCFA(d.monthTotal), s: `${d.monthCount} versements` },
            { l: 'Mois dernier', v: formatFCFA(d.prevMonthTotal), s: 'Total versé' },
          ].map(s => (
            <View key={s.l} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.l}</Text>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{s.v}</Text>
              <Text style={styles.statSub}>{s.s}</Text>
            </View>
          ))}
        </View>
      </GradientHeader>

      <View style={ui.body}>
        {d.vehicle && !done && (
          <TouchableOpacity onPress={d.openVersement} activeOpacity={0.9}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.alertCard}>
              <View style={styles.alertIcon}>
                <Icon name="wallet" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.alertTitle}>Déclarer mon versement</Text>
                <Text style={styles.alertText}>{`Reste ${formatFCFA(d.dailyTarget - d.paidToday)} à verser aujourd'hui`}</Text>
              </View>
              <View style={styles.alertBtn}>
                <Icon name="arrow" size={14} color="#3B82F6" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Véhicule affecté */}
        <SectionHeader title="Mon véhicule" action={d.vehicle ? 'Détails' : undefined} onAction={() => router.push('/(driver)/vehicle')} />
        {d.vehicle ? (
          <Card onPress={() => router.push('/(driver)/vehicle')} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconBubble name="car" color={T.accent} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontFamily: Fonts.bold, fontSize: 16 }}>
                  {VEHICLE_TYPES[d.vehicle.vehicleType]?.emoji} {d.vehicle.make} {d.vehicle.model}
                </Text>
                <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>
                  {d.vehicle.plate} · {d.vehicle.primaryDriverId === user.id ? 'Titulaire' : 'Relais'}
                </Text>
              </View>
              <Text style={{ color: VEHICLE_STATUS[d.vehicle.status]?.color, fontFamily: Fonts.bold, fontSize: 12 }}>
                {VEHICLE_STATUS[d.vehicle.status]?.label}
              </Text>
            </View>
          </Card>
        ) : (
          <View style={{ marginBottom: 24 }}>
            <EmptyState icon="car" title="Aucun véhicule affecté" body="Votre propriétaire doit vous affecter à un véhicule depuis son espace « Flotte »." />
          </View>
        )}

        {/* Raccourcis */}
        <View style={styles.actionsGrid}>
          <Card onPress={() => router.push('/(driver)/versements')} style={{ flex: 1 }}>
            <IconBubble name="calendar" color="#3B82F6" size={44} />
            <Text style={[styles.actionLabel, { color: T.text }]}>Historique</Text>
            <Text style={[styles.actionSub, { color: T.muted }]}>{d.versements.length} versements</Text>
          </Card>
          <Card onPress={() => router.push('/(driver)/vehicle')} style={{ flex: 1 }}>
            <IconBubble name="file" color="#10B981" size={44} />
            <Text style={[styles.actionLabel, { color: T.text }]}>Papiers</Text>
            <Text style={[styles.actionSub, { color: T.muted }]}>Assurance, visite…</Text>
          </Card>
        </View>

        <SectionHeader title="Derniers versements" action="Voir tout" onAction={() => router.push('/(driver)/versements')} />
        <Card style={{ paddingVertical: 4 }}>
          {d.versements.length === 0 ? (
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12, paddingVertical: 12 }}>{"Aucun versement pour l'instant."}</Text>
          ) : d.versements.slice(0, 5).map((t, i, arr) => (
            <View key={t.id} style={[styles.orderItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}>
              <View style={[styles.orderIcon, { backgroundColor: '#10B98115' }]}>
                <Icon name="check" size={14} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 14 }}>{t.description}</Text>
                <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>
                  {formatDate(t.date)} · {PAYMENT_METHODS[t.paymentMethod ?? 'cash'].label}
                </Text>
              </View>
              <Text style={{ color: T.text, fontFamily: Fonts.bold, fontSize: 14 }}>{formatFCFA(t.amount)}</Text>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modeBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.12)',
  },
  modeText: { fontSize: 10, color: '#fff', letterSpacing: 1, fontFamily: Fonts.semibold },
  title: { fontSize: 28, letterSpacing: -0.5, color: '#fff', fontFamily: Fonts.bold },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  ratingText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily: Fonts.sans },
  toggle: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center' },
  knob: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', position: 'absolute', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2,
  },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  toggleLabel: { fontSize: 10, marginTop: 6, color: '#fff', fontFamily: Fonts.semibold },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.sans },
  progressValue: { fontSize: 12, color: '#fff', fontFamily: Fonts.bold },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontFamily: Fonts.sans },
  statValue: { fontSize: 15, color: '#fff', fontFamily: Fonts.bold },
  statSub: { fontSize: 9, marginTop: 2, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.sans },
  alertCard: {
    borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
  },
  alertIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 15, color: '#fff', fontFamily: Fonts.bold },
  alertText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontFamily: Fonts.sans, marginTop: 2 },
  alertBtn: { width: 32, height: 32, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionsGrid: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  actionLabel: { fontSize: 15, fontFamily: Fonts.bold, marginTop: 14 },
  actionSub: { fontSize: 12, marginTop: 2, fontFamily: Fonts.sans },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  orderIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
