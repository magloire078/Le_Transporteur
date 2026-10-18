import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  runTransaction,
  DocumentData,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { EMPTY_DOCUMENTS } from './labels';
import {
  Chauffeur,
  ChauffeurStatus,
  DocumentKey,
  MaintenanceLog,
  RevenuDoc,
  Transaction,
  Utilisateur,
  VehicleDocument,
  Vehicule,
} from './types';

type Unsubscribe = () => void;

// ==================== PARSERS ====================
// Les données existantes contiennent des champs manquants ou null :
// on normalise tout ici pour que les écrans n'aient pas à s'en soucier.

function toVehicule(id: string, d: DocumentData): Vehicule {
  return {
    id,
    plate: d.plate ?? '',
    make: d.make ?? '',
    model: d.model ?? '',
    vehicleType: d.vehicleType ?? 'taxi_compteur',
    status: d.status ?? 'Available',
    image: d.image ?? '',
    ownerId: d.ownerId ?? '',
    owner: d.owner ?? '',
    primaryDriverId: d.primaryDriverId ?? null,
    secondaryDriverId: d.secondaryDriverId ?? null,
    firstServiceDate: d.firstServiceDate ?? null,
    documents: { ...EMPTY_DOCUMENTS, ...(d.documents ?? {}) },
    maintenanceLogs: Array.isArray(d.maintenanceLogs) ? d.maintenanceLogs : [],
  };
}

function toTransaction(t: DocumentData): Transaction {
  return {
    id: t.id ?? `txn_${t.date}`,
    date: t.date ?? new Date().toISOString(),
    description: t.description ?? '',
    amount: Number(t.amount) || 0,
    type: t.type === 'expense' ? 'expense' : 'revenue',
    driver: t.driver ?? '',
    driverId: t.driverId,
    paymentMethod: t.paymentMethod,
  };
}

function toChauffeur(id: string, d: DocumentData): Chauffeur {
  return {
    id,
    name: d.name ?? 'Chauffeur',
    phone: d.phone ?? '',
    age: d.age,
    residence: d.residence,
    status: d.status ?? 'Available',
    avatar: d.avatar ?? '',
    rating: typeof d.rating === 'number' ? d.rating : 5,
    dailyTarget: d.dailyTarget,
  };
}

// ==================== SUBSCRIPTIONS ====================

