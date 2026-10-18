import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useFleet } from '@/context/FleetContext';
import { Fonts } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import { ChauffeurFormSheet, VehicleFormSheet } from '@/components/FormSheets';
import { Badge, Card, ChipGroup, EmptyState, GradientHeader, IconBubble, Loading, Screen, styles as ui } from '@/components/ui';
import { CHAUFFEUR_STATUS, DEFAULT_DAILY_TARGET, VEHICLE_STATUS, VEHICLE_TYPES, formatFCFA, initials } from '@/services/labels';
import { inMonth } from '@/services/analytics';
import { VehicleStatus } from '@/services/types';

type Tab = 'vehicles' | 'drivers';
type Filter = 'all' | VehicleStatus;

export default function FleetScreen() {
  const { activeTheme: T, user } = useAppContext();
  const fleet = useFleet();
  const [tab, setTab] = useState<Tab>('vehicles');
  const [filter, setFilter] = useState<Filter>('all');
  const [addVehicle, setAddVehicle] = useState(false);
  const [addDriver, setAddDriver] = useState(false);

  const driverStats = useMemo(() => {
    const now = new Date();
    return fleet.chauffeurs.map(c => {
      const vehicle = fleet.vehicles.find(v => v.primaryDriverId === c.id || v.secondaryDriverId === c.id);
      const month = fleet.transactions.filter(t => t.type === 'revenue' && inMonth(t, now) && (t.driverId === c.id || (!t.driverId && t.driver === c.name)));
      return { chauffeur: c, vehicle, monthTotal: month.reduce((s, t) => s + t.amount, 0), monthCount: month.length };
    }).sort((a, b) => Number(!!b.vehicle) - Number(!!a.vehicle) || b.monthTotal - a.monthTotal);
  }, [fleet.chauffeurs, fleet.vehicles, fleet.transactions]);

  if (fleet.loading || !user) return <Loading />;

  const vehicles = fleet.perVehicle.filter(p => filter === 'all' || p.vehicle.status === filter);

  return (
    <Screen>
      <GradientHeader>
        <Text style={ui.headerKicker}>GESTION DE FLOTTE</Text>
        <Text style={ui.headerTitle}>Véhicules & Chauffeurs</Text>
        <Text style={ui.headerSub}>Affectations, papiers et entretien de chaque véhicule</Text>

        <View style={styles.segment}>
          {(['vehicles', 'drivers'] as Tab[]).map(k => (
            <TouchableOpacity key={k} onPress={() => setTab(k)} style={[styles.segmentBtn, tab === k && { backgroundColor: '#fff' }]}>
              <Text style={{ color: tab === k ? T.gradient[0] : '#fff', fontFamily: Fonts.bold, fontSize: 13 }}>
                {k === 'vehicles' ? `🚕 Véhicules (${fleet.vehicles.length})` : `🧑🏾‍✈️ Chauffeurs (${fleet.chauffeurs.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GradientHeader>

      <View style={ui.body}>
        {tab === 'vehicles' ? (
          <>
            <View style={styles.toolbar}>
              <View style={{ flex: 1 }}>
                <ChipGroup<Filter>
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { key: 'all', label: 'Tous' },
                    ...(Object.keys(VEHICLE_STATUS) as VehicleStatus[]).map(k => ({ key: k, label: VEHICLE_STATUS[k].label })),
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => setAddVehicle(true)} style={[styles.addBtn, { borderColor: T.accent }]}>
              <Icon name="plus" size={18} color={T.accent} />
              <Text style={{ color: T.accent, fontFamily: Fonts.bold, fontSize: 14 }}>Ajouter un véhicule</Text>
            </TouchableOpacity>

            {vehicles.length === 0 ? (
              <EmptyState icon="car" title="Aucun véhicule" body={filter === 'all' ? 'Votre flotte est vide.' : 'Aucun véhicule avec ce statut.'} />
            ) : (
              <View style={{ gap: 12 }}>
                {vehicles.map(({ vehicle: v, driver, secondDriver, revenueMonth, expenseMonth }) => {
                  const st = VEHICLE_STATUS[v.status] ?? VEHICLE_STATUS.Available;
                  const expired = fleet.alerts.filter(a => a.vehicleId === v.id && a.level === 'critical').length;
                  return (
                    <Card key={v.id} onPress={() => fleet.openVehicle(v.id)}>
                      <View style={styles.cardTop}>
                        <View style={[styles.plate, { borderColor: T.text }]}>
                          <Text style={[styles.plateText, { color: T.text }]}>{v.plate}</Text>
                        </View>
                        <Badge label={st.label} color={st.color} />
                      </View>
                      <Text style={[styles.vehicleName, { color: T.text }]}>
                        {VEHICLE_TYPES[v.vehicleType]?.emoji} {v.make} {v.model}
                      </Text>
                      <Text style={[styles.meta, { color: T.muted }]}>
                        Titulaire : {driver?.name ?? '—'}{secondDriver ? ` · Relais : ${secondDriver.name}` : ''}
                      </Text>
                      <View style={[styles.statsRow, { borderTopColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}>
                        <Stat label="Recettes (mois)" value={formatFCFA(revenueMonth)} color="#10B981" />
                        <Stat label="Dépenses (mois)" value={formatFCFA(expenseMonth)} color="#EF4444" />
                        <Stat label="Papiers" value={expired ? `${expired} expiré${expired > 1 ? 's' : ''}` : 'OK'} color={expired ? '#EF4444' : '#10B981'} />
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setAddDriver(true)} style={[styles.addBtn, { borderColor: T.accent }]}>
              <Icon name="plus" size={18} color={T.accent} />
              <Text style={{ color: T.accent, fontFamily: Fonts.bold, fontSize: 14 }}>Ajouter un chauffeur</Text>
            </TouchableOpacity>

            {driverStats.length === 0 ? (
              <EmptyState icon="users" title="Aucun chauffeur" body="Ajoutez vos chauffeurs ou invitez-les à créer leur compte." />
            ) : (
              <View style={{ gap: 12 }}>
                {driverStats.map(({ chauffeur: c, vehicle, monthTotal, monthCount }) => {
                  const st = CHAUFFEUR_STATUS[c.status] ?? CHAUFFEUR_STATUS.Available;
                  const target = c.dailyTarget ?? DEFAULT_DAILY_TARGET;
                  return (
                    <Card key={c.id} onPress={vehicle ? () => fleet.openVehicle(vehicle.id) : undefined}>
                      <View style={styles.driverRow}>
                        <View style={[styles.avatar, { backgroundColor: T.accent + '25' }]}>
                          <Text style={{ color: T.accentText, fontFamily: Fonts.bold, fontSize: 15 }}>{initials(c.name)}</Text>
                          <View style={[styles.avatarDot, { backgroundColor: st.color, borderColor: T.card }]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.vehicleName, { color: T.text, marginTop: 0 }]}>{c.name}</Text>
                          <Text style={[styles.meta, { color: T.muted }]}>
                            {vehicle ? `🚕 ${vehicle.plate} · ${vehicle.model}` : 'Non affecté'}{c.residence ? ` · ${c.residence}` : ''}
                          </Text>
                        </View>
                        {!!c.phone && (
                          <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`)}>
                            <IconBubble name="phone" color="#10B981" size={36} />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={[styles.statsRow, { borderTopColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}>
                        <Stat label="Versé ce mois" value={formatFCFA(monthTotal)} color={T.text} />
                        <Stat label="Versements" value={String(monthCount)} color={T.text} />
                        <Stat label="Objectif / jour" value={formatFCFA(target)} color={T.muted} />
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      <VehicleFormSheet visible={addVehicle} onClose={() => setAddVehicle(false)} owner={user} />
      <ChauffeurFormSheet visible={addDriver} onClose={() => setAddDriver(false)} />
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 10 }}>{label}</Text>
      <Text style={{ color, fontFamily: Fonts.bold, fontSize: 13, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 4, marginTop: 20 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'flex-start' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 14, marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plate: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  plateText: { fontFamily: Fonts.extraBold, fontSize: 13, letterSpacing: 1 },
  vehicleName: { fontSize: 15, fontFamily: Fonts.bold, marginTop: 10 },
  meta: { fontSize: 12, fontFamily: Fonts.sans, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarDot: { position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2 },
});
