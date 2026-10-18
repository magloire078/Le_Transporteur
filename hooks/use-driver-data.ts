import { useEffect, useMemo, useState } from 'react';
import {
  addTransaction,
  setChauffeurStatus,
  subscribeChauffeur,
  subscribeRevenus,
  subscribeVehicles,
} from '@/services/fleetService';
import { flattenTransactions, inMonth, onDay, sumBy, dailySeries } from '@/services/analytics';
import { DEFAULT_DAILY_TARGET } from '@/services/labels';
import { Chauffeur, PaymentMethod, RevenuDoc, Utilisateur, Vehicule } from '@/services/types';

/** Données du chauffeur connecté : véhicule(s) affecté(s) et ses versements. */
export function useDriverData(user: Utilisateur | null) {
  const [vehicles, setVehicles] = useState<Vehicule[] | null>(null);
  const [revenus, setRevenus] = useState<RevenuDoc[]>([]);
  const [profile, setProfile] = useState<Chauffeur | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeVehicles(user, setVehicles, e => setError(e.message));
    const u2 = subscribeChauffeur(user.id, setProfile);
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
    // Les anciennes transactions n'ont que le nom du chauffeur : on accepte les deux.
    const mine = flattenTransactions(list, revenus).filter(
      t => t.type === 'revenue' && (t.driverId === user?.id || (!t.driverId && t.driver === user?.name)),
    );
    const today = mine.filter(t => onDay(t, now));
    const month = mine.filter(t => inMonth(t, now));
    const prevMonth = mine.filter(t => inMonth(t, now, -1));
    const target = profile?.dailyTarget ?? DEFAULT_DAILY_TARGET;
    const paidToday = sumBy(today, 'revenue');

    return {
      vehicle: list.find(v => v.primaryDriverId === user?.id) ?? list[0],
      versements: mine,
      paidToday,
      dailyTarget: target,
      progress: Math.min(1, target > 0 ? paidToday / target : 0),
      monthTotal: sumBy(month, 'revenue'),
      monthCount: month.length,
      prevMonthTotal: sumBy(prevMonth, 'revenue'),
      series7: dailySeries(mine, 7, now),
    };
  }, [vehicles, revenus, profile, user]);

  const isOnDuty = profile?.status === 'On Duty';

  const toggleDuty = () => {
    if (!user) return Promise.resolve();
    return setChauffeurStatus(user.id, isOnDuty ? 'Available' : 'On Duty');
  };

  const declareVersement = (vehicleId: string, amount: number, method: PaymentMethod, description = 'Recette du Jour') => {
    if (!user) return Promise.reject(new Error('Non connecté'));
    return addTransaction(vehicleId, {
      date: new Date().toISOString(),
      description,
      amount,
      type: 'revenue',
      driver: user.name,
      driverId: user.id,
      paymentMethod: method,
    });
  };

  return {
    loading: vehicles === null && !error,
    error,
    vehicles: vehicles ?? [],
    profile,
    isOnDuty,
    toggleDuty,
    declareVersement,
    ...derived,
  };
}
