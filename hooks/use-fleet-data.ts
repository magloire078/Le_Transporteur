import { useEffect, useMemo, useState } from 'react';
import { subscribeChauffeurs, subscribeRevenus, subscribeVehicles } from '@/services/fleetService';
import {
  computeAlerts,
  dailySeries,
  flattenTransactions,
  growthLabel,
  inMonth,
  onDay,
  paymentBreakdown,
  sumBy,
} from '@/services/analytics';
import { Chauffeur, RevenuDoc, Utilisateur, Vehicule } from '@/services/types';

/** Données de flotte pour un propriétaire (ou toute la flotte pour un admin). */
export function useFleetData(user: Utilisateur | null) {
  const [vehicles, setVehicles] = useState<Vehicule[] | null>(null);
  const [revenus, setRevenus] = useState<RevenuDoc[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const onErr = (e: Error) => setError(e.message);
    const u1 = subscribeVehicles(user, setVehicles, onErr);
    const u2 = subscribeChauffeurs(setChauffeurs, onErr);
    return () => { u1(); u2(); };
  }, [user]);

  const vehicleIdsKey = (vehicles ?? []).map(v => v.id).sort().join(',');
  useEffect(() => {
    const ids = vehicleIdsKey ? vehicleIdsKey.split(',') : [];
    return subscribeRevenus(ids, setRevenus);
  }, [vehicleIdsKey]);

  const derived = useMemo(() => {
    const list = vehicles ?? [];
    const now = new Date();
    const transactions = flattenTransactions(list, revenus);
    const today = transactions.filter(t => onDay(t, now));
    const month = transactions.filter(t => inMonth(t, now));
    const prevMonth = transactions.filter(t => inMonth(t, now, -1));

    const revenueToday = sumBy(today, 'revenue');
    const revenueMonth = sumBy(month, 'revenue');
    const expenseMonth = sumBy(month, 'expense');
    const revenuePrevMonth = sumBy(prevMonth, 'revenue');

    const chauffeurById = new Map(chauffeurs.map(c => [c.id, c]));
    const fleetDriverIds = new Set(list.flatMap(v => [v.primaryDriverId, v.secondaryDriverId]).filter(Boolean) as string[]);

    const perVehicle = list.map(v => {
      const txs = month.filter(t => t.vehicleId === v.id);
      const paidToday = today.some(t => t.vehicleId === v.id && t.type === 'revenue');
      return {
        vehicle: v,
        revenueMonth: sumBy(txs, 'revenue'),
        expenseMonth: sumBy(txs, 'expense'),
        paidToday,
        driver: v.primaryDriverId ? chauffeurById.get(v.primaryDriverId) : undefined,
        secondDriver: v.secondaryDriverId ? chauffeurById.get(v.secondaryDriverId) : undefined,
      };
    });

    return {
      transactions,
      revenueToday,
      revenueMonth,
      expenseMonth,
      netMonth: revenueMonth - expenseMonth,
      revenueGrowth: growthLabel(revenueMonth, revenuePrevMonth),
      paymentsToday: paymentBreakdown(today),
      paymentsMonth: paymentBreakdown(month),
      series7: dailySeries(transactions, 7, now),
      counts: {
        total: list.length,
        inUse: list.filter(v => v.status === 'In Use').length,
        available: list.filter(v => v.status === 'Available').length,
        maintenance: list.filter(v => v.status === 'Maintenance').length,
        paidToday: perVehicle.filter(p => p.paidToday).length,
      },
      perVehicle,
      chauffeurById,
      fleetDrivers: chauffeurs.filter(c => fleetDriverIds.has(c.id)),
      alerts: computeAlerts(list, chauffeurs, now),
    };
  }, [vehicles, revenus, chauffeurs]);

  return {
    loading: vehicles === null && !error,
    error,
    vehicles: vehicles ?? [],
    chauffeurs,
    ...derived,
  };
}