/** Véhicules visibles par l'utilisateur selon son rôle. */
export function subscribeVehicles(user: Utilisateur, cb: (list: Vehicule[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const col = collection(db, 'vehicules');

  if (user.role === 'admin') {
    return onSnapshot(col, snap => cb(snap.docs.map(d => toVehicule(d.id, d.data()))), onError);
  }

  if (user.role === 'owner') {
    const q = query(col, where('ownerId', '==', user.id));
    return onSnapshot(q, snap => cb(snap.docs.map(d => toVehicule(d.id, d.data()))), onError);
  }

  // Chauffeur : véhicules où il est titulaire ou relais.
  let primary: Vehicule[] = [];
  let secondary: Vehicule[] = [];
  const emit = () => {
    const merged = new Map<string, Vehicule>();
    [...primary, ...secondary].forEach(v => merged.set(v.id, v));
    cb([...merged.values()]);
  };
  const u1 = onSnapshot(query(col, where('primaryDriverId', '==', user.id)), snap => {
    primary = snap.docs.map(d => toVehicule(d.id, d.data()));
    emit();
  }, onError);
  const u2 = onSnapshot(query(col, where('secondaryDriverId', '==', user.id)), snap => {
    secondary = snap.docs.map(d => toVehicule(d.id, d.data()));
    emit();
  }, onError);
  return () => { u1(); u2(); };
}

/**
 * Revenus d'une liste de véhicules. Les règles Firestore vérifient l'accès
 * document par document, d'où un abonnement par véhicule plutôt qu'une requête.
 */
export function subscribeRevenus(vehicleIds: string[], cb: (docs: RevenuDoc[]) => void): Unsubscribe {
  const state = new Map<string, RevenuDoc>();
  const emit = () => cb([...state.values()]);

  if (vehicleIds.length === 0) {
    cb([]);
    return () => {};
  }

  const unsubs = vehicleIds.map(vid =>
    onSnapshot(
      doc(db, 'revenus', vid),
      snap => {
        const data = snap.data();
        state.set(vid, {
          id: vid,
          vehicleId: vid,
          transactions: Array.isArray(data?.transactions) ? data!.transactions.map(toTransaction) : [],
        });
        emit();
      },
      () => {
        // Accès refusé ou document absent : on considère le véhicule sans transaction.
        state.set(vid, { id: vid, vehicleId: vid, transactions: [] });
        emit();
      },
    ),
  );
  return () => unsubs.forEach(u => u());
}

export function subscribeChauffeurs(cb: (list: Chauffeur[]) => void, onError?: (e: Error) => void): Unsubscribe {
  return onSnapshot(collection(db, 'chauffeurs'), snap => cb(snap.docs.map(d => toChauffeur(d.id, d.data()))), onError);
}

export function subscribeChauffeur(id: string, cb: (c: Chauffeur | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'chauffeurs', id), snap => cb(snap.exists() ? toChauffeur(snap.id, snap.data()) : null), () => cb(null));
}

// ==================== VÉHICULES ====================

export async function addVehicle(
  owner: Utilisateur,
  data: Pick<Vehicule, 'plate' | 'make' | 'model' | 'vehicleType'> & { firstServiceDate?: string | null },
): Promise<string> {
  const ref = await addDoc(collection(db, 'vehicules'), {
    plate: data.plate.trim().toUpperCase(),
    make: data.make.trim(),
    model: data.model.trim(),
    vehicleType: data.vehicleType,
    status: 'Available',
    image: `https://placehold.co/400x250.png?text=${encodeURIComponent(`${data.make} ${data.model}`)}`,
    ownerId: owner.id,
    owner: owner.name,
    primaryDriverId: null,
    secondaryDriverId: null,
    firstServiceDate: data.firstServiceDate || null,
    documents: EMPTY_DOCUMENTS,
    maintenanceLogs: [],
  });
  await setDoc(doc(db, 'revenus', ref.id), { vehicleId: ref.id, transactions: [] });
  return ref.id;
}

export function updateVehicle(id: string, patch: Partial<Omit<Vehicule, 'id'>>) {
  return updateDoc(doc(db, 'vehicules', id), patch);
}

export async function deleteVehicle(id: string) {
  await deleteDoc(doc(db, 'revenus', id)).catch(() => {});
  await deleteDoc(doc(db, 'vehicules', id));
}

export function assignDriver(vehicleId: string, slot: 'primary' | 'secondary', driverId: string | null) {
  return updateDoc(doc(db, 'vehicules', vehicleId), {
    [slot === 'primary' ? 'primaryDriverId' : 'secondaryDriverId']: driverId,
  });
}

export function updateVehicleDocument(vehicleId: string, key: DocumentKey, value: VehicleDocument) {
  return updateDoc(doc(db, 'vehicules', vehicleId), { [`documents.${key}`]: value });
}

export async function addMaintenance(vehicleId: string, log: Omit<MaintenanceLog, 'id'>, recordExpense: boolean) {
  const entry: MaintenanceLog = { ...log, id: `mnt_${Date.now()}` };
  await updateDoc(doc(db, 'vehicules', vehicleId), { maintenanceLogs: arrayUnion(entry) });
  if (recordExpense && log.cost > 0) {
    await addTransaction(vehicleId, {
      date: log.date,
      description: log.description,
      amount: log.cost,
      type: 'expense',
      driver: '',
    });
  }
}

// ==================== TRANSACTIONS ====================

export async function addTransaction(vehicleId: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  const entry: Transaction = { ...tx, id: `txn_${Date.now()}` };
  // Firestore refuse les champs undefined dans un tableau.
  const clean = Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined));
  await setDoc(doc(db, 'revenus', vehicleId), { vehicleId, transactions: arrayUnion(clean) }, { merge: true });
  return entry;
}

export async function deleteTransaction(vehicleId: string, txId: string) {
  const ref = doc(db, 'revenus', vehicleId);
  await runTransaction(db, async t => {
    const snap = await t.get(ref);
    const list: DocumentData[] = snap.data()?.transactions ?? [];
    t.update(ref, { transactions: list.filter(x => x.id !== txId) });
  });
}

// ==================== CHAUFFEURS ====================

export async function addChauffeur(data: Pick<Chauffeur, 'name' | 'phone'> & Partial<Chauffeur>) {
  const ref = await addDoc(collection(db, 'chauffeurs'), {
    name: data.name.trim(),
    phone: data.phone.trim(),
    age: data.age ?? null,
    residence: data.residence ?? '',
    status: 'Available',
    avatar: 'https://placehold.co/80x80.png',
    rating: 5,
    dailyTarget: data.dailyTarget ?? null,
    // Permet au propriétaire de modifier la fiche d'un chauffeur sans compte (cf. firestore.rules).
    createdBy: auth.currentUser?.uid ?? null,
  });
  return ref.id;
}

export function updateChauffeur(id: string, patch: Partial<Omit<Chauffeur, 'id'>>) {
  return updateDoc(doc(db, 'chauffeurs', id), patch);
}

export function setChauffeurStatus(id: string, status: ChauffeurStatus) {
  return updateDoc(doc(db, 'chauffeurs', id), { status });
}

/** Garantit qu'un compte chauffeur possède sa fiche publique chauffeurs/{uid}. */
export function ensureChauffeurProfile(user: Utilisateur) {
  return setDoc(
    doc(db, 'chauffeurs', user.id),
    { name: user.name, phone: user.phone },
    { merge: true },
  );
}
