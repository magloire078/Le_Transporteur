import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useDriver } from '@/context/DriverContext';
import { Fonts } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import BarChart from '@/components/BarChart';
import { Card, EmptyState, GradientHeader, Loading, Screen, SectionHeader, styles as ui } from '@/components/ui';
import { PAYMENT_METHODS, formatDate, formatFCFA } from '@/services/labels';

export default function VersementsScreen() {
  const { activeTheme: T } = useAppContext();
  const d = useDriver();

  if (d.loading) return <Loading />;

  const trend = d.prevMonthTotal > 0 ? Math.round(((d.monthTotal - d.prevMonthTotal) / d.prevMonthTotal) * 100) : null;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <GradientHeader>
          <Text style={ui.headerKicker}>MES VERSEMENTS</Text>
          <Text style={styles.big}>{d.monthTotal.toLocaleString('fr-FR')} <Text style={{ fontSize: 18, fontFamily: Fonts.semibold }}>FCFA</Text></Text>
          <Text style={ui.headerSub}>
            Versés ce mois{trend !== null ? ` · ${trend >= 0 ? '+' : ''}${trend}% vs mois dernier` : ''}
          </Text>
        </GradientHeader>

        <View style={ui.body}>
          <SectionHeader title="7 derniers jours" />
          <Card style={{ marginBottom: 24 }}>
            <BarChart data={d.series7} color={T.accent} />
          </Card>

          <SectionHeader title="Historique" />
          {d.versements.length === 0 ? (
            <EmptyState icon="wallet" title="Aucun versement" body="Vos versements déclarés apparaîtront ici." action={d.vehicle ? 'Déclarer un versement' : undefined} onAction={d.openVersement} />
          ) : (
            <Card style={{ paddingVertical: 4 }}>
              {d.versements.map((t, i, arr) => (
                <View key={t.id} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}>
                  <Text style={{ fontSize: 18 }}>{PAYMENT_METHODS[t.paymentMethod ?? 'cash'].emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 14 }}>{t.description}</Text>
                    <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>{formatDate(t.date)} · {t.vehiclePlate}</Text>
                  </View>
                  <Text style={{ color: '#10B981', fontFamily: Fonts.bold, fontSize: 14 }}>{formatFCFA(t.amount)}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      </Screen>

      {d.vehicle && (
        <TouchableOpacity onPress={d.openVersement} activeOpacity={0.9} style={[styles.fab, { backgroundColor: T.accent }]}>
          <Icon name="plus" size={26} color="#fff" sw={2.4} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  big: { fontSize: 34, color: '#fff', fontFamily: Fonts.extraBold, letterSpacing: -1, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
});
