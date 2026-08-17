import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

// Notificación flotante no bloqueante (reemplaza los Alert.alert nativos
// para avisos de validación, como "selecciona las opciones requeridas").
const Toast = ({ visible, message, type = 'error', onHide }) => {
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -80,
        duration: 220,
        useNativeDriver: true,
      }).start(() => onHide?.());
    }, 2600);

    return () => clearTimeout(timer);
  }, [visible, message]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        type === 'success' ? styles.success : styles.error,
        { transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.icon}>{type === 'success' ? '✓' : '⚠️'}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  error: {
    backgroundColor: '#C62828',
  },
  success: {
    backgroundColor: '#2E7D32',
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});

export default Toast;
