import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplashScreen from '../screens/AnimatedSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const ONBOARDING_SEEN_KEY = 'syscor.hasSeenOnboarding';

// Mantiene visible el splash nativo hasta que nuestro splash animado en JS toma el control.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Orquesta la secuencia de arranque:
//   splash -> introducción (solo el primer arranque) -> bienvenida -> app.
//
// El splash se monta por encima de la pantalla que le sigue, de modo que al
// deslizarse hacia arriba la deja descubierta sin parpadeos.
export default function BootGate({ children }) {
  const [stage, setStage] = useState('splash');
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  // Ruta de auth elegida en la bienvenida ('Login' o 'RegisterCustomer').
  const [entryRoute, setEntryRoute] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then((value) => {
      setIsFirstLaunch(value == null);
    });
  }, []);

  useEffect(() => {
    // Ocultamos el splash nativo de inmediato: a partir de aquí el splash en JS
    // es el que se ve, y así la transición de salida la controlamos nosotros.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleSplashFinish = () => setStage(isFirstLaunch ? 'onboarding' : 'welcome');

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setStage('welcome');
  };

  const handleWelcomeFinish = (route) => {
    setEntryRoute(route);
    setStage('app');
  };

  // `children` puede ser una función para recibir la ruta inicial elegida.
  if (stage === 'app') {
    return typeof children === 'function' ? children({ entryRoute }) : children;
  }

  if (stage === 'onboarding') {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  if (stage === 'welcome') {
    return <WelcomeScreen onFinish={handleWelcomeFinish} />;
  }

  // Etapa de splash: debajo se monta ya la pantalla que quedará al descubierto
  // cuando el splash se retire hacia arriba.
  return (
    <View style={styles.container}>
      {isFirstLaunch ? (
        <OnboardingScreen onFinish={handleOnboardingFinish} />
      ) : (
        <WelcomeScreen onFinish={handleWelcomeFinish} />
      )}
      <AnimatedSplashScreen onFinish={handleSplashFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
