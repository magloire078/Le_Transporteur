import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Utilisateur, UserRole } from './types';

const DEFAULT_AVATAR = 'https://placehold.co/100x100.png';

export async function loadUtilisateur(uid: string): Promise<Utilisateur | null> {
  const snap = await getDoc(doc(db, 'utilisateurs', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: uid,
    name: d.name ?? '',
    email: d.email ?? '',
    phone: d.phone ?? '',
    role: (d.role as UserRole) ?? 'driver',
    avatar: d.avatar ?? DEFAULT_AVATAR,
  };
}

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function register(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
}): Promise<Utilisateur> {
  const cred = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password);
  const uid = cred.user.uid;
  await updateProfile(cred.user, { displayName: params.name });

  const user: Utilisateur = {
    id: uid,
    name: params.name.trim(),
    email: params.email.trim(),
    phone: params.phone.trim(),
    role: params.role,
    avatar: DEFAULT_AVATAR,
  };
  const { id, ...data } = user;
  await setDoc(doc(db, 'utilisateurs', uid), data);

  if (params.role === 'owner') {
    await setDoc(doc(db, 'proprietaires', uid), {
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: DEFAULT_AVATAR,
    });
  } else {
    await setDoc(doc(db, 'chauffeurs', uid), {
      name: user.name,
      phone: user.phone,
      status: 'Available',
      avatar: DEFAULT_AVATAR,
      rating: 5,
    });
  }
  return user;
}

export async function updateUtilisateur(uid: string, patch: Partial<Pick<Utilisateur, 'name' | 'phone'>>) {
  await updateDoc(doc(db, 'utilisateurs', uid), patch);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export function signOut() {
  return fbSignOut(auth);
}

/** Traduit les codes d'erreur Firebase Auth en messages lisibles. */
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email': return 'Adresse e-mail invalide.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'E-mail ou mot de passe incorrect.';
    case 'auth/email-already-in-use': return 'Un compte existe déjà avec cet e-mail.';
    case 'auth/weak-password': return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/too-many-requests': return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'auth/network-request-failed': return 'Pas de connexion Internet.';
    default: return (e as Error)?.message ?? 'Une erreur est survenue.';
  }
}
