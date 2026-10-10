import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplashScreen from '@syscor/shared/src/screens/AnimatedSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Misma clave que el BootGate compartido: quien ya vio la introducción antes
// de este cambio no la vuelve a ver.
const ONBOARDING_SEEN_KEY = 'syscor.hasSeenOnboarding';

// Mantiene visible el splash nativo hasta que nuestro splash animado en JS toma el control.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Arranque de la app de clientes:
//   splash -> introducción (solo el primer arranque) -> app.
//
// A diferencia del BootGate compartido (que usa la app de empleados), aquí no
// hay pantalla de bienvenida con "Iniciar sesión / Crear cuenta": sin sesión la
// app abre directo en el login, que ya ofrece crear cuenta y ver el menú.
//
// El splash se monta por encima de la pantalla que le sigue, de modo que al
// deslizarse hacia arriba la deja descubierta sin parpadeos.
export default function CustomerBootGate({ children }) {
  const [stage, setStage] = useState('splash');
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

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

  const handleSplashFinish = () => setStage(isFirstLaunch ? 'onboarding' : 'app');

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setStage('app');
  };

  // Durante el splash ya se monta debajo la pantalla que quedará al
  // descubierto. El árbol es siempre el mismo para que la navegación no se
  // vuelva a montar cuando el splash se retira.
  const showOnboarding = isFirstLaunch && stage !== 'app';

  return (
    <View style={styles.container}>
      {showOnboarding ? <OnboardingScreen onFinish={handleOnboardingFinish} /> : children}
      {stage === 'splash' ? <AnimatedSplashScreen onFinish={handleSplashFinish} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
