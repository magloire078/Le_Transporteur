import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useFleet } from '@/context/FleetContext';
import { Fonts } from '@/constants/theme';
import BarChart from '@/components/BarChart';
import ExportSheet from '@/components/ExportSheet';
import SettingsSection from '@/components/SettingsSection';
import { Button, Card, GradientHeader, Loading, Row, Screen, SectionHeader, styles as ui } from '@/components/ui';
import { PAYMENT_METHODS, formatFCFA } from '@/services/labels';
import { PaymentMethod } from '@/services/types';

export default function FinancesScreen() {
  const { activeTheme: T } = useAppContext();
  const fleet = useFleet();
  const [exportOpen, setExportOpen] = useState(false);

  if (fleet.loading) return <Loading />;

  const ranking = [...fleet.perVehicle].sort((a, b) => (b.revenueMonth - b.expenseMonth) - (a.revenueMonth - a.expenseMonth));
  const best = Math.max(1, ...ranking.map(r => r.revenueMonth));
  const totalMonth = Math.max(1, fleet.revenueMonth);
  const monthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <Screen>
      <GradientHeader>
        <Text style={ui.headerKicker}>FINANCES · {monthName.toUpperCase()}</Text>
        <Text style={styles.netLabel}>Bénéfice net du mois</Text>
        <Text style={[styles.netValue, { color: fleet.netMonth >= 0 ? '#fff' : '#FCA5A5' }]}>
          {fleet.netMonth.toLocaleString('fr-FR')} <Text style={{ fontSize: 18, fontFamily: Fonts.semibold }}>FCFA</Text>
        </Text>
        <View style={styles.kpis}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Recettes</Text>
            <Text style={[styles.kpiVal, { color: '#6EE7B7' }]}>{formatFCFA(fleet.revenueMonth)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Dépenses</Text>
            <Text style={[styles.kpiVal, { color: '#FCA5A5' }]}>{formatFCFA(fleet.expenseMonth)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>vs mois dernier</Text>
            <Text style={styles.kpiVal}>{fleet.revenueGrowth}</Text>
          </View>
        </View>
      </GradientHeader>

      <View style={ui.body}>
        <SectionHeader title="Versements des 7 derniers jours" />
        <Card style={{ marginBottom: 24 }}>
          <BarChart data={fleet.series7} color={T.accent} />
        </Card>

        <SectionHeader title="Rentabilité par véhicule" />
        <Card style={{ marginBottom: 24 }}>
          {ranking.length === 0 ? (
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>Aucun véhicule.</Text>
          ) : ranking.map(({ vehicle: v, revenueMonth, expenseMonth }, i) => (
            <View key={v.id} style={{ marginBottom: i < ranking.length - 1 ? 14 : 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13 }} onPress={() => fleet.openVehicle(v.id)}>
                  {i + 1}. {v.plate} · {v.model}
                </Text>
                <Text style={{ color: revenueMonth - expenseMonth >= 0 ? '#10B981' : '#EF4444', fontFamily: Fonts.bold, fontSize: 13 }}>
                  {formatFCFA(revenueMonth - expenseMonth)}
                </Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: T.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.barFill, { width: `${(revenueMonth / best) * 100}%`, backgroundColor: T.accent }]} />
              </View>
            </View>
          ))}
        </Card>

        <SectionHeader title="Modes de versement (mois)" />
        <Card style={{ marginBottom: 16 }}>
          {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map(k => (
            <View key={k} style={{ marginBottom: 6 }}>
              <Row label={`${PAYMENT_METHODS[k].emoji} ${PAYMENT_METHODS[k].label}`} value={`${formatFCFA(fleet.paymentsMonth[k])} · ${Math.round((fleet.paymentsMonth[k] / totalMonth) * 100)}%`} />
              <View style={[styles.barBg, { backgroundColor: T.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.barFill, { width: `${(fleet.paymentsMonth[k] / totalMonth) * 100}%`, backgroundColor: PAYMENT_METHODS[k].color }]} />
              </View>
            </View>
          ))}
        </Card>

        <Button label="Export comptable (CSV)" icon="download" onPress={() => setExportOpen(true)} style={{ marginBottom: 28 }} />

        <SettingsSection />
      </View>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} transactions={fleet.transactions} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  netLabel: { color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.sans, fontSize: 13, marginTop: 10 },
  netValue: { fontSize: 34, fontFamily: Fonts.extraBold, letterSpacing: -1 },
  kpis: { flexDirection: 'row', gap: 8, marginTop: 18 },
  kpi: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  kpiLabel: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.sans, fontSize: 10 },
  kpiVal: { color: '#fff', fontFamily: Fonts.bold, fontSize: 13, marginTop: 2 },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
