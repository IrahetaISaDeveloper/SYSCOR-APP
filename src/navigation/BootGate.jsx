import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplashScreen from '../screens/AnimatedSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const ONBOARDING_SEEN_KEY = 'syscor.hasSeenOnboarding';

// Mantiene visible el splash nativo hasta que nuestro splash animado en JS toma el control.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Orquesta la secuencia de arranque: splash animado -> introducción (solo primera vez)
// -> pantalla de bienvenida -> app principal (login o dashboard según sesión).
export default function BootGate({ children }) {
  const [stage, setStage] = useState('splash');
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then((value) => {
      setIsFirstLaunch(value == null);
    });
  }, []);

  const handleSplashFinish = async () => {
    await SplashScreen.hideAsync().catch(() => {});
    setStage(isFirstLaunch ? 'onboarding' : 'welcome');
  };

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setStage('welcome');
  };

  const handleWelcomeFinish = () => setStage('app');

  if (stage === 'splash') {
    return <AnimatedSplashScreen onFinish={handleSplashFinish} />;
  }

  if (stage === 'onboarding') {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  if (stage === 'welcome') {
    return <WelcomeScreen onFinish={handleWelcomeFinish} />;
  }

  return children;
}
