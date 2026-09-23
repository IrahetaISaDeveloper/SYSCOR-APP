import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons as Icon } from '@expo/vector-icons';

// Lo que la app realmente ofrece hoy al cliente.
const HIGHLIGHTS = [
  { icon: 'restaurant-outline', label: 'Menú completo con salsas y extras' },
  { icon: 'card-outline', label: 'Paga tu pedido en línea' },
];

// Pantalla de bienvenida: primera impresión de la marca y punto de entrada a la
// sesión. Queda debajo del splash, que se retira deslizándose hacia arriba.
export default function WelcomeScreen({ onFinish }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const t = isDark ? darkTokens : lightTokens;

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 480,
        delay: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 480,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise]);

  // Deja claro que sin cuenta el menú es solo de consulta, antes de entrar.
  const confirmBrowseMenu = () => {
    Alert.alert(
      'Explorar sin cuenta',
      'Puedes ver todo el menú sin iniciar sesión, pero para hacer un pedido necesitarás registrarte o iniciar sesión.',
      [
        { text: 'Regresar', style: 'cancel' },
        { text: 'Continuar', onPress: () => onFinish?.('Menu') },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* La barra de estado queda sobre la imagen, que es oscura en ambos temas */}
      <StatusBar style="light" />

      {/* Imagen de portada, a sangre por los costados y el borde superior */}
      <Image
        source={require('../../assets/welcome-tacos.jpg')}
        style={styles.hero}
        resizeMode="cover"
      />

      <Animated.View
        style={[styles.body, { opacity: fade, transform: [{ translateY: rise }] }]}
      >
        {/* Mensaje principal */}
        <Text style={[styles.title, { color: t.textPrimary }]}>
          Sabor de El Corral, a un{'\n'}pedido de distancia
        </Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Explora el menú, arma tu platillo con los extras que prefieras y paga sin
          hacer fila.
        </Text>

        <View style={styles.highlights}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.icon} style={styles.highlightRow}>
              <Icon name={item.icon} size={17} color={t.accent} />
              <Text style={[styles.highlightText, { color: t.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Acciones */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: t.accent }]}
          activeOpacity={0.85}
          onPress={() => onFinish?.('Login')}
        >
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          <Icon name="arrow-forward" size={17} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
          activeOpacity={0.85}
          onPress={() => onFinish?.('RegisterCustomer')}
        >
          <Text style={[styles.secondaryButtonText, { color: t.textPrimary }]}>
            Crear cuenta
          </Text>
        </TouchableOpacity>

        {/* Acceso al menú sin sesión: solo consulta, sin poder comprar */}
        <TouchableOpacity
          style={styles.browseLink}
          activeOpacity={0.7}
          onPress={confirmBrowseMenu}
        >
          <Text style={[styles.browseLinkText, { color: t.accent }]}>Explorar menú</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Paleta propia de esta pantalla: es la única que responde al tema del sistema.
const lightTokens = {
  background: '#F7F5F1',
  surface: '#FFFFFF',
  border: '#E3DFD8',
  textPrimary: '#14213D',
  textSecondary: '#5B6472',
  accent: '#8E1B1B',
};

const darkTokens = {
  background: '#0B0B0B',
  surface: '#1C1C1E',
  border: '#2E2E32',
  textPrimary: '#FFFFFF',
  textSecondary: '#A8AEB8',
  accent: '#C62828',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    width: '100%',
    height: '42%',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  highlights: {
    marginTop: 22,
    marginBottom: 30,
    gap: 13,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  highlightText: {
    fontSize: 14,
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: 14,
    marginBottom: 11,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  browseLink: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 2,
  },
  browseLinkText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
