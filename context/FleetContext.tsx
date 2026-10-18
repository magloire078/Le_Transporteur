import * as React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useAppContext } from './AppContext';
import { useFleetData } from '@/hooks/use-fleet-data';
import VehicleSheet from '@/components/VehicleSheet';
import { TransactionFormSheet } from '@/components/FormSheets';
import { TransactionType } from '@/services/types';

type FleetData = ReturnType<typeof useFleetData>;

interface FleetContextType extends FleetData {
  openVehicle: (id: string) => void;
  openTransactionForm: (opts?: { vehicleId?: string; type?: TransactionType }) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

/** Données de flotte partagées par les onglets propriétaire, plus les feuilles globales. */
export function FleetProvider({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const data = useFleetData(user);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [txForm, setTxForm] = useState<{ vehicleId?: string; type: TransactionType } | null>(null);

  const selected = data.vehicles.find(v => v.id === vehicleId) ?? null;
  // Un admin consulte toute la flotte mais ne modifie que ses propres véhicules (règles Firestore).
  const canEdit = !!selected && !!user && (selected.ownerId === user.id || user.role === 'admin');

  const value: FleetContextType = {
    ...data,
    openVehicle: setVehicleId,
    openTransactionForm: opts => setTxForm({ vehicleId: opts?.vehicleId, type: opts?.type ?? 'revenue' }),
  };

  return (
    <FleetContext.Provider value={value}>
      {children}
      <VehicleSheet
        vehicle={selected}
        onClose={() => setVehicleId(null)}
        chauffeurs={data.chauffeurs}
        transactions={data.transactions}
        canEdit={canEdit}
      />
      <TransactionFormSheet
        visible={!!txForm}
        onClose={() => setTxForm(null)}
        vehicles={data.vehicles}
        chauffeurById={data.chauffeurById}
        defaultVehicleId={txForm?.vehicleId}
        defaultType={txForm?.type}
      />
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within a FleetProvider');
  return ctx;
}
