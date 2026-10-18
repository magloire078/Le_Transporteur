// Types alignés sur la base Firestore existante (projet taxifleet-manager).
// Les valeurs stockées (status, type, role…) sont conservées telles quelles
// pour rester compatibles avec les données déjà présentes.

export type UserRole = 'owner' | 'driver' | 'admin';

/** utilisateurs/{uid} */
export interface Utilisateur {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
}

/** proprietaires/{uid} */
export interface Proprietaire {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export type ChauffeurStatus = 'Available' | 'On Duty' | 'Off Duty';

/** chauffeurs/{uid} — fiche publique du chauffeur, lisible par les propriétaires */
export interface Chauffeur {
  id: string;
  name: string;
  phone: string;
  age?: number;
  residence?: string;
  status: ChauffeurStatus;
  avatar: string;
  rating: number;
  /** Versement journalier attendu par le propriétaire (FCFA). */
  dailyTarget?: number;
}

export type VehicleStatus = 'Available' | 'In Use' | 'Maintenance';
export type VehicleType = 'taxi_compteur' | 'woro_woro' | 'gbaka' | 'vtc' | 'moto_taxi' | 'camion';

export type DocumentKey =
  | 'insurance'
  | 'technicalInspection'
  | 'transportCard'
  | 'registration'
  | 'parkingCard'
  | 'vignette'
  | 'patente';

export interface VehicleDocument {
  valid: boolean;
  /** Date ISO (YYYY-MM-DD) ou null si non renseignée. */
  expiryDate: string | null;
}

export type VehicleDocuments = Record<DocumentKey, VehicleDocument>;

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  cost: number;
}

/** vehicules/{id} */
export interface Vehicule {
  id: string;
  plate: string;
  make: string;
  model: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  image: string;
  ownerId: string;
  /** Nom du propriétaire (dénormalisé). */
  owner: string;
  primaryDriverId: string | null;
  secondaryDriverId: string | null;
  firstServiceDate: string | null;
  documents: VehicleDocuments;
  maintenanceLogs: MaintenanceLog[];
}

export type TransactionType = 'revenue' | 'expense';
export type PaymentMethod = 'wave' | 'orange' | 'mtn' | 'cash';

export interface Transaction {
  id: string;
  /** Date ISO complète. */
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  /** Nom du chauffeur (dénormalisé, comme dans les données existantes). */
  driver: string;
  driverId?: string;
  paymentMethod?: PaymentMethod;
}

/** revenus/{vehicleId} — un document par véhicule, transactions en tableau. */
export interface RevenuDoc {
  id: string;
  vehicleId: string;
  transactions: Transaction[];
}

/** Transaction enrichie avec son véhicule, pratique pour les listes globales. */
export interface FleetTransaction extends Transaction {
  vehicleId: string;
  vehiclePlate: string;
  vehicleLabel: string;
}

export interface FleetAlert {
  id: string;
  title: string;
  body: string;
  level: 'critical' | 'warning' | 'info';
  vehicleId?: string;
}
