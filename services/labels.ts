import { ChauffeurStatus, DocumentKey, PaymentMethod, VehicleStatus, VehicleType, VehicleDocuments } from './types';

export const DOCUMENT_LABELS: Record<DocumentKey, string> = {
  insurance: 'Assurance',
  technicalInspection: 'Visite technique',
  transportCard: 'Carte de transport',
  registration: 'Carte grise',
  parkingCard: 'Carte de stationnement',
  vignette: 'Vignette',
  patente: 'Patente',
};

export const DOCUMENT_KEYS = Object.keys(DOCUMENT_LABELS) as DocumentKey[];

export const EMPTY_DOCUMENTS: VehicleDocuments = DOCUMENT_KEYS.reduce((acc, k) => {
  acc[k] = { valid: false, expiryDate: null };
  return acc;
}, {} as VehicleDocuments);

export const VEHICLE_STATUS: Record<VehicleStatus, { label: string; color: string }> = {
  'Available': { label: 'Disponible', color: '#10B981' },
  'In Use': { label: 'En service', color: '#F59E0B' },
  'Maintenance': { label: 'Au garage', color: '#EF4444' },
};

export const VEHICLE_TYPES: Record<VehicleType, { label: string; emoji: string }> = {
  taxi_compteur: { label: 'Taxi compteur', emoji: '🚕' },
  woro_woro: { label: 'Woro-woro', emoji: '🚖' },
  gbaka: { label: 'Gbaka', emoji: '🚐' },
  vtc: { label: 'VTC', emoji: '🚘' },
  moto_taxi: { label: 'Moto-taxi', emoji: '🏍️' },
  camion: { label: 'Camion / Fret', emoji: '🚚' },
};

export const CHAUFFEUR_STATUS: Record<ChauffeurStatus, { label: string; color: string }> = {
  'Available': { label: 'Disponible', color: '#10B981' },
  'On Duty': { label: 'En service', color: '#F59E0B' },
  'Off Duty': { label: 'Repos', color: '#6B7280' },
};

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; emoji: string; color: string }> = {
  wave: { label: 'Wave', emoji: '🌊', color: '#00B8E6' },
  orange: { label: 'Orange Money', emoji: '🟠', color: '#FF6B00' },
  mtn: { label: 'MTN MoMo', emoji: '🟡', color: '#D4A900' },
  cash: { label: 'Espèces', emoji: '💵', color: '#10B981' },
};

export const DEFAULT_DAILY_TARGET = 17000;

export function formatFCFA(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR')} F`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function dayKey(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('');
}
