import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, ActivityIndicator, StyleSheet } from 'react-native';

const AUTO_ADVANCE_MS = 1600;

// Pantalla de bienvenida/carga previa al login o al dashboard principal —
// distinta del splash nativo, da contexto de marca mientras se resuelve la sesión.
export default function WelcomeScreen({ onFinish }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => onFinish?.(), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [fade, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <Image
          source={require('../../assets/logo png horizontal claro.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bienvenido a El Corral</Text>
        <Text style={styles.subtitle}>Sabor auténtico, siempre a un pedido de distancia</Text>
        <ActivityIndicator size="small" color="#C62828" style={styles.spinner} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 110,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  spinner: {
    marginTop: 8,
  },
});
