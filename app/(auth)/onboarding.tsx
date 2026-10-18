import * as React from 'react';
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import { Icon } from '@/components/Icon';

type Gradient = readonly [string, string, ...string[]];

export default function OnboardingScreen() {
  const router = useRouter();
  const { activeTheme: T, setIsNewUser } = useAppContext();

  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      emoji: '🚕',
      title: 'Votre flotte, en temps réel',
      sub: 'Suivez chaque véhicule : en service, disponible ou au garage. Où que vous soyez, vous savez ce qui roule.',
      colors: (T.dark ? ['#0F172A', '#1E293B'] : ['#0B2545', '#1A3A6C']) as Gradient,
    },
    {
      emoji: '💰',
      title: 'Des versements sans surprise',
      sub: 'Vos chauffeurs déclarent leur recette du jour (Wave, Orange Money, MTN ou espèces). Vous voyez qui a versé, et combien.',
      colors: ['#065F46', '#10B981'] as Gradient,
    },
    {
      emoji: '📑',
      title: 'Papiers toujours à jour',
      sub: 'Assurance, visite technique, carte de transport, patente… Recevez une alerte avant chaque expiration et évitez la fourrière.',
      colors: ['#92400E', '#F59E0B'] as Gradient,
    },
  ];

  const animateSlide = (toSlide: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: slide < toSlide ? -20 : 20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSlide(toSlide);
      slideAnim.setValue(slide < toSlide ? 20 : -20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleDone = () => {
    setIsNewUser(false);
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (slide < slides.length - 1) animateSlide(slide + 1);
    else handleDone();
  };

  const s = slides[slide];
  const last = slide === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={s.colors} style={StyleSheet.absoluteFill} />
      <View style={[styles.circle, { width: 300, height: 300, top: -50, right: -100, opacity: 0.15 }]} />
      <View style={[styles.circle, { width: 200, height: 200, bottom: 100, left: -50, opacity: 0.1 }]} />

      <TouchableOpacity onPress={handleDone} style={styles.skip}>
        <Text style={[styles.skipText, { fontFamily: Fonts.semibold }]}>Passer</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.iconGlass}>
          <Text style={styles.emoji}>{s.emoji}</Text>
        </View>
        <Text style={[styles.title, { fontFamily: Fonts.extraBold }]}>{s.title}</Text>
        <Text style={[styles.sub, { fontFamily: Fonts.sans }]}>{s.sub}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => i !== slide && animateSlide(i)} style={{ padding: 4 }}>
              <View style={[styles.dot, { width: i === slide ? 30 : 8, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.3)' }]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.9} style={styles.nextBtn}>
          <Text style={[styles.nextText, { color: s.colors[0], fontFamily: Fonts.bold }]}>{last ? 'Commencer' : 'Suivant'}</Text>
          <Icon name="arrow" size={18} color={s.colors[0]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  skip: { position: 'absolute', top: 60, right: 24, zIndex: 2, padding: 8 },
  skipText: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  iconGlass: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: { fontSize: 56 },
  title: { fontSize: 32, color: '#fff', letterSpacing: -0.8, lineHeight: 38, marginBottom: 16 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  footer: { paddingHorizontal: 32, paddingBottom: 56, gap: 28 },
  dotsContainer: { flexDirection: 'row', gap: 4 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextText: { fontSize: 17 },
});
