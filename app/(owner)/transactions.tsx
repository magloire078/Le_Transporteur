import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useFleet } from '@/context/FleetContext';
import { Fonts } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import { Card, ChipGroup, EmptyState, GradientHeader, Loading, Screen, styles as ui } from '@/components/ui';
import { inMonth, sumBy } from '@/services/analytics';
import { PAYMENT_METHODS, dayKey, formatFCFA } from '@/services/labels';
import { FleetTransaction } from '@/services/types';

type TypeFilter = 'all' | 'revenue' | 'expense';
type PeriodFilter = 'month' | 'prev' | 'all';

export default function TransactionsScreen() {
  const { activeTheme: T } = useAppContext();
  const fleet = useFleet();
  const [type, setType] = useState<TypeFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [vehicleId, setVehicleId] = useState<string>('all');

  const filtered = useMemo(() => {
    const now = new Date();
    return fleet.transactions.filter(t =>
      (type === 'all' || t.type === type) &&
      (vehicleId === 'all' || t.vehicleId === vehicleId) &&
      (period === 'all' || (period === 'month' ? inMonth(t, now) : inMonth(t, now, -1))),
    );
  }, [fleet.transactions, type, period, vehicleId]);

  const groups = useMemo(() => {
    const map = new Map<string, FleetTransaction[]>();
    for (const t of filtered) {
      const k = dayKey(t.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return [...map.entries()];
  }, [filtered]);

  if (fleet.loading) return <Loading />;

  const revenue = sumBy(filtered, 'revenue');
  const expense = sumBy(filtered, 'expense');

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <GradientHeader>
          <Text style={ui.headerKicker}>JOURNAL DES OPÉRATIONS</Text>
          <Text style={ui.headerTitle}>Recettes & Dépenses</Text>
          <View style={[styles.summary]}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Recettes</Text>
              <Text style={[styles.summaryVal, { color: '#6EE7B7' }]}>{formatFCFA(revenue)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dépenses</Text>
              <Text style={[styles.summaryVal, { color: '#FCA5A5' }]}>{formatFCFA(expense)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text style={styles.summaryVal}>{formatFCFA(revenue - expense)}</Text>
            </View>
          </View>
        </GradientHeader>

        <View style={ui.body}>
          <ChipGroup<PeriodFilter>
            value={period}
            onChange={setPeriod}
            options={[{ key: 'month', label: 'Ce mois' }, { key: 'prev', label: 'Mois dernier' }, { key: 'all', label: 'Tout' }]}
          />
          <ChipGroup<TypeFilter>
            value={type}
            onChange={setType}
            options={[{ key: 'all', label: 'Toutes' }, { key: 'revenue', label: '💰 Recettes' }, { key: 'expense', label: '🔧 Dépenses' }]}
          />
          {fleet.vehicles.length > 1 && (
            <ChipGroup<string>
              value={vehicleId}
              onChange={setVehicleId}
              options={[{ key: 'all', label: 'Tous véhicules' }, ...fleet.vehicles.map(v => ({ key: v.id, label: v.plate }))]}
            />
          )}

          {groups.length === 0 ? (
            <EmptyState icon="wallet" title="Aucune opération" body="Aucune recette ni dépense pour ces filtres." action="Enregistrer une recette" onAction={() => fleet.openTransactionForm()} />
          ) : groups.map(([day, list]) => (
            <View key={day} style={{ marginBottom: 16 }}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayTitle, { color: T.muted }]}>
                  {new Date(list[0].date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
                <Text style={[styles.dayTotal, { color: T.text }]}>{formatFCFA(sumBy(list, 'revenue') - sumBy(list, 'expense'))}</Text>
              </View>
              <Card style={{ paddingVertical: 0 }}>
                {list.map((t, i) => (
                  <TouchableOpacity
                    key={`${t.vehicleId}-${t.id}`}
                    onPress={() => fleet.openVehicle(t.vehicleId)}
                    style={[styles.row, i < list.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: (t.type === 'revenue' ? '#10B981' : '#EF4444') + '18' }]}>
                      <Icon name={t.type === 'revenue' ? 'wallet' : 'wrench'} size={16} color={t.type === 'revenue' ? '#10B981' : '#EF4444'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, { color: T.text }]}>{t.description}</Text>
                      <Text style={[styles.rowSub, { color: T.muted }]}>
                        {t.vehiclePlate}{t.driver ? ` · ${t.driver}` : ''}
                        {t.type === 'revenue' ? ` · ${PAYMENT_METHODS[t.paymentMethod ?? 'cash'].emoji}` : ''}
                      </Text>
                    </View>
                    <Text style={[styles.rowAmount, { color: t.type === 'revenue' ? '#10B981' : '#EF4444' }]}>
                      {t.type === 'revenue' ? '+' : '−'}{formatFCFA(t.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}
        </View>
      </Screen>

      {fleet.vehicles.length > 0 && (
        <TouchableOpacity onPress={() => fleet.openTransactionForm()} activeOpacity={0.9} style={[styles.fab, { backgroundColor: T.accent }]}>
          <Icon name="plus" size={26} color="#fff" sw={2.4} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: 8, marginTop: 18 },
  summaryItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.sans, fontSize: 11 },
  summaryVal: { color: '#fff', fontFamily: Fonts.bold, fontSize: 14, marginTop: 2 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  dayTitle: { fontFamily: Fonts.semibold, fontSize: 12, textTransform: 'capitalize' },
  dayTotal: { fontFamily: Fonts.bold, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: Fonts.semibold, fontSize: 14 },
  rowSub: { fontFamily: Fonts.sans, fontSize: 11, marginTop: 2 },
  rowAmount: { fontFamily: Fonts.bold, fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
});
