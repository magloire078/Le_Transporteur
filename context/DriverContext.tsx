import * as React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Text } from 'react-native';
import { useAppContext } from './AppContext';
import { useDriverData } from '@/hooks/use-driver-data';
import { Button, ChipGroup, Field, Sheet } from '@/components/ui';
import { InfoNote } from '@/components/FormSheets';
import { notify } from '@/services/dialog';
import { PAYMENT_METHODS, formatFCFA } from '@/services/labels';
import { Fonts } from '@/constants/theme';
import { PaymentMethod } from '@/services/types';

type DriverData = ReturnType<typeof useDriverData>;

interface DriverContextType extends DriverData {
  openVersement: () => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export function DriverProvider({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const data = useDriverData(user);
  const [open, setOpen] = useState(false);

  return (
    <DriverContext.Provider value={{ ...data, openVersement: () => setOpen(true) }}>
      {children}
      <VersementSheet visible={open} onClose={() => setOpen(false)} data={data} />
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error('useDriver must be used within a DriverProvider');
  return ctx;
}

function VersementSheet({ visible, onClose, data }: { visible: boolean; onClose: () => void; data: DriverData }) {
  const { activeTheme: T } = useAppContext();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('wave');
  const [busy, setBusy] = useState(false);

  const remaining = Math.max(0, data.dailyTarget - data.paidToday);

  useEffect(() => {
    if (!visible) return;
    setVehicleId(data.vehicle?.id ?? null);
    setAmount(remaining ? String(remaining) : '');
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    const n = Number(amount.replace(/\s/g, ''));
    if (!vehicleId) return notify('Aucun véhicule', 'Vous n\'êtes affecté à aucun véhicule. Contactez votre propriétaire.');
    if (!n || n <= 0) return notify('Montant invalide', 'Saisissez le montant versé en FCFA.');
    setBusy(true);
    try {
      await data.declareVersement(vehicleId, n, method);
      onClose();
      notify('Versement enregistré ✅', `${formatFCFA(n)} via ${PAYMENT_METHODS[method].label}. Votre propriétaire en est informé.`);
    } catch (e) {
      const denied = (e as { code?: string }).code === 'permission-denied';
      notify('Échec du versement', denied
        ? 'Votre compte n\'est pas encore autorisé à déclarer des versements. Demandez à votre propriétaire de vérifier votre affectation.'
        : (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Déclarer un versement">
      <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 13, marginBottom: 16 }}>
        Versé aujourd'hui : <Text style={{ color: T.text, fontFamily: Fonts.bold }}>{formatFCFA(data.paidToday)}</Text> sur {formatFCFA(data.dailyTarget)} attendus.
      </Text>
      {data.vehicles.length > 1 && (
        <ChipGroup<string>
          label="Véhicule"
          value={vehicleId}
          onChange={setVehicleId}
          options={data.vehicles.map(v => ({ key: v.id, label: `${v.plate} · ${v.model}` }))}
        />
      )}
      <Field label="Montant versé (FCFA)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="17000" />
      <ChipGroup<PaymentMethod>
        label="Mode de versement"
        value={method}
        onChange={setMethod}
        options={(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map(k => ({ key: k, label: `${PAYMENT_METHODS[k].emoji} ${PAYMENT_METHODS[k].label}` }))}
      />
      {method !== 'cash' && <InfoNote text="Effectuez d'abord le transfert Mobile Money vers votre propriétaire, puis déclarez-le ici." />}
      <Button label="Confirmer le versement" icon="check" onPress={submit} loading={busy} />
    </Sheet>
  );
}
