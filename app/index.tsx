import { Redirect } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { Loading } from '@/components/ui';

export default function Index() {
  const { authReady, user, isNewUser } = useAppContext();

  if (!authReady) {
    return <Loading />;
  }

  if (!user) {
    return <Redirect href={isNewUser ? '/(auth)/onboarding' : '/(auth)/login'} />;
  }

  if (user.role === 'driver') {
    return <Redirect href="/(driver)" />;
  }

  // Propriétaire et administrateur partagent l'espace de gestion de flotte.
  return <Redirect href="/(owner)" />;
}
