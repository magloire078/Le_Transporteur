import * as React from 'react';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { notify } from '@/services/dialog';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import { addChauffeur, addTransaction, addVehicle } from '@/services/fleetService';
import { PAYMENT_METHODS, VEHICLE_TYPES } from '@/services/labels';
import { Chauffeur, PaymentMethod, TransactionType, Utilisateur, VehicleType, Vehicule } from '@/services/types';
import { Button, ChipGroup, Field, Sheet } from './ui';

function useBusy() {
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, onDone: () => void) => {
    setBusy(true);
    try {
      await fn();
      onDone();
    } catch (e) {
      notify('Échec de l\'enregistrement', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

// ==================== NOUVEAU VÉHICULE ====================

export function VehicleFormSheet({ visible, onClose, owner }: { visible: boolean; onClose: () => void; owner: Utilisateur }) {
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [type, setType] = useState<VehicleType>('taxi_compteur');
  const [firstService, setFirstService] = useState('');
  const { busy, run } = useBusy();

  useEffect(() => {
    if (visible) { setPlate(''); setModel(''); setFirstService(''); }
  }, [visible]);

  const save = () => {
    if (!plate.trim() || !make.trim() || !model.trim()) {
      notify('Champs manquants', 'Immatriculation, marque et modèle sont obligatoires.');
      return;
    }
    if (firstService && !isoDate.test(firstService)) {
      notify('Date invalide', 'Utilisez le format AAAA-MM-JJ (ex. 2018-06-29).');
      return;
    }
    run(() => addVehicle(owner, { plate, make, model, vehicleType: type, firstServiceDate: firstService || null }), onClose);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Ajouter un véhicule">
      <ChipGroup<VehicleType>
        label="Type de véhicule"
        value={type}
        onChange={setType}
        options={(Object.keys(VEHICLE_TYPES) as VehicleType[]).map(k => ({ key: k, label: `${VEHICLE_TYPES[k].emoji} ${VEHICLE_TYPES[k].label}` }))}
      />
      <Field label="Immatriculation" value={plate} onChangeText={setPlate} placeholder="530 HC 01" autoCapitalize="characters" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Marque" value={make} onChangeText={setMake} placeholder="Toyota" /></View>
        <View style={{ flex: 1 }}><Field label="Modèle" value={model} onChangeText={setModel} placeholder="Corolla" /></View>
      </View>
      <Field label="Mise en circulation (AAAA-MM-JJ)" value={firstService} onChangeText={setFirstService} placeholder="2018-06-29" />
      <Button label="Enregistrer le véhicule" icon="plus" onPress={save} loading={busy} />
    </Sheet>
  );
}

// ==================== NOUVEAU CHAUFFEUR ====================

export function ChauffeurFormSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [residence, setResidence] = useState('');
  const [age, setAge] = useState('');
  const [target, setTarget] = useState('17000');
  const { busy, run } = useBusy();

  useEffect(() => {
    if (visible) { setName(''); setPhone(''); setResidence(''); setAge(''); setTarget('17000'); }
  }, [visible]);

  const save = () => {
    if (!name.trim() || !phone.trim()) {
      notify('Champs manquants', 'Le nom et le téléphone sont obligatoires.');
      return;
    }
    run(() => addChauffeur({
      name,
      phone,
      residence,
      age: age ? Number(age) : undefined,
      dailyTarget: Number(target) || undefined,
    }), onClose);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Ajouter un chauffeur">
      <Field label="Nom complet" value={name} onChangeText={setName} placeholder="KOUADIO Kouakou" autoCapitalize="words" />
      <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="+225 07 01 02 03 04" keyboardType="phone-pad" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 2 }}><Field label="Lieu de résidence" value={residence} onChangeText={setResidence} placeholder="Yamoussoukro" /></View>
        <View style={{ flex: 1 }}><Field label="Âge" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="35" /></View>
      </View>
      <Field label="Versement journalier attendu (FCFA)" value={target} onChangeText={setTarget} keyboardType="number-pad" />
      <InfoNote text="Si le chauffeur crée lui-même son compte dans l'application, il apparaîtra automatiquement dans votre liste." />
      <Button label="Enregistrer le chauffeur" icon="plus" onPress={save} loading={busy} />
    </Sheet>
  );
}

