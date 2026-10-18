import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useFleet } from '@/context/FleetContext';
import { Icon } from '@/components/Icon';
import { Fonts } from '@/constants/theme';
import AlertsModal from '@/components/AlertsModal';
import { VehicleFormSheet } from '@/components/FormSheets';
import { Badge, Card, EmptyState, GradientHeader, IconBubble, Loading, Screen, SectionHeader, styles as ui } from '@/components/ui';
import { PAYMENT_METHODS, VEHICLE_STATUS, VEHICLE_TYPES, formatDate, formatFCFA } from '@/services/labels';
import { PaymentMethod } from '@/services/types';

export default function OwnerDashboard() {
  const router = useRouter();
  const { activeTheme: T, user } = useAppContext();
  const fleet = useFleet();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  if (fleet.loading || !user) return <Loading />;

  const { counts, alerts } = fleet;
  const docAlerts = alerts.filter(a => a.level !== 'info');
  const urgentCount = alerts.filter(a => a.level !== 'info').length;

  return (
    <Screen>
      <GradientHeader>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.liveRow}>
              <View style={[styles.statusDot, { backgroundColor: counts.inUse > 0 ? '#10B981' : '#F59E0B' }]} />
              <Text style={ui.headerKicker}>
                {user.role === 'admin' ? 'ADMINISTRATION · TOUTE LA FLOTTE' : 'MA FLOTTE · EN DIRECT'}
              </Text>
            </View>
            <Text style={ui.headerTitle}>Bonjour, {user.name.split(' ')[0]}</Text>
            <Text style={ui.headerSub}>
              {counts.total} véhicule{counts.total > 1 ? 's' : ''} · {fleet.fleetDrivers.length} chauffeur{fleet.fleetDrivers.length > 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setAlertsOpen(true)} activeOpacity={0.8} style={styles.bellBtn}>
            <Icon name="bell" size={18} color="#FFFFFF" />
            {urgentCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{urgentCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Recette du jour */}
        <View style={[ui.glass, { marginBottom: 16 }]}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueLabel}>Versements du jour</Text>
              <Text style={styles.revenueAmount}>
                {fleet.revenueToday.toLocaleString('fr-FR')} <Text style={{ fontSize: 18, fontFamily: Fonts.semibold }}>FCFA</Text>
              </Text>
            </View>
            <View style={styles.growthBadge}>
              <Icon name="trending" size={14} color="#10B981" />
              <Text style={styles.growthText}>{fleet.revenueGrowth}</Text>
            </View>
          </View>
          <View style={styles.splitContainer}>
            <Text style={styles.splitTitle}>Encaissements par mode :</Text>
            <View style={styles.pillsRow}>
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map(k => (
                <View key={k} style={styles.pill}>
                  <Text style={styles.pillText}>{PAYMENT_METHODS[k].emoji} {k === 'orange' ? 'OM' : k === 'mtn' ? 'MoMo' : PAYMENT_METHODS[k].label}</Text>
                  <Text style={[styles.pillText, { fontFamily: Fonts.bold }]}>{formatFCFA(fleet.paymentsToday[k])}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Indicateurs */}
        <View style={styles.metricsGrid}>
          {[
            { v: counts.inUse, l: 'En service', c: '#F59E0B' },
            { v: counts.available, l: 'Disponibles', c: '#10B981' },
            { v: counts.maintenance, l: 'Au garage', c: '#F87171' },
            { v: `${counts.paidToday}/${counts.total}`, l: 'Ont versé', c: '#60A5FA' },
          ].map(m => (
            <View key={m.l} style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: m.c }]}>{m.v}</Text>
              <Text style={styles.metricLabel}>{m.l}</Text>
            </View>
          ))}
        </View>
      </GradientHeader>

      <View style={ui.body}>
        {fleet.error && (
          <Card style={{ marginBottom: 16, borderColor: '#EF4444' }}>
            <Text style={{ color: '#EF4444', fontFamily: Fonts.semibold, fontSize: 12 }}>Erreur de synchronisation : {fleet.error}</Text>
          </Card>
        )}

        {/* Actions rapides */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            onPress={() => fleet.openTransactionForm()}
            style={[styles.quickActionBtn, { backgroundColor: T.accent + '20', borderColor: T.accent }]}
          >
            <Icon name="wallet" size={18} color={T.accent} />
            <Text style={[styles.quickActionText, { color: T.text }]}>Encaisser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAddVehicleOpen(true)}
            style={[styles.quickActionBtn, { backgroundColor: T.card, borderColor: T.dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
          >
            <Icon name="plus" size={18} color={T.accent} />
            <Text style={[styles.quickActionText, { color: T.text }]}>Véhicule</Text>
          </TouchableOpacity>
        </View>

        {/* Flotte en direct */}
        <SectionHeader title="Véhicules en direct" live action="Gérer" onAction={() => router.push('/(owner)/fleet')} />
        {fleet.perVehicle.length === 0 ? (
          <EmptyState icon="car" title="Aucun véhicule" body="Ajoutez votre premier véhicule pour suivre ses recettes." action="Ajouter un véhicule" onAction={() => setAddVehicleOpen(true)} />
        ) : (
          <View style={{ gap: 12, marginBottom: 24 }}>
            {fleet.perVehicle.map(({ vehicle: v, driver, paidToday, revenueMonth }) => {
              const st = VEHICLE_STATUS[v.status] ?? VEHICLE_STATUS.Available;
              return (
                <Card key={v.id} onPress={() => fleet.openVehicle(v.id)} style={{ borderColor: v.status === 'In Use' ? T.accent + '40' : undefined }}>
                  <View style={styles.trackTop}>
                    <View style={styles.trackLeft}>
                      <IconBubble name="car" color={st.color} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.trackName, { color: T.text }]}>{VEHICLE_TYPES[v.vehicleType]?.emoji} {v.make} {v.model}</Text>
                        <Text style={[styles.trackSub, { color: T.muted }]}>
                          {v.plate} · {driver ? driver.name : '⚠️ Sans chauffeur'}
                        </Text>
                      </View>
                    </View>
                    <Badge label={st.label} color={st.color} />
                  </View>
                  <View style={[styles.trackDetails, { backgroundColor: T.dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }]}>
                    <Text style={[styles.trackDetailText, { color: paidToday ? '#10B981' : T.muted }]}>
                      {paidToday ? '✅ Versement du jour reçu' : '⏳ Versement du jour en attente'}
                    </Text>
                    <Text style={[styles.trackDetailText, { color: T.text, fontFamily: Fonts.bold }]}>{formatFCFA(revenueMonth)} ce mois</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Papiers */}
        <SectionHeader title="Papiers à surveiller" action={alerts.length ? 'Tout voir' : undefined} onAction={() => setAlertsOpen(true)} />
        {docAlerts.length === 0 ? (
          <Card style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconBubble name="shield" color="#10B981" />
            <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13, flex: 1 }}>Aucun document expiré ou à renouveler dans les 30 jours.</Text>
          </Card>
        ) : (
          <View style={styles.docGrid}>
            {docAlerts.slice(0, 4).map(a => {
              const color = a.level === 'critical' ? '#EF4444' : '#F59E0B';
              return (
                <Card key={a.id} onPress={() => a.vehicleId && fleet.openVehicle(a.vehicleId)} style={[styles.docCard, { borderColor: color }]}>
                  <Badge label={a.level === 'critical' ? 'Expiré' : 'Bientôt'} color={color} />
                  <Text style={[styles.docTitle, { color: T.text }]} numberOfLines={2}>{a.title}</Text>
                  <Text style={[styles.docBody, { color: T.muted }]} numberOfLines={2}>{a.body}</Text>
                </Card>
              );
            })}
          </View>
        )}

        {/* Dernières opérations */}
        <SectionHeader title="Dernières opérations" action="Tout voir" onAction={() => router.push('/(owner)/transactions')} />
        <Card style={{ paddingVertical: 0 }}>
          {fleet.transactions.length === 0 ? (
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12, paddingVertical: 16 }}>Aucune opération enregistrée.</Text>
          ) : fleet.transactions.slice(0, 5).map((t, idx, arr) => (
            <TouchableOpacity
              key={`${t.vehicleId}-${t.id}`}
              onPress={() => fleet.openVehicle(t.vehicleId)}
              style={[styles.orderRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.orderTitle, { color: T.text }]}>{t.description}</Text>
                <Text style={[styles.orderSub, { color: T.muted }]}>
                  {formatDate(t.date)} · {t.vehiclePlate}{t.driver ? ` · ${t.driver}` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.orderPrice, { color: t.type === 'revenue' ? '#10B981' : '#EF4444' }]}>
                  {t.type === 'revenue' ? '+' : '−'}{formatFCFA(t.amount)}
                </Text>
                {t.type === 'revenue' && (
                  <Text style={[styles.orderMethod, { color: PAYMENT_METHODS[t.paymentMethod ?? 'cash'].color }]}>
                    {(t.paymentMethod ?? 'cash').toUpperCase()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <AlertsModal visible={alertsOpen} onClose={() => setAlertsOpen(false)} alerts={alerts} onOpenVehicle={fleet.openVehicle} />
      <VehicleFormSheet visible={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} owner={user} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  bellBadge: {
    position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444', minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  revenueLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.sans, marginBottom: 2 },
  revenueAmount: { fontSize: 32, color: '#fff', letterSpacing: -1, fontFamily: Fonts.extraBold },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.2)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  growthText: { color: '#10B981', fontSize: 11, fontFamily: Fonts.bold },
  splitContainer: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 12 },
  splitTitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.sans, marginBottom: 8 },
  pillsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  pillText: { fontSize: 11, color: '#fff', fontFamily: Fonts.sans },
  metricsGrid: { flexDirection: 'row', gap: 8 },
  metricItem: {
    flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  metricVal: { fontSize: 18, marginBottom: 2, fontFamily: Fonts.bold },
  metricLabel: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.sans },
  quickActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5 },
  quickActionText: { fontSize: 13, fontFamily: Fonts.bold },
  trackTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  trackLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  trackName: { fontSize: 15, fontFamily: Fonts.bold },
  trackSub: { fontSize: 12, marginTop: 2, fontFamily: Fonts.sans },
  trackDetails: { marginTop: 12, padding: 10, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackDetailText: { fontSize: 12, fontFamily: Fonts.semibold },
  docGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  docCard: { width: '48%', flexGrow: 1, padding: 12, gap: 6 },
  docTitle: { fontSize: 12, fontFamily: Fonts.bold },
  docBody: { fontSize: 10, fontFamily: Fonts.sans },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, gap: 8 },
  orderTitle: { fontSize: 14, fontFamily: Fonts.bold },
  orderSub: { fontSize: 12, marginTop: 2, fontFamily: Fonts.sans },
  orderPrice: { fontSize: 15, marginBottom: 2, fontFamily: Fonts.bold },
  orderMethod: { fontSize: 10, fontFamily: Fonts.bold },
});
