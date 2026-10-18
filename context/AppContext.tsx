import * as React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '@/constants/theme';
import { auth } from '@/services/firebase';
import { loadUtilisateur } from '@/services/authService';
import { ensureChauffeurProfile } from '@/services/fleetService';
import { Utilisateur } from '@/services/types';

type ThemeName = keyof typeof THEMES;

interface AppContextType {
  /** false tant que l'état d'authentification et les préférences ne sont pas chargés. */
  authReady: boolean;
  user: Utilisateur | null;
  /** Connecté à Firebase Auth mais sans document utilisateurs/{uid}. */
  profileMissing: boolean;
  setUser: (u: Utilisateur | null) => void;
  refreshUser: () => Promise<void>;
  themeName: ThemeName;
  setThemeName: (theme: ThemeName) => void;
  activeTheme: typeof THEMES[ThemeName];
  isNewUser: boolean;
  setIsNewUser: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const ONBOARDING_KEY = 'transporteur.onboardingDone';
const THEME_KEY = 'transporteur.theme';

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [themeName, setThemeNameState] = useState<ThemeName>('blue');
  const [isNewUser, setIsNewUserState] = useState<boolean>(false);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [done, theme] = await Promise.all([AsyncStorage.getItem(ONBOARDING_KEY), AsyncStorage.getItem(THEME_KEY)]);
        setIsNewUserState(done !== '1');
        if (theme && theme in THEMES) setThemeNameState(theme as ThemeName);
      } catch {
        setIsNewUserState(true);
      }
      setPrefsReady(true);
    })();
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async fbUser => {
      setProfileMissing(false);
      if (!fbUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      try {
        let u = await loadUtilisateur(fbUser.uid);
        // À l'inscription, le profil utilisateurs/{uid} est écrit juste après la
        // création du compte : on patiente un peu avant de conclure qu'il manque.
        for (let i = 0; !u && i < 5; i++) {
          await new Promise(r => setTimeout(r, 800));
          u = await loadUtilisateur(fbUser.uid);
        }
        setUser(u);
        setProfileMissing(!u);
        if (u?.role === 'driver') ensureChauffeurProfile(u).catch(() => {});
      } catch {
        setUser(null);
      }
      setAuthReady(true);
    });
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    setUser(await loadUtilisateur(auth.currentUser.uid));
  };

  const setThemeName = (t: ThemeName) => {
    setThemeNameState(t);
    AsyncStorage.setItem(THEME_KEY, t).catch(() => {});
  };

  const setIsNewUser = (val: boolean) => {
    setIsNewUserState(val);
    AsyncStorage.setItem(ONBOARDING_KEY, val ? '0' : '1').catch(() => {});
  };

  const value: AppContextType = {
    authReady: authReady && prefsReady,
    user,
    profileMissing,
    setUser,
    refreshUser,
    themeName,
    setThemeName,
    activeTheme: THEMES[themeName],
    isNewUser,
    setIsNewUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