// ==================== NOUVELLE TRANSACTION ====================

export function TransactionFormSheet({
  visible,
  onClose,
  vehicles,
  chauffeurById,
  defaultVehicleId,
  defaultType = 'revenue',
}: {
  visible: boolean;
  onClose: () => void;
  vehicles: Vehicule[];
  chauffeurById: Map<string, Chauffeur>;
  defaultVehicleId?: string;
  defaultType?: TransactionType;
}) {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState('');
  const { busy, run } = useBusy();

  useEffect(() => {
    if (!visible) return;
    setVehicleId(defaultVehicleId ?? vehicles[0]?.id ?? null);
    setType(defaultType);
    setAmount('');
    setDescription(defaultType === 'revenue' ? 'Recette du Jour' : '');
    setMethod('cash');
    setDate(new Date().toISOString().slice(0, 10));
  }, [visible, defaultVehicleId, defaultType, vehicles]);

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const driver = vehicle?.primaryDriverId ? chauffeurById.get(vehicle.primaryDriverId) : undefined;

  const save = () => {
    const n = Number(amount.replace(/\s/g, ''));
    if (!vehicle) return notify('Véhicule requis', 'Choisissez un véhicule.');
    if (!n || n <= 0) return notify('Montant invalide', 'Saisissez un montant en FCFA.');
    if (!description.trim()) return notify('Description requise', 'Décrivez l\'opération.');
    if (!isoDate.test(date)) return notify('Date invalide', 'Utilisez le format AAAA-MM-JJ.');
    const at = date === new Date().toISOString().slice(0, 10) ? new Date() : new Date(`${date}T12:00:00`);
    run(() => addTransaction(vehicle.id, {
      date: at.toISOString(),
      description: description.trim(),
      amount: n,
      type,
      driver: type === 'revenue' ? driver?.name ?? '' : '',
      driverId: type === 'revenue' ? driver?.id : undefined,
      paymentMethod: type === 'revenue' ? method : undefined,
    }), onClose);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={type === 'revenue' ? 'Enregistrer une recette' : 'Enregistrer une dépense'}>
      <ChipGroup<TransactionType>
        value={type}
        onChange={t => { setType(t); setDescription(t === 'revenue' ? 'Recette du Jour' : ''); }}
        options={[{ key: 'revenue', label: '💰 Recette' }, { key: 'expense', label: '🔧 Dépense' }]}
      />
      <ChipGroup<string>
        label="Véhicule"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicles.map(v => ({ key: v.id, label: `${v.plate} · ${v.model}` }))}
      />
      {type === 'revenue' && (
        <Text style={{ marginTop: -6, marginBottom: 12, fontSize: 12 }}>
          <DriverHint name={driver?.name} />
        </Text>
      )}
      <Field label="Montant (FCFA)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="17000" />
      <Field label="Description" value={description} onChangeText={setDescription} placeholder={type === 'revenue' ? 'Recette du Jour' : 'Vidange + Filtre'} />
      <Field label="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} />
      {type === 'revenue' && (
        <ChipGroup<PaymentMethod>
          label="Mode de versement"
          value={method}
          onChange={setMethod}
          options={(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map(k => ({ key: k, label: `${PAYMENT_METHODS[k].emoji} ${PAYMENT_METHODS[k].label}` }))}
        />
      )}
      <Button label="Enregistrer" icon="check" onPress={save} loading={busy} />
    </Sheet>
  );
}

function DriverHint({ name }: { name?: string }) {
  const { activeTheme: T } = useAppContext();
  return (
    <Text style={{ color: name ? T.muted : '#F59E0B', fontFamily: Fonts.sans }}>
      {name ? `Chauffeur titulaire : ${name}` : '⚠️ Aucun chauffeur affecté à ce véhicule'}
    </Text>
  );
}

export function InfoNote({ text }: { text: string }) {
  const { activeTheme: T } = useAppContext();
  return (
    <View style={{ backgroundColor: T.accent + '15', borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <Text style={{ color: T.dark ? T.text : T.accentText, fontFamily: Fonts.sans, fontSize: 12, lineHeight: 17 }}>ℹ️ {text}</Text>
    </View>
  );
}
