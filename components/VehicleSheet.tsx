import * as React from 'react';
import { useEffect, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { confirm, notify } from '@/services/dialog';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import {
  addMaintenance,
  assignDriver,
  deleteTransaction,
  deleteVehicle,
  updateVehicle,
  updateVehicleDocument,
} from '@/services/fleetService';
import {
  DOCUMENT_KEYS,
  DOCUMENT_LABELS,
  VEHICLE_STATUS,
  VEHICLE_TYPES,
  formatDate,
  formatFCFA,
} from '@/services/labels';
import { Chauffeur, DocumentKey, FleetTransaction, VehicleStatus, Vehicule } from '@/services/types';
import { Icon } from './Icon';
import { Badge, Button, Card, ChipGroup, Field, Row, SectionHeader, Sheet } from './ui';

const NONE = '__none__';
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function docState(expiryDate: string | null, valid: boolean): { label: string; color: string } {
  if (expiryDate) {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: 'Expiré', color: '#EF4444' };
    if (days <= 30) return { label: `${days} j`, color: '#F59E0B' };
    return { label: 'Valide', color: '#10B981' };
  }
  return valid ? { label: 'Valide', color: '#10B981' } : { label: 'À renseigner', color: '#6B7280' };
}

export default function VehicleSheet({
  vehicle,
  onClose,
  chauffeurs,
  transactions,
  canEdit,
}: {
  vehicle: Vehicule | null;
  onClose: () => void;
  chauffeurs: Chauffeur[];
  transactions: FleetTransaction[];
  canEdit: boolean;
}) {
  const { activeTheme: T } = useAppContext();
  const [editingDoc, setEditingDoc] = useState<DocumentKey | null>(null);
  const [docDate, setDocDate] = useState('');
  const [docValid, setDocValid] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [mDesc, setMDesc] = useState('');
  const [mCost, setMCost] = useState('');
  const [mExpense, setMExpense] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEditingDoc(null);
    setShowMaintenance(false);
  }, [vehicle?.id]);

  if (!vehicle) return null;
  const v = vehicle;
  const type = VEHICLE_TYPES[v.vehicleType] ?? VEHICLE_TYPES.taxi_compteur;
  const vehicleTx = transactions.filter(t => t.vehicleId === v.id);
  const now = new Date();
  const monthTx = vehicleTx.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = monthTx.filter(t => t.type === 'revenue').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const guard = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      notify('Action impossible', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const driverOptions = [
    { key: NONE, label: 'Aucun' },
    ...chauffeurs.map(c => ({ key: c.id, label: c.name })),
  ];

  const openDoc = (k: DocumentKey) => {
    if (!canEdit) return;
    setEditingDoc(editingDoc === k ? null : k);
    setDocDate(v.documents[k].expiryDate ?? '');
    setDocValid(v.documents[k].valid);
  };

  const saveDoc = () => {
    if (!editingDoc) return;
    if (docDate && !isoDate.test(docDate)) {
      notify('Date invalide', 'Utilisez le format AAAA-MM-JJ.');
      return;
    }
    const expired = docDate ? new Date(docDate).getTime() < Date.now() : false;
    guard(() => updateVehicleDocument(v.id, editingDoc, { valid: docValid && !expired, expiryDate: docDate || null }))
      .then(() => setEditingDoc(null));
  };

  const saveMaintenance = () => {
    const cost = Number(mCost.replace(/\s/g, '')) || 0;
    if (!mDesc.trim()) {
      notify('Description requise', 'Décrivez l\'intervention (ex. Vidange + Filtre).');
      return;
    }
    guard(() => addMaintenance(v.id, { date: new Date().toISOString(), description: mDesc.trim(), cost }, mExpense)).then(() => {
      setShowMaintenance(false);
      setMDesc('');
      setMCost('');
    });
  };

  const confirmDelete = () => {
    confirm('Supprimer ce véhicule ?', `${v.make} ${v.model} (${v.plate}) et tout son historique de recettes seront supprimés.`, 'Supprimer',
      () => guard(() => deleteVehicle(v.id)).then(onClose));
  };

  const confirmDeleteTx = (t: FleetTransaction) => {
    if (!canEdit) return;
    confirm('Supprimer cette opération ?', `${t.description} · ${formatFCFA(t.amount)} du ${formatDate(t.date)}`, 'Supprimer',
      () => guard(() => deleteTransaction(v.id, t.id)));
  };

  return (
    <Sheet visible={!!vehicle} onClose={onClose} title={`${type.emoji} ${v.make} ${v.model}`}>
      {/* Identité */}
      <Card style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: T.text, fontFamily: Fonts.extraBold, fontSize: 22, letterSpacing: 1 }}>{v.plate}</Text>
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>
              {type.label} · en circulation depuis {formatDate(v.firstServiceDate)}
            </Text>
          </View>
          <Badge label={VEHICLE_STATUS[v.status]?.label ?? v.status} color={VEHICLE_STATUS[v.status]?.color ?? T.muted} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>Recettes du mois</Text>
            <Text style={{ color: '#10B981', fontFamily: Fonts.bold, fontSize: 16 }}>{formatFCFA(monthRevenue)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>Dépenses du mois</Text>
            <Text style={{ color: '#EF4444', fontFamily: Fonts.bold, fontSize: 16 }}>{formatFCFA(monthExpense)}</Text>
          </View>
        </View>
      </Card>

      {canEdit && (
        <ChipGroup<VehicleStatus>
          label="Statut"
          value={v.status}
          onChange={s => guard(() => updateVehicle(v.id, { status: s }))}
          options={(Object.keys(VEHICLE_STATUS) as VehicleStatus[]).map(k => ({ key: k, label: VEHICLE_STATUS[k].label }))}
        />
      )}

      {/* Chauffeurs */}
      <SectionHeader title="Chauffeurs" />
      {canEdit ? (
        <>
          <ChipGroup<string>
            label="Titulaire"
            value={v.primaryDriverId ?? NONE}
            onChange={id => guard(() => assignDriver(v.id, 'primary', id === NONE ? null : id))}
            options={driverOptions}
          />
          <ChipGroup<string>
            label="Relais (2ᵉ chauffeur)"
            value={v.secondaryDriverId ?? NONE}
            onChange={id => guard(() => assignDriver(v.id, 'secondary', id === NONE ? null : id))}
            options={driverOptions}
          />
        </>
      ) : (
        <Card style={{ marginBottom: 16 }}>
          <Row label="Titulaire" value={chauffeurs.find(c => c.id === v.primaryDriverId)?.name ?? '—'} />
          <Row label="Relais" value={chauffeurs.find(c => c.id === v.secondaryDriverId)?.name ?? '—'} />
        </Card>
      )}

      {/* Documents */}
      <SectionHeader title="Papiers du véhicule" />
      <Card style={{ marginBottom: 16, paddingVertical: 4 }}>
        {DOCUMENT_KEYS.map((k, i) => {
          const d = v.documents[k];
          const st = docState(d.expiryDate, d.valid);
          return (
            <View key={k} style={i < DOCUMENT_KEYS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: T.dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' } : undefined}>
              <TouchableOpacity onPress={() => openDoc(k)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}>
                <Icon name="file" size={18} color={st.color} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13 }}>{DOCUMENT_LABELS[k]}</Text>
                  <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>Expire le {formatDate(d.expiryDate)}</Text>
                </View>
                <Badge label={st.label} color={st.color} />
              </TouchableOpacity>
              {editingDoc === k && (
                <View style={{ paddingBottom: 12 }}>
                  <Field label="Date d'expiration (AAAA-MM-JJ)" value={docDate} onChangeText={setDocDate} placeholder="2026-12-31" />
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13 }}>Document en règle</Text>
                    <Switch value={docValid} onValueChange={setDocValid} trackColor={{ true: '#10B981' }} />
                  </View>
                  <Button label="Mettre à jour" onPress={saveDoc} loading={busy} />
                </View>
              )}
            </View>
          );
        })}
      </Card>

      {/* Entretien */}
      <SectionHeader title="Entretien & réparations" action={canEdit ? (showMaintenance ? 'Annuler' : '+ Ajouter') : undefined} onAction={() => setShowMaintenance(s => !s)} />
      {showMaintenance && (
        <Card style={{ marginBottom: 12 }}>
          <Field label="Intervention" value={mDesc} onChangeText={setMDesc} placeholder="Vidange + Filtre" />
          <Field label="Coût (FCFA)" value={mCost} onChangeText={setMCost} keyboardType="number-pad" placeholder="25000" />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13, flex: 1 }}>Enregistrer aussi comme dépense</Text>
            <Switch value={mExpense} onValueChange={setMExpense} trackColor={{ true: T.accent }} />
          </View>
          <Button label="Enregistrer l'intervention" icon="wrench" onPress={saveMaintenance} loading={busy} />
        </Card>
      )}
      <Card style={{ marginBottom: 16 }}>
        {v.maintenanceLogs.length === 0 ? (
          <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>Aucune intervention enregistrée.</Text>
        ) : (
          [...v.maintenanceLogs].reverse().slice(0, 6).map(m => (
            <Row key={m.id} label={`${formatDate(m.date)} · ${m.description}`} value={formatFCFA(m.cost)} />
          ))
        )}
      </Card>

      {/* Historique */}
      <SectionHeader title="Dernières opérations" />
      <Card style={{ marginBottom: 16 }}>
        {vehicleTx.length === 0 ? (
          <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12 }}>Aucune recette ni dépense.</Text>
        ) : (
          vehicleTx.slice(0, 8).map(t => (
            <TouchableOpacity key={t.id} onLongPress={() => confirmDeleteTx(t)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontFamily: Fonts.semibold, fontSize: 13 }}>{t.description}</Text>
                <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 11 }}>{formatDate(t.date)}{t.driver ? ` · ${t.driver}` : ''}</Text>
              </View>
              <Text style={{ color: t.type === 'revenue' ? '#10B981' : '#EF4444', fontFamily: Fonts.bold, fontSize: 13 }}>
                {t.type === 'revenue' ? '+' : '−'}{formatFCFA(t.amount)}
              </Text>
            </TouchableOpacity>
          ))
        )}
        {canEdit && vehicleTx.length > 0 && (
          <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 10, marginTop: 6 }}>Appui long sur une opération pour la supprimer.</Text>
        )}
      </Card>

      {canEdit && <Button label="Supprimer le véhicule" variant="danger" icon="trash" onPress={confirmDelete} />}
    </Sheet>
  );
}
