import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, Auth } from 'firebase/auth';
// getReactNativePersistence est exposé par le bundle React Native de firebase/auth
// mais absent des types web : on l'importe donc sans vérification de type.
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration web du projet Firebase « Le Transporteur » (taxifleet-manager).
// Ces valeurs ne sont pas secrètes : la sécurité repose sur firestore.rules.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyBAyWJUaHtGclWljpSo-n5hv8PLfauxHfE',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'taxifleet-manager.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'taxifleet-manager',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'taxifleet-manager.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID ?? '900836744178',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:900836744178:web:81a74314cae71c248c696b',
};

const isFirstInit = getApps().length === 0;
export const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

function createAuth(): Auth {
  if (!isFirstInit) return getAuth(app);
  if (Platform.OS === 'web') {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  }
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = createAuth();
export const db = getFirestore(app);
