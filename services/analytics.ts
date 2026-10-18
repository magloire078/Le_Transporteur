import { DOCUMENT_KEYS, DOCUMENT_LABELS, dayKey } from './labels';
import { Chauffeur, FleetAlert, FleetTransaction, PaymentMethod, RevenuDoc, Vehicule } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function flattenTransactions(vehicles: Vehicule[], revenus: RevenuDoc[]): FleetTransaction[] {
  const byId = new Map(vehicles.map(v => [v.id, v]));
  const out: FleetTransaction[] = [];
  for (const r of revenus) {
    const v = byId.get(r.vehicleId);
    if (!v) continue;
    for (const t of r.transactions) {
      out.push({ ...t, vehicleId: v.id, vehiclePlate: v.plate, vehicleLabel: `${v.make} ${v.model}` });
    }
  }
  return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function sumBy(list: FleetTransaction[], type: 'revenue' | 'expense') {
  return list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
}

export function inMonth(t: { date: string }, ref: Date, offset = 0) {
  const d = new Date(t.date);
  const target = new Date(ref.getFullYear(), ref.getMonth() + offset, 1);
  return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
}

export function onDay(t: { date: string }, ref: Date) {
  return dayKey(t.date) === dayKey(ref);
}

export function paymentBreakdown(list: FleetTransaction[]): Record<PaymentMethod, number> {
  const out: Record<PaymentMethod, number> = { wave: 0, orange: 0, mtn: 0, cash: 0 };
  for (const t of list) {
    if (t.type !== 'revenue') continue;
    out[t.paymentMethod ?? 'cash'] += t.amount;
  }
  return out;
}

/** Recettes des N derniers jours (du plus ancien au plus récent). */
export function dailySeries(list: FleetTransaction[], days: number, now = new Date()) {
  const series: { key: string; label: string; revenue: number; expense: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const key = dayKey(d);
    series.push({ key, label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3), revenue: 0, expense: 0 });
  }
  const idx = new Map(series.map((s, i) => [s.key, i]));
  for (const t of list) {
    const i = idx.get(dayKey(t.date));
    if (i === undefined) continue;
    if (t.type === 'revenue') series[i].revenue += t.amount;
    else series[i].expense += t.amount;
  }
  return series;
}

export function growthLabel(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? 'Nouveau' : '—';
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

/** Alertes de flotte : documents expirés/à renouveler, véhicules au garage ou sans chauffeur. */
export function computeAlerts(vehicles: Vehicule[], chauffeurs: Chauffeur[], now = new Date()): FleetAlert[] {
  const alerts: FleetAlert[] = [];
  const known = new Set(chauffeurs.map(c => c.id));

  for (const v of vehicles) {
    for (const key of DOCUMENT_KEYS) {
      const d = v.documents[key];
      const label = DOCUMENT_LABELS[key];
      if (d.expiryDate) {
        const days = Math.ceil((new Date(d.expiryDate).getTime() - now.getTime()) / DAY_MS);
        if (days < 0) {
          alerts.push({ id: `${v.id}-${key}`, level: 'critical', vehicleId: v.id, title: `${label} expirée · ${v.plate}`, body: `Expirée depuis ${-days} jour(s). Le véhicule risque l'immobilisation.` });
        } else if (days <= 30) {
          alerts.push({ id: `${v.id}-${key}`, level: 'warning', vehicleId: v.id, title: `${label} à renouveler · ${v.plate}`, body: `Expire dans ${days} jour(s).` });
        }
      } else if (!d.valid && (key === 'insurance' || key === 'technicalInspection')) {
        alerts.push({ id: `${v.id}-${key}`, level: 'warning', vehicleId: v.id, title: `${label} non renseignée · ${v.plate}`, body: 'Ajoutez la date d\'expiration pour être alerté à temps.' });
      }
    }
    if (v.status === 'Maintenance') {
      alerts.push({ id: `${v.id}-mnt`, level: 'info', vehicleId: v.id, title: `${v.make} ${v.model} au garage`, body: `${v.plate} est indisponible pour le service.` });
    }
    if (!v.primaryDriverId || !known.has(v.primaryDriverId)) {
      alerts.push({ id: `${v.id}-drv`, level: 'info', vehicleId: v.id, title: `Aucun chauffeur titulaire · ${v.plate}`, body: 'Affectez un chauffeur pour suivre ses versements.' });
    }
  }

  const order = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => order[a.level] - order[b.level]);
}

export function toCsv(list: FleetTransaction[]): string {
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = [
    'Date,Véhicule,Immatriculation,Type,Description,Chauffeur,Paiement,Montant (FCFA)',
    ...list.map(t => [
      esc(new Date(t.date).toLocaleDateString('fr-FR')),
      esc(t.vehicleLabel),
      esc(t.vehiclePlate),
      esc(t.type === 'revenue' ? 'Recette' : 'Dépense'),
      esc(t.description),
      esc(t.driver),
      esc((t.paymentMethod ?? 'cash').toUpperCase()),
      t.type === 'revenue' ? t.amount : -t.amount,
    ].join(',')),
  ];
  return rows.join('\n');
}
