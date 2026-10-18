import * as React from 'react';
import { View, Text } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useDriver } from '@/context/DriverContext';
import { Fonts } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import { Badge, Card, EmptyState, GradientHeader, Loading, Row, Screen, SectionHeader, styles as ui } from '@/components/ui';
import { DOCUMENT_KEYS, DOCUMENT_LABELS, VEHICLE_STATUS, VEHICLE_TYPES, formatDate, formatFCFA } from '@/services/labels';

function docState(expiryDate: string | null, valid: boolean) {
  if (expiryDate) {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: 'Expiré', color: '#EF4444' };
    if (days <= 30) return { label: `${days} j`, color: '#F59E0B' };
    return { label: 'Valide', color: '#10B981' };
  }
  return valid ? { label: 'Valide', color: '#10B981' } : { label: 'Non renseigné', color: '#6B7280' };
}

export default function DriverVehicleScreen() {
  const { activeTheme: T } = useAppContext();
  const d = useDriver();

  if (d.loading) return <Loading />;
  const v = d.vehicle;

  return (
    <Screen>
      <GradientHeader>
        <Text style={ui.headerKicker}>MON VÉHICULE</Text>
        {v ? (
          <>
            <Text style={ui.headerTitle}>{VEHICLE_TYPES[v.vehicleType]?.emoji} {v.make} {v.model}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ color: '#0B2545', fontFamily: Fonts.extraBold, letterSpacing: 1 }}>{v.plate}</Text>
              </View>
              <Text style={ui.headerSub}>{VEHICLE_STATUS[v.status]?.label}</Text>
            </View>
          </>
        ) : (
          <Text style={ui.headerTitle}>Aucun véhicule</Text>
        )}
      </GradientHeader>

      <View style={ui.body}>
        {!v ? (
          <EmptyState icon="car" title="Aucun véhicule affecté" body="Demandez à votre propriétaire de vous affecter à un véhicule." />
        ) : (
          <>
            <SectionHeader title="Papiers du véhicule" />
            <Card style={{ marginBottom: 24, paddingVertical: 4 }}>
              {DOCUMENT_KEYS.map((k, i) => {
                const doc = v.documents[k];
                const st = docState(doc.expiryDate, doc.valid);
                return (
                  <View key={k} style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }, i < DOCUMENT_KEYS.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }]}>
                    <Icon name="file" size={18} color={st.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13 }}>{DOCUMENT_LABELS[k]}</Text>
                      <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>Expire le {formatDate(doc.expiryDate)}</Text>
                    </View>
                    <Badge label={st.label} color={st.color} />
                  </View>
                );
              })}
            </Card>

            <SectionHeader title="Entretien" />
            <Card style={{ marginBottom: 24 }}>
              {v.maintenanceLogs.length === 0 ? (
                <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>Aucune intervention enregistrée.</Text>
              ) : [...v.maintenanceLogs].reverse().slice(0, 8).map(m => (
                <Row key={m.id} label={`${formatDate(m.date)} · ${m.description}`} value={formatFCFA(m.cost)} />
              ))}
            </Card>

            <SectionHeader title="Informations" />
            <Card>
              <Row label="Propriétaire" value={v.owner || '—'} />
              <Row label="Mise en circulation" value={formatDate(v.firstServiceDate)} />
              <Row label="Mon rôle" value={v.primaryDriverId === d.profile?.id ? 'Titulaire' : 'Relais'} />
              <Row label="Versement attendu / jour" value={formatFCFA(d.dailyTarget)} />
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
}
